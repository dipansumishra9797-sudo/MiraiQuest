import React, { useState } from 'react';
import { useApp } from '../../store/appStore';
import { Assignment, AssignmentSubmission } from '../../types';
import {
  FileText,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  AlertCircle,
  Code,
  ArrowRight,
  ExternalLink,
  Paperclip,
  Check,
  Send,
  Upload,
  X,
  Sparkles,
} from 'lucide-react';

interface StudentAssignmentsViewProps {
  onOpenCompilerWithProblem?: (problemId?: string) => void;
}

export const StudentAssignmentsView: React.FC<StudentAssignmentsViewProps> = ({
  onOpenCompilerWithProblem,
}) => {
  const {
    assignments,
    assignmentSubmissions,
    submitAssignment,
    activeStudent,
    theme,
  } = useApp();

  const isDark = theme === 'dark';

  // Submission modal state
  const [selectedAsgnToSubmit, setSelectedAsgnToSubmit] = useState<Assignment | null>(null);
  const [submissionCodeOrText, setSubmissionCodeOrText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccessNotice, setSubmitSuccessNotice] = useState<string | null>(null);

  // Filter assignments relevant for this student
  const relevantAssignments = assignments.filter((a) => {
    const campusMatches = a.campus === 'All Campuses' || a.campus === activeStudent.campus;
    const sectionMatches = a.section === 'All Sections' || a.section === activeStudent.section;
    return campusMatches && sectionMatches;
  });

  const handleOpenSubmit = (asgn: Assignment) => {
    setSelectedAsgnToSubmit(asgn);
    // Pre-populate with existing submission if any
    const existing = assignmentSubmissions.find(
      (s) => s.assignmentId === asgn.id && s.studentId === activeStudent.id
    );
    if (existing) {
      setSubmissionCodeOrText(existing.submissionCode || existing.submissionText || '');
    } else {
      setSubmissionCodeOrText(asgn.starterCode || '');
    }
  };

  const handleSubmitSolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsgnToSubmit || !submissionCodeOrText.trim()) return;

    setIsSubmitting(true);
    const res = submitAssignment(
      selectedAsgnToSubmit.id,
      activeStudent.id,
      submissionCodeOrText.trim()
    );
    setIsSubmitting(false);

    setSubmitSuccessNotice(res.message);
    setSelectedAsgnToSubmit(null);
    setSubmissionCodeOrText('');
    setTimeout(() => setSubmitSuccessNotice(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {submitSuccessNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs flex items-center justify-between gap-2 animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{submitSuccessNotice}</span>
          </div>
          <button
            onClick={() => setSubmitSuccessNotice(null)}
            className="text-slate-400 hover:text-white text-xs"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Overview */}
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
            <span>COURSEWORK & LAB SUBMISSION PORTAL</span>
          </div>
          <h3 className="text-xl font-bold">Faculty Assignments for {activeStudent.campus}</h3>
          <p className={`text-xs mt-0.5 max-w-xl ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            Official assignments, coding challenges, and lab reports published by Prof. Priya Nair and faculty coordinators.
            On-time submissions earn verified XP points in your immutable ledger.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div
            className={`p-3 rounded-xl border text-center min-w-[100px] ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-2xs'
            }`}
          >
            <div className={`text-[10px] font-semibold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Coursework XP
            </div>
            <div className="text-xl font-bold text-emerald-400 tabular-nums">+20-35 XP</div>
          </div>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {relevantAssignments.map((asgn) => {
          const submission = assignmentSubmissions.find(
            (s) => s.assignmentId === asgn.id && s.studentId === activeStudent.id
          );

          const isSubmitted = Boolean(submission);
          const isGraded = submission?.status === 'graded';

          return (
            <div
              key={asgn.id}
              className={`p-5 rounded-2xl border transition-all ${
                isDark
                  ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Meta Chips */}
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
                        isDark ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {asgn.subject}
                    </span>

                    <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>+{asgn.pointsXp} XP</span>
                    </span>

                    <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Due {asgn.dueDate} at {asgn.dueTime}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h4 className="text-base font-bold text-white">
                    <span className={isDark ? 'text-white' : 'text-slate-900'}>{asgn.title}</span>
                  </h4>

                  <p className={`text-xs leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    {asgn.description}
                  </p>

                  {/* Instructions preview */}
                  {asgn.instructions && asgn.instructions.length > 0 && (
                    <div className="pt-1">
                      <div className={`text-[11px] font-semibold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        Faculty Instructions:
                      </div>
                      <ul className="space-y-1">
                        {asgn.instructions.map((inst, i) => (
                          <li
                            key={i}
                            className={`text-xs flex items-center gap-2 ${
                              isDark ? 'text-slate-300' : 'text-slate-700'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                            <span>{inst}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Attachments */}
                  {asgn.attachments && asgn.attachments.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 flex-wrap">
                      {asgn.attachments.map((att, i) => (
                        <span
                          key={i}
                          className={`text-[11px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${
                            isDark
                              ? 'bg-slate-950 border-slate-800 text-slate-300'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <Paperclip className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-medium">{att.name}</span>
                          <span className="text-slate-500">({att.size})</span>
                        </span>
                      ))}
                    </div>
                  )}

                  {/* If Graded feedback exists */}
                  {isGraded && submission?.feedback && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs mt-2">
                      <div className="font-bold mb-0.5">Faculty Evaluation ({submission.gradedBy}):</div>
                      <div>{submission.feedback}</div>
                    </div>
                  )}
                </div>

                {/* Status & Action Side */}
                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                  {/* Status Tag */}
                  <div>
                    {isGraded ? (
                      <span className="px-3 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Graded: +{submission.grade} XP Awarded</span>
                      </span>
                    ) : isSubmitted ? (
                      <span className="px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Submitted · In Faculty Review</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Action Required</span>
                      </span>
                    )}
                  </div>

                  {/* Submission Buttons */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {asgn.type === 'coding' && onOpenCompilerWithProblem && (
                      <button
                        onClick={() => onOpenCompilerWithProblem(asgn.problemId)}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-slate-200 hover:text-white hover:bg-slate-800'
                            : 'bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100 shadow-2xs'
                        }`}
                      >
                        <Code className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Practice in Sandbox</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleOpenSubmit(asgn)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer ${
                        isSubmitted
                          ? isDark
                            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            : 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isSubmitted ? 'Update Submission' : 'Submit Solution'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Submission Modal */}
      {selectedAsgnToSubmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className={`w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl border shadow-2xl overflow-hidden transition-colors ${
              isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900 shadow-2xl'
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
                  <span>SUBMIT ASSIGNMENT</span>
                  <span>·</span>
                  <span>+{selectedAsgnToSubmit.pointsXp} XP</span>
                </div>
                <h3 className="text-base font-bold mt-0.5">{selectedAsgnToSubmit.title}</h3>
              </div>

              <button
                onClick={() => setSelectedAsgnToSubmit(null)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitSolution} className="flex-1 overflow-y-auto p-5 space-y-4">
              <div>
                <div className={`text-xs font-medium mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  {selectedAsgnToSubmit.description}
                </div>

                <label className="block text-xs font-bold mb-1.5">
                  {selectedAsgnToSubmit.type === 'coding'
                    ? 'Solution Code (JavaScript / Python / C++) *'
                    : 'Your Solution / Written Report *'}
                </label>
                <textarea
                  required
                  rows={9}
                  value={submissionCodeOrText}
                  onChange={(e) => setSubmissionCodeOrText(e.target.value)}
                  placeholder={
                    selectedAsgnToSubmit.type === 'coding'
                      ? '// Write or paste your verified implementation here...'
                      : 'Type your detailed problem explanation, runtime bounds, and findings here...'
                  }
                  className={`w-full p-3.5 rounded-xl border text-xs font-mono outline-hidden ${
                    isDark
                      ? 'bg-slate-950 border-slate-800 text-indigo-200 focus:border-indigo-500'
                      : 'bg-slate-50 border-slate-300 text-indigo-950 focus:border-indigo-600'
                  }`}
                />
              </div>

              <div
                className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                  isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>On-time LMS timestamp check active. Points will be credited upon submission.</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAsgnToSubmit(null)}
                  className={`px-4 py-2 rounded-xl text-xs font-medium ${
                    isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting || !submissionCodeOrText.trim()}
                  className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Solution & Claim XP</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
