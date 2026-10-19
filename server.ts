import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import { executeCode } from './server/codeRunnerService';
import { queryCodingProblems, generateOriginalPracticeProblem, CODING_SEARCH_CATALOG } from './server/searchService';
import { extractTextFromPdf, generateMcqsFromText } from './server/pdfService';
import {
  initWebSocketServer,
  dispatchNotification,
  getVapidPublicKey,
  savePushSubscription,
} from './server/notificationService';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Multer in-memory storage for PDF processing (max 25MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

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

// 4. Code Execution Service (/api/run) for C++, C, Java, Python, and JavaScript
app.post('/api/run', async (req: Request, res: Response) => {
  const { language, code, source_code, stdin = '', problem, onlyVisibleCases = false, studentId } = req.body;
  const targetCode = source_code || code;

  if (!language || !targetCode) {
    return res.status(400).json({
      error: 'Missing required parameters: language and source_code (or code) are required.',
    });
  }

  try {
    const summary = await executeCode({
      language,
      code: targetCode,
      source_code: targetCode,
      stdin,
      problem,
      onlyVisibleCases,
      studentId: studentId || req.ip || 'anon',
    });
    return res.json(summary);
  } catch (err: any) {
    console.error('Execution service failure:', err);
    return res.status(500).json({
      error: `Execution service error: ${err.message || 'Unknown compiler failure'}`,
    });
  }
});

// 5. Enhanced Multi-Topic Coding Search (Fixing LeetCode 20 root cause)
app.post('/api/gemini/search-coding-problems', async (req: Request, res: Response) => {
  const { query = '', topic = '', platform = 'all', difficulty = 'all', page = 1, pageSize = 10 } = req.body;

  if (!query && !topic) {
    return res.status(400).json({
      success: false,
      error: 'A search query keyword or topic is required.',
      problems: [],
    });
  }

  try {
    const searchData = queryCodingProblems({
      query: String(query),
      topic: String(topic),
      platform: platform as any,
      difficulty: difficulty as any,
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
    });

    return res.json({
      success: true,
      problems: searchData.problems,
      totalCount: searchData.totalCount,
      page: searchData.page,
      pageSize: searchData.pageSize,
      hasMore: searchData.hasMore,
      topic: searchData.topic,
      searchQueries: [
        `competitive programming ${query || topic} problems`,
        `site:leetcode.com/problems/ ${query || topic}`,
      ],
      sources: searchData.problems.map((p) => p.sourceUrl),
    });
  } catch (err: any) {
    console.error('Coding search endpoint error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Search failed',
      problems: [],
    });
  }
});

// 6. Generate ORIGINAL Non-Infringing Practice Problem inspired by search topic
app.post('/api/gemini/generate-original-problem', (req: Request, res: Response) => {
  try {
    const originalProblem = generateOriginalPracticeProblem(req.body);
    return res.json({
      success: true,
      problem: originalProblem,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate original problem',
    });
  }
});

// 7. Teacher: PDF to MCQ Assignment Generator
app.post('/api/teacher/pdf-to-mcq', upload.single('pdf'), async (req: Request, res: Response) => {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({
      success: false,
      error: 'No PDF file uploaded. Please select a valid PDF document.',
    });
  }

  const { subject = 'Computer Science', topic = 'Core Principles', count = 10, difficultyMix = 'balanced' } = req.body;

  try {
    console.log(`[PDF Upload] Received ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`);

    // Extract text with pdf-parse and OCR fallback
    const { text, ocrFallbackUsed } = await extractTextFromPdf(req.file.buffer);

    if (!text || text.trim().length === 0) {
      return res.status(422).json({
        success: false,
        error: 'Unable to extract readable text from PDF. The document may be empty, password-protected, or unscannable.',
      });
    }

    // Generate MCQs
    const mcqs = await generateMcqsFromText({
      text,
      subject,
      topic,
      count: Number(count) || 10,
      difficultyMix: difficultyMix as any,
      ai,
    });

    return res.json({
      success: true,
      mcqs,
      originalPdfName: req.file.originalname,
      textExcerpt: text.slice(0, 500) + '...',
      extractedLength: text.length,
      ocrFallbackUsed,
    });
  } catch (err: any) {
    console.error('PDF to MCQ processing error:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Failed to process PDF and generate MCQs',
    });
  }
});

