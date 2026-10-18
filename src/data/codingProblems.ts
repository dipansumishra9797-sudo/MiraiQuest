export type Platform = 'leetcode' | 'hackerrank' | 'codeforces';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type SupportedLanguage = 'javascript' | 'python' | 'c' | 'cpp' | 'java';

export function getCppStarterTemplate(title?: string, functionName?: string): string {
  const fn = functionName || 'solution';
  return `#include <bits/stdc++.h>
using namespace std;

// Problem: ${title || 'Competitive Programming Challenge'}
// Function / Class scaffold:
class Solution {
public:
    void ${fn}() {
        // TODO: Implement core algorithmic logic
    }
};

int main() {
    // Fast I/O scaffolding for C++17
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    Solution solver;
    // Read input and invoke solver
    // Example: solver.${fn}();

    return 0;
}`;
}

export function getCStarterTemplate(title?: string, functionName?: string): string {
  const fn = functionName || 'solution';
  return `#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>
#include <string.h>

// Problem: ${title || 'Competitive Programming Challenge'}
void ${fn}() {
    // TODO: Implement solution in C11
}

int main() {
    ${fn}();
    return 0;
}`;
}

export function getJavaStarterTemplate(title?: string, functionName?: string): string {
  const fn = functionName || 'solution';
  return `import java.util.*;
import java.io.*;

public class Solution {
    public static void ${fn}() {
        // TODO: Implement solution logic
    }

    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        ${fn}();
    }
}`;
}

export function getLanguageStarter(
  problem: Partial<CodingProblem>,
  lang: SupportedLanguage
): string {
  if (problem?.starterCode && problem.starterCode[lang]) {
    const existing = problem.starterCode[lang];
    if (existing && existing.trim().length > 0 && !existing.includes('// C++ Starter\n// Implement solution')) {
      return existing;
    }
  }

  if (lang === 'cpp') {
    return getCppStarterTemplate(problem?.title, problem?.functionName);
  }
  if (lang === 'c') {
    return getCStarterTemplate(problem?.title, problem?.functionName);
  }
  if (lang === 'java') {
    return getJavaStarterTemplate(problem?.title, problem?.functionName);
  }
  if (lang === 'python') {
    return problem?.starterCode?.python || `def ${problem?.functionName || 'solution'}(*args):\n    # TODO: Implement solution\n    pass`;
  }
  return problem?.starterCode?.javascript || `function ${problem?.functionName || 'solution'}(...args) {\n  // TODO: Implement solution\n}`;
}

export interface TestCase {
  id: string;
  input: any[];
  inputFormatted: string;
  expectedOutput: any;
  expectedOutputFormatted: string;
  explanation?: string;
  isHidden?: boolean;
}

export interface CodingProblem {
  id: string;
  title: string;
  platform: Platform;
  platformProblemNumber?: string;
  difficulty: Difficulty;
  xpReward: number;
  category: string;
  tags: string[];
  description: string;
  constraints: string[];
  examples: {
    input: string;
    output: string;
    explanation?: string;
  }[];
  starterCode: Partial<Record<SupportedLanguage, string>> & { javascript: string; python: string };
  functionName: string;
  testCases: TestCase[];
  hints?: string[];
  sourceUrl?: string;
}

