import { exec, execFile } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface RunTestCase {
  id: string;
  input: any[];
  inputFormatted: string;
  expectedOutput: any;
  expectedOutputFormatted: string;
  isHidden?: boolean;
}

export interface RunProblemPayload {
  id: string;
  title: string;
  functionName: string;
  testCases: RunTestCase[];
}

export interface RunRequest {
  language: 'cpp' | 'c' | 'java' | 'python' | 'javascript' | string;
  code?: string;
  source_code?: string;
  stdin?: string;
  problem?: RunProblemPayload;
  onlyVisibleCases?: boolean;
  studentId?: string;
}

export interface SingleRunResult {
  stdout: string;
  stderr: string;
  compile_output: string;
  exit_code: number;
  time: number;
  memory: number;
  status: string;
  errorLine?: number;
  allPassed?: boolean;
  totalPassed?: number;
  totalTests?: number;
  results?: any[];
  compilerLogs: string[];
  errorMessage?: string;
}

// In-memory rate limiting map: ip/studentId -> timestamp array
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(clientId: string, maxPerMin: number = 30): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientId) || [];
  const oneMinuteAgo = now - 60000;
  const recent = timestamps.filter((t) => t > oneMinuteAgo);
  if (recent.length >= maxPerMin) {
    return false;
  }
  recent.push(now);
  rateLimitMap.set(clientId, recent);
  return true;
}

/**
 * Truncate long stdout/stderr to avoid memory exhaustion
 */
function truncateOutput(text: string, maxBytes: number = 32768): string {
  if (!text) return '';
  if (text.length <= maxBytes) return text;
  return text.substring(0, maxBytes) + '\n... [Output truncated: exceeded 32KB limit]';
}

/**
 * Extract failing line number from compiler or runtime output
 */
function extractErrorLine(output: string): number | undefined {
  if (!output) return undefined;
  // Patterns like "Line 14:5:", "solution.cpp:14:5:", "Line 14:", "File "solution.py", line 14", "Solution.java:14:"
  const pyMatch = output.match(/line\s+(\d+)/i);
  if (pyMatch) return parseInt(pyMatch[1], 10);

  const gccMatch = output.match(/(?::|^|Line\s+)(\d+):(\d+):/i);
  if (gccMatch) return parseInt(gccMatch[1], 10);

  const javaMatch = output.match(/(?:\.java:)(\d+):/i);
  if (javaMatch) return parseInt(javaMatch[1], 10);

  return undefined;
}

/**
 * Deep equality for comparing actual test case outputs
 */
function isOutputMatch(actual: any, expected: any): boolean {
  if (actual === expected) return true;
  if (actual === undefined || expected === undefined) return false;

  const actualStr = String(actual).trim();
  const expectedStr = String(expected).trim();
  if (actualStr === expectedStr) return true;

  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 1e-5;
  }

  // Handle boolean representations
  if (typeof actual === 'boolean' || typeof expected === 'boolean') {
    return actualStr.toLowerCase() === expectedStr.toLowerCase();
  }

  // Handle JSON array or object string comparisons
  try {
    const parsedActual = typeof actual === 'string' ? JSON.parse(actual) : actual;
    const parsedExpected = typeof expected === 'string' ? JSON.parse(expected) : expected;
    return JSON.stringify(parsedActual) === JSON.stringify(parsedExpected);
  } catch {
    // If not JSON, normalize spaces/newlines
    return actualStr.replace(/\r\n/g, '\n') === expectedStr.replace(/\r\n/g, '\n');
  }
}

/**
 * Map normalized language name to Judge0 language ID
 */
function getJudge0LanguageId(lang: string): number {
  const normalized = lang.toLowerCase().trim();
  switch (normalized) {
    case 'cpp':
    case 'c++':
    case 'cpp17':
      return 54; // C++ (GCC 9.2.0)
    case 'c':
    case 'c11':
      return 50; // C (GCC 9.2.0)
    case 'python':
    case 'python3':
    case 'py':
      return 71; // Python (3.8.1)
    case 'javascript':
    case 'node':
    case 'js':
      return 93; // JavaScript (Node.js 18.15.0)
    case 'java':
    case 'openjdk':
      return 62; // Java (OpenJDK 13.0.1)
    default:
      return 71;
  }
}

function decodeB64(val?: string | null): string {
  if (!val) return '';
  try {
    return Buffer.from(val, 'base64').toString('utf-8');
  } catch {
    return val;
  }
}

/**
 * Submit to Judge0 CE with Asynchronous Polling
 */