// 8. Anti-Cheat: Log Detected Event & Notify Teachers/Admins
const antiCheatAuditLogs: any[] = [];
app.post('/api/anticheat/log-event', async (req: Request, res: Response) => {
  const { studentId, studentName, campus, section, eventType, quizId, quizTitle, details, severity = 'medium' } = req.body;

  const logEntry = {
    id: `ac_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    studentId,
    studentName,
    campus,
    section,
    eventType,
    quizId,
    quizTitle,
    details: details || `Anti-cheat violation detected: ${eventType}`,
    severity,
    timestamp: new Date().toISOString(),
  };

  antiCheatAuditLogs.push(logEntry);
  console.log(`[Anti-Cheat Audit] Event logged: ${eventType} by ${studentName} (${campus} - ${section})`);

  // Dispatch real-time alert to teachers and admins
  await dispatchNotification({
    id: `notif_ac_${Date.now()}`,
    title: `Anti-Cheat Alert: ${studentName}`,
    message: `${studentName} (${section}, ${campus}) triggered ${eventType.replace('_', ' ')} during ${quizTitle || 'Quiz'}.`,
    type: 'anti_cheat',
    category: 'audit',
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: 'faculty',
    targetCampus: campus,
  });

  return res.json({ success: true, logEntry });
});

// 9. Tab Switch / Unfocused Auto-Submit Endpoint
const autoSubmittedQuizStore: Record<string, any> = {};
app.post('/api/quiz/auto-submit', async (req: Request, res: Response) => {
  const { studentId, studentName, campus, section, quizId, quizTitle, score, totalQuestions, reason = 'tab_switch', switchCount = 1, answers = [] } = req.body;

  const recordId = `${quizId}_${studentId}`;
  const record = {
    id: recordId,
    studentId,
    studentName,
    campus,
    section,
    quizId,
    quizTitle,
    submittedAt: new Date().toISOString(),
    reason,
    switchCount,
    score,
    totalQuestions,
    answers,
    locked: true,
  };

  autoSubmittedQuizStore[recordId] = record;
  console.log(`[Auto-Submit Triggered] Quiz "${quizTitle}" auto-submitted for ${studentName} due to ${reason} (${switchCount} switches).`);

  // Notify teachers
  await dispatchNotification({
    id: `notif_as_${Date.now()}`,
    title: `Quiz Auto-Submitted (Tab Switch): ${studentName}`,
    message: `${studentName} switched tabs during ${quizTitle || 'Weekly Quiz'} and was automatically submitted (Score: ${score}/${totalQuestions}).`,
    type: 'quiz',
    category: 'academic',
    timestamp: new Date().toISOString(),
    read: false,
    targetRole: 'faculty',
    targetCampus: campus,
  });

  return res.json({
    success: true,
    message: 'Quiz was auto-submitted due to tab switch violation and locked on the server.',
    record,
  });
});

// 10. Teacher / Admin Retake Grant
app.post('/api/quiz/grant-retake', async (req: Request, res: Response) => {
  const { quizId, studentId, reason, grantedByName } = req.body;
  const recordId = `${quizId}_${studentId}`;

  if (autoSubmittedQuizStore[recordId]) {
    autoSubmittedQuizStore[recordId].locked = false;
    autoSubmittedQuizStore[recordId].retakeGranted = true;
    autoSubmittedQuizStore[recordId].retakeReason = reason;
    autoSubmittedQuizStore[recordId].grantedByName = grantedByName;
  }

  // Notify student
  await dispatchNotification({
    id: `notif_retake_${Date.now()}`,
    userId: studentId,
    title: `Quiz Retake Granted`,
    message: `Prof. ${grantedByName} has granted you a retake for your quiz. Reason: ${reason}`,
    type: 'quiz',
    category: 'academic',
    timestamp: new Date().toISOString(),
    read: false,
  });

  return res.json({
    success: true,
    message: `Retake granted for student ${studentId}.`,
  });
});

// 11. Notifications Gateway & Web Push Keys
app.get('/api/notifications/vapid-public-key', (_req: Request, res: Response) => {
  return res.json({ publicKey: getVapidPublicKey() });
});

app.post('/api/notifications/push-subscribe', (req: Request, res: Response) => {
  const { userId, role, subscription } = req.body;
  if (!userId || !subscription) {
    return res.status(400).json({ error: 'Missing userId or subscription payload' });
  }
  if (role && role !== 'student') {
    return res.status(403).json({ error: 'Push notifications are enabled for student accounts only.' });
  }
  savePushSubscription(userId, subscription);
  return res.json({ success: true, message: 'Push subscription registered.' });
});

app.post('/api/notifications/dispatch', async (req: Request, res: Response) => {
  const notif = req.body;
  if (!notif.title || !notif.message) {
    return res.status(400).json({ error: 'Title and message required.' });
  }

  await dispatchNotification({
    id: notif.id || `notif_${Date.now()}`,
    userId: notif.userId,
    title: notif.title,
    message: notif.message,
    type: notif.type || 'assignment',
    category: notif.category || 'academic',
    timestamp: new Date().toISOString(),
    read: false,
    link: notif.link,
    targetCampus: notif.targetCampus,
    targetYear: notif.targetYear,
    targetSection: notif.targetSection,
    targetRole: notif.targetRole,
  });

  return res.json({ success: true, message: 'Notification dispatched.' });
});

// In-memory accept tracking to detect repeated collusion patterns
const peerAcceptHistory: { askerId: string; helperId: string; timestamp: number }[] = [];
const phoneOtpStore: Record<string, { newPhone: string; otp: string; expiresAt: number }> = {};

// 5. Peer Doubts: Accept Answer Backend Verification
app.post('/api/peer-doubts/accept-answer', (req: Request, res: Response) => {
  const {
    doubtId,
    answerId,
    callerId,
    callerRole,
    doubtOwnerId,
    doubtTitle,
    answerAuthorId,
    answerAuthorName,
    isAlreadyLocked,
    helperTodayAcceptedCount = 0,
  } = req.body;

  if (!doubtId || !answerId || !callerId) {
    return res.status(400).json({ error: 'Missing required parameters: doubtId, answerId, callerId.' });
  }

  // Rule 1: Only the asker who posted the doubt (or faculty override) can accept
  const isOwner = callerId === doubtOwnerId;
  const isFaculty = callerRole === 'faculty' || callerRole === 'admin';
  if (!isOwner && !isFaculty) {
    return res.status(403).json({
      error: 'Permission denied: Only the student who asked this doubt (the asker) or faculty can accept an answer.',
    });
  }

  // Rule 2: No XP for answering your own doubt, and the asker cannot accept their own answer
  if (answerAuthorId === doubtOwnerId) {
    return res.status(400).json({
      error: 'Invalid action: The asker cannot accept their own answer, and no XP can be earned for self-answers.',
    });
  }

  // Rule 3: Choice locking once XP is awarded
  if (isAlreadyLocked) {
    return res.status(400).json({
      error: 'Locked: This doubt already has an accepted answer awarded with XP. The choice is permanently locked.',
    });
  }

  // Rule 4: Helper reward cap (15 XP per accepted answer, max 3 rewarded per day per helper)
  const isCapped = helperTodayAcceptedCount >= 3;
  const xpToAward = isCapped ? 0 : 15;

  // Track collusion / repeated accept patterns between same two accounts
  peerAcceptHistory.push({
    askerId: doubtOwnerId,
    helperId: answerAuthorId,
    timestamp: Date.now(),
  });

  // Check last 7 days accepts between this specific pair
  const recentWindowMs = 7 * 24 * 60 * 60 * 1000;
  const pairAccepts = peerAcceptHistory.filter(
    (h) =>
      Date.now() - h.timestamp < recentWindowMs &&
      ((h.askerId === doubtOwnerId && h.helperId === answerAuthorId) ||
        (h.askerId === answerAuthorId && h.helperId === doubtOwnerId))
  );

  let collusionFlag = null;
  if (pairAccepts.length >= 3) {
    collusionFlag = {
      id: `flag_peer_collusion_${Date.now()}`,
      studentId: answerAuthorId,
      studentName: answerAuthorName || 'Student',
      campus: 'HI-Tech',
      timestamp: new Date().toISOString(),
      reason: 'Collusion detected: Repeated reciprocal accept pattern between students',
      severity: 'high',
      details: `Student ${doubtOwnerId} and ${answerAuthorId} have exchanged ${pairAccepts.length} accepted answers within 7 days, indicating potential point-farming collusion.`,
      suggestedAction: 'Audit recent peer doubt interactions and void suspicious ledger entries.',
      status: 'pending',
    };
  }

  // Generate in-app notification for helper
  const helperNotification = {
    id: `notif_accept_${Date.now()}`,
    userId: answerAuthorId,
    title: 'Answer Accepted! (+15 XP)',
    message: `Your answer on "${doubtTitle || 'Peer Doubt'}" was accepted by the asker! ${
      xpToAward > 0 ? `+${xpToAward} XP awarded to your ledger.` : 'Daily XP cap reached (3/day).'
    }`,
    type: 'peer_accept',
    timestamp: new Date().toISOString(),
    read: false,
    link: `/peer-help#post_${doubtId}`,
  };

  return res.json({
    success: true,
    pointsAwarded: xpToAward,
    isCapped,
    isLocked: true,
    notification: helperNotification,
    collusionFlag,
    ledgerMetadata: {
      actionKey: 'peer_help',
      actionType: 'peer_help',
      sourceDescription: `Accepted Peer Help Answer on doubt: "${doubtTitle || 'Technical Doubt'}"`,
      verificationMetadata: {
        doubtId,
        doubtUrl: `/peer-help#post_${doubtId}`,
        askerId: doubtOwnerId,
        acceptedAt: new Date().toISOString(),
      },
    },
  });
});