export const CODING_PROBLEMS: CodingProblem[] = [
  // ================= LEETCODE =================
  {
    id: 'lc_1',
    title: 'Two Sum',
    platform: 'leetcode',
    platformProblemNumber: '1',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Arrays & Hashing',
    tags: ['Array', 'Hash Table'],
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.',
    ],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].',
      },
      {
        input: 'nums = [3, 3], target = 6',
        output: '[0, 1]',
      },
    ],
    functionName: 'twoSum',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
      cpp: `#include <vector>
#include <unordered_map>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> map;
        for (int i = 0; i < nums.size(); i++) {
            int complement = target - nums[i];
            if (map.find(complement) != map.end()) {
                return {map[complement], i};
            }
            map[nums[i]] = i;
        }
        return {};
    }
};`,
      java: `import java.util.HashMap;

class Solution {
    public int[] twoSum(int[] nums, int target) {
        HashMap<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int complement = target - nums[i];
            if (map.containsKey(complement)) {
                return new int[]{map.get(complement), i};
            }
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: [[2, 7, 11, 15], 9],
        inputFormatted: 'nums = [2, 7, 11, 15], target = 9',
        expectedOutput: [0, 1],
        expectedOutputFormatted: '[0, 1]',
      },
      {
        id: 'tc_2',
        input: [[3, 2, 4], 6],
        inputFormatted: 'nums = [3, 2, 4], target = 6',
        expectedOutput: [1, 2],
        expectedOutputFormatted: '[1, 2]',
      },
      {
        id: 'tc_3',
        input: [[3, 3], 6],
        inputFormatted: 'nums = [3, 3], target = 6',
        expectedOutput: [0, 1],
        expectedOutputFormatted: '[0, 1]',
      },
      {
        id: 'tc_hidden',
        input: [[1, 5, 8, 12, 19], 20],
        inputFormatted: 'nums = [1, 5, 8, 12, 19], target = 20',
        expectedOutput: [0, 4],
        expectedOutputFormatted: '[0, 4]',
        isHidden: true,
      },
    ],
  },
  {
    id: 'lc_3',
    title: 'Longest Substring Without Repeating Characters',
    platform: 'leetcode',
    platformProblemNumber: '3',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Sliding Window',
    tags: ['Hash Table', 'String', 'Sliding Window'],
    description: `Given a string \`s\`, find the length of the longest substring without duplicate characters.

A substring is a contiguous non-empty sequence of characters within a string.`,
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.',
    ],
    examples: [
      {
        input: 's = "abcabcbb"',
        output: '3',
        explanation: 'The answer is "abc", with the length of 3.',
      },
      {
        input: 's = "bbbbb"',
        output: '1',
        explanation: 'The answer is "b", with the length of 1.',
      },
      {
        input: 's = "pwwkew"',
        output: '3',
        explanation: 'The answer is "wke", with the length of 3.',
      },
    ],
    functionName: 'lengthOfLongestSubstring',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  let maxLength = 0;
  let start = 0;
  const map = new Map();

  for (let end = 0; end < s.length; end++) {
    const char = s[end];
    if (map.has(char) && map.get(char) >= start) {
      start = map.get(char) + 1;
    }
    map.set(char, end);
    maxLength = Math.max(maxLength, end - start + 1);
  }
  return maxLength;
}`,
      python: `def lengthOfLongestSubstring(s):
    char_map = {}
    max_len = 0
    start = 0
    for end, char in enumerate(s):
        if char in char_map and char_map[char] >= start:
            start = char_map[char] + 1
        char_map[char] = end
        max_len = max(max_len, end - start + 1)
    return max_len`,
      cpp: `#include <string>
#include <unordered_map>
#include <algorithm>
using namespace std;

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> map;
        int maxLen = 0, start = 0;
        for (int end = 0; end < s.length(); end++) {
            if (map.count(s[end]) && map[s[end]] >= start) {
                start = map[s[end]] + 1;
            }
            map[s[end]] = end;
            maxLen = max(maxLen, end - start + 1);
        }
        return maxLen;
    }
};`,
      java: `import java.util.HashMap;

