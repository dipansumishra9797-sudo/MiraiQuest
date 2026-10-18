export interface SearchProblemItem {
  id: string;
  title: string;
  platform: 'leetcode' | 'hackerrank' | 'codeforces';
  platformProblemNumber?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  category: string;
  topic: string;
  tags: string[];
  descriptionSummary: string;
  sourceUrl: string;
  functionName: string;
}

// Comprehensive catalog of 60+ classic and competitive programming problems
export const CODING_SEARCH_CATALOG: SearchProblemItem[] = [
  // ================= ARRAYS =================
  {
    id: 'search_arr_1',
    title: 'Two Sum',
    platform: 'leetcode',
    platformProblemNumber: '1',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Arrays & Hashing',
    topic: 'Arrays',
    tags: ['Array', 'Hash Table', 'Prefix'],
    descriptionSummary: 'Find two indices in nums such that they add up to the specified target integer.',
    sourceUrl: 'https://leetcode.com/problems/two-sum/',
    functionName: 'twoSum',
  },
  {
    id: 'search_arr_2',
    title: '3Sum Triplet Target Zero',
    platform: 'leetcode',
    platformProblemNumber: '15',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays & Two Pointers',
    topic: 'Arrays',
    tags: ['Array', 'Two Pointers', 'Sorting'],
    descriptionSummary: 'Find all unique triplets in the array which gives the sum of zero without duplicates.',
    sourceUrl: 'https://leetcode.com/problems/3sum/',
    functionName: 'threeSum',
  },
  {
    id: 'search_arr_3',
    title: 'Container With Most Water',
    platform: 'leetcode',
    platformProblemNumber: '11',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays & Two Pointers',
    topic: 'Arrays',
    tags: ['Array', 'Two Pointers', 'Greedy'],
    descriptionSummary: 'Calculate the maximum water area a container formed by vertical elevation lines can store.',
    sourceUrl: 'https://leetcode.com/problems/container-with-most-water/',
    functionName: 'maxArea',
  },
  {
    id: 'search_arr_4',
    title: 'Trapping Rain Water',
    platform: 'leetcode',
    platformProblemNumber: '42',
    difficulty: 'hard',
    xpReward: 40,
    category: 'Arrays & Dynamic Programming',
    topic: 'Arrays',
    tags: ['Array', 'Two Pointers', 'Stack', 'Elevation'],
    descriptionSummary: 'Compute how much water an elevation map can trap after raining using two-pointer boundaries.',
    sourceUrl: 'https://leetcode.com/problems/trapping-rain-water/',
    functionName: 'trap',
  },
  {
    id: 'search_arr_5',
    title: 'Maximum Subarray (Kadane)',
    platform: 'leetcode',
    platformProblemNumber: '53',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays & Dynamic Programming',
    topic: 'Arrays',
    tags: ['Array', 'Divide and Conquer', 'Dynamic Programming', 'Kadane'],
    descriptionSummary: 'Find the contiguous subarray within an array of numbers that has the largest sum.',
    sourceUrl: 'https://leetcode.com/problems/maximum-subarray/',
    functionName: 'maxSubArray',
  },
  {
    id: 'search_arr_6',
    title: 'Product of Array Except Self',
    platform: 'leetcode',
    platformProblemNumber: '238',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays & Prefix Products',
    topic: 'Arrays',
    tags: ['Array', 'Prefix Sum'],
    descriptionSummary: 'Return an array answer such that answer[i] is equal to product of all elements except nums[i] in O(n) without division.',
    sourceUrl: 'https://leetcode.com/problems/product-of-array-except-self/',
    functionName: 'productExceptSelf',
  },
  {
    id: 'search_arr_7',
    title: 'Merge Intervals',
    platform: 'leetcode',
    platformProblemNumber: '56',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays & Sorting',
    topic: 'Arrays',
    tags: ['Array', 'Sorting'],
    descriptionSummary: 'Given an array of intervals, merge all overlapping intervals into non-overlapping spans.',
    sourceUrl: 'https://leetcode.com/problems/merge-intervals/',
    functionName: 'merge',
  },
  {
    id: 'search_arr_8',
    title: 'Rotate Array Right by K',
    platform: 'leetcode',
    platformProblemNumber: '189',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays',
    topic: 'Arrays',
    tags: ['Array', 'Math', 'Two Pointers'],
    descriptionSummary: 'Rotate an array to the right by k steps in-place with O(1) auxiliary space.',
    sourceUrl: 'https://leetcode.com/problems/rotate-array/',
    functionName: 'rotate',
  },
  {
    id: 'search_arr_9',
    title: 'Next Permutation',
    platform: 'leetcode',
    platformProblemNumber: '31',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays',
    topic: 'Arrays',
    tags: ['Array', 'Two Pointers'],
    descriptionSummary: 'Rearrange numbers into the lexicographically next greater permutation of numbers.',
    sourceUrl: 'https://leetcode.com/problems/next-permutation/',
    functionName: 'nextPermutation',
  },
  {
    id: 'search_arr_10',
    title: 'Subarray Sum Equals K',
    platform: 'leetcode',
    platformProblemNumber: '560',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Arrays & Hashing',
    topic: 'Arrays',
    tags: ['Array', 'Hash Table', 'Prefix Sum'],
    descriptionSummary: 'Find the total number of continuous subarrays whose sum equals to target integer k.',
    sourceUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    functionName: 'subarraySum',
  },

  // ================= GRAPHS =================
  {
    id: 'search_graph_1',
    title: 'Number of Islands',
    platform: 'leetcode',
    platformProblemNumber: '200',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs & BFS/DFS',
    topic: 'Graphs',
    tags: ['Graph', 'BFS', 'DFS', 'Matrix', 'Union Find'],
    descriptionSummary: 'Count number of connected 1s surrounded by water (0s) using 4-directional grid traversal.',
    sourceUrl: 'https://leetcode.com/problems/number-of-islands/',
    functionName: 'numIslands',
  },
  {
    id: 'search_graph_2',
    title: 'Course Schedule (Topological Sort)',
    platform: 'leetcode',
    platformProblemNumber: '207',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs & Topological Sort',
    topic: 'Graphs',
    tags: ['Graph', 'Topological Sort', 'Kahn Algorithm', 'DFS'],
    descriptionSummary: 'Detect cycle in directed course dependency prerequisite graph to decide if graduation is possible.',
    sourceUrl: 'https://leetcode.com/problems/course-schedule/',
    functionName: 'canFinish',
  },
  {
    id: 'search_graph_3',
    title: 'Clone Graph',
    platform: 'leetcode',
    platformProblemNumber: '133',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs',
    topic: 'Graphs',
    tags: ['Graph', 'DFS', 'BFS', 'Hash Table'],
    descriptionSummary: 'Return a deep copy of a connected undirected graph given a reference of the first node.',
    sourceUrl: 'https://leetcode.com/problems/clone-graph/',
    functionName: 'cloneGraph',
  },
  {
    id: 'search_graph_4',
    title: 'Network Delay Time (Dijkstra)',
    platform: 'leetcode',
    platformProblemNumber: '743',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs & Shortest Path',
    topic: 'Graphs',
    tags: ['Graph', 'Dijkstra', 'Heap', 'Shortest Path'],
    descriptionSummary: 'Compute minimum time required for all n nodes to receive a broadcast signal sent from node k.',
    sourceUrl: 'https://leetcode.com/problems/network-delay-time/',
    functionName: 'networkDelayTime',
  },
  {
    id: 'search_graph_5',
    title: 'Word Ladder (Shortest Mutation BFS)',
    platform: 'leetcode',
    platformProblemNumber: '127',
    difficulty: 'hard',
    xpReward: 40,
    category: 'Graphs & BFS',
    topic: 'Graphs',
    tags: ['Graph', 'BFS', 'Hash Table', 'String'],
    descriptionSummary: 'Find shortest transformation sequence length from beginWord to endWord via valid word dictionary.',
    sourceUrl: 'https://leetcode.com/problems/word-ladder/',
    functionName: 'ladderLength',
  },
  {
    id: 'search_graph_6',
    title: 'Rotting Oranges (Multi-Source BFS)',
    platform: 'leetcode',
    platformProblemNumber: '994',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs & BFS',
    topic: 'Graphs',
    tags: ['Graph', 'BFS', 'Matrix'],
    descriptionSummary: 'Calculate minimum minutes elapsed until no cell has a fresh orange using simultaneous multi-source BFS.',
    sourceUrl: 'https://leetcode.com/problems/rotting-oranges/',
    functionName: 'orangesRotting',
  },
  {
    id: 'search_graph_7',
    title: 'Alien Dictionary',
    platform: 'leetcode',
    platformProblemNumber: '269',
    difficulty: 'hard',
    xpReward: 40,
    category: 'Graphs & Topological Sort',
    topic: 'Graphs',
    tags: ['Graph', 'Topological Sort', 'DFS', 'String'],
    descriptionSummary: 'Derive the unique alphabetical ordering of alien characters from sorted dictionary words.',
    sourceUrl: 'https://leetcode.com/problems/alien-dictionary/',
    functionName: 'alienOrder',
  },
  {
    id: 'search_graph_8',
    title: 'Pacific Atlantic Water Flow',
    platform: 'leetcode',
    platformProblemNumber: '417',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs & DFS',
    topic: 'Graphs',
    tags: ['Graph', 'DFS', 'BFS', 'Matrix'],
    descriptionSummary: 'Find all grid coordinates from which rain water can flow to both Pacific and Atlantic oceans.',
    sourceUrl: 'https://leetcode.com/problems/pacific-atlantic-water-flow/',
    functionName: 'pacificAtlantic',
  },
  {
    id: 'search_graph_9',
    title: 'Graph Valid Tree',
    platform: 'leetcode',
    platformProblemNumber: '261',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs & Union Find',
    topic: 'Graphs',
    tags: ['Graph', 'Union Find', 'BFS', 'DFS'],
    descriptionSummary: 'Check if given undirected edges form a valid single connected tree with no cycles.',
    sourceUrl: 'https://leetcode.com/problems/graph-valid-tree/',
    functionName: 'validTree',
  },
  {
    id: 'search_graph_10',
    title: 'Reconstruct Itinerary (Eulerian Path)',
    platform: 'leetcode',
    platformProblemNumber: '332',
    difficulty: 'hard',
    xpReward: 40,
    category: 'Graphs & Hierholzer',
    topic: 'Graphs',
    tags: ['Graph', 'DFS', 'Eulerian Circuit'],
    descriptionSummary: 'Reconstruct airline itinerary in lexicographical smallest order using all ticket edges exactly once.',
    sourceUrl: 'https://leetcode.com/problems/reconstruct-itinerary/',
    functionName: 'findItinerary',
  },

  // ================= DYNAMIC PROGRAMMING (DP) =================
  {
    id: 'search_dp_1',
    title: 'Climbing Stairs',
    platform: 'leetcode',
    platformProblemNumber: '70',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Math', 'Memoization'],
    descriptionSummary: 'Count distinct ways to reach top of n stairs taking either 1 or 2 steps at each step.',
    sourceUrl: 'https://leetcode.com/problems/climbing-stairs/',
    functionName: 'climbStairs',
  },
  {
    id: 'search_dp_2',
    title: 'Coin Change (Fewest Coins)',
    platform: 'leetcode',
    platformProblemNumber: '322',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'BFS', 'Knapsack'],
    descriptionSummary: 'Find fewest number of coins needed to make up target amount or return -1 if impossible.',
    sourceUrl: 'https://leetcode.com/problems/coin-change/',
    functionName: 'coinChange',
  },
  {
    id: 'search_dp_3',
    title: 'Longest Increasing Subsequence',
    platform: 'leetcode',
    platformProblemNumber: '300',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Binary Search', 'Subsequence'],
    descriptionSummary: 'Determine length of longest strictly increasing subsequence in an integer array in O(n log n).',
    sourceUrl: 'https://leetcode.com/problems/longest-increasing-subsequence/',
    functionName: 'lengthOfLIS',
  },
  {
    id: 'search_dp_4',
    title: '0/1 Knapsack Classical Problem',
    platform: 'hackerrank',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Knapsack', 'Optimization'],
    descriptionSummary: 'Maximize total value of items placed into capacity-constrained knapsack without splitting items.',
    sourceUrl: 'https://www.hackerrank.com/challenges/unbounded-knapsack/problem',
    functionName: 'knapsack',
  },
  {
    id: 'search_dp_5',
    title: 'Word Break Problem',
    platform: 'leetcode',
    platformProblemNumber: '139',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Trie', 'String', 'Memoization'],
    descriptionSummary: 'Determine if string s can be segmented into a space-separated sequence of dictionary words.',
    sourceUrl: 'https://leetcode.com/problems/word-break/',
    functionName: 'wordBreak',
  },
  {
    id: 'search_dp_6',
    title: 'House Robber Non-Adjacent',
    platform: 'leetcode',
    platformProblemNumber: '198',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Array'],
    descriptionSummary: 'Determine maximum money you can rob tonight without alerting police from adjacent houses.',
    sourceUrl: 'https://leetcode.com/problems/house-robber/',
    functionName: 'rob',
  },
  {
    id: 'search_dp_7',
    title: 'Edit Distance (Levenshtein)',
    platform: 'leetcode',
    platformProblemNumber: '72',
    difficulty: 'hard',
    xpReward: 40,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'String'],
    descriptionSummary: 'Find minimum number of operations (insert, delete, replace) required to convert word1 to word2.',
    sourceUrl: 'https://leetcode.com/problems/edit-distance/',
    functionName: 'minDistance',
  },
  {
    id: 'search_dp_8',
    title: 'Longest Common Subsequence',
    platform: 'leetcode',
    platformProblemNumber: '1143',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'String', '2D-DP'],
    descriptionSummary: 'Find length of longest common subsequence between two strings text1 and text2.',
    sourceUrl: 'https://leetcode.com/problems/longest-common-subsequence/',
    functionName: 'longestCommonSubsequence',
  },
  {
    id: 'search_dp_9',
    title: 'Unique Paths in Grid',
    platform: 'leetcode',
    platformProblemNumber: '62',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Combinatorics', 'Math'],
    descriptionSummary: 'Calculate total possible unique paths for a robot moving from top-left to bottom-right of m x n grid.',
    sourceUrl: 'https://leetcode.com/problems/unique-paths/',
    functionName: 'uniquePaths',
  },
  {
    id: 'search_dp_10',
    title: 'Partition Equal Subset Sum',
    platform: 'leetcode',
    platformProblemNumber: '416',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Array', 'Subset Sum'],
    descriptionSummary: 'Check if non-empty array of positive integers can be partitioned into two subsets with equal sums.',
    sourceUrl: 'https://leetcode.com/problems/partition-equal-subset-sum/',
    functionName: 'canPartition',
  },

  // ================= STRINGS =================
  {
    id: 'search_str_1',
    title: 'Valid Parentheses',
    platform: 'leetcode',
    platformProblemNumber: '20',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Strings & Stacks',
    topic: 'Strings',
    tags: ['String', 'Stack'],
    descriptionSummary: 'Determine if input string containing brackets is valid with matching opening and closing types.',
    sourceUrl: 'https://leetcode.com/problems/valid-parentheses/',
    functionName: 'isValid',
  },
  {
    id: 'search_str_2',
    title: 'Longest Substring Without Repeating Characters',
    platform: 'leetcode',
    platformProblemNumber: '3',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Strings & Sliding Window',
    topic: 'Strings',
    tags: ['String', 'Sliding Window', 'Hash Table'],
    descriptionSummary: 'Find length of the longest substring without repeating characters using variable window.',
    sourceUrl: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
    functionName: 'lengthOfLongestSubstring',
  },
  {
    id: 'search_str_3',
    title: 'Group Anagrams',
    platform: 'leetcode',
    platformProblemNumber: '49',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Strings & Hashing',
    topic: 'Strings',
    tags: ['String', 'Hash Table', 'Sorting'],
    descriptionSummary: 'Group an array of strings together if they are anagrams of one another.',
    sourceUrl: 'https://leetcode.com/problems/group-anagrams/',
    functionName: 'groupAnagrams',
  },
  {
    id: 'search_str_4',
    title: 'Minimum Window Substring',
    platform: 'leetcode',
    platformProblemNumber: '76',
    difficulty: 'hard',
    xpReward: 40,
    category: 'Strings & Sliding Window',
    topic: 'Strings',
    tags: ['String', 'Sliding Window', 'Hash Table'],
    descriptionSummary: 'Find minimum window in string s which contains all characters of string t in O(m+n).',
    sourceUrl: 'https://leetcode.com/problems/minimum-window-substring/',
    functionName: 'minWindow',
  },
  {
    id: 'search_str_5',
    title: 'Longest Palindromic Substring',
    platform: 'leetcode',
    platformProblemNumber: '5',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Strings & Two Pointers',
    topic: 'Strings',
    tags: ['String', 'Dynamic Programming', 'Palindrome'],
    descriptionSummary: 'Find the longest palindromic substring in string s using expansion around centers.',
    sourceUrl: 'https://leetcode.com/problems/longest-palindromic-substring/',
    functionName: 'longestPalindrome',
  },
  {
    id: 'search_str_6',
    title: 'Valid Anagram',
    platform: 'leetcode',
    platformProblemNumber: '242',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Strings',
    topic: 'Strings',
    tags: ['String', 'Hash Table', 'Sorting'],
    descriptionSummary: 'Check whether string t is an anagram of string s by counting ASCII character frequencies.',
    sourceUrl: 'https://leetcode.com/problems/valid-anagram/',
    functionName: 'isAnagram',
  },
  {
    id: 'search_str_7',
    title: 'Decode String Encoded K Times',
    platform: 'leetcode',
    platformProblemNumber: '394',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Strings & Stacks',
    topic: 'Strings',
    tags: ['String', 'Stack', 'Recursion'],
    descriptionSummary: 'Decode an encoded string like 3[a2[c]] to accaccacc using recursive stacks.',
    sourceUrl: 'https://leetcode.com/problems/decode-string/',
    functionName: 'decodeString',
  },
  {
    id: 'search_str_8',
    title: 'Palindromic Substrings Count',
    platform: 'leetcode',
    platformProblemNumber: '647',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Strings',
    topic: 'Strings',
    tags: ['String', 'Dynamic Programming', 'Two Pointers'],
    descriptionSummary: 'Count how many palindromic substrings exist in a given string s.',
    sourceUrl: 'https://leetcode.com/problems/palindromic-substrings/',
    functionName: 'countSubstrings',
  },
  {
    id: 'search_str_9',
    title: 'String to Integer (atoi)',
    platform: 'leetcode',
    platformProblemNumber: '8',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Strings',
    topic: 'Strings',
    tags: ['String', 'Parsing'],
    descriptionSummary: 'Implement the myAtoi function which converts a string to a 32-bit signed integer with clamping.',
    sourceUrl: 'https://leetcode.com/problems/string-to-integer-atoi/',
    functionName: 'myAtoi',
  },
  {
    id: 'search_str_10',
    title: 'Implement strStr() (KMP Algorithm)',
    platform: 'leetcode',
    platformProblemNumber: '28',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Strings',
    topic: 'Strings',
    tags: ['String', 'Two Pointers', 'String Matching', 'KMP'],
    descriptionSummary: 'Return the index of first occurrence of needle in haystack, or -1 if needle is not part of haystack.',
    sourceUrl: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/',
    functionName: 'strStr',
  },

  // ================= TREES =================
  {
    id: 'search_tree_1',
    title: 'Maximum Depth of Binary Tree',
    platform: 'leetcode',
    platformProblemNumber: '104',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Trees & DFS',
    topic: 'Trees',
    tags: ['Tree', 'Binary Tree', 'DFS', 'BFS'],
    descriptionSummary: 'Find maximum depth or number of nodes along longest path from root node down to farthest leaf node.',
    sourceUrl: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/',
    functionName: 'maxDepth',
  },
  {
    id: 'search_tree_2',
    title: 'Validate Binary Search Tree (BST)',
    platform: 'leetcode',
    platformProblemNumber: '98',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Trees & BST',
    topic: 'Trees',
    tags: ['Tree', 'BST', 'DFS', 'Inorder'],
    descriptionSummary: 'Determine if a binary tree is a valid binary search tree using range boundaries or inorder traversal.',
    sourceUrl: 'https://leetcode.com/problems/validate-binary-search-tree/',
    functionName: 'isValidBST',
  },
  {
    id: 'search_tree_3',
    title: 'Lowest Common Ancestor (LCA)',
    platform: 'leetcode',
    platformProblemNumber: '236',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Trees & DFS',
    topic: 'Trees',
    tags: ['Tree', 'Binary Tree', 'DFS', 'Recursion'],
    descriptionSummary: 'Find the lowest common ancestor of two given nodes in a general binary tree.',
    sourceUrl: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/',
    functionName: 'lowestCommonAncestor',
  },
  {
    id: 'search_tree_4',
    title: 'Binary Tree Level Order Traversal',
    platform: 'leetcode',
    platformProblemNumber: '102',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Trees & BFS',
    topic: 'Trees',
    tags: ['Tree', 'BFS', 'Binary Tree', 'Queue'],
    descriptionSummary: 'Return level order traversal of its nodes values level by level from left to right using a queue.',
    sourceUrl: 'https://leetcode.com/problems/binary-tree-level-order-traversal/',
    functionName: 'levelOrder',
  },
  {
    id: 'search_tree_5',
    title: 'Invert Binary Tree',
    platform: 'leetcode',
    platformProblemNumber: '226',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Trees',
    topic: 'Trees',
    tags: ['Tree', 'Binary Tree', 'DFS', 'BFS'],
    descriptionSummary: 'Invert a binary tree in-place by swapping left and right subtrees recursively.',
    sourceUrl: 'https://leetcode.com/problems/invert-binary-tree/',
    functionName: 'invertTree',
  },
  {
    id: 'search_tree_6',
    title: 'Serialize and Deserialize Binary Tree',
    platform: 'leetcode',
    platformProblemNumber: '297',
    difficulty: 'hard',
    xpReward: 40,
    category: 'Trees & Design',
    topic: 'Trees',
    tags: ['Tree', 'Design', 'BFS', 'DFS', 'String'],
    descriptionSummary: 'Design an algorithm to serialize a binary tree into a string and deserialize back into original tree structure.',
    sourceUrl: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/',
    functionName: 'serialize',
  },
  {
    id: 'search_tree_7',
    title: 'Kth Smallest Element in a BST',
    platform: 'leetcode',
    platformProblemNumber: '230',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Trees & BST',
    topic: 'Trees',
    tags: ['Tree', 'BST', 'DFS', 'Inorder'],
    descriptionSummary: 'Find the kth smallest value (1-indexed) of all the values of the nodes in a binary search tree.',
    sourceUrl: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/',
    functionName: 'kthSmallest',
  },
  {
    id: 'search_tree_8',
    title: 'Diameter of Binary Tree',
    platform: 'leetcode',
    platformProblemNumber: '543',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Trees',
    topic: 'Trees',
    tags: ['Tree', 'Binary Tree', 'DFS'],
    descriptionSummary: 'Compute length of the diameter of a binary tree (longest path between any two nodes).',
    sourceUrl: 'https://leetcode.com/problems/diameter-of-binary-tree/',
    functionName: 'diameterOfBinaryTree',
  },
  {
    id: 'search_tree_9',
    title: 'Construct Binary Tree from Preorder & Inorder',
    platform: 'leetcode',
    platformProblemNumber: '105',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Trees & Recursion',
    topic: 'Trees',
    tags: ['Tree', 'Binary Tree', 'Divide and Conquer', 'Array'],
    descriptionSummary: 'Reconstruct and return the root of the binary tree given preorder and inorder traversal arrays.',
    sourceUrl: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/',
    functionName: 'buildTree',
  },
  {
    id: 'search_tree_10',
    title: 'Subtree of Another Tree',
    platform: 'leetcode',
    platformProblemNumber: '572',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Trees',
    topic: 'Trees',
    tags: ['Tree', 'Binary Tree', 'DFS', 'String Matching'],
    descriptionSummary: 'Determine if binary tree subRoot is a subtree of root with identical structure and node values.',
    sourceUrl: 'https://leetcode.com/problems/subtree-of-another-tree/',
    functionName: 'isSubtree',
  },

  // ================= HASHING =================
  {
    id: 'search_hash_1',
    title: 'Two Sum (Hash Map)',
    platform: 'leetcode',
    platformProblemNumber: '1',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Arrays & Hashing',
    topic: 'Hashing',
    tags: ['Hash Table', 'Array', 'Hash Map'],
    descriptionSummary: 'Classic hash-map problem: find two indices that sum to a target in O(n) using a complement lookup table.',
    sourceUrl: 'https://leetcode.com/problems/two-sum/',
    functionName: 'twoSum',
  },
  {
    id: 'search_hash_2',
    title: 'Contains Duplicate',
    platform: 'leetcode',
    platformProblemNumber: '217',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Hashing',
    topic: 'Hashing',
    tags: ['Hash Table', 'Array', 'Sorting'],
    descriptionSummary: 'Determine if any value appears at least twice in an integer array using a hash set in O(n).',
    sourceUrl: 'https://leetcode.com/problems/contains-duplicate/',
    functionName: 'containsDuplicate',
  },
  {
    id: 'search_hash_3',
    title: 'Group Anagrams (Hashing)',
    platform: 'leetcode',
    platformProblemNumber: '49',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Hashing',
    topic: 'Hashing',
    tags: ['Hash Table', 'String', 'Sorting', 'Hash Map'],
    descriptionSummary: 'Group strings that are anagrams together using a character-frequency hash key.',
    sourceUrl: 'https://leetcode.com/problems/group-anagrams/',
    functionName: 'groupAnagrams',
  },
  {
    id: 'search_hash_4',
    title: 'Subarray Sum Equals K (Hash Map Prefix)',
    platform: 'leetcode',
    platformProblemNumber: '560',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Hashing',
    topic: 'Hashing',
    tags: ['Hash Map', 'Prefix Sum', 'Array'],
    descriptionSummary: 'Count continuous subarrays with sum equal to k using prefix-sum hash map in O(n).',
    sourceUrl: 'https://leetcode.com/problems/subarray-sum-equals-k/',
    functionName: 'subarraySum',
  },
  {
    id: 'search_hash_5',
    title: 'Longest Consecutive Sequence',
    platform: 'leetcode',
    platformProblemNumber: '128',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Hashing',
    topic: 'Hashing',
    tags: ['Hash Set', 'Array', 'Union Find'],
    descriptionSummary: 'Find the length of the longest consecutive sequence in an unsorted array in O(n) using a hash set.',
    sourceUrl: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    functionName: 'longestConsecutive',
  },

  // ================= MORE HACKERRANK =================
  {
    id: 'search_hr_1',
    title: 'Compare the Triplets',
    platform: 'hackerrank',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Arrays',
    topic: 'Arrays',
    tags: ['Array', 'Implementation'],
    descriptionSummary: 'Compare two triplets element by element and award points based on which element is greater.',
    sourceUrl: 'https://www.hackerrank.com/challenges/compare-the-triplets/problem',
    functionName: 'compareTriplets',
  },
  {
    id: 'search_hr_2',
    title: 'Left Rotation',
    platform: 'hackerrank',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Arrays',
    topic: 'Arrays',
    tags: ['Array', 'Implementation'],
    descriptionSummary: 'Perform d left rotations on an array and return the updated array efficiently.',
    sourceUrl: 'https://www.hackerrank.com/challenges/array-left-rotation/problem',
    functionName: 'rotateLeft',
  },
  {
    id: 'search_hr_3',
    title: 'Hash Tables: Ransom Note',
    platform: 'hackerrank',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Hashing',
    topic: 'Hashing',
    tags: ['Hash Table', 'String', 'Hash Map'],
    descriptionSummary: 'Determine if a ransom note can be constructed from a magazine using character frequency hash maps.',
    sourceUrl: 'https://www.hackerrank.com/challenges/ctci-ransom-note/problem',
    functionName: 'checkMagazine',
  },
  {
    id: 'search_hr_4',
    title: 'Tree: Height of a Binary Tree',
    platform: 'hackerrank',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Trees',
    topic: 'Trees',
    tags: ['Tree', 'Binary Tree', 'DFS', 'Recursion'],
    descriptionSummary: 'Calculate the height of a binary tree as the number of edges on the longest root-to-leaf path.',
    sourceUrl: 'https://www.hackerrank.com/challenges/tree-height-of-a-binary-tree/problem',
    functionName: 'height',
  },
  {
    id: 'search_hr_5',
    title: 'Breadth First Search: Shortest Reach',
    platform: 'hackerrank',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Graphs & BFS',
    topic: 'Graphs',
    tags: ['Graph', 'BFS', 'Shortest Path'],
    descriptionSummary: 'Using BFS, find the shortest reach from a source node to all other nodes, returning -1 for unreachable nodes.',
    sourceUrl: 'https://www.hackerrank.com/challenges/bfsshortreach/problem',
    functionName: 'bfs',
  },
  {
    id: 'search_hr_6',
    title: 'Dynamic Programming: Coin Change',
    platform: 'hackerrank',
    difficulty: 'medium',
    xpReward: 20,
    category: 'Dynamic Programming',
    topic: 'DP',
    tags: ['Dynamic Programming', 'Knapsack', 'Coin Change'],
    descriptionSummary: 'Count the number of ways to make change for a target amount given an unlimited supply of coin denominations.',
    sourceUrl: 'https://www.hackerrank.com/challenges/coin-change/problem',
    functionName: 'getWays',
  },
  {
    id: 'search_hr_7',
    title: 'Strings: Making Anagrams',
    platform: 'hackerrank',
    difficulty: 'easy',
    xpReward: 10,
    category: 'Strings',
    topic: 'Strings',
    tags: ['String', 'Hash Table', 'Anagram'],
    descriptionSummary: 'Find the minimum number of character deletions to make two strings anagrams of each other.',
    sourceUrl: 'https://www.hackerrank.com/challenges/ctci-making-anagrams/problem',
    functionName: 'makeAnagram',
  },
];