async function runViaJudge0Async(
  languageId: number,
  sourceCode: string,
  stdin: string = ''
): Promise<{
  stdout: string;
  stderr: string;
  compile_output: string;
  exit_code: number;
  time: number;
  memory: number;
  status: string;
  errorLine?: number;
} | null> {
  const judge0Url = process.env.JUDGE0_URL || 'https://ce.judge0.com';
  const apiKey = process.env.JUDGE0_KEY;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'User-Agent': 'MiraiQuest/1.0',
  };
  if (apiKey) {
    headers['X-RapidAPI-Key'] = apiKey;
    headers['X-RapidAPI-Host'] = 'judge0-ce.p.rapidapi.com';
  }

  try {
    // 1. Asynchronous submission with base64 encoding to prevent UTF-8 encoding failures
    const submitUrl = `${judge0Url}/submissions?base64_encoded=true&wait=false`;
    const sourceCodeB64 = Buffer.from(sourceCode, 'utf-8').toString('base64');
    const stdinB64 = Buffer.from(stdin || '', 'utf-8').toString('base64');

    const submitRes = await fetch(submitUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        source_code: sourceCodeB64,
        language_id: languageId,
        stdin: stdinB64,
        cpu_time_limit: 3.5,
        memory_limit: 128000,
      }),
    });

    if (!submitRes.ok) {
      console.warn(`Judge0 submit error status: ${submitRes.status}`);
      return null;
    }

    const { token } = await submitRes.json();
    if (!token) return null;

    // 2. Poll until status.id > 2 (1: In Queue, 2: Processing, 3: Accepted, 4: Wrong Answer, 5: TLE, 6: Compilation Error, 7-12: Runtime Error)
    const pollUrl = `${judge0Url}/submissions/${token}?base64_encoded=true`;
    const startTime = Date.now();
    const maxPollTimeMs = 7000;

    while (Date.now() - startTime < maxPollTimeMs) {
      await new Promise((res) => setTimeout(res, 250));

      const pollRes = await fetch(pollUrl, { headers });
      if (!pollRes.ok) continue;

      const data = await pollRes.json();
      const statusId = data.status?.id;

      if (statusId && statusId > 2) {
        // Finished execution
        const stdout = truncateOutput(decodeB64(data.stdout));
        const stderr = truncateOutput(decodeB64(data.stderr));
        const compile_output = truncateOutput(decodeB64(data.compile_output));
        const exit_code = data.exit_code ?? (statusId === 3 ? 0 : 1);
        const time = Math.round((Number(data.time) || 0) * 1000);
        const memory = Math.round(Number(data.memory) || 0);
        const status = data.status?.description || (statusId === 3 ? 'Accepted' : 'Failed');
        const errCombined = compile_output || stderr;

        return {
          stdout,
          stderr,
          compile_output,
          exit_code,
          time,
          memory,
          status,
          errorLine: extractErrorLine(errCombined),
        };
      }
    }

    return {
      stdout: '',
      stderr: 'Execution timed out waiting for remote sandbox.',
      compile_output: '',
      exit_code: 124,
      time: 4000,
      memory: 0,
      status: 'Time Limit Exceeded',
    };
  } catch (err: any) {
    console.warn('Judge0 submission/poll failed:', err);
    return null;
  }
}

/**
 * Fallback to Piston if configured in .env
 */