class Solution {
    public int lengthOfLongestSubstring(String s) {
        HashMap<Character, Integer> map = new HashMap<>();
        int maxLen = 0, start = 0;
        for (int end = 0; end < s.length(); end++) {
            char c = s.charAt(end);
            if (map.containsKey(c) && map.get(c) >= start) {
                start = map.get(c) + 1;
            }
            map.put(c, end);
            maxLen = Math.max(maxLen, end - start + 1);
        }
        return maxLen;
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: ['abcabcbb'],
        inputFormatted: 's = "abcabcbb"',
        expectedOutput: 3,
        expectedOutputFormatted: '3',
      },
      {
        id: 'tc_2',
        input: ['bbbbb'],
        inputFormatted: 's = "bbbbb"',
        expectedOutput: 1,
        expectedOutputFormatted: '1',
      },
      {
        id: 'tc_3',
        input: ['pwwkew'],
        inputFormatted: 's = "pwwkew"',
        expectedOutput: 3,
        expectedOutputFormatted: '3',
      },
      {
        id: 'tc_hidden',
        input: ['dvdf'],
        inputFormatted: 's = "dvdf"',
        expectedOutput: 3,
        expectedOutputFormatted: '3',
        isHidden: true,
      },
    ],
  },
  {
    id: 'lc_53',
    title: 'Maximum Subarray',
    platform: 'leetcode',
    platformProblemNumber: '53',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming'],
    description: `Given an integer array \`nums\`, find the subarray with the largest sum, and return its sum.

A subarray is a contiguous non-empty sequence of elements within an array.`,
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4',
    ],
    examples: [
      {
        input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        output: '6',
        explanation: 'The subarray [4, -1, 2, 1] has the largest sum 6.',
      },
      {
        input: 'nums = [1]',
        output: '1',
      },
      {
        input: 'nums = [5, 4, -1, 7, 8]',
        output: '23',
      },
    ],
    functionName: 'maxSubArray',
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  let maxCurrent = nums[0];
  let maxGlobal = nums[0];

  for (let i = 1; i < nums.length; i++) {
    maxCurrent = Math.max(nums[i], maxCurrent + nums[i]);
    if (maxCurrent > maxGlobal) {
      maxGlobal = maxCurrent;
    }
  }
  return maxGlobal;
}`,
      python: `def maxSubArray(nums):
    max_current = max_global = nums[0]
    for num in nums[1:]:
        max_current = max(num, max_current + num)
        max_global = max(max_global, max_current)
    return max_global`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int maxCur = nums[0], maxGlo = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            maxCur = max(nums[i], maxCur + nums[i]);
            maxGlo = max(maxGlo, maxCur);
        }
        return maxGlo;
    }
};`,
      java: `class Solution {
    public int maxSubArray(int[] nums) {
        int maxCur = nums[0], maxGlo = nums[0];
        for (int i = 1; i < nums.length; i++) {
            maxCur = Math.max(nums[i], maxCur + nums[i]);
            maxGlo = Math.max(maxGlo, maxCur);
        }
        return maxGlo;
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]],
        inputFormatted: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]',
        expectedOutput: 6,
        expectedOutputFormatted: '6',
      },
      {
        id: 'tc_2',
        input: [[1]],
        inputFormatted: 'nums = [1]',
        expectedOutput: 1,
        expectedOutputFormatted: '1',
      },
      {
        id: 'tc_3',
        input: [[5, 4, -1, 7, 8]],
        inputFormatted: 'nums = [5, 4, -1, 7, 8]',
        expectedOutput: 23,
        expectedOutputFormatted: '23',
      },
    ],
  },
  {
    id: 'lc_206',
    title: 'Reverse Linked List',
    platform: 'leetcode',
    platformProblemNumber: '206',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Linked List',
    tags: ['Linked List', 'Recursion'],
    description: `Given the array representation of a singly linked list, reverse the list, and return the reversed list.`,
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000',
    ],
    examples: [
      {
        input: 'head = [1, 2, 3, 4, 5]',
        output: '[5, 4, 3, 2, 1]',
      },
      {
        input: 'head = [1, 2]',
        output: '[2, 1]',
      },
      {
        input: 'head = []',
        output: '[]',
      },
    ],
    functionName: 'reverseList',
    starterCode: {
      javascript: `/**
 * @param {number[]} head
 * @return {number[]}
 */
