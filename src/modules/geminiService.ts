/**
 * Gemini Client Service
 * Communicates with server-side /api/gemini endpoints
 */

export interface GeneratedQuestion {
  questionText: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export async function generateQuizQuestionsFromAI(
  subject: string,
  topic: string,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium',
  count: number = 3
): Promise<{ questions: GeneratedQuestion[]; fallback: boolean }> {
  try {
    const res = await fetch('/api/gemini/quiz-gen', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, topic, difficulty, count }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      questions: data.questions || [],
      fallback: Boolean(data.fallback),
    };
  } catch (error) {
    console.warn('Using client-side fallback for quiz generation:', error);
    // Graceful offline fallback
    return {
      fallback: true,
      questions: [
        {
          questionText: `In ${subject} on ${topic}: Which invariant guarantees correct execution under boundary conditions?`,
          options: [
            'Strict adherence to base case termination before stack overflow',
            'Arbitrary loop unrolling without state verification',
            'Dynamic memory reallocation on every iteration',
            'Disabling exception handlers at compile time',
          ],
          correctOptionIndex: 0,
          explanation: `In ${topic}, guaranteeing well-defined base conditions is vital to preserve operational correctness and prevent unexpected runtime exceptions.`,
          topic,
          difficulty,
        },
        {
          questionText: `When optimizing algorithmic performance in ${topic}, which metric typically dominates real-world throughput?`,
          options: [
            'Cache locality and asymptotic worst-case bounds',
            'Source code line count',
            'Number of comments in the file',
            'Variable name character lengths',
          ],
          correctOptionIndex: 0,
          explanation: 'Memory access patterns, cache line locality, and algorithmic complexity dictate real hardware execution speeds.',
          topic,
          difficulty,
        },
      ],
    };
  }
}

export async function getStudyBuddyHint(
  question: string,
  selectedOption: string,
  correctOption: string,
  subject: string,
  topic: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/study-buddy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, selectedOption, correctOption, subject, topic }),
    });

    if (!res.ok) throw new Error('Failed to fetch hint');
    const data = await res.json();
    return data.hint || 'Remember the core property of this topic and check how each option behaves.';
  } catch (error) {
    return `Nice try! While "${selectedOption}" is a common initial thought, think about the core invariant of ${topic}: "${correctOption}" guarantees correct state preservation without unintended side-effects.`;
  }
}

export async function getHinglishExplanation(
  explanation: string,
  question: string,
  topic: string
): Promise<string> {
  try {
    const res = await fetch('/api/gemini/hinglish-explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explanation, question, topic }),
    });

    if (!res.ok) throw new Error('Failed to fetch Hinglish explanation');
    const data = await res.json();
    return data.hinglish || explanation;
  } catch (error) {
    return `Yeh concept ${topic} ka kaafi important hai! Asaan shabdon mein: jab hum is concept ko dekhte hain, toh correct answer memory aur execution dono ko optimize karta hai. Revision ke liye question dobara try karein!`;
  }
}

export async function searchCodingProblemViaGoogle(
  query: string,
  platform: 'all' | 'leetcode' | 'hackerrank' | 'codeforces' = 'all',
  difficulty: 'all' | 'easy' | 'medium' | 'hard' = 'all'
): Promise<{
  success: boolean;
  problem: any;
  searchQueries: string[];
  sources: string[];
  isGrounded: boolean;
}> {
  try {
    const res = await fetch('/api/gemini/search-coding-problems', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, platform, difficulty }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    return {
      success: true,
      problem: data.problem,
      searchQueries: data.searchQueries || [query],
      sources: data.sources || [],
      isGrounded: Boolean(data.isGrounded),
    };
  } catch (err: any) {
    console.warn('Google Search client request fallback:', err);
    return {
      success: false,
      problem: null,
      searchQueries: [query],
      sources: [],
      isGrounded: false,
    };
  }
}