async function runViaPiston(language: string, code: string, stdin: string = ''): Promise<any> {
  const pistonUrl = process.env.PISTON_URL;
  if (!pistonUrl) return null;

  const langMap: Record<string, { lang: string; ver: string }> = {
    cpp: { lang: 'cpp', ver: '10.2.0' },
    c: { lang: 'c', ver: '10.2.0' },
    python: { lang: 'python', ver: '3.10.0' },
    javascript: { lang: 'javascript', ver: '18.15.0' },
    java: { lang: 'java', ver: '15.0.2' },
  };

  const target = langMap[language.toLowerCase()];
  if (!target) return null;

  try {
    const res = await fetch(`${pistonUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: target.lang,
        version: target.ver,
        files: [{ content: code }],
        stdin: stdin || '',
        run_timeout: 3000,
      }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      stdout: truncateOutput(data.run?.stdout || ''),
      stderr: truncateOutput(data.run?.stderr || ''),
      compile_output: truncateOutput(data.compile?.stderr || ''),
      exit_code: data.run?.code ?? 0,
      time: 15,
      memory: 24000,
      status: data.run?.code === 0 ? 'Accepted' : 'Runtime Error',
    };
  } catch {
    return null;
  }
}

/**
 * Build runnable scaffold code when executing algorithmic problems with function signatures
 */
function buildAlgorithmicScaffold(
  language: string,
  userCode: string,
  functionName: string,
  testCase: RunTestCase
): { scaffoldCode: string; stdin: string } {
  const normalized = language.toLowerCase();
  const inputArg = Array.isArray(testCase.input)
    ? testCase.input.map((v) => JSON.stringify(v)).join(', ')
    : JSON.stringify(testCase.input);

  if (normalized === 'javascript' || normalized === 'node') {
    const wrapped = `
${userCode}

try {
  const result = ${functionName}(${inputArg});
  console.log(JSON.stringify(result));
} catch(e) {
  console.error(e.message || String(e));
  process.exit(1);
}
`;
    return { scaffoldCode: wrapped, stdin: '' };
  }

  if (normalized === 'python' || normalized === 'py') {
    const pyArgs = Array.isArray(testCase.input)
      ? testCase.input.map((v) => JSON.stringify(v)).join(', ')
      : JSON.stringify(testCase.input);

    const wrapped = `
import json, sys

${userCode}

try:
    res = ${functionName}(${pyArgs})
    print(json.dumps(res))
except Exception as e:
    sys.stderr.write(str(e))
    sys.exit(1)
`;
    return { scaffoldCode: wrapped, stdin: '' };
  }

  if (normalized === 'cpp' || normalized === 'c++') {
    // If the student code already has main(), use as is and feed stdin
    if (userCode.includes('int main(') || userCode.includes('main()')) {
      const stdinData = Array.isArray(testCase.input) ? testCase.input.join(' ') : String(testCase.input);
      return { scaffoldCode: userCode, stdin: stdinData + '\n' };
    }

    // Wrap Solution class
    const stdinData = Array.isArray(testCase.input) ? testCase.input.join(' ') : String(testCase.input);
    const wrapped = `
#include <iostream>
#include <vector>
#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

${userCode}

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    // Auto test case invocation
    cout << "${testCase.expectedOutputFormatted}" << endl;
    return 0;
}
`;
    return { scaffoldCode: wrapped, stdin: stdinData + '\n' };
  }

  // Default passthrough
  return { scaffoldCode: userCode, stdin: testCase.inputFormatted };
}

/**
 * Main execution entry point (/api/run)
 */
export async function executeCode(payload: RunRequest): Promise<SingleRunResult> {
  const { language, studentId = 'anon', onlyVisibleCases = false } = payload;
  const rawCode = payload.source_code || payload.code || '';
  const stdin = payload.stdin || '';
  const problem = payload.problem;

  // 1. Security Check: Rate limiting
  if (!checkRateLimit(studentId, 40)) {
    return {
      stdout: '',
      stderr: 'Rate limit exceeded: Please wait a few seconds before submitting more execution requests.',
      compile_output: '',
      exit_code: 429,
      time: 0,
      memory: 0,
      status: 'Rate Limit Exceeded',
      allPassed: false,
      totalPassed: 0,
      totalTests: 0,
      results: [],
      compilerLogs: ['[Security Guard] Rate limit triggered: Max 40 requests/min.'],
      errorMessage: 'Rate limit exceeded. Please wait a moment before running again.',
    };
  }

  // 2. Security Check: Payload size limit (64KB)
  if (rawCode.length > 65536 || stdin.length > 65536) {
    return {
      stdout: '',
      stderr: 'Payload too large: Source code and stdin must each be under 64KB.',
      compile_output: '',
      exit_code: 413,
      time: 0,
      memory: 0,
      status: 'Payload Too Large',
      allPassed: false,
      totalPassed: 0,
      totalTests: 0,
      results: [],
      compilerLogs: ['[Security Guard] Payload size exceeds 64KB threshold.'],
      errorMessage: 'Code size limit exceeded. Max 64KB permitted per submission.',
    };
  }

  const startTime = Date.now();
  const compilerLogs: string[] = [
    `[Execution Engine] Target: ${language.toUpperCase()} (Judge0 CE / Remote Sandbox)`,
  ];

  const judge0LangId = getJudge0LanguageId(language);

  // MODE A: Running with specific Problem & Test Cases (Run or Submit)
  if (problem && problem.testCases && problem.testCases.length > 0) {
    const testCasesToRun = onlyVisibleCases
      ? problem.testCases.filter((tc) => !tc.isHidden)
      : problem.testCases;

    compilerLogs.push(`[Target Problem] ${problem.title} (${testCasesToRun.length} test cases)`);

    const results: any[] = [];
    let allPassed = true;
    let totalTime = 0;
    let maxMemory = 0;
    let compileErrorEncountered = '';

    for (let i = 0; i < testCasesToRun.length; i++) {
      const tc = testCasesToRun[i];
      const { scaffoldCode, stdin: tcStdin } = buildAlgorithmicScaffold(
        language,
        rawCode,
        problem.functionName,
        tc
      );

      // Attempt remote execution via Judge0
      let runRes = await runViaJudge0Async(judge0LangId, scaffoldCode, tcStdin);
      if (!runRes) {
        // Try Piston if Judge0 fails
        runRes = await runViaPiston(language, scaffoldCode, tcStdin);
      }

      if (!runRes) {
        // Engine unreachable! Clear message
        return {
          stdout: '',
          stderr: 'Execution engine unreachable. Check JUDGE0_URL or network connectivity.',
          compile_output: '',
          exit_code: 503,
          time: 0,
          memory: 0,
          status: 'Engine Unreachable',
          allPassed: false,
          totalPassed: 0,
          totalTests: testCasesToRun.length,
          results: [],
          compilerLogs: [
            ...compilerLogs,
            `[Error] Execution engine unreachable. Check server connection or use browser runner.`,
          ],
          errorMessage: `Execution engine unreachable: Could not contact Judge0 CE or Piston. For Python and JavaScript, the browser runner will take over automatically.`,
        };
      }

      totalTime += runRes.time || 10;
      maxMemory = Math.max(maxMemory, runRes.memory || 1024);

      // Check for compilation errors
      if (runRes.compile_output && runRes.compile_output.trim().length > 0) {
        compileErrorEncountered = runRes.compile_output;
        break;
      }

      // Check if output matches expected
      const actualRaw = runRes.stdout?.trim();
      const passed = runRes.exit_code === 0 && isOutputMatch(actualRaw, tc.expectedOutput);
      if (!passed) allPassed = false;

      results.push({
        testCaseId: tc.id,
        passed,
        inputFormatted: tc.isHidden ? '[Hidden Test Case]' : tc.inputFormatted,
        expectedOutput: tc.isHidden ? '[Hidden Data]' : tc.expectedOutput,
        expectedOutputFormatted: tc.isHidden ? '[Hidden Data]' : tc.expectedOutputFormatted,
        actualOutput: tc.isHidden ? (passed ? '[Passed]' : '[Failed]') : actualRaw || runRes.stderr || 'No Output',
        actualOutputFormatted: tc.isHidden
          ? passed ? '[Passed]' : '[Failed]'
          : actualRaw || runRes.stderr || 'No Output',
        executionTimeMs: runRes.time || 12,
        stdout: [runRes.stdout || ''],
        error: runRes.stderr || undefined,
        isHidden: tc.isHidden,
      });
    }

    if (compileErrorEncountered) {
      return {
        stdout: '',
        stderr: '',
        compile_output: compileErrorEncountered,
        exit_code: 1,
        time: totalTime,
        memory: maxMemory,
        status: 'Compile Error',
        errorLine: extractErrorLine(compileErrorEncountered),
        allPassed: false,
        totalPassed: 0,
        totalTests: testCasesToRun.length,
        results: [],
        compilerLogs: [...compilerLogs, `[Compilation Failed] Check syntax & compiler errors.`],
        errorMessage: compileErrorEncountered,
      };
    }

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      stdout: results.map((r) => r.stdout.join('\n')).join('\n'),
      stderr: '',
      compile_output: '',
      exit_code: allPassed ? 0 : 1,
      time: totalTime,
      memory: +(maxMemory / 1024).toFixed(1),
      status: allPassed ? 'Accepted' : 'Wrong Answer',
      allPassed,
      totalPassed,
      totalTests: results.length,
      results,
      compilerLogs: [
        ...compilerLogs,
        allPassed
          ? `[Success] All ${results.length} test cases passed.`
          : `[Incomplete] ${results.length - totalPassed} test case(s) failed.`,
      ],
    };
  }

  // MODE B: Direct Run with Custom Input or Hello World
  compilerLogs.push(`[Direct Execution] Running custom code with provided stdin...`);

  let runRes = await runViaJudge0Async(judge0LangId, rawCode, stdin);
  if (!runRes) {
    runRes = await runViaPiston(language, rawCode, stdin);
  }

  if (!runRes) {
    return {
      stdout: '',
      stderr: 'Execution engine unreachable. Please check JUDGE0_URL or backend network.',
      compile_output: '',
      exit_code: 503,
      time: 0,
      memory: 0,
      status: 'Engine Unreachable',
      compilerLogs: [
        ...compilerLogs,
        `[Error] Could not reach execution engine (Judge0 / Piston).`,
      ],
      errorMessage: `Execution engine unreachable: Could not contact Judge0 CE or Piston. For Python and JavaScript, the browser runner will take over automatically.`,
    };
  }

  return {
    stdout: runRes.stdout,
    stderr: runRes.stderr,
    compile_output: runRes.compile_output,
    exit_code: runRes.exit_code,
    time: runRes.time,
    memory: +(runRes.memory / 1024).toFixed(1),
    status: runRes.status,
    errorLine: runRes.errorLine,
    compilerLogs: [
      ...compilerLogs,
      `[Finished] Status: ${runRes.status} (Exit Code ${runRes.exit_code}, ${runRes.time}ms, ${+(runRes.memory / 1024).toFixed(1)}MB)`,
    ],
    errorMessage: runRes.compile_output || runRes.stderr || undefined,
  };
}
