import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Google GenAI on server-side only
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// 1. Generate Quiz Questions
app.post('/api/gemini/quiz-gen', async (req: Request, res: Response) => {
  const { subject, topic, difficulty = 'medium', count = 3 } = req.body;

  if (!ai) {
    // High-quality offline fallback
    return res.json({
      fallback: true,
      questions: [
        {
          questionText: `In ${subject} (${topic}), which data representation provides O(1) amortized lookup complexity under proper load factor?`,
          options: ['Hash Table with Open Addressing', 'Balanced Binary Search Tree', 'Singly Linked List', 'B-Tree node traversal'],
          correctOptionIndex: 0,
          explanation: 'Hash tables with balanced load factoring achieve average and amortized O(1) key-value lookup.',
          topic: topic || 'Data Structures',
          difficulty: difficulty,
        },
        {
          questionText: `When handling recursion in ${topic}, what critical base invariant prevents stack overflow errors?`,
          options: ['Strict termination condition reached before stack limit', 'Increasing counter variable indefinitely', 'Dynamic re-allocation of call frame registers', 'Disabling tail-call optimization'],
          correctOptionIndex: 0,
          explanation: 'A well-defined base case stops self-referential execution before call stack exhaustion.',
          topic: topic || 'Recursion',
          difficulty: difficulty,
        },
        {
          questionText: `Which algorithmic paradigm decomposes a problem into overlapping subproblems stored in memory?`,
          options: ['Dynamic Programming (Memoization)', 'Greedy Choice Property', 'Brute Force Enumeration', 'Randomized Monte Carlo'],
          correctOptionIndex: 0,
          explanation: 'Dynamic programming optimizes by caching overlapping subproblem results.',
          topic: topic || 'Dynamic Programming',
          difficulty: difficulty,
        },
      ].slice(0, count),
    });
  }

  try {
    const prompt = `Generate ${count} multiple choice questions for collegiate students studying ${subject} on the topic "${topic}".
Difficulty level: ${difficulty}.
Return ONLY valid JSON with this schema:
[
  {
    "questionText": "string",
    "options": ["string", "string", "string", "string"],
    "correctOptionIndex": number (0 to 3),
    "explanation": "concise explanation of why this is correct",
    "topic": "${topic}",
    "difficulty": "${difficulty}"
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = JSON.parse(response.text || '[]');
    return res.json({ fallback: false, questions: parsed });
  } catch (error: any) {
    console.error('Gemini quiz gen error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate quiz questions' });
  }
});

// 2. AI Study Buddy (Pedagogical tutor explaining mistakes without spoiling answers)
app.post('/api/gemini/study-buddy', async (req: Request, res: Response) => {
  const { question, selectedOption, correctOption, subject, topic } = req.body;

  if (!ai) {
    return res.json({
      hint: `Great try! Remember the core invariant of ${topic}: compare how "${selectedOption}" behaves under boundary conditions versus what is ideal. Review the definition of ${correctOption} for key properties.`,
    });
  }

  try {
    const prompt = `You are a supportive, encouraging collegiate teaching assistant at MSOT college.
A student answered a question incorrectly in ${subject} (${topic}).
Question: "${question}"
Student selected: "${selectedOption}"
Correct answer: "${correctOption}"

Provide a warm, supportive pedagogical explanation (2-3 sentences max) explaining the conceptual misunderstanding in what they picked and why the correct concept works, encouraging their learning mindset. Do not be condescending.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ hint: response.text?.trim() });
  } catch (error: any) {
    console.error('Study buddy error:', error);
    return res.json({
      hint: `Focus on how ${topic} operates at scale: notice why ${correctOption} satisfies the runtime and correctness constraints.`,
    });
  }
});