function reverseList(head) {
  const result = [];
  for (let i = head.length - 1; i >= 0; i--) {
    result.push(head[i]);
  }
  return result;
}`,
      python: `def reverseList(head):
    return head[::-1]`,
      cpp: `#include <vector>
#include <algorithm>
using namespace std;

class Solution {
public:
    vector<int> reverseList(vector<int>& head) {
        vector<int> res = head;
        reverse(res.begin(), res.end());
        return res;
    }
};`,
      java: `import java.util.ArrayList;
import java.util.Collections;

class Solution {
    public int[] reverseList(int[] head) {
        int[] res = new int[head.length];
        for (int i = 0; i < head.length; i++) {
            res[i] = head[head.length - 1 - i];
        }
        return res;
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: [[1, 2, 3, 4, 5]],
        inputFormatted: 'head = [1, 2, 3, 4, 5]',
        expectedOutput: [5, 4, 3, 2, 1],
        expectedOutputFormatted: '[5, 4, 3, 2, 1]',
      },
      {
        id: 'tc_2',
        input: [[1, 2]],
        inputFormatted: 'head = [1, 2]',
        expectedOutput: [2, 1],
        expectedOutputFormatted: '[2, 1]',
      },
      {
        id: 'tc_3',
        input: [[]],
        inputFormatted: 'head = []',
        expectedOutput: [],
        expectedOutputFormatted: '[]',
      },
    ],
  },

  // ================= HACKERRANK =================
  {
    id: 'hr_left_rotation',
    title: 'Left Rotation',
    platform: 'hackerrank',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Arrays',
    tags: ['Arrays', 'Data Structures'],
    description: `A left rotation operation on an array of size \`n\` shifts each of the array's elements \`1\` unit to the left. Given an integer \`d\`, rotate the array that many steps left and return the result.`,
    constraints: [
      '1 <= n <= 10^5',
      '1 <= d <= n',
      '1 <= a[i] <= 10^6',
    ],
    examples: [
      {
        input: 'a = [1, 2, 3, 4, 5], d = 4',
        output: '[5, 1, 2, 3, 4]',
      },
      {
        input: 'a = [1, 2, 3, 4, 5], d = 2',
        output: '[3, 4, 5, 1, 2]',
      },
    ],
    functionName: 'rotLeft',
    starterCode: {
      javascript: `/**
 * Complete the 'rotLeft' function below.
 * @param {number[]} a
 * @param {number} d
 * @return {number[]}
 */
function rotLeft(a, d) {
  const k = d % a.length;
  return a.slice(k).concat(a.slice(0, k));
}`,
      python: `def rotLeft(a, d):
    k = d % len(a)
    return a[k:] + a[:k]`,
      cpp: `#include <vector>
using namespace std;

vector<int> rotLeft(vector<int> a, int d) {
    int n = a.size();
    vector<int> res(n);
    for (int i = 0; i < n; i++) {
        res[i] = a[(i + d) % n];
    }
    return res;
}`,
      java: `class Result {
    public static int[] rotLeft(int[] a, int d) {
        int n = a.length;
        int[] res = new int[n];
        for (int i = 0; i < n; i++) {
            res[i] = a[(i + d) % n];
        }
        return res;
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: [[1, 2, 3, 4, 5], 4],
        inputFormatted: 'a = [1, 2, 3, 4, 5], d = 4',
        expectedOutput: [5, 1, 2, 3, 4],
        expectedOutputFormatted: '[5, 1, 2, 3, 4]',
      },
      {
        id: 'tc_2',
        input: [[1, 2, 3, 4, 5], 2],
        inputFormatted: 'a = [1, 2, 3, 4, 5], d = 2',
        expectedOutput: [3, 4, 5, 1, 2],
        expectedOutputFormatted: '[3, 4, 5, 1, 2]',
      },
      {
        id: 'tc_3',
        input: [[41, 73, 89, 7, 10, 1, 59, 58, 84, 77], 4],
        inputFormatted: 'a = [41, 73, 89, 7, 10, 1, 59, 58, 84, 77], d = 4',
        expectedOutput: [10, 1, 59, 58, 84, 77, 41, 73, 89, 7],
        expectedOutputFormatted: '[10, 1, 59, 58, 84, 77, 41, 73, 89, 7]',
      },
    ],
  },
  {
    id: 'hr_balanced_brackets',
    title: 'Balanced Brackets',
    platform: 'hackerrank',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Stacks',
    tags: ['Stack', 'Strings'],
    description: `A bracket is considered to be any one of the following characters: \`(\`, \`)\`, \`{\`, \`}\`, \`[\`, or \`]\`.

Two brackets are considered to be a matched pair if an opening bracket occurs to the left of a closing bracket of the exact same type.

Given a string of brackets, determine whether the sequence is balanced. If balanced, return \`"YES"\`. Otherwise, return \`"NO"\`.`,
    constraints: [
      '1 <= s.length <= 10^3',
      'All characters are in {[()]}',
    ],
    examples: [
      {
        input: 's = "{[()]}"',
        output: '"YES"',
      },
      {
        input: 's = "{[(])}"',
        output: '"NO"',
      },
      {
        input: 's = "{{[[(())]]}}"',
        output: '"YES"',
      },
    ],
    functionName: 'isBalanced',
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {string} "YES" or "NO"
 */
function isBalanced(s) {
  const stack = [];
  const map = {
    ')': '(',
    '}': '{',
    ']': '['
  };

  for (const ch of s) {
    if (ch === '(' || ch === '{' || ch === '[') {
      stack.push(ch);
    } else {
      if (stack.length === 0 || stack.pop() !== map[ch]) {
        return "NO";
      }
    }
  }
  return stack.length === 0 ? "YES" : "NO";
}`,
      python: `def isBalanced(s):
    stack = []
    pairs = {')': '(', '}': '{', ']': '['}
    for char in s:
        if char in '({[':
            stack.append(char)
        elif char in pairs:
            if not stack or stack.pop() != pairs[char]:
                return "NO"
    return "YES" if not stack else "NO"`,
      cpp: `#include <string>
#include <stack>
using namespace std;

string isBalanced(string s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '{' || c == '[') st.push(c);
        else {
            if (st.empty()) return "NO";
            if (c == ')' && st.top() != '(') return "NO";
            if (c == '}' && st.top() != '{') return "NO";
            if (c == ']' && st.top() != '[') return "NO";
            st.pop();
        }
    }
    return st.empty() ? "YES" : "NO";
}`,
      java: `import java.util.Stack;