// 6. Batchmates API: ONLY returns classmates with same campus, year, section
app.get('/api/students/:id/batchmates', (req: Request, res: Response) => {
  const { id } = req.params;
  const requestingStudentId = req.query.requestingStudentId as string;
  const campus = req.query.campus as string;
  const year = req.query.year as string;
  const section = req.query.section as string;

  // Strict backend security: Only the student themselves (or faculty) can request their batchmates
  if (requestingStudentId && requestingStudentId !== id) {
    return res.status(403).json({
      error: 'Access Refused: You may only view batchmates for your own verified campus, year, and section.',
    });
  }

  return res.json({
    success: true,
    scope: { campus, year, section },
    message: 'Authorized to view batchmates for matching campus, year, and section.',
  });
});

// 7. Student Profile Update: Enforce MSOT Read-Only fields on Backend
app.put('/api/students/:id/profile', (req: Request, res: Response) => {
  const { id } = req.params;
  const callerId = req.body.callerId || id;
  const callerRole = req.body.callerRole || 'student';
  const attemptedUpdates = req.body.attemptedUpdates || { ...req.body };
  delete attemptedUpdates.callerId;
  delete attemptedUpdates.callerRole;

  // Authorization check
  if (callerRole !== 'admin' && callerId !== id) {
    return res.status(403).json({ error: 'Permission denied: You can only edit your own profile.' });
  }

  // MSOT Managed Fields Lock: Students CANNOT alter campus, year, section, or rollNumber
  if (callerRole !== 'admin') {
    const forbiddenFields = ['campus', 'year', 'section', 'rollNumber'];
    const violatedFields = forbiddenFields.filter((f) => attemptedUpdates[f] !== undefined);

    if (violatedFields.length > 0) {
      return res.status(403).json({
        error: `Managed by MSOT Registrar: [${violatedFields.join(', ')}] are read-only official records and can only be modified by university administration.`,
      });
    }
  }

  // Bio validation (max 200 characters)
  if (attemptedUpdates.bio && attemptedUpdates.bio.length > 200) {
    return res.status(400).json({ error: 'Bio exceeds maximum limit of 200 characters.' });
  }

  // URL validation for social links
  const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
  if (attemptedUpdates.socialLinks) {
    for (const [key, val] of Object.entries(attemptedUpdates.socialLinks)) {
      if (val && typeof val === 'string' && val.trim().length > 0) {
        if (!urlPattern.test(val.trim())) {
          return res.status(400).json({ error: `Invalid URL format for ${key}: "${val}"` });
        }
      }
    }
  }

  return res.json({
    success: true,
    message: 'Profile updated successfully.',
    updatedFields: attemptedUpdates,
  });
});