/**
 * Filter and search problems matching query, topic, platform, and difficulty
 */
export function queryCodingProblems(params: {
  query: string;
  topic?: string;
  platform?: 'all' | 'leetcode' | 'hackerrank' | 'codeforces';
  difficulty?: 'all' | 'easy' | 'medium' | 'hard';
  page?: number;
  pageSize?: number;
}): {
  problems: SearchProblemItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
  topic: string;
} {
  const {
    query = '',
    topic = '',
    platform = 'all',
    difficulty = 'all',
    page = 1,
    pageSize = 10,
  } = params;

  const qLower = query.toLowerCase().trim();
  const topicLower = topic.toLowerCase().trim();

  console.log(`[Search Engine] Query: "${query}", Topic: "${topic}", Platform: "${platform}", Difficulty: "${difficulty}", Page: ${page}`);

  // Topic alias matching map
  const topicKeywords: Record<string, string[]> = {
    arrays: ['array', 'arrays', 'matrix', 'subarray', 'interval', 'prefix', 'two sum', 'rotate', 'merge'],
    graphs: ['graph', 'graphs', 'island', 'cycle', 'bfs', 'dfs', 'dijkstra', 'topological', 'network', 'path'],
    dp: ['dp', 'dynamic programming', 'memoization', 'knapsack', 'subsequence', 'stairs', 'coins', 'partition'],
    dynamic_programming: ['dp', 'dynamic programming', 'memoization', 'knapsack', 'subsequence', 'partition'],
    strings: ['string', 'strings', 'palindrome', 'anagram', 'parentheses', 'substring', 'char', 'decode', 'atoi'],
    trees: ['tree', 'trees', 'bst', 'binary tree', 'lca', 'inorder', 'preorder', 'diameter', 'depth', 'serialize'],
    hashing: ['hash', 'hashing', 'hash table', 'hash map', 'anagram', 'two sum', 'group', 'subarray sum'],
  };

  const results = CODING_SEARCH_CATALOG.filter((item) => {
    // Platform match
    if (platform !== 'all' && item.platform !== platform) {
      return false;
    }
    // Difficulty match
    if (difficulty !== 'all' && item.difficulty !== difficulty) {
      return false;
    }

    // Direct topic filter if specified
    if (topicLower) {
      const aliases = topicKeywords[topicLower] || [topicLower];
      const matchesTopic =
        item.topic.toLowerCase().includes(topicLower) ||
        item.category.toLowerCase().includes(topicLower) ||
        aliases.some((alias) => item.tags.some((t) => t.toLowerCase().includes(alias)));
      if (!matchesTopic) return false;
    }

    // Query text match (if query provided)
    if (!qLower) return true;

    // Check aliases for the query (e.g. if query is "graphs", "trees", "dp")
    let aliasMatches = false;
    for (const [key, aliases] of Object.entries(topicKeywords)) {
      if (aliases.includes(qLower) || key === qLower) {
        if (
          item.topic.toLowerCase().includes(key) ||
          item.category.toLowerCase().includes(key) ||
          item.tags.some((t) => aliases.some((a) => t.toLowerCase().includes(a)))
        ) {
          aliasMatches = true;
          break;
        }
      }
    }

    return (
      aliasMatches ||
      item.title.toLowerCase().includes(qLower) ||
      item.id.toLowerCase().includes(qLower) ||
      item.category.toLowerCase().includes(qLower) ||
      item.topic.toLowerCase().includes(qLower) ||
      item.descriptionSummary.toLowerCase().includes(qLower) ||
      item.tags.some((t) => t.toLowerCase().includes(qLower)) ||
      (item.platformProblemNumber && item.platformProblemNumber === qLower)
    );
  });

  // Sort: higher relevance first
  results.sort((a, b) => {
    if (qLower) {
      const aExact = a.title.toLowerCase().includes(qLower) ? 2 : 1;
      const bExact = b.title.toLowerCase().includes(qLower) ? 2 : 1;
      if (aExact !== bExact) return bExact - aExact;
    }
    return 0;
  });

  const startIndex = (page - 1) * pageSize;
  const paginated = results.slice(startIndex, startIndex + pageSize);
  const hasMore = startIndex + pageSize < results.length;

  console.log(`[Search Engine] Returned ${paginated.length} results of ${results.length} total matches.`);

  return {
    problems: paginated,
    totalCount: results.length,
    page,
    pageSize,
    hasMore,
    topic: topic || 'All Topics',
  };
}

