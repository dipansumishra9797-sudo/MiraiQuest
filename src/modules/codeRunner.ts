import { CodingProblem, SupportedLanguage, TestCase } from '../data/codingProblems';

export interface TestExecutionResult {
  testCaseId: string;
  passed: boolean;
  status?: 'Passed' | 'Failed' | 'Time Limit Exceeded' | 'Runtime Error' | 'Compile Error';
  inputFormatted: string;
  expectedOutput: any;
  expectedOutputFormatted: string;
  actualOutput: any;
  actualOutputFormatted: string;
  executionTimeMs: number;
  stdout: string[];
  error?: string;
  isHidden?: boolean;
}

export interface RunSummary {
  allPassed: boolean;
  totalPassed: number;
  totalTests: number;
  results: TestExecutionResult[];
  overallTimeMs: number;
  memoryMb: number;
  compilerLogs: string[];
  errorMessage?: string;
  compileError?: string;
  errorLine?: number;
  stdout?: string;
  stderr?: string;
  status?: string;
}

/**
 * Deep equality checker for test case outputs
 */
function isEqual(actual: any, expected: any): boolean {
  if (actual === expected) return true;
  if (actual === undefined || expected === undefined) return false;

  const actualStr = String(actual).trim();
  const expectedStr = String(expected).trim();
  if (actualStr === expectedStr) return true;

  if (typeof actual === 'number' && typeof expected === 'number') {
    return Math.abs(actual - expected) < 1e-5;
  }

  if (typeof actual === 'boolean' || typeof expected === 'boolean') {
    return actualStr.toLowerCase() === expectedStr.toLowerCase();
  }

  if (Array.isArray(actual) && Array.isArray(expected)) {
    if (actual.length !== expected.length) return false;
    for (let i = 0; i < actual.length; i++) {
      if (!isEqual(actual[i], expected[i])) return false;
    }
    return true;
  }

  if (typeof actual === 'object' && typeof expected === 'object' && actual !== null && expected !== null) {
    const keysA = Object.keys(actual);
    const keysB = Object.keys(expected);
    if (keysA.length !== keysB.length) return false;
    for (const key of keysA) {
      if (!isEqual(actual[key], expected[key])) return false;
    }
    return true;
  }

  try {
    const parsedA = typeof actual === 'string' ? JSON.parse(actual) : actual;
    const parsedB = typeof expected === 'string' ? JSON.parse(expected) : expected;
    return JSON.stringify(parsedA) === JSON.stringify(parsedB);
  } catch {
    return false;
  }
}

function formatOutput(val: any): string {
  if (val === undefined) return 'undefined';
  if (val === null) return 'null';
  if (typeof val === 'string') return val;
  try {
    return JSON.stringify(val);
  } catch {
    return String(val);
  }
}

function extractErrorLine(output: string): number | undefined {
  if (!output) return undefined;
  const match = output.match(/(?:line\s+|:|^|Line\s+)(\d+)(?::\d+|:|\s+|$)/i);
  return match ? parseInt(match[1], 10) : undefined;
}

/**
 * Sandboxed Browser Web Worker execution for JavaScript with timeout (kills infinite loops!)
 */