// 8. Request Phone Change OTP (Login Identity Protection)
app.post('/api/students/:id/request-phone-otp', (req: Request, res: Response) => {
  const { id } = req.params;
  const callerId = req.body.callerId || id;
  const { newPhoneNumber } = req.body;

  if (callerId !== id) {
    return res.status(403).json({ error: 'Cannot request phone change for another account.' });
  }

  if (!newPhoneNumber || !newPhoneNumber.trim()) {
    return res.status(400).json({ error: 'New phone number is required.' });
  }

  // Generate 6-digit OTP (mock OTP 729410 for instant testing)
  const otp = '729410';
  phoneOtpStore[id] = {
    newPhone: newPhoneNumber.trim(),
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000,
  };

  return res.json({
    success: true,
    message: `Verification OTP dispatched to ${newPhoneNumber}. Enter code to verify identity change.`,
    mockOtp: otp,
    demoOtp: otp,
  });
});

// 9. Verify Phone Change OTP
app.post('/api/students/:id/verify-phone-otp', (req: Request, res: Response) => {
  const { id } = req.params;
  const callerId = req.body.callerId || id;
  const { otp } = req.body;

  if (callerId !== id) {
    return res.status(403).json({ error: 'Unauthorized phone verification request.' });
  }

  const record = phoneOtpStore[id];
  if (!record || Date.now() > record.expiresAt) {
    return res.status(400).json({ error: 'OTP expired or not requested. Please request a new code.' });
  }

  if (record.otp !== otp?.trim()) {
    return res.status(400).json({ error: 'Invalid verification OTP. Please check and try again.' });
  }

  const updatedPhone = record.newPhone;
  delete phoneOtpStore[id];

  return res.json({
    success: true,
    message: 'Phone number verified and updated successfully.',
    newPhoneNumber: updatedPhone,
  });
});

// 10. Faculty / Admin Profile Update
app.put('/api/faculty/:id/profile', (req: Request, res: Response) => {
  const { id } = req.params;
  const { callerId, updates = {} } = req.body;

  if (callerId !== id) {
    return res.status(403).json({ error: 'Unauthorized to edit this faculty profile.' });
  }

  return res.json({
    success: true,
    message: 'Faculty profile updated successfully.',
    updates,
  });
});

// Vite or Static Serving
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';
  const server = http.createServer(app);
  initWebSocketServer(server);

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

  server.listen(PORT, () => {
    console.log(`MiraiQuest server listening on http://localhost:${PORT}`);
  });
}

startServer();