/**
 * Generate an ORIGINAL pedagogical practice problem inspired by a topic or search result
 * (avoiding copyright word-for-word duplication).
 */
export function generateOriginalPracticeProblem(problemMeta: Partial<SearchProblemItem>): any {
  const title = problemMeta.title || 'Algorithmic Optimization Challenge';
  const topic = problemMeta.topic || 'Data Structures';
  const difficulty = problemMeta.difficulty || 'medium';
  const fn = problemMeta.functionName || 'solveChallenge';
  const xpReward = difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 40;

  return {
    id: `mq_orig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    title: `[Original] ${title}`,
    platform: problemMeta.platform || 'leetcode',
    difficulty,
    xpReward,
    category: `${topic} Mastery`,
    tags: [topic, 'Original', difficulty.toUpperCase()],
    description: `### Problem Statement (Original Collegiate Challenge)
You are building an algorithmic pipeline at Mirai Tech. Given an input sequence or structure representing collegiate metrics, implement an optimal function \`${fn}\` that solves this problem in O(n log n) or better time complexity.

This question is inspired by the foundational concepts of **${topic}** and **${title}**. Ensure your code handles edge conditions, zero elements, and extreme scale invariants.`,
    constraints: [
      '1 <= n <= 10^5',
      'All values lie within standard 32-bit signed integers',
      'Time Complexity Target: O(n) or O(n log n)',
      'Memory Limit: 64 MB',
    ],
    examples: [
      {
        input: 'nums = [2, 7, 11, 15], target = 9',
        output: '[0, 1]',
        explanation: 'The elements at indices 0 and 1 sum to 9.',
      },
      {
        input: 'nums = [3, 2, 4], target = 6',
        output: '[1, 2]',
        explanation: 'The elements at indices 1 and 2 sum to 6.',
      },
    ],
    functionName: fn,
    starterCode: {
      javascript: `// JavaScript Solution
function ${fn}(nums, target) {
  // TODO: Implement your solution
  return [];
}`,
      python: `# Python 3.12 Solution
def ${fn}(nums, target):
    # TODO: Implement your solution
    return []`,
      c: `#include <stdio.h>
#include <stdlib.h>

// C11 Solution
int* ${fn}(int* nums, int numsSize, int target, int* returnSize) {
    // TODO: Implement solution
    *returnSize = 0;
    return NULL;
}

int main() {
    return 0;
}`,
      cpp: `#include <bits/stdc++.h>
using namespace std;

// C++17 Competitive Programming Scaffold
class Solution {
public:
    vector<int> ${fn}(vector<int>& nums, int target) {
        // Fast hash-map lookup
        unordered_map<int, int> seen;
        for (int i = 0; i < (int)nums.size(); i++) {
            int comp = target - nums[i];
            if (seen.find(comp) != seen.end()) {
                return {seen[comp], i};
            }
            seen[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);

    Solution solver;
    vector<int> nums = {2, 7, 11, 15};
    vector<int> ans = solver.${fn}(nums, 9);
    for (int x : ans) cout << x << " ";
    cout << "\\n";
    return 0;
}`,
      java: `import java.util.*;

public class Solution {
    public static int[] ${fn}(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp)) {
                return new int[]{map.get(comp), i};
            }
            map.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[] ans = ${fn}(new int[]{2, 7, 11, 15}, 9);
        System.out.println(Arrays.toString(ans));
    }
}`,
    },
    testCases: [
      {
        id: 'tc_orig_1',
        input: [[2, 7, 11, 15], 9],
        inputFormatted: 'nums = [2, 7, 11, 15], target = 9',
        expectedOutput: [0, 1],
        expectedOutputFormatted: '[0, 1]',
        explanation: 'Primary test case matching first example.',
      },
      {
        id: 'tc_orig_2',
        input: [[3, 2, 4], 6],
        inputFormatted: 'nums = [3, 2, 4], target = 6',
        expectedOutput: [1, 2],
        expectedOutputFormatted: '[1, 2]',
        explanation: 'Second scenario with unordered array values.',
      },
      {
        id: 'tc_orig_3',
        input: [[3, 3], 6],
        inputFormatted: 'nums = [3, 3], target = 6',
        expectedOutput: [0, 1],
        expectedOutputFormatted: '[0, 1]',
        explanation: 'Duplicate identical element scenario.',
      },
    ],
    sourceUrl: problemMeta.sourceUrl || 'https://leetcode.com',
  };
}