export function runJsInSandboxedWorker(
  code: string,
  stdin: string = '',
  functionName?: string,
  args?: any[],
  timeoutMs: number = 2500
): Promise<{ stdout: string[]; result: any; error?: string; timeMs: number; status: string; errorLine?: number }> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    // Worker code with sandbox: disables network, overrides console.log
    const workerScript = `
      self.onmessage = function(e) {
        const { code, stdin, functionName, args } = e.data;
        const logs = [];
        
        // Sandbox environment: block network APIs
        self.fetch = undefined;
        self.XMLHttpRequest = undefined;
        self.WebSocket = undefined;
        self.Worker = undefined;

        console.log = function(...msg) {
          logs.push(msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' '));
        };
        console.error = function(...msg) {
          logs.push('[ERR] ' + msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' '));
        };
        console.warn = function(...msg) {
          logs.push('[WARN] ' + msg.map(m => typeof m === 'object' ? JSON.stringify(m) : String(m)).join(' '));
        };

        try {
          if (functionName && args !== undefined) {
            // Function test case execution
            const fn = new Function(code + '\\n return ' + functionName + ';')();
            const res = fn(...args);
            self.postMessage({ success: true, logs, result: res });
          } else {
            // Direct standalone execution
            // Feed stdin as global stdin string or readline helper
            self.stdin = stdin || '';
            const res = new Function(code)();
            self.postMessage({ success: true, logs, result: res });
          }
        } catch (err) {
          self.postMessage({ success: false, logs, error: err.message || String(err), stack: err.stack });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    let worker: Worker | null = new Worker(workerUrl);
    let isTerminated = false;

    const timer = setTimeout(() => {
      if (!isTerminated && worker) {
        isTerminated = true;
        worker.terminate();
        worker = null;
        URL.revokeObjectURL(workerUrl);
        const elapsed = Math.round(performance.now() - startTime);
        resolve({
          stdout: ['[Worker Terminated] Time Limit Exceeded (> 2500ms). Infinite loop killed.'],
          result: null,
          error: 'Time Limit Exceeded (> 2500ms): Execution halted because an infinite loop or excessive computation was detected.',
          timeMs: elapsed,
          status: 'Time Limit Exceeded',
        });
      }
    }, timeoutMs);

    worker.onmessage = (event) => {
      if (isTerminated) return;
      clearTimeout(timer);
      isTerminated = true;
      const data = event.data;
      const elapsed = Math.round(performance.now() - startTime);
      worker?.terminate();
      worker = null;
      URL.revokeObjectURL(workerUrl);

      if (data.success) {
        resolve({
          stdout: data.logs,
          result: data.result,
          timeMs: elapsed,
          status: 'Passed',
        });
      } else {
        const line = extractErrorLine(data.stack || data.error);
        resolve({
          stdout: data.logs,
          result: null,
          error: data.error,
          errorLine: line,
          timeMs: elapsed,
          status: 'Runtime Error',
        });
      }
    };

    worker.onerror = (err) => {
      if (isTerminated) return;
      clearTimeout(timer);
      isTerminated = true;
      const elapsed = Math.round(performance.now() - startTime);
      worker?.terminate();
      worker = null;
      URL.revokeObjectURL(workerUrl);
      resolve({
        stdout: [],
        result: null,
        error: `Worker Syntax/Runtime Error: ${err.message}`,
        errorLine: err.lineno,
        timeMs: elapsed,
        status: 'Runtime Error',
      });
    };

    worker.postMessage({ code, stdin, functionName, args });
  });
}

/**
 * Sandboxed Browser execution for Python (Pyodide fallback with Web Worker + timeout)
 */
let pyodideWorker: Worker | null = null;
let pyodideWorkerUrl: string | null = null;

export function runPythonInSandboxedWorker(
  code: string,
  stdin: string = '',
  functionName?: string,
  args?: any[],
  timeoutMs: number = 3000
): Promise<{ stdout: string[]; result: any; error?: string; timeMs: number; status: string; errorLine?: number }> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    // Isolated Pyodide Web Worker script
    const pyWorkerScript = `
      let pyodide = null;
      let pyodideLoading = null;

      async function initPyodide() {
        if (pyodide) return pyodide;
        if (!pyodideLoading) {
          importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');
          pyodideLoading = loadPyodide({
            stdout: (text) => self.postMessage({ type: 'stdout', text }),
            stderr: (text) => self.postMessage({ type: 'stderr', text }),
          });
        }
        pyodide = await pyodideLoading;
        return pyodide;
      }

      self.onmessage = async function(e) {
        const { code, stdin, functionName, args } = e.data;
        const capturedLogs = [];

        try {
          const py = await initPyodide();
          
          // Set stdin if available
          if (stdin) {
            py.setStdin({ stdin: () => stdin });
          }

          // Redirect stdout
          py.runPython(\`
import sys, io, json
_mq_stdout = io.StringIO()
sys.stdout = _mq_stdout
          \`);

          if (functionName && args !== undefined) {
            py.runPython(code);
            const pyFunc = py.globals.get(functionName);
            if (!pyFunc) {
              throw new Error("Function '" + functionName + "' is not defined in Python script.");
            }
            const pyArgs = args.map(a => typeof a === 'object' ? py.toPy(a) : a);
            const res = pyFunc(...pyArgs);
            const jsRes = res && res.toJs ? res.toJs() : res;

            const stdoutText = py.runPython("_mq_stdout.getvalue()");
            if (stdoutText) capturedLogs.push(stdoutText.trim());

            self.postMessage({ type: 'done', success: true, logs: capturedLogs, result: jsRes });
          } else {
            const res = py.runPython(code);
            const stdoutText = py.runPython("_mq_stdout.getvalue()");
            if (stdoutText) capturedLogs.push(stdoutText.trim());
            self.postMessage({ type: 'done', success: true, logs: capturedLogs, result: res });
          }
        } catch (err) {
          self.postMessage({ type: 'done', success: false, logs: capturedLogs, error: err.message || String(err) });
        }
      };
    `;

    const blob = new Blob([pyWorkerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    let worker: Worker | null = new Worker(workerUrl);
    let isTerminated = false;
    const accumulatedLogs: string[] = [];

    const timer = setTimeout(() => {
      if (!isTerminated && worker) {
        isTerminated = true;
        worker.terminate();
        worker = null;
        URL.revokeObjectURL(workerUrl);
        const elapsed = Math.round(performance.now() - startTime);
        resolve({
          stdout: ['[Pyodide Worker Terminated] Time Limit Exceeded (> 3000ms). Infinite loop killed.'],
          result: null,
          error: 'Time Limit Exceeded (> 3000ms): Python execution exceeded timeout. Infinite loop was safely halted.',
          timeMs: elapsed,
          status: 'Time Limit Exceeded',
        });
      }
    }, timeoutMs);

    worker.onmessage = (event) => {
      const data = event.data;
      if (data.type === 'stdout' && data.text) {
        accumulatedLogs.push(data.text);
      } else if (data.type === 'stderr' && data.text) {
        accumulatedLogs.push(`[ERR] ${data.text}`);
      } else if (data.type === 'done') {
        if (isTerminated) return;
        clearTimeout(timer);
        isTerminated = true;
        const elapsed = Math.round(performance.now() - startTime);
        worker?.terminate();
        worker = null;
        URL.revokeObjectURL(workerUrl);

        const logs = [...accumulatedLogs, ...(data.logs || [])];
        if (data.success) {
          resolve({
            stdout: logs,
            result: data.result,
            timeMs: elapsed,
            status: 'Passed',
          });
        } else {
          const line = extractErrorLine(data.error);
          resolve({
            stdout: logs,
            result: null,
            error: data.error,
            errorLine: line,
            timeMs: elapsed,
            status: 'Runtime Error',
          });
        }
      }
    };

    worker.onerror = (err) => {
      if (isTerminated) return;
      clearTimeout(timer);
      isTerminated = true;
      const elapsed = Math.round(performance.now() - startTime);
      worker?.terminate();
      worker = null;
      URL.revokeObjectURL(workerUrl);
      resolve({
        stdout: accumulatedLogs,
        result: null,
        error: `Pyodide Worker Error: ${err.message}`,
        timeMs: elapsed,
        status: 'Runtime Error',
      });
    };

    worker.postMessage({ code, stdin, functionName, args });
  });
}

/**
 * Execute standalone code with optional stdin (Hello World, Custom Input, etc.)
 */
export async function runDirectCode(
  language: SupportedLanguage,
  code: string,
  stdin: string = ''
): Promise<RunSummary> {
  const startTime = performance.now();
  const compilerLogs: string[] = [
    `[Execution] Dispatching ${language.toUpperCase()} to execution service (/api/run)...`,
  ];

  // 1. Try Backend Execution Service (/api/run with Judge0/Piston)
  try {
    const res = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        source_code: code,
        stdin,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return {
        allPassed: data.exit_code === 0 && !data.compile_output,
        totalPassed: data.exit_code === 0 ? 1 : 0,
        totalTests: 1,
        results: [
          {
            testCaseId: 'direct_run',
            passed: data.exit_code === 0 && !data.compile_output,
            status: data.status || (data.exit_code === 0 ? 'Passed' : 'Runtime Error'),
            inputFormatted: stdin ? `stdin: ${stdin}` : 'No input (stdin empty)',
            expectedOutput: 'Output',
            expectedOutputFormatted: 'Output',
            actualOutput: data.stdout || data.stderr || 'No output',
            actualOutputFormatted: data.stdout || data.stderr || 'No output',
            executionTimeMs: data.time || Math.round(performance.now() - startTime),
            stdout: [data.stdout || ''],
            error: data.compile_output || data.stderr || undefined,
          },
        ],
        overallTimeMs: data.time || Math.round(performance.now() - startTime),
        memoryMb: data.memory || 24.5,
        compilerLogs: [...compilerLogs, ...(data.compilerLogs || [])],
        errorMessage: data.compile_output || data.stderr || undefined,
        compileError: data.compile_output || undefined,
        errorLine: data.errorLine || extractErrorLine(data.compile_output || data.stderr || ''),
        stdout: data.stdout,
        stderr: data.stderr,
        status: data.status,
      };
    }
  } catch (netErr) {
    console.warn('Backend /api/run failed, assessing browser fallback:', netErr);
  }

  // 2. Browser Fallback for JavaScript
  if (language === 'javascript') {
    compilerLogs.push(`[Browser Fallback] Executing JavaScript in isolated sandboxed Web Worker...`);
    const workerRes = await runJsInSandboxedWorker(code, stdin);
    const passed = !workerRes.error;
    const time = workerRes.timeMs;

    return {
      allPassed: passed,
      totalPassed: passed ? 1 : 0,
      totalTests: 1,
      results: [
        {
          testCaseId: 'direct_run',
          passed,
          status: workerRes.status as any,
          inputFormatted: stdin ? `stdin: ${stdin}` : 'No input',
          expectedOutput: '',
          expectedOutputFormatted: '',
          actualOutput: workerRes.stdout.join('\n') || formatOutput(workerRes.result),
          actualOutputFormatted: workerRes.stdout.join('\n') || formatOutput(workerRes.result),
          executionTimeMs: time,
          stdout: workerRes.stdout,
          error: workerRes.error,
        },
      ],
      overallTimeMs: time,
      memoryMb: 18.2,
      compilerLogs: [...compilerLogs, `[Browser Worker Finished] Status: ${workerRes.status} (${time}ms)`],
      errorMessage: workerRes.error,
      errorLine: workerRes.errorLine,
      stdout: workerRes.stdout.join('\n') || formatOutput(workerRes.result),
      stderr: workerRes.error,
      status: workerRes.status,
    };
  }

  // 3. Browser Fallback for Python
  if (language === 'python') {
    compilerLogs.push(`[Browser Fallback] Executing Python 3 in sandboxed Pyodide runtime...`);
    const pyRes = await runPythonInSandboxedWorker(code, stdin);
    const passed = !pyRes.error;
    const time = pyRes.timeMs;

    return {
      allPassed: passed,
      totalPassed: passed ? 1 : 0,
      totalTests: 1,
      results: [
        {
          testCaseId: 'direct_run',
          passed,
          status: pyRes.status as any,
          inputFormatted: stdin ? `stdin: ${stdin}` : 'No input',
          expectedOutput: '',
          expectedOutputFormatted: '',
          actualOutput: pyRes.stdout.join('\n') || formatOutput(pyRes.result),
          actualOutputFormatted: pyRes.stdout.join('\n') || formatOutput(pyRes.result),
          executionTimeMs: time,
          stdout: pyRes.stdout,
          error: pyRes.error,
        },
      ],
      overallTimeMs: time,
      memoryMb: 32.5,
      compilerLogs: [...compilerLogs, `[Pyodide Worker Finished] Status: ${pyRes.status} (${time}ms)`],
      errorMessage: pyRes.error,
      errorLine: pyRes.errorLine,
      stdout: pyRes.stdout.join('\n') || formatOutput(pyRes.result),
      stderr: pyRes.error,
      status: pyRes.status,
    };
  }

  // 4. For C, C++, and Java when backend is unreachable:
  return {
    allPassed: false,
    totalPassed: 0,
    totalTests: 1,
    results: [],
    overallTimeMs: 0,
    memoryMb: 0,
    compilerLogs: [
      ...compilerLogs,
      `[Execution Engine Unreachable] Could not contact Judge0 / Piston compiler engine.`,
    ],
    errorMessage: `Execution Engine Unreachable: ${language.toUpperCase()} compilation requires the backend execution service (/api/run). Browser Web Worker fallbacks only exist for Python and JavaScript. Please ensure JUDGE0_URL or PISTON_URL is configured and reachable in .env.`,
    status: 'Engine Unreachable',
  };
}

/**
 * Execute Problem Code against Unit Test Cases
 */
export async function runProblemCode(
  problem: CodingProblem,
  userCode: string,
  language: SupportedLanguage,
  onlyVisibleCases: boolean = false
): Promise<RunSummary> {
  const startTime = performance.now();
  const testCasesToRun = onlyVisibleCases
    ? problem.testCases.filter((tc) => !tc.isHidden)
    : problem.testCases;

  const compilerLogs: string[] = [
    `[Test Runner] ${language.toUpperCase()} • Problem: "${problem.title}" (${testCasesToRun.length} test cases)`,
  ];

  // 1. Try backend /api/run service
  try {
    const response = await fetch('/api/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language,
        code: userCode,
        problem: {
          id: problem.id,
          title: problem.title,
          functionName: problem.functionName,
          testCases: testCasesToRun,
        },
        onlyVisibleCases,
      }),
    });

    if (response.ok) {
      const data = await response.json();

      if (data.compileError || data.compile_output) {
        const err = data.compileError || data.compile_output;
        return {
          allPassed: false,
          totalPassed: 0,
          totalTests: testCasesToRun.length,
          results: [],
          overallTimeMs: data.time || Math.round(performance.now() - startTime),
          memoryMb: data.memory || 28.5,
          compilerLogs: [
            ...compilerLogs,
            `[Build Failed] Compilation errors detected. See line numbers below.`,
            ...(data.compilerLogs || []),
          ],
          errorMessage: err,
          compileError: err,
          errorLine: data.errorLine || extractErrorLine(err),
          status: 'Compile Error',
        };
      }

      return {
        allPassed: Boolean(data.allPassed),
        totalPassed: data.totalPassed ?? (data.results?.filter((r: any) => r.passed).length || 0),
        totalTests: data.totalTests ?? testCasesToRun.length,
        results: data.results || [],
        overallTimeMs: data.time || Math.round(performance.now() - startTime),
        memoryMb: data.memory || 34.2,
        compilerLogs: [
          ...compilerLogs,
          ...(data.compilerLogs || [`[Build Succeeded] ${language.toUpperCase()} execution completed.`]),
        ],
        errorMessage: data.errorMessage,
        status: data.allPassed ? 'Accepted' : 'Wrong Answer',
      };
    }
  } catch (err) {
    console.warn('Backend compiler unavailable for problem run, testing browser fallback:', err);
  }

  // 2. Browser Fallback for JavaScript Test Cases
  if (language === 'javascript') {
    compilerLogs.push(`[Browser Fallback] Running JavaScript test suite in sandboxed Web Worker...`);
    const results: TestExecutionResult[] = [];
    let allPassed = true;
    let totalTime = 0;

    for (const tc of testCasesToRun) {
      const workerRes = await runJsInSandboxedWorker(
        userCode,
        '',
        problem.functionName,
        tc.input
      );

      totalTime += workerRes.timeMs;
      const passed = !workerRes.error && isEqual(workerRes.result, tc.expectedOutput);
      if (!passed) allPassed = false;

      results.push({
        testCaseId: tc.id,
        passed,
        status: workerRes.error ? (workerRes.status as any) : passed ? 'Passed' : 'Failed',
        inputFormatted: tc.isHidden ? '[Hidden Test Case]' : tc.inputFormatted,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        expectedOutputFormatted: tc.isHidden ? '[Hidden Data]' : tc.expectedOutputFormatted,
        actualOutput: tc.isHidden ? (passed ? '[Passed]' : '[Failed]') : workerRes.error || formatOutput(workerRes.result),
        actualOutputFormatted: tc.isHidden
          ? passed ? '[Passed]' : '[Failed]'
          : workerRes.error || formatOutput(workerRes.result),
        executionTimeMs: workerRes.timeMs,
        stdout: workerRes.stdout,
        error: workerRes.error,
        isHidden: tc.isHidden,
      });
    }

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      allPassed,
      totalPassed,
      totalTests: results.length,
      results,
      overallTimeMs: totalTime,
      memoryMb: 24.6,
      compilerLogs: [
        ...compilerLogs,
        allPassed
          ? `[Success] All ${results.length} test cases passed.`
          : `[Incomplete] ${results.length - totalPassed} test case(s) failed.`,
      ],
      status: allPassed ? 'Accepted' : 'Wrong Answer',
    };
  }

  // 3. Browser Fallback for Python Test Cases
  if (language === 'python') {
    compilerLogs.push(`[Browser Fallback] Running Python test suite in sandboxed Pyodide Worker...`);
    const results: TestExecutionResult[] = [];
    let allPassed = true;
    let totalTime = 0;

    for (const tc of testCasesToRun) {
      const pyRes = await runPythonInSandboxedWorker(
        userCode,
        '',
        problem.functionName,
        tc.input
      );

      totalTime += pyRes.timeMs;
      const passed = !pyRes.error && isEqual(pyRes.result, tc.expectedOutput);
      if (!passed) allPassed = false;

      results.push({
        testCaseId: tc.id,
        passed,
        status: pyRes.error ? (pyRes.status as any) : passed ? 'Passed' : 'Failed',
        inputFormatted: tc.isHidden ? '[Hidden Test Case]' : tc.inputFormatted,
        expectedOutput: tc.isHidden ? '[Hidden]' : tc.expectedOutput,
        expectedOutputFormatted: tc.isHidden ? '[Hidden Data]' : tc.expectedOutputFormatted,
        actualOutput: tc.isHidden ? (passed ? '[Passed]' : '[Failed]') : pyRes.error || formatOutput(pyRes.result),
        actualOutputFormatted: tc.isHidden
          ? passed ? '[Passed]' : '[Failed]'
          : pyRes.error || formatOutput(pyRes.result),
        executionTimeMs: pyRes.timeMs,
        stdout: pyRes.stdout,
        error: pyRes.error,
        isHidden: tc.isHidden,
      });
    }

    const totalPassed = results.filter((r) => r.passed).length;
    return {
      allPassed,
      totalPassed,
      totalTests: results.length,
      results,
      overallTimeMs: totalTime,
      memoryMb: 34.8,
      compilerLogs: [
        ...compilerLogs,
        allPassed
          ? `[Success] All ${results.length} Python test cases passed.`
          : `[Incomplete] ${results.length - totalPassed} test case(s) failed.`,
      ],
      status: allPassed ? 'Accepted' : 'Wrong Answer',
    };
  }

  // 4. C, C++, Java unreachable
  return {
    allPassed: false,
    totalPassed: 0,
    totalTests: testCasesToRun.length,
    results: [],
    overallTimeMs: 0,
    memoryMb: 0,
    compilerLogs: [
      ...compilerLogs,
      `[Execution Engine Unreachable] Backend compiler service /api/run is offline or unreachable.`,
    ],
    errorMessage: `Execution Engine Unreachable: ${language.toUpperCase()} test case execution requires the backend compiler service (/api/run). Browser fallbacks exist only for Python and JavaScript. Check JUDGE0_URL or backend network.`,
    status: 'Engine Unreachable',
  };
}
