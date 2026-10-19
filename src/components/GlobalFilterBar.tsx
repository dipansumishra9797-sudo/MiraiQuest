import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../store/appStore';
import { Campus, AcademicYear } from '../types';
import {
  Filter,
  X,
  ChevronDown,
  Search,
  RotateCcw,
  SlidersHorizontal,
  Building2,
  Calendar,
  Layers,
  BookOpen,
  ArrowUpDown,
  Check,
} from 'lucide-react';

const CAMPUSES: Campus[] = ['HI-Tech', 'Rathinam', 'JUJ'];
const ACADEMIC_YEARS: AcademicYear[] = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SUBJECTS = [
  { id: 'all', label: 'All Subjects' },
  { id: 'dsa', label: 'Data Structures & Algorithms' },
  { id: 'python', label: 'Python Programming' },
  { id: 'web', label: 'Full Stack Web Dev' },
  { id: 'dbms', label: 'Database Management Systems' },
];

export const GlobalFilterBar: React.FC = () => {
  const {
    globalFilters,
    updateGlobalFilter,
    toggleCampusFilter,
    toggleYearFilter,
    toggleSectionFilter,
    clearGlobalFilters,
    availableSections,
    filteredStudents,
    students,
  } = useApp();

  const [openDropdown, setOpenDropdown] = useState<'campus' | 'year' | 'section' | 'subject' | 'sort' | null>(null);
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const filterBarRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const totalActiveFiltersCount =
    globalFilters.campuses.length +
    globalFilters.years.length +
    globalFilters.sections.length +
    (globalFilters.subject !== 'all' ? 1 : 0) +
    (globalFilters.searchQuery ? 1 : 0);

  const hasActiveFilters = totalActiveFiltersCount > 0;

  return (
    <div
      ref={filterBarRef}
      className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        {/* Main Bar */}
        <div className="flex items-center justify-between gap-3">
          {/* Left: Filter title & Student Match Count */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <Filter className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Filters</span>
            </div>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {filteredStudents.length} of {students.length} students
            </span>
          </div>

          {/* Desktop & Tablet Filter Controls */}
          <div className="hidden md:flex items-center gap-1.5 lg:gap-2 flex-1 justify-end flex-wrap">
            {/* Campus Multi-select Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'campus' ? null : 'campus')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  globalFilters.campuses.length > 0
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Campus
                  {globalFilters.campuses.length > 0 && ` (${globalFilters.campuses.length})`}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {openDropdown === 'campus' && (
                <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <span>Select Campus</span>
                    {globalFilters.campuses.length > 0 && (
                      <button
                        onClick={() => updateGlobalFilter('campuses', [])}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="py-1 space-y-0.5">
                    {CAMPUSES.map((c) => {
                      const isSelected = globalFilters.campuses.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => toggleCampusFilter(c)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{c}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Year / Batch Multi-select Popover */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'year' ? null : 'year')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  globalFilters.years.length > 0
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Year / Batch
                  {globalFilters.years.length > 0 && ` (${globalFilters.years.length})`}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {openDropdown === 'year' && (
                <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <span>Select Year / Batch</span>
                    {globalFilters.years.length > 0 && (
                      <button
                        onClick={() => updateGlobalFilter('years', [])}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="py-1 space-y-0.5">
                    {ACADEMIC_YEARS.map((y) => {
                      const isSelected = globalFilters.years.includes(y);
                      return (
                        <button
                          key={y}
                          onClick={() => toggleYearFilter(y)}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{y}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Section Multi-select Popover (Dynamic based on selected Campus & Year) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'section' ? null : 'section')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  globalFilters.sections.length > 0
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Section
                  {globalFilters.sections.length > 0 && ` (${globalFilters.sections.length})`}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {openDropdown === 'section' && (
                <div className="absolute left-0 mt-1.5 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    <span>Select Section</span>
                    {globalFilters.sections.length > 0 && (
                      <button
                        onClick={() => updateGlobalFilter('sections', [])}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="py-1 max-h-48 overflow-y-auto space-y-0.5">
                    {availableSections.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-slate-400 italic">No sections found</div>
                    ) : (
                      availableSections.map((sec) => {
                        const isSelected = globalFilters.sections.includes(sec);
                        return (
                          <button
                            key={sec}
                            onClick={() => toggleSectionFilter(sec)}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                              isSelected
                                ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span>Section {sec}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Subject Filter */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'subject' ? null : 'subject')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  globalFilters.subject !== 'all'
                    ? 'bg-indigo-50 dark:bg-indigo-900/40 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {globalFilters.subject === 'all'
                    ? 'All Subjects'
                    : SUBJECTS.find((s) => s.id === globalFilters.subject)?.label.split(' ')[0] || 'Subject'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {openDropdown === 'subject' && (
                <div className="absolute left-0 mt-1.5 w-60 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
                  <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Filter by Subject
                  </div>
                  <div className="py-1 space-y-0.5">
                    {SUBJECTS.map((sub) => {
                      const isSelected = globalFilters.subject === sub.id;
                      return (
                        <button
                          key={sub.id}
                          onClick={() => {
                            updateGlobalFilter('subject', sub.id);
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                            isSelected
                              ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          <span>{sub.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(openDropdown === 'sort' ? null : 'sort')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  Sort:{' '}
                  {globalFilters.sortBy === 'xp'
                    ? 'Total XP'
                    : globalFilters.sortBy === 'name'
                    ? 'Name'
                    : globalFilters.sortBy === 'streak'
                    ? 'Streak'
                    : 'Activity'}
                </span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {openDropdown === 'sort' && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-2 z-50">
                  <div className="px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                    Sort Students
                  </div>
                  <div className="py-1 space-y-0.5">
                    {[
                      { id: 'xp', label: 'Highest Total XP' },
                      { id: 'name', label: 'Student Name (A-Z)' },
                      { id: 'streak', label: 'Streak Days' },
                      { id: 'activity', label: 'Most Recently Active' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        onClick={() => {
                          updateGlobalFilter('sortBy', st.id as any);
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left ${
                          globalFilters.sortBy === st.id
                            ? 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 font-medium'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <span>{st.label}</span>
                        {globalFilters.sortBy === st.id && (
                          <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="relative min-w-[180px] max-w-[220px]">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search name, roll no..."
                value={globalFilters.searchQuery}
                onChange={(e) => updateGlobalFilter('searchQuery', e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              {globalFilters.searchQuery && (
                <button
                  onClick={() => updateGlobalFilter('searchQuery', '')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearGlobalFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="Clear all active filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear</span>
              </button>
            )}
          </div>

          {/* Mobile Filter Toggle Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileSheetOpen(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors touch-target ${
                hasActiveFilters
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-4 h-4 rounded-full bg-white text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                  {totalActiveFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Active Filter Chips Summary Row */}
        {hasActiveFilters && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
              Active:
            </span>

            {/* Campus Chips */}
            {globalFilters.campuses.map((c) => (
              <span
                key={`chip-campus-${c}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
              >
                <span>{c}</span>
                <button
                  onClick={() => toggleCampusFilter(c)}
                  className="hover:text-blue-900 dark:hover:text-blue-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Year Chips */}
            {globalFilters.years.map((y) => (
              <span
                key={`chip-year-${y}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800"
              >
                <span>{y}</span>
                <button
                  onClick={() => toggleYearFilter(y)}
                  className="hover:text-purple-900 dark:hover:text-purple-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Section Chips */}
            {globalFilters.sections.map((sec) => (
              <span
                key={`chip-sec-${sec}`}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              >
                <span>Sec {sec}</span>
                <button
                  onClick={() => toggleSectionFilter(sec)}
                  className="hover:text-emerald-900 dark:hover:text-emerald-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Subject Chip */}
            {globalFilters.subject !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <span>{SUBJECTS.find((s) => s.id === globalFilters.subject)?.label || globalFilters.subject}</span>
                <button
                  onClick={() => updateGlobalFilter('subject', 'all')}
                  className="hover:text-amber-900 dark:hover:text-amber-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {/* Search Query Chip */}
            {globalFilters.searchQuery && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <span>"{globalFilters.searchQuery}"</span>
                <button
                  onClick={() => updateGlobalFilter('searchQuery', '')}
                  className="hover:text-slate-900 dark:hover:text-slate-100"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              onClick={clearGlobalFilters}
              className="text-[11px] font-semibold text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 ml-1 underline decoration-dotted"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Mobile Filter Drawer / Bottom Sheet */}
      {mobileSheetOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSheetOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-800 max-h-[85dvh] flex flex-col z-10 pb-safe animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Filter & Sort Students</h3>
              </div>
              <button
                onClick={() => setMobileSheetOpen(false)}
                className="p-2 rounded-lg touch-target flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 space-y-5 overflow-y-auto">
              {/* Search */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Search Student
                </label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search name, roll number, email..."
                    value={globalFilters.searchQuery}
                    onChange={(e) => updateGlobalFilter('searchQuery', e.target.value)}
                    className="w-full pl-9 pr-8 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                  {globalFilters.searchQuery && (
                    <button
                      onClick={() => updateGlobalFilter('searchQuery', '')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Campuses Multi-select */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Campus
                  </label>
                  {globalFilters.campuses.length > 0 && (
                    <button
                      onClick={() => updateGlobalFilter('campuses', [])}
                      className="text-xs text-indigo-600 dark:text-indigo-400"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {CAMPUSES.map((c) => {
                    const isSelected = globalFilters.campuses.includes(c);
                    return (
                      <button
                        key={`mob-${c}`}
                        type="button"
                        onClick={() => toggleCampusFilter(c)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{c}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Year / Batch Multi-select */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Year / Batch
                  </label>
                  {globalFilters.years.length > 0 && (
                    <button
                      onClick={() => updateGlobalFilter('years', [])}
                      className="text-xs text-indigo-600 dark:text-indigo-400"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ACADEMIC_YEARS.map((y) => {
                    const isSelected = globalFilters.years.includes(y);
                    return (
                      <button
                        key={`mob-${y}`}
                        type="button"
                        onClick={() => toggleYearFilter(y)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{y}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Section Multi-select */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Section ({availableSections.length} available)
                  </label>
                  {globalFilters.sections.length > 0 && (
                    <button
                      onClick={() => updateGlobalFilter('sections', [])}
                      className="text-xs text-indigo-600 dark:text-indigo-400"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {availableSections.map((sec) => {
                    const isSelected = globalFilters.sections.includes(sec);
                    return (
                      <button
                        key={`mob-sec-${sec}`}
                        type="button"
                        onClick={() => toggleSectionFilter(sec)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                        <span>{sec}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Subject
                </label>
                <select
                  value={globalFilters.subject}
                  onChange={(e) => updateGlobalFilter('subject', e.target.value)}
                  className="w-full py-2 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Sort Students By
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'xp', label: 'Total XP' },
                    { id: 'name', label: 'Name (A-Z)' },
                    { id: 'streak', label: 'Streak' },
                    { id: 'activity', label: 'Last Active' },
                  ].map((st) => {
                    const isSelected = globalFilters.sortBy === st.id;
                    return (
                      <button
                        key={`mob-sort-${st.id}`}
                        type="button"
                        onClick={() => updateGlobalFilter('sortBy', st.id as any)}
                        className={`py-2 px-3 text-xs font-semibold rounded-xl border transition-colors text-center ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={clearGlobalFilters}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 touch-target flex items-center justify-center"
              >
                Clear All
              </button>
              <button
                type="button"
                onClick={() => setMobileSheetOpen(false)}
                className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 shadow-xs touch-target flex items-center justify-center"
              >
                Apply Filters ({filteredStudents.length})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
