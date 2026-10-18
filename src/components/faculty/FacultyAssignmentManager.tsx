import React, { useState, useRef } from 'react';
import { useApp } from '../../store/appStore';
import { Assignment, AssignmentSubmission, Campus } from '../../types';
import { GoogleSearchCodingModal } from '../student/GoogleSearchCodingModal';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  Clock,
  Building2,
  Users,
  Award,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code,
  FileSpreadsheet,
  Trash2,
  Eye,
  Check,
  Send,
  Sparkles,
  Paperclip,
  UploadCloud,
  ChevronDown,
  X,
  Loader2,
  RefreshCw,
  Download,
} from 'lucide-react';

export const FacultyAssignmentManager: React.FC = () => {
  const {
    assignments,
    assignmentSubmissions,
    createAssignment,
    deleteAssignment,
    gradeAssignmentSubmission,
    activeFaculty,
    theme,
  } = useApp();

  const isDark = theme === 'dark';

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSearchAssignModal, setShowSearchAssignModal] = useState(false);
  const [selectedAssignmentForReview, setSelectedAssignmentForReview] = useState<Assignment | null>(null);

  // New Assignment Form State
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Data Structures & Algorithms');
  const [newCampus, setNewCampus] = useState<Campus | 'All Campuses'>('All Campuses');
  const [newSection, setNewSection] = useState('All Sections');
  const [newDueDate, setNewDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newDueTime, setNewDueTime] = useState('23:59');
  const [newPointsXp, setNewPointsXp] = useState(25);
  const [newType, setNewType] = useState<'coding' | 'lab_report' | 'homework'>('coding');
  const [newDescription, setNewDescription] = useState('');
  const [newInstructions, setNewInstructions] = useState([
    'Review the conceptual requirements before coding.',
    'Test with boundary edge cases in the compiler sandbox.',
    'Ensure all automated assertions pass before final submission.',
  ]);
  const [newStarterCode, setNewStarterCode] = useState(`// Starter Template for Coursework
function solve(input) {
  // Your code here
  return input;
}`);
  const [newPlatformLink, setNewPlatformLink] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<{ name: string; size: string; type: string }[]>([]);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // PDF upload state
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [pdfSuccess, setPdfSuccess] = useState<string | null>(null);
  const [pdfDragOver, setPdfDragOver] = useState(false);

  // Grading form state for selected submission
  const [gradingSubId, setGradingSubId] = useState<string | null>(null);
  const [gradeInput, setGradeInput] = useState<number>(25);
  const [feedbackInput, setFeedbackInput] = useState<string>('');

  // Computations
  const totalSubmissions = assignmentSubmissions.length;
  const pendingGradingCount = assignmentSubmissions.filter((s) => s.status === 'submitted' || s.status === 'late').length;
  const gradedCount = assignmentSubmissions.filter((s) => s.status === 'graded').length;
  const avgGrade =
    gradedCount > 0
      ? Math.round(
          assignmentSubmissions
            .filter((s) => s.status === 'graded' && typeof s.grade === 'number')
            .reduce((sum, s) => sum + (s.grade || 0), 0) / gradedCount
        )
      : 24;

  const handlePdfSelect = (file: File | null) => {
    setPdfError(null);
    setPdfSuccess(null);
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are accepted. Please select a valid .pdf file.');
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setPdfError(`File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed is 20 MB.`);
      return;
    }
    if (file.size === 0) {
      setPdfError('The selected file appears to be empty. Please choose a valid PDF.');
      return;
    }
    setPdfFile(file);
  };

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    setPdfUploading(true);
    setPdfProgress(0);
    setPdfError(null);
    setPdfSuccess(null);

    // Simulate progress while the request is in-flight
    const progressInterval = setInterval(() => {
      setPdfProgress((p) => (p < 85 ? p + 8 : p));
    }, 300);

    try {
      const formData = new FormData();
      // Field name must match multer's upload.single('pdf') on the backend
      formData.append('pdf', pdfFile);
      formData.append('subject', newSubject);
      formData.append('topic', newTitle || 'General');
      formData.append('count', '10');
      formData.append('difficultyMix', 'balanced');

      // Do NOT set Content-Type — the browser sets it automatically with the boundary
      const res = await fetch('/api/teacher/pdf-to-mcq', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setPdfProgress(100);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      const sizeStr = pdfFile.size < 1024 * 1024
        ? `${(pdfFile.size / 1024).toFixed(0)} KB`
        : `${(pdfFile.size / 1024 / 1024).toFixed(1)} MB`;

      setAttachedFiles((prev) => [
        ...prev.filter((f) => f.name !== pdfFile.name),
        { name: pdfFile.name, size: sizeStr, type: 'application/pdf' },
      ]);

      setPdfSuccess(
        `PDF uploaded! Extracted ${data.extractedLength?.toLocaleString() ?? '?'} characters.${
          data.ocrFallbackUsed ? ' (OCR fallback used for scanned pages)' : ''
        } ${data.mcqs?.length ?? 0} MCQs generated.`
      );
    } catch (err: any) {
      clearInterval(progressInterval);
      setPdfProgress(0);
      setPdfError(err.message || 'Upload failed. Check your connection and try again.');
    } finally {
      setPdfUploading(false);
    }
  };

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim()) return;

    createAssignment({
      title: newTitle.trim(),
      subject: newSubject,
      campus: newCampus,
      section: newSection,
      dueDate: newDueDate,
      dueTime: newDueTime,
      pointsXp: Number(newPointsXp) || 20,
      description: newDescription.trim(),
      instructions: newInstructions.filter((i) => i.trim().length > 0),
      type: newType,
      starterCode: newType === 'coding' ? newStarterCode : undefined,
      platformLink: newPlatformLink.trim() || undefined,
      language: 'javascript',
      attachments: attachedFiles,
      createdByName: activeFaculty.name,
      status: 'published',
    });

    setUploadNotice(`Assignment "${newTitle.trim()}" published successfully!`);
    setShowUploadModal(false);
    // Reset fields
    setNewTitle('');
    setNewDescription('');
    setTimeout(() => setUploadNotice(null), 4000);
  };

  const handleGradeSubmit = (subId: string) => {
    if (!feedbackInput.trim()) {
      alert('Please provide pedagogical feedback for the student.');
      return;
    }
    gradeAssignmentSubmission(subId, Number(gradeInput), feedbackInput.trim(), activeFaculty.name);
    setGradingSubId(null);
    setFeedbackInput('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {uploadNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{uploadNotice}</span>
          </div>
          <button onClick={() => setUploadNotice(null)} className="text-slate-400 hover:text-white text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner & Action Buttons */}
      <div
        className={`p-6 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
          isDark
            ? 'bg-slate-900 border-slate-800'
            : 'bg-white border-slate-200 shadow-xs text-slate-900'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-500 mb-1">
            <FileText className="w-4 h-4" />
            <span>COURSEWORK & ACADEMIC LAB PORTAL</span>
          </div>
          <h3 className="text-xl font-bold">Faculty Assignment Manager & Uploader</h3>
          <p className={`text-xs mt-0.5 max-w-2xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Upload course assignments, link competitive LeetCode/HackerRank/Codeforces challenges, attach rubric PDFs, and verify student submissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Google Search Live Problem Import */}
          <button
            onClick={() => setShowSearchAssignModal(true)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
              isDark
                ? 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                : 'bg-slate-100 border-slate-200 text-slate-800 hover:bg-slate-200/80 shadow-2xs'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-emerald-400" />
            <span>Search LeetCode / HR to Assign</span>
          </button>

          {/* Create Assignment Button */}
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Upload New Assignment</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div
          className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Published Assignments
          </div>
          <div className="text-2xl font-bold text-white tabular-nums my-1">
            <span className={isDark ? 'text-white' : 'text-slate-900'}>{assignments.length}</span>
          </div>
          <div className="text-[11px] text-indigo-400 font-medium">Cross-Campus Accessible</div>
        </div>

        <div
          className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Total Student Submissions
          </div>
          <div className="text-2xl font-bold text-emerald-400 tabular-nums my-1">
            {totalSubmissions}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium">{gradedCount} Graded & Verified</div>
        </div>

        <div
          className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Pending Verification
          </div>
          <div className="text-2xl font-bold text-amber-400 tabular-nums my-1">
            {pendingGradingCount}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">Awaiting Feedback & XP</div>
        </div>

        <div
          className={`p-4 rounded-xl border transition-colors ${
            isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className={`text-[11px] font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Average XP Awarded
          </div>
          <div className="text-2xl font-bold text-indigo-400 tabular-nums my-1">
            {avgGrade} XP
          </div>
          <div className="text-[11px] text-slate-500 font-medium">96% On-Time Compliance</div>
        </div>
      </div>

      {/* Assignment List */}
      <div
        className={`p-6 rounded-2xl border space-y-4 transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
            <h4 className="text-sm font-bold">Active Course Assignments ({assignments.length})</h4>
          </div>
          <span className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Click "Review Submissions" to grade student code and feedback
          </span>
        </div>

        <div className="space-y-3">
          {assignments.map((asgn) => {
            const submissionsForThis = assignmentSubmissions.filter((s) => s.assignmentId === asgn.id);
            const pendingForThis = submissionsForThis.filter((s) => s.status === 'submitted' || s.status === 'late').length;

            return (
              <div
                key={asgn.id}
                className={`p-4 rounded-xl border transition-all ${
                  isDark
                    ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                    : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                          asgn.type === 'coding'
                            ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                            : asgn.type === 'lab_report'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {asgn.type.replace('_', ' ')}
                      </span>

                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {asgn.campus} · {asgn.section}
                      </span>

                      <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5" />
                        <span>+{asgn.pointsXp} XP</span>
                      </span>

                      <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        <Calendar className="w-3 h-3" />
                        <span>Due {asgn.dueDate} at {asgn.dueTime}</span>
                      </span>
                    </div>

                    <h5 className="text-base font-bold text-white">
                      <span className={isDark ? 'text-white' : 'text-slate-900'}>{asgn.title}</span>
                    </h5>

                    <p className={`text-xs line-clamp-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      {asgn.description}
                    </p>

                    {/* Attachments preview */}
                    {asgn.attachments && asgn.attachments.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 flex-wrap">
                        {asgn.attachments.map((att, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                              isDark
                                ? 'bg-slate-900 border-slate-800 text-slate-400'
                                : 'bg-white border-slate-200 text-slate-600'
                            }`}
                          >
                            <Paperclip className="w-3 h-3 text-indigo-400" />
                            <span>{att.name}</span>
                            <span className="text-slate-500">({att.size})</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions & Submissions Count */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div
                      className={`p-2.5 rounded-xl border text-center min-w-[90px] ${
                        isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-2xs'
                      }`}
                    >
                      <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Submissions
                      </div>
                      <div className="text-base font-bold text-emerald-400 tabular-nums">
                        {submissionsForThis.length}
                        {pendingForThis > 0 && (
                          <span className="text-xs text-amber-400 ml-1 font-normal">({pendingForThis} new)</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setSelectedAssignmentForReview(asgn)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review Submissions</span>
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Delete assignment "${asgn.title}"?`)) {
                          deleteAssignment(asgn.id);
                        }
                      }}
                      title="Delete assignment"
                      className={`p-2 rounded-xl border transition-colors ${
                        isDark
                          ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30'
                          : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Review Submissions Modal */}
      {selectedAssignmentForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between shrink-0 ${
                isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400">
                  <span>SUBMISSIONS REVIEW</span>
                  <span>·</span>
                  <span className="capitalize">{selectedAssignmentForReview.subject}</span>
                </div>
                <h3 className="text-lg font-bold mt-0.5">{selectedAssignmentForReview.title}</h3>
              </div>

              <button
                onClick={() => setSelectedAssignmentForReview(null)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submissions List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {(() => {
                const subs = assignmentSubmissions.filter((s) => s.assignmentId === selectedAssignmentForReview.id);

                if (subs.length === 0) {
                  return (
                    <div className="py-12 text-center space-y-2">
                      <Users className={`w-8 h-8 mx-auto ${isDark ? 'text-slate-600' : 'text-slate-400'}`} />
                      <div className="text-sm font-semibold">No Submissions Received Yet</div>
                      <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Students have not submitted solutions for this assignment yet. Submissions will appear in real time once submitted.
                      </div>
                    </div>
                  );
                }

                return subs.map((sub) => {
                  const isGradingThis = gradingSubId === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 rounded-xl border space-y-3 transition-colors ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-sm text-indigo-400">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-sm">{sub.studentName}</div>
                            <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                              {sub.campus} · Section {sub.section} · Submitted {new Date(sub.submittedAt).toLocaleDateString()} at {new Date(sub.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                              sub.status === 'graded'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : sub.status === 'late'
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {sub.status === 'graded' ? `Graded: ${sub.grade}/${sub.maxPoints} XP` : sub.status}
                          </span>

                          {sub.status !== 'graded' && !isGradingThis && (
                            <button
                              onClick={() => {
                                setGradingSubId(sub.id);
                                setGradeInput(sub.maxPoints);
                                setFeedbackInput('Excellent structure and logic. Test suites verified.');
                              }}
                              className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Grade & Feedback
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Code or Text Content */}
                      {sub.submissionCode && (
                        <div>
                          <div className={`text-[10px] font-mono uppercase mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Submitted Code / Solution:
                          </div>
                          <pre
                            className={`p-3 rounded-lg font-mono text-xs overflow-x-auto ${
                              isDark ? 'bg-slate-900 text-indigo-300' : 'bg-white text-indigo-900 border border-slate-200'
                            }`}
                          >
                            {sub.submissionCode}
                          </pre>
                        </div>
                      )}

                      {sub.submissionText && (
                        <div
                          className={`p-3 rounded-lg text-xs leading-relaxed ${
                            isDark ? 'bg-slate-900/60 text-slate-300' : 'bg-white text-slate-700 border border-slate-200'
                          }`}
                        >
                          {sub.submissionText}
                        </div>
                      )}

                      {/* Graded Feedback display */}
                      {sub.status === 'graded' && sub.feedback && (
                        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                          <span className="font-semibold">Faculty Feedback ({sub.gradedBy}): </span>
                          <span>{sub.feedback}</span>
                        </div>
                      )}

                      {/* Interactive Grading Form */}
                      {isGradingThis && (
                        <div
                          className={`p-3.5 rounded-xl border space-y-3 ${
                            isDark ? 'bg-slate-900 border-indigo-500/30' : 'bg-white border-indigo-300 shadow-sm'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-indigo-400">Award XP & Verified Faculty Feedback</span>
                            <button
                              onClick={() => setGradingSubId(null)}
                              className="text-xs text-slate-400 hover:text-white"
                            >
                              Cancel
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                                Award XP (Max {sub.maxPoints})
                              </label>
                              <input
                                type="number"
                                min={0}
                                max={sub.maxPoints}
                                value={gradeInput}
                                onChange={(e) => setGradeInput(Number(e.target.value))}
                                className={`w-full px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>

                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-medium text-slate-400 mb-1">
                                Pedagogical Feedback for Student
                              </label>
                              <input
                                type="text"
                                value={feedbackInput}
                                onChange={(e) => setFeedbackInput(e.target.value)}
                                placeholder="Constructive comments, algorithmic efficiency remarks..."
                                className={`w-full px-3 py-1.5 rounded-lg border text-xs ${
                                  isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                                }`}
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => handleGradeSubmit(sub.id)}
                              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Verify & Award XP</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Upload New Assignment Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
            }`}
          >
            {/* Modal Header */}
            <div
              className={`p-5 border-b flex items-center justify-between shrink-0 ${
                isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-slate-50/70'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Upload Course Assignment</h3>
                  <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    Create new verified academic coursework for MSOT students across campuses.
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowUploadModal(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateAssignment} className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Lab 5: Dynamic Programming & Optimal Substructure"
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* Subject & Type Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="Data Structures & Algorithms">Data Structures & Algorithms</option>
                    <option value="Python Programming">Python Programming</option>
                    <option value="Operating Systems">Operating Systems</option>
                    <option value="Database Management Systems">Database Management Systems</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Assignment Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="coding">Coding Sandbox Challenge</option>
                    <option value="lab_report">Lab Report / Implementation</option>
                    <option value="homework">Written Homework Problem Set</option>
                  </select>
                </div>
              </div>

              {/* Target Campus & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Target Campus</label>
                  <select
                    value={newCampus}
                    onChange={(e) => setNewCampus(e.target.value as any)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="All Campuses">All Campuses (HI-Tech, Rathinam, JUJ)</option>
                    <option value="HI-Tech">HI-Tech Main Campus</option>
                    <option value="Rathinam">Rathinam Campus</option>
                    <option value="JUJ">JUJ Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Assigned Section</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  >
                    <option value="All Sections">All Sections</option>
                    <option value="CS-A">Section CS-A</option>
                    <option value="CS-B">Section CS-B</option>
                    <option value="IT-A">Section IT-A</option>
                  </select>
                </div>
              </div>

              {/* Deadline & XP Value */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Due Time</label>
                  <input
                    type="time"
                    required
                    value={newDueTime}
                    onChange={(e) => setNewDueTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-medium ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1">Points / XP Reward</label>
                  <input
                    type="number"
                    min={5}
                    max={100}
                    value={newPointsXp}
                    onChange={(e) => setNewPointsXp(Number(e.target.value))}
                    className={`w-full px-3 py-2 rounded-xl border text-xs font-semibold ${
                      isDark ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'
                    }`}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold mb-1">Description & Problem Statement *</label>
                <textarea
                  required
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Outline the problem context, algorithmic requirements, and expected asymptotic bounds..."
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-medium outline-hidden ${
                    isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600'
                  }`}
                />
              </div>

              {/* Starter Code (if coding challenge) */}
              {newType === 'coding' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold flex items-center gap-1.5">
                      <Code className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Starter Code Template (JavaScript / Python)</span>
                    </label>
                    <span className="text-[10px] text-slate-500">Students will start with this template</span>
                  </div>
                  <textarea
                    rows={4}
                    value={newStarterCode}
                    onChange={(e) => setNewStarterCode(e.target.value)}
                    className={`w-full p-3 rounded-xl border font-mono text-xs outline-hidden ${
                      isDark ? 'bg-slate-950 border-slate-800 text-indigo-300 focus:border-indigo-500' : 'bg-slate-50 border-slate-300 text-indigo-900 focus:border-indigo-600'
                    }`}
                  />
                </div>
              )}

              {/* PDF Upload Section */}
              <div>
                <label className="block text-xs font-bold mb-1 flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                  Attach PDF Rubric / Assignment Sheet
                  <span className={`text-[10px] font-normal ml-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                    (PDF only · max 20 MB)
                  </span>
                </label>

                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setPdfDragOver(true); }}
                  onDragLeave={() => setPdfDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setPdfDragOver(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handlePdfSelect(file);
                  }}
                  onClick={() => pdfInputRef.current?.click()}
                  className={`relative p-5 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all ${
                    pdfDragOver
                      ? 'border-indigo-500 bg-indigo-500/10'
                      : isDark
                      ? 'border-slate-700 bg-slate-950 hover:border-slate-600 hover:bg-slate-900'
                      : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-white'
                  }`}
                >
                  <input
                    ref={pdfInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => handlePdfSelect(e.target.files?.[0] ?? null)}
                  />
                  <UploadCloud className={`w-6 h-6 mx-auto mb-1.5 ${
                    pdfDragOver ? 'text-indigo-400' : isDark ? 'text-slate-500' : 'text-slate-400'
                  }`} />
                  {pdfFile ? (
                    <div className="text-xs space-y-0.5">
                      <div className="font-semibold text-emerald-400 flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {pdfFile.name}
                      </div>
                      <div className={isDark ? 'text-slate-400' : 'text-slate-500'}>
                        {pdfFile.size < 1024 * 1024
                          ? `${(pdfFile.size / 1024).toFixed(0)} KB`
                          : `${(pdfFile.size / 1024 / 1024).toFixed(1)} MB`}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs">
                      <div className={`font-medium ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                        Drop PDF here or <span className="text-indigo-400 underline">Browse</span>
                      </div>
                      <div className={isDark ? 'text-slate-500' : 'text-slate-400'}>
                        Drag and drop your PDF rubric or assignment sheet.
                      </div>
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                {pdfUploading && (
                  <div className="mt-2 space-y-1">
                    <div className={`h-1.5 rounded-full overflow-hidden ${
                      isDark ? 'bg-slate-800' : 'bg-slate-200'
                    }`}>
                      <div
                        className="h-full bg-indigo-500 rounded-full transition-all duration-300"
                        style={{ width: `${pdfProgress}%` }}
                      />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-indigo-400">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Uploading & extracting text… {pdfProgress}%</span>
                    </div>
                  </div>
                )}

                {/* Error */}
                {pdfError && (
                  <div className="mt-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    <span>{pdfError}</span>
                  </div>
                )}

                {/* Success */}
                {pdfSuccess && (
                  <div className="mt-2 p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{pdfSuccess}</span>
                  </div>
                )}

                {/* Upload / Remove buttons */}
                {pdfFile && !pdfUploading && (
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handlePdfUpload}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      Upload & Extract MCQs
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPdfFile(null);
                        setPdfError(null);
                        setPdfSuccess(null);
                        setPdfProgress(0);
                        if (pdfInputRef.current) pdfInputRef.current.value = '';
                      }}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                        isDark
                          ? 'border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30'
                          : 'border-slate-200 text-slate-500 hover:text-rose-600 hover:border-rose-200'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Remove
                    </button>
                  </div>
                )}

                {/* Already-attached files */}
                {attachedFiles.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {attachedFiles.map((f, i) => (
                      <span
                        key={i}
                        className={`text-[10px] px-2 py-0.5 rounded-md border flex items-center gap-1 ${
                          isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-600'
                        }`}
                      >
                        <Paperclip className="w-3 h-3 text-indigo-400" />
                        {f.name} ({f.size})
                        <button
                          type="button"
                          onClick={() => setAttachedFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="ml-1 text-slate-500 hover:text-rose-400"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Google Search Live Problem Import Modal */}
      <GoogleSearchCodingModal
        isOpen={showSearchAssignModal}
        onClose={() => setShowSearchAssignModal(false)}
        allowAssign={true}
      />
    </div>
  );
};