// 3. Hindi / Hinglish Explanation Toggle
app.post('/api/gemini/hinglish-explain', async (req: Request, res: Response) => {
  const { explanation, question, topic } = req.body;

  if (!ai) {
    return res.json({
      hinglish: `Yeh concept ${topic} ka kaafi important hai! Asaan shabdon mein: jab hum is concept ko implement karte hain, toh core rule yeh hota hai ki hum optimized approach use karein taaki time aur memory dono bache. Aapka effort sahi track par hai, ek baar standard flow revise kar lijiye!`,
    });
  }

  try {
    const prompt = `Translate and adapt the following technical explanation into warm, collegiate, natural Indian Hinglish (mixture of conversational Hindi written in Latin script and clear English tech terms) for MSOT students:
Topic: ${topic}
Question: ${question}
English Explanation: "${explanation}"

Keep it engaging, friendly, easy to grasp, and encouraging in 2-3 sentences.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    return res.json({ hinglish: response.text?.trim() });
  } catch (error: any) {
    console.error('Hinglish explain error:', error);
    return res.json({
      hinglish: `Yeh samajhna zaroori hai ki ${topic} mein constraints ko kaise handle karte hain. Sahi answer memory aur operations ko balance karta hai. Keep going!`,
    });
  }
});

// 4. Google Search & Live Fetch for LeetCode, HackerRank, Codeforces
app.post('/api/gemini/search-coding-problems', async (req: Request, res: Response) => {
  const { query, platform = 'all', difficulty = 'all' } = req.body;

  if (!query || typeof query !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  // If AI is configured, execute real Google Search Grounding with gemini-2.5-flash
  if (ai) {
    try {
      const prompt = `Use Google Search to find and extract the exact coding problem from ${
        platform === 'all' ? 'LeetCode, HackerRank, or Codeforces' : platform
      } matching this query: "${query}".
Difficulty filter if applicable: ${difficulty}.

Retrieve:
1. Exact official problem title and platform (must be 'leetcode', 'hackerrank', or 'codeforces').
2. Difficulty ('easy', 'medium', 'hard') and XP points (easy=10, medium=20, hard=40).
3. Problem category and relevant algorithmic tags.
4. Clean Markdown problem description, input/output specifications, and constraints.
5. At least two input/output examples with explanations.
6. A standard function name in camelCase (e.g. isValid, climbStairs, compareTriplets).
7. Starter code templates in JavaScript, Python, C++, and Java.
8. At least 3 structured test cases (each with id, input array, inputFormatted string, expectedOutput, expectedOutputFormatted string).

Return ONLY a valid JSON object matching this exact schema:
{
  "id": "string",
  "title": "string",
  "platform": "leetcode" | "hackerrank" | "codeforces",
  "platformProblemNumber": "string optional",
  "difficulty": "easy" | "medium" | "hard",
  "xpReward": number,
  "category": "string",
  "tags": ["string"],
  "description": "string",
  "constraints": ["string"],
  "examples": [
    { "input": "string", "output": "string", "explanation": "string" }
  ],
  "functionName": "string",
  "starterCode": {
    "javascript": "string",
    "python": "string",
    "cpp": "string",
    "java": "string"
  },
  "testCases": [
    {
      "id": "string",
      "input": [],
      "inputFormatted": "string",
      "expectedOutput": null,
      "expectedOutputFormatted": "string",
      "explanation": "string"
    }
  ],
  "sourceUrl": "string"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const responseText = response.text || '';
      // Extract JSON if wrapped in markdown fences
      let jsonStr = responseText.trim();
      const match = jsonStr.match(/```json\s*([\s\S]*?)\s*```/) || jsonStr.match(/```\s*([\s\S]*?)\s*```/);
      if (match) {
        jsonStr = match[1];
      }

      const problem = JSON.parse(jsonStr);

      // Extract search queries and grounding metadata if available
      const searchQueries = response.candidates?.[0]?.groundingMetadata?.webSearchQueries || [
        `${query} ${platform !== 'all' ? platform : 'leetcode hackerrank codeforces'} problem`,
      ];
      const sources =
        response.candidates?.[0]?.groundingMetadata?.groundingChunks
          ?.map((c: any) => c.web?.uri)
          .filter(Boolean) || [];

      return res.json({
        success: true,
        problem,
        searchQueries,
        sources,
        isGrounded: true,
        platformSource: problem.platform || platform,
      });
    } catch (err: any) {
      console.warn('Google Search grounding fallback invoked:', err?.message || err);
      // Fall through to fallback catalog
    }
  }

  // High-fidelity fallback catalog and dynamic generator
  const qLower = query.toLowerCase();

  // Curated catalog of classic LeetCode, HackerRank, Codeforces problems
  const catalog: any[] = [
    {
      id: 'lc_20',
      title: 'Valid Parentheses',
      platform: 'leetcode',
      platformProblemNumber: '20',
      difficulty: 'easy',
      xpReward: 10,
      category: 'Stacks & Strings',
      tags: ['Stack', 'String'],
      description: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
      constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only ()[]{}'],
      examples: [
        { input: 's = "()"', output: 'true', explanation: 'Matching pair of parentheses.' },
        { input: 's = "()[]{}"', output: 'true', explanation: 'All pairs properly closed.' },
        { input: 's = "(]"', output: 'false', explanation: 'Bracket types do not match.' },
      ],
      functionName: 'isValid',
      starterCode: {
        javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
        python: `def isValid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return False
        else:
            stack.append(char)
    return not stack`,
        cpp: `bool isValid(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return false;
            char top = st.top(); st.pop();
            if (c == ')' && top != '(') return false;
            if (c == '}' && top != '{') return false;
            if (c == ']' && top != '[') return false;
        }
    }
    return st.empty();
}`,
        java: `class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}`,
      },
      testCases: [
        { id: 'tc_1', input: ['()'], inputFormatted: 's = "()"', expectedOutput: true, expectedOutputFormatted: 'true' },
        { id: 'tc_2', input: ['()[]{}'], inputFormatted: 's = "()[]{}"', expectedOutput: true, expectedOutputFormatted: 'true' },
        { id: 'tc_3', input: ['(]'], inputFormatted: 's = "(]"', expectedOutput: false, expectedOutputFormatted: 'false' },
        { id: 'tc_4', input: ['{[]}'], inputFormatted: 's = "{[]}"', expectedOutput: true, expectedOutputFormatted: 'true' },
      ],
      sourceUrl: 'https://leetcode.com/problems/valid-parentheses/',
    },
    {
      id: 'lc_70',
      title: 'Climbing Stairs',
      platform: 'leetcode',
      platformProblemNumber: '70',
      difficulty: 'easy',
      xpReward: 10,
      category: 'Dynamic Programming',
      tags: ['Math', 'Dynamic Programming', 'Memoization'],
      description: `You are climbing a staircase. It takes \`n\` steps to reach the top.
Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?`,
      constraints: ['1 <= n <= 45'],
      examples: [
        { input: 'n = 2', output: '2', explanation: 'There are two ways: 1 step + 1 step, or 2 steps.' },
        { input: 'n = 3', output: '3', explanation: 'There are three ways: 1+1+1, 1+2, or 2+1.' },
      ],
      functionName: 'climbStairs',
      starterCode: {
        javascript: `function climbStairs(n) {
  if (n <= 2) return n;
  let first = 1, second = 2;
  for (let i = 3; i <= n; i++) {
    const third = first + second;
    first = second;
    second = third;
  }
  return second;
}`,
        python: `def climbStairs(n):
    if n <= 2:
        return n
    a, b = 1, 2
    for _ in range(3, n + 1):
        a, b = b, a + b
    return b`,
        cpp: `int climbStairs(int n) {
    if (n <= 2) return n;
    int a = 1, b = 2;
    for (int i = 3; i <= n; ++i) {
        int temp = a + b;
        a = b;
        b = temp;
    }
    return b;
}`,
        java: `class Solution {
    public int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
}`,
      },
      testCases: [
        { id: 'tc_1', input: [2], inputFormatted: 'n = 2', expectedOutput: 2, expectedOutputFormatted: '2' },
        { id: 'tc_2', input: [3], inputFormatted: 'n = 3', expectedOutput: 3, expectedOutputFormatted: '3' },
        { id: 'tc_3', input: [5], inputFormatted: 'n = 5', expectedOutput: 8, expectedOutputFormatted: '8' },
      ],
      sourceUrl: 'https://leetcode.com/problems/climbing-stairs/',
    },
    {
      id: 'hr_compare_triplets',
      title: 'Compare the Triplets',
      platform: 'hackerrank',
      platformProblemNumber: 'challenges/compare-the-triplets',
      difficulty: 'easy',
      xpReward: 10,
      category: 'Arrays & Math',
      tags: ['Arrays', 'Logic'],
      description: `Alice and Bob each created one problem for HackerRank. A reviewer rates the two challenges, awarding points on a scale from 1 to 100 for three categories: problem clarity, originality, and difficulty.

The rating for Alice's challenge is the triplet \`a = [a[0], a[1], a[2]]\`, and the rating for Bob's challenge is \`b = [b[0], b[1], b[2]]\`.

Your task is to find their comparison points by comparing \`a[i]\` with \`b[i]\`:
- If a[i] > b[i], then Alice is awarded 1 point.
- If a[i] < b[i], then Bob is awarded 1 point.
- If a[i] == b[i], then neither person receives a point.

Return an array containing [AlicePoints, BobPoints].`,
      constraints: ['1 <= a[i] <= 100', '1 <= b[i] <= 100'],
      examples: [
        { input: 'a = [5, 6, 7], b = [3, 6, 10]', output: '[1, 1]', explanation: 'Alice gets 1 point for first category, Bob gets 1 point for third category.' },
      ],
      functionName: 'compareTriplets',
      starterCode: {
        javascript: `function compareTriplets(a, b) {
  let alice = 0, bob = 0;
  for (let i = 0; i < 3; i++) {
    if (a[i] > b[i]) alice++;
    else if (a[i] < b[i]) bob++;
  }
  return [alice, bob];
}`,
        python: `def compareTriplets(a, b):
    alice = sum(1 for x, y in zip(a, b) if x > y)
    bob = sum(1 for x, y in zip(a, b) if x < y)
    return [alice, bob]`,
        cpp: `vector<int> compareTriplets(vector<int> a, vector<int> b) {
    int alice = 0, bob = 0;
    for (int i = 0; i < 3; ++i) {
        if (a[i] > b[i]) alice++;
        else if (a[i] < b[i]) bob++;
    }
    return {alice, bob};
}`,
        java: `class Solution {
    public static List<Integer> compareTriplets(List<Integer> a, List<Integer> b) {
        int alice = 0, bob = 0;
        for (int i = 0; i < 3; i++) {
            if (a.get(i) > b.get(i)) alice++;
            else if (a.get(i) < b.get(i)) bob++;
        }
        return Arrays.asList(alice, bob);
    }
}`,
      },
      testCases: [
        { id: 'tc_1', input: [[5, 6, 7], [3, 6, 10]], inputFormatted: 'a = [5, 6, 7], b = [3, 6, 10]', expectedOutput: [1, 1], expectedOutputFormatted: '[1, 1]' },
        { id: 'tc_2', input: [[17, 28, 30], [99, 16, 8]], inputFormatted: 'a = [17, 28, 30], b = [99, 16, 8]', expectedOutput: [2, 1], expectedOutputFormatted: '[2, 1]' },
      ],
      sourceUrl: 'https://www.hackerrank.com/challenges/compare-the-triplets',
    },
    {
      id: 'cf_50a',
      title: 'Domino Piling',
      platform: 'codeforces',
      platformProblemNumber: '50A',
      difficulty: 'easy',
      xpReward: 10,
      category: 'Math & Greedy',
      tags: ['Math', 'Greedy'],
      description: `You are given a rectangular board of \`M x N\` squares. Also you are given an unlimited number of standard domino pieces of \`2 x 1\` squares.

You are allowed to rotate the pieces. You are asked to place as many dominoes as possible on the board so as to satisfy the following conditions:
1. Each domino completely covers two squares.
2. No two dominoes overlap.
3. Each domino lies entirely inside the board. It is allowed to touch the edges of the board.

Find the maximum number of dominoes, which can be placed under these restrictions.`,
      constraints: ['1 <= M <= N <= 16'],
      examples: [
        { input: 'm = 2, n = 4', output: '4', explanation: '2x4 board has 8 squares, fits 8 / 2 = 4 dominoes.' },
        { input: 'm = 3, n = 3', output: '4', explanation: '3x3 board has 9 squares, fits floor(9 / 2) = 4 dominoes.' },
      ],
      functionName: 'dominoPiling',
      starterCode: {
        javascript: `function dominoPiling(m, n) {
  return Math.floor((m * n) / 2);
}`,
        python: `def dominoPiling(m, n):
    return (m * n) // 2`,
        cpp: `int dominoPiling(int m, int n) {
    return (m * n) / 2;
}`,
        java: `class Solution {
    public static int dominoPiling(int m, int n) {
        return (m * n) / 2;
    }
}`,
      },
      testCases: [
        { id: 'tc_1', input: [2, 4], inputFormatted: 'm = 2, n = 4', expectedOutput: 4, expectedOutputFormatted: '4' },
        { id: 'tc_2', input: [3, 3], inputFormatted: 'm = 3, n = 3', expectedOutput: 4, expectedOutputFormatted: '4' },
        { id: 'tc_3', input: [1, 5], inputFormatted: 'm = 1, n = 5', expectedOutput: 2, expectedOutputFormatted: '2' },
      ],
      sourceUrl: 'https://codeforces.com/problemset/problem/50/A',
    },
    {
      id: 'cf_158a',
      title: 'Next Round',
      platform: 'codeforces',
      platformProblemNumber: '158A',
      difficulty: 'easy',
      xpReward: 10,
      category: 'Arrays & Logic',
      tags: ['Implementation'],
      description: `"Contestant who earns a score equal to or greater than the k-th place finisher's score will advance to the next round, as long as the contestant earns a positive score..." - an excerpt from contest rules.

A total of \`n\` participants took part in the contest (\`n >= k\`), and you already know their scores. Calculate how many participants will advance to the next round.`,
      constraints: ['1 <= k <= n <= 50', 'scores are sorted in non-increasing order'],
      examples: [
        { input: 'n = 8, k = 5, scores = [10, 9, 8, 7, 7, 7, 5, 5]', output: '6', explanation: 'The 5th participant scored 7. 6 participants scored >= 7.' },
      ],
      functionName: 'nextRound',
      starterCode: {
        javascript: `function nextRound(n, k, scores) {
  const cutoff = scores[k - 1];
  let advancers = 0;
  for (let i = 0; i < n; i++) {
    if (scores[i] >= cutoff && scores[i] > 0) {
      advancers++;
    }
  }
  return advancers;
}`,
        python: `def nextRound(n, k, scores):
    cutoff = scores[k - 1]
    return sum(1 for s in scores if s >= cutoff and s > 0)`,
        cpp: `int nextRound(int n, int k, vector<int>& scores) {
    int cutoff = scores[k - 1];
    int count = 0;
    for (int s : scores) {
        if (s >= cutoff && s > 0) count++;
    }
    return count;
}`,
        java: `class Solution {
    public static int nextRound(int n, int k, int[] scores) {
        int cutoff = scores[k - 1];
        int count = 0;
        for (int s : scores) {
            if (s >= cutoff && s > 0) count++;
        }
        return count;
    }
}`,
      },
      testCases: [
        { id: 'tc_1', input: [8, 5, [10, 9, 8, 7, 7, 7, 5, 5]], inputFormatted: 'n=8, k=5, scores=[10,9,8,7,7,7,5,5]', expectedOutput: 6, expectedOutputFormatted: '6' },
        { id: 'tc_2', input: [4, 2, [0, 0, 0, 0]], inputFormatted: 'n=4, k=2, scores=[0,0,0,0]', expectedOutput: 0, expectedOutputFormatted: '0' },
      ],
      sourceUrl: 'https://codeforces.com/problemset/problem/158/A',
    },
    {
      id: 'lc_322',
      title: 'Coin Change',
      platform: 'leetcode',
      platformProblemNumber: '322',
      difficulty: 'medium',
      xpReward: 20,
      category: 'Dynamic Programming',
      tags: ['Array', 'Dynamic Programming', 'Breadth-First Search'],
      description: `You are given an integer array \`coins\` representing coins of different denominations and an integer \`amount\` representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return \`-1\`.

You may assume that you have an infinite number of each kind of coin.`,
      constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
      examples: [
        { input: 'coins = [1, 2, 5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1 (3 coins total).' },
        { input: 'coins = [2], amount = 3', output: '-1', explanation: 'Amount 3 cannot be made with only coin 2.' },
      ],
      functionName: 'coinChange',
      starterCode: {
        javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`,
        python: `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for i in range(1, amount + 1):
        for coin in coins:
            if i - coin >= 0:
                dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1`,
        cpp: `int coinChange(vector<int>& coins, int amount) {
    vector<int> dp(amount + 1, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; ++i) {
        for (int c : coins) {
            if (i >= c) dp[i] = min(dp[i], dp[i - c] + 1);
        }
    }
    return dp[amount] > amount ? -1 : dp[amount];
}`,
        java: `class Solution {
    public int coinChange(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i >= coin) dp[i] = Math.min(dp[i], dp[i - coin] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
}`,
      },
      testCases: [
        { id: 'tc_1', input: [[1, 2, 5], 11], inputFormatted: 'coins = [1, 2, 5], amount = 11', expectedOutput: 3, expectedOutputFormatted: '3' },
        { id: 'tc_2', input: [[2], 3], inputFormatted: 'coins = [2], amount = 3', expectedOutput: -1, expectedOutputFormatted: '-1' },
        { id: 'tc_3', input: [[1], 0], inputFormatted: 'coins = [1], amount = 0', expectedOutput: 0, expectedOutputFormatted: '0' },
      ],
      sourceUrl: 'https://leetcode.com/problems/coin-change/',
    },
  ];

  // Try matching query against catalog
  const found = catalog.find(
    (item) =>
      item.title.toLowerCase().includes(qLower) ||
      item.id.toLowerCase().includes(qLower) ||
      item.category.toLowerCase().includes(qLower) ||
      item.tags.some((t: string) => t.toLowerCase().includes(qLower))
  );

  const matchedProblem = found || catalog[0];

  return res.json({
    success: true,
    problem: matchedProblem,
    searchQueries: [
      `site:${matchedProblem.platform === 'leetcode' ? 'leetcode.com' : matchedProblem.platform === 'hackerrank' ? 'hackerrank.com' : 'codeforces.com'} ${query}`,
      `google search official competitive programming problem "${query}"`,
    ],
    sources: [matchedProblem.sourceUrl],
    isGrounded: false,
    fallback: true,
  });
});

// Vite or Static Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`LevelUp server listening on http://localhost:${PORT}`);
  });
}

startServer();
