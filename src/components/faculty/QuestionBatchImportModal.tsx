import React, { useState } from 'react';
import { X, UploadCloud, AlertTriangle, CheckCircle2, FileText, Sparkles, Filter } from 'lucide-react';
import { Question } from '../../types';

interface QuestionBatchImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingQuestions: Question[];
  onImport: (questions: Question[]) => void;
  isDark: boolean;
}

interface ParsedQuestionRow {
  isValid: boolean;
  isDuplicate: boolean;
  duplicateOf?: string;
  error?: string;
  data: Partial<Question>;
}

export const QuestionBatchImportModal: React.FC<QuestionBatchImportModalProps> = ({
  isOpen,
  onClose,
  existingQuestions,
  onImport,
  isDark,
}) => {
  const [importMode, setImportMode] = useState<'csv' | 'json'>('csv');
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedQuestionRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [skipDuplicates, setSkipDuplicates] = useState(true);

  if (!isOpen) return null;

  const sampleCsv = `Topic,Difficulty,Question Text,Option A,Option B,Option C,Option D,Correct Option (0-3),Explanation
Arrays,medium,What is the worst-case time complexity of quickselect?,O(n),O(n log n),O(n^2),O(1),2,When unbalanced pivots occur on every partition, quickselect degrades to O(n^2).
Hashing,easy,Which data structure handles hash table collisions with linked chains?,Open Addressing,Separate Chaining,Linear Probing,Double Hashing,1,Separate chaining stores collided keys in linked lists at each bucket.`;

  const sampleJson = `[
  {
    "topic": "Trees",
    "difficulty": "medium",
    "questionText": "What is the maximum number of nodes in a binary tree of depth k (root at depth 1)?",
    "options": ["2^k - 1", "2^(k-1)", "2^(k+1) - 1", "k^2"],
    "correctOptionIndex": 0,
    "explanation": "A full binary tree of depth k contains 1 + 2 + 4 + ... + 2^(k-1) = 2^k - 1 nodes."
  }
]`;

  const handleParse = () => {
    const text = rawText.trim();
    if (!text) {
      setParsedRows([]);
      setHasParsed(true);
      return;
    }

    const rows: ParsedQuestionRow[] = [];
    const normalizedExisting = new Map<string, string>();
    existingQuestions.forEach((q) => {
      normalizedExisting.set(q.questionText.toLowerCase().replace(/[^a-z0-9]/g, ''), q.id);
    });

    if (importMode === 'json') {
      try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error('Top-level JSON payload must be an array of questions.');
        }

        parsed.forEach((item: any, idx: number) => {
          if (!item.questionText || typeof item.questionText !== 'string') {
            rows.push({
              isValid: false,
              isDuplicate: false,
              error: `Row ${idx + 1}: Missing or invalid 'questionText'.`,
              data: item,
            });
            return;
          }

          if (!Array.isArray(item.options) || item.options.length < 2) {
            rows.push({
              isValid: false,
              isDuplicate: false,
              error: `Row ${idx + 1}: 'options' must be an array of at least 2 choices.`,
              data: item,
            });
            return;
          }

          const correctIdx = Number(item.correctOptionIndex);
          if (isNaN(correctIdx) || correctIdx < 0 || correctIdx >= item.options.length) {
            rows.push({
              isValid: false,
              isDuplicate: false,
              error: `Row ${idx + 1}: 'correctOptionIndex' must be between 0 and ${item.options.length - 1}.`,
              data: item,
            });
            return;
          }

          const norm = item.questionText.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isDuplicate = normalizedExisting.has(norm);

          rows.push({
            isValid: true,
            isDuplicate,
            duplicateOf: isDuplicate ? normalizedExisting.get(norm) : undefined,
            data: {
              subjectId: item.subjectId || 'dsa',
              topic: item.topic || 'General Algorithms',
              difficulty: ['easy', 'medium', 'hard'].includes(item.difficulty) ? item.difficulty : 'medium',
              questionText: item.questionText.trim(),
              options: item.options.map((o: any) => String(o).trim()),
              correctOptionIndex: correctIdx,
              explanation: item.explanation || 'Pedagogical explanation verified by faculty.',
              source: 'faculty_upload',
              status: 'approved',
              weekNumber: item.weekNumber || 6,
            },
          });
        });
      } catch (err: any) {
        rows.push({
          isValid: false,
          isDuplicate: false,
          error: `JSON syntax error: ${err.message}`,
          data: {},
        });
      }
    } else {
      // CSV / TSV Parsing
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        rows.push({
          isValid: false,
          isDuplicate: false,
          error: 'CSV must contain a header row followed by at least one data row.',
          data: {},
        });
      } else {
        const delimiter = lines[0].includes('\t') ? '\t' : ',';
        const dataLines = lines.slice(1);

        dataLines.forEach((line, idx) => {
          // Simple CSV splitter handling quoted fields
          const parts: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (ch === '"') {
              inQuotes = !inQuotes;
            } else if (ch === delimiter && !inQuotes) {
              parts.push(current.trim());
              current = '';
            } else {
              current += ch;
            }
          }
          parts.push(current.trim());

          if (parts.length < 7) {
            rows.push({
              isValid: false,
              isDuplicate: false,
              error: `Row ${idx + 2}: Expected at least 7 columns (Topic, Difficulty, Question Text, Option A, Option B, Correct Option, Explanation). Found ${parts.length}.`,
              data: {},
            });
            return;
          }

          const topic = parts[0] || 'General';
          const difficulty = ['easy', 'medium', 'hard'].includes(parts[1]?.toLowerCase())
            ? (parts[1].toLowerCase() as 'easy' | 'medium' | 'hard')
            : 'medium';
          const questionText = parts[2]?.replace(/^"|"$/g, '').trim();

          const options: string[] = [];
          for (let i = 3; i <= 6 && i < parts.length - 2; i++) {
            if (parts[i]) options.push(parts[i].replace(/^"|"$/g, '').trim());
          }

          // If no 4th option provided, fallback to slice 3..parts.length-2
          if (options.length < 2) {
            options.push('Option A', 'Option B');
          }

          const correctColIdx = parts.length >= 9 ? 7 : parts.length - 2;
          const explColIdx = parts.length >= 9 ? 8 : parts.length - 1;

          let correctOptionIndex = parseInt(parts[correctColIdx] || '0', 10);
          if (isNaN(correctOptionIndex) || correctOptionIndex < 0 || correctOptionIndex >= options.length) {
            correctOptionIndex = 0;
          }

          const explanation = parts[explColIdx]?.replace(/^"|"$/g, '').trim() || 'Verified by faculty.';

          if (!questionText) {
            rows.push({
              isValid: false,
              isDuplicate: false,
              error: `Row ${idx + 2}: Missing question text.`,
              data: {},
            });
            return;
          }

          const norm = questionText.toLowerCase().replace(/[^a-z0-9]/g, '');
          const isDuplicate = normalizedExisting.has(norm);

          rows.push({
            isValid: true,
            isDuplicate,
            duplicateOf: isDuplicate ? normalizedExisting.get(norm) : undefined,
            data: {
              subjectId: 'dsa',
              topic,
              difficulty,
              questionText,
              options,
              correctOptionIndex,
              explanation,
              source: 'faculty_upload',
              status: 'approved',
              weekNumber: 6,
            },
          });
        });
      }
    }

    setParsedRows(rows);
    setHasParsed(true);
  };

  const validRows = parsedRows.filter((r) => r.isValid && (!skipDuplicates || !r.isDuplicate));
  const duplicateCount = parsedRows.filter((r) => r.isDuplicate).length;
  const invalidCount = parsedRows.filter((r) => !r.isValid).length;

  const handleCommitImport = () => {
    if (validRows.length === 0) return;

    const newQuestions: Question[] = validRows.map((r, i) => ({
      id: `q_bulk_${Date.now()}_${i}`,
      subjectId: r.data.subjectId || 'dsa',
      topic: r.data.topic || 'General',
      difficulty: r.data.difficulty || 'medium',
      questionText: r.data.questionText || '',
      options: r.data.options || ['A', 'B'],
      correctOptionIndex: r.data.correctOptionIndex ?? 0,
      explanation: r.data.explanation || '',
      source: 'faculty_upload',
      status: 'approved',
      weekNumber: r.data.weekNumber || 6,
      createdAt: new Date().toISOString().split('T')[0],
      reviewedBy: 'Faculty Bulk Import',
      editedBeforeApproval: false,
    }));

    onImport(newQuestions);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setRawText(content);
        if (file.name.endsWith('.json')) {
          setImportMode('json');
        } else {
          setImportMode('csv');
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-3xl max-h-[90vh] rounded-2xl border shadow-2xl overflow-hidden flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Header */}
        <div className={`p-4 sm:p-5 border-b flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
              <UploadCloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base">Question Bank Batch Uploader</h3>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Import questions from CSV, Excel (TSV), or JSON with automated validation & duplicate detection.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-lg cursor-pointer ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Format Selector + File Picker */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setImportMode('csv');
                  setHasParsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  importMode === 'csv'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                CSV / Excel TSV
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportMode('json');
                  setHasParsed(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  importMode === 'json'
                    ? 'bg-indigo-600 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-300'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                JSON Array
              </button>
            </div>

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer hover:border-indigo-500 transition-colors">
                <FileText className="w-3.5 h-3.5 text-indigo-500" />
                <span>Choose File (.csv, .tsv, .json)</span>
                <input
                  type="file"
                  accept=".csv,.tsv,.json,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setRawText(importMode === 'csv' ? sampleCsv : sampleJson)}
                className="text-xs text-indigo-500 hover:underline cursor-pointer"
              >
                Load Example
              </button>
            </div>
          </div>

          {/* Raw Text Input */}
          <div>
            <label className="block text-xs font-bold mb-1">
              Paste or Edit Raw {importMode.toUpperCase()} Data:
            </label>
            <textarea
              value={rawText}
              onChange={(e) => {
                setRawText(e.target.value);
                setHasParsed(false);
              }}
              rows={6}
              placeholder={importMode === 'csv' ? 'Paste CSV or tab-separated text from Excel here...' : 'Paste JSON array here...'}
              className={`w-full border rounded-xl p-3 text-xs font-mono outline-none ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900'
              }`}
            />
          </div>

          {/* Parse Button */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={handleParse}
              disabled={!rawText.trim()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Validate & Inspect Duplicates</span>
            </button>

            {hasParsed && (
              <label className="flex items-center gap-2 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={skipDuplicates}
                  onChange={(e) => setSkipDuplicates(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <span>Skip existing duplicate questions ({duplicateCount})</span>
              </label>
            )}
          </div>

          {/* Validation & Preview Strip */}
          {hasParsed && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 flex-wrap text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/15 text-emerald-500 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{validRows.length} Valid to Import</span>
                </span>

                {duplicateCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-500 font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{duplicateCount} Duplicates Detected</span>
                  </span>
                )}

                {invalidCount > 0 && (
                  <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 text-rose-500 font-bold flex items-center gap-1">
                    <X className="w-3.5 h-3.5" />
                    <span>{invalidCount} Invalid Rows</span>
                  </span>
                )}
              </div>

              {/* Preview List */}
              <div
                className={`max-h-60 overflow-y-auto rounded-xl border divide-y ${
                  isDark ? 'border-slate-800 divide-slate-800' : 'border-slate-200 divide-slate-100'
                }`}
              >
                {parsedRows.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No rows parsed. Check your data above.
                  </div>
                ) : (
                  parsedRows.map((row, idx) => (
                    <div
                      key={idx}
                      className={`p-3 text-xs flex items-start justify-between gap-3 ${
                        !row.isValid
                          ? 'bg-rose-500/5'
                          : row.isDuplicate
                          ? 'bg-amber-500/5'
                          : 'bg-transparent'
                      }`}
                    >
                      <div className="space-y-1 max-w-xl">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-400">#{idx + 1}</span>
                          {row.isValid ? (
                            <>
                              <span className="font-bold text-indigo-500">{row.data.topic}</span>
                              <span className="text-slate-400">·</span>
                              <span className="capitalize text-slate-500">{row.data.difficulty}</span>
                            </>
                          ) : (
                            <span className="font-bold text-rose-500">Error</span>
                          )}

                          {row.isDuplicate && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-500 font-bold text-[10px]">
                              Duplicate
                            </span>
                          )}
                        </div>

                        {row.isValid ? (
                          <>
                            <div className="font-semibold">{row.data.questionText}</div>
                            <div className="text-[11px] text-slate-400">
                              Answer: Option {String.fromCharCode(65 + (row.data.correctOptionIndex || 0))} (
                              {row.data.options?.[row.data.correctOptionIndex || 0]})
                            </div>
                          </>
                        ) : (
                          <div className="text-rose-400 font-mono text-[11px]">{row.error}</div>
                        )}
                      </div>

                      <div className="shrink-0 text-right">
                        {row.isValid && !row.isDuplicate && (
                          <span className="text-emerald-500 font-bold text-[11px]">Ready</span>
                        )}
                        {row.isDuplicate && (
                          <span className="text-amber-500 text-[11px]">
                            {skipDuplicates ? 'Skipped' : 'Include'}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className={`p-4 border-t flex items-center justify-between shrink-0 ${isDark ? 'border-slate-800 bg-slate-950/50' : 'border-slate-200 bg-slate-50'}`}>
          <div className="text-xs text-slate-400">
            {hasParsed ? `${validRows.length} questions will be added to the Question Bank` : 'Parse data first to review'}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCommitImport}
              disabled={!hasParsed || validRows.length === 0}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              Import {validRows.length} Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