class Result {
    public static String isBalanced(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) return "NO";
                if (c == ')' && stack.pop() != '(') return "NO";
                if (c == '}' && stack.pop() != '{') return "NO";
                if (c == ']' && stack.pop() != '[') return "NO";
            }
        }
        return stack.isEmpty() ? "YES" : "NO";
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: ['{[()]}'],
        inputFormatted: 's = "{[()]}"',
        expectedOutput: 'YES',
        expectedOutputFormatted: '"YES"',
      },
      {
        id: 'tc_2',
        input: ['{[(])}'],
        inputFormatted: 's = "{[(])}"',
        expectedOutput: 'NO',
        expectedOutputFormatted: '"NO"',
      },
      {
        id: 'tc_3',
        input: ['{{[[(())]]}}'],
        inputFormatted: 's = "{{[[(())]]}}"',
        expectedOutput: 'YES',
        expectedOutputFormatted: '"YES"',
      },
    ],
  },

  // ================= CODEFORCES =================
  {
    id: 'cf_4a',
    title: 'Watermelon (4A)',
    platform: 'codeforces',
    platformProblemNumber: '4A',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Math & Logic',
    tags: ['Math', 'Brute Force'],
    description: `One hot summer day Pete and his friend Billy decided to buy a watermelon. They chose the biggest and the ripest one. After that the watermelon was weighed, and the scales showed \`w\` kilos.

They rushed home, dying of thirst, and decided to divide the berry, however they faced a hard problem.

Pete and Billy are great fans of even numbers, that's why they want to divide the watermelon into two parts, each of them weighing an even number of kilos; and of course, each part should have a positive weight.

Can they divide the watermelon in the way they want? Return \`"YES"\` or \`"NO"\`.`,
    constraints: [
      '1 <= w <= 100',
    ],
    examples: [
      {
        input: 'w = 8',
        output: '"YES"',
        explanation: 'For example, the boys can divide the watermelon into two parts of 2 and 6 kilos respectively (another variant — two parts of 4 and 4 kilos).',
      },
      {
        input: 'w = 2',
        output: '"NO"',
        explanation: 'Only positive parts are allowed: 1 and 1 (both are odd).',
      },
    ],
    functionName: 'canSplitWatermelon',
    starterCode: {
      javascript: `/**
 * Codeforces 4A - Watermelon
 * @param {number} w - weight in kilos
 * @return {string} "YES" or "NO"
 */
function canSplitWatermelon(w) {
  if (w > 2 && w % 2 === 0) {
    return "YES";
  }
  return "NO";
}`,
      python: `def canSplitWatermelon(w):
    return "YES" if w > 2 and w % 2 == 0 else "NO"`,
      cpp: `#include <string>
using namespace std;

string canSplitWatermelon(int w) {
    return (w > 2 && w % 2 == 0) ? "YES" : "NO";
}`,
      java: `class Solution {
    public static String canSplitWatermelon(int w) {
        return (w > 2 && w % 2 == 0) ? "YES" : "NO";
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: [8],
        inputFormatted: 'w = 8',
        expectedOutput: 'YES',
        expectedOutputFormatted: '"YES"',
      },
      {
        id: 'tc_2',
        input: [2],
        inputFormatted: 'w = 2',
        expectedOutput: 'NO',
        expectedOutputFormatted: '"NO"',
      },
      {
        id: 'tc_3',
        input: [10],
        inputFormatted: 'w = 10',
        expectedOutput: 'YES',
        expectedOutputFormatted: '"YES"',
      },
      {
        id: 'tc_4',
        input: [7],
        inputFormatted: 'w = 7',
        expectedOutput: 'NO',
        expectedOutputFormatted: '"NO"',
      },
    ],
  },
  {
    id: 'cf_71a',
    title: 'Way Too Long Words (71A)',
    platform: 'codeforces',
    platformProblemNumber: '71A',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Strings',
    tags: ['Strings'],
    description: `Sometimes some words like \`"localization"\` or \`"internationalization"\` are so long that writing them many times in one text is quite tiresome.

Let's consider a word too long, if its length is strictly more than 10 characters. All too long words should be replaced with a special abbreviation.

This abbreviation is made like this: we write down the first and the last letter of a word and between them we write the number of letters between the first and the last letters.

For example, \`"localization"\` will be written as \`"l10n"\`, and \`"internationalization"\` will be \`"i18n"\`. Words of length <= 10 remain unchanged.`,
    constraints: [
      '1 <= word.length <= 100',
      'Word consists of lowercase Latin letters.',
    ],
    examples: [
      {
        input: 'word = "localization"',
        output: '"l10n"',
      },
      {
        input: 'word = "word"',
        output: '"word"',
      },
    ],
    functionName: 'abbreviateWord',
    starterCode: {
      javascript: `/**
 * Codeforces 71A - Way Too Long Words
 * @param {string} word
 * @return {string}
 */
function abbreviateWord(word) {
  if (word.length > 10) {
    return word[0] + (word.length - 2) + word[word.length - 1];
  }
  return word;
}`,
      python: `def abbreviateWord(word):
    if len(word) > 10:
        return f"{word[0]}{len(word) - 2}{word[-1]}"
    return word`,
      cpp: `#include <string>
using namespace std;

string abbreviateWord(string word) {
    if (word.length() > 10) {
        return word.front() + to_string(word.length() - 2) + word.back();
    }
    return word;
}`,
      java: `class Solution {
    public static String abbreviateWord(String word) {
        if (word.length() > 10) {
            return "" + word.charAt(0) + (word.length() - 2) + word.charAt(word.length() - 1);
        }
        return word;
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: ['localization'],
        inputFormatted: 'word = "localization"',
        expectedOutput: 'l10n',
        expectedOutputFormatted: '"l10n"',
      },
      {
        id: 'tc_2',
        input: ['internationalization'],
        inputFormatted: 'word = "internationalization"',
        expectedOutput: 'i18n',
        expectedOutputFormatted: '"i18n"',
      },
      {
        id: 'tc_3',
        input: ['word'],
        inputFormatted: 'word = "word"',
        expectedOutput: 'word',
        expectedOutputFormatted: '"word"',
      },
    ],
  },
  {
    id: 'cf_1a',
    title: 'Theatre Square (1A)',
    platform: 'codeforces',
    platformProblemNumber: '1A',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Math & Geometry',
    tags: ['Math'],
    description: `Theatre Square in the capital city of Berland has a rectangular shape with the size \`n x m\` meters. On the occasion of the city's anniversary, a decision was taken to pave the Square with square granite flagstones. Each flagstone is of the size \`a x a\`.

What is the least number of flagstones needed to pave the Square? It's allowed to cover the surface larger than the Theatre Square, but the Square has to be covered. It's not allowed to break the flagstones. The sides of flagstones must be parallel to the sides of the Square.`,
    constraints: [
      '1 <= n, m, a <= 10^9',
    ],
    examples: [
      {
        input: 'n = 6, m = 6, a = 4',
        output: '4',
        explanation: 'Ceil(6/4) * Ceil(6/4) = 2 * 2 = 4 flagstones.',
      },
      {
        input: 'n = 1, m = 1, a = 1',
        output: '1',
      },
    ],
    functionName: 'theatreSquare',
    starterCode: {
      javascript: `/**
 * Codeforces 1A - Theatre Square
 * @param {number} n - length
 * @param {number} m - width
 * @param {number} a - flagstone side
 * @return {number}
 */
function theatreSquare(n, m, a) {
  const stonesN = Math.ceil(n / a);
  const stonesM = Math.ceil(m / a);
  return stonesN * stonesM;
}`,
      python: `import math

def theatreSquare(n, m, a):
    stones_n = math.ceil(n / a)
    stones_m = math.ceil(m / a)
    return stones_n * stones_m`,
      cpp: `#include <cmath>
using namespace std;

long long theatreSquare(long long n, long long m, long long a) {
    long long countN = (n + a - 1) / a;
    long long countM = (m + a - 1) / a;
    return countN * countM;
}`,
      java: `class Solution {
    public static long theatreSquare(long n, long m, long a) {
        long countN = (n + a - 1) / a;
        long countM = (m + a - 1) / a;
        return countN * countM;
    }
}`,
    },
    testCases: [
      {
        id: 'tc_1',
        input: [6, 6, 4],
        inputFormatted: 'n = 6, m = 6, a = 4',
        expectedOutput: 4,
        expectedOutputFormatted: '4',
      },
      {
        id: 'tc_2',
        input: [1, 1, 1],
        inputFormatted: 'n = 1, m = 1, a = 1',
        expectedOutput: 1,
        expectedOutputFormatted: '1',
      },
      {
        id: 'tc_3',
        input: [12, 13, 4],
        inputFormatted: 'n = 12, m = 13, a = 4',
        expectedOutput: 12,
        expectedOutputFormatted: '12',
      },
    ],
  },
];
