import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/appStore';
import {
  GitPullRequest,
  ExternalLink,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';

export const OpenSourceGuideView: React.FC = () => {
  const { isDark, setNavSection, role } = useApp();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [reloadKey, setReloadKey] = useState<number>(0);
  const [showEmbeddedAnyway, setShowEmbeddedAnyway] = useState<boolean>(false);

  const timeoutTimerRef = useRef<NodeJS.Timeout | null>(null);

  const FIRSTPR_URL = 'https://www.firstpr.in/';

  // Manage 6-second timeout detection for blocked/slow iframe loading
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    setIsTimedOut(false);

    // Start 6-second timer
    timeoutTimerRef.current = setTimeout(() => {
      // If still loading after 6 seconds, assume potential frame blocking or network timeout
      setIsTimedOut(true);
    }, 6000);

    return () => {
      if (timeoutTimerRef.current) {
        clearTimeout(timeoutTimerRef.current);
      }
    };
  }, [reloadKey]);

  const handleIframeLoad = () => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    setIsLoading(false);
  };

  const handleIframeError = () => {
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
    }
    setIsLoading(false);
    setHasError(true);
  };

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    setIsTimedOut(false);
    setShowEmbeddedAnyway(false);
    setReloadKey((prev) => prev + 1);
  };

  // Guard: If an admin reaches this view directly, redirect immediately to admin home
  useEffect(() => {
    if (role === 'admin') {
      if (typeof window !== 'undefined' && window.location.pathname === '/open-source-guide') {
        window.history.replaceState({}, '', '/');
      }
      setNavSection('admin:rules');
    }
  }, [role, setNavSection]);

  const handleBackToDashboard = () => {
    if (role === 'faculty') {
      setNavSection('faculty:analytics');
    } else {
      setNavSection('dashboard:overview');
    }
  };

  if (role === 'admin') {
    return null;
  }

  const showFallbackCard = (hasError || isTimedOut) && !showEmbeddedAnyway;

  const cardBg =
    role === 'student'
      ? isDark
        ? 'bg-slate-900/70 border-slate-800/80 text-white backdrop-blur-xl'
        : 'bg-white/75 border-slate-200/80 text-slate-900 backdrop-blur-xl shadow-xs'
      : isDark
      ? 'bg-slate-900 border-slate-800 text-white shadow-md'
      : 'bg-white border-slate-200 text-slate-900 shadow-sm';

  return (
    <div className="w-full space-y-4 sm:space-y-5 animate-fade-in">
      {/* Header Bar: Title, Tagline, Powered by FirstPR & Controls */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${cardBg}`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <button
            type="button"
            onClick={handleBackToDashboard}
            className={`p-2 rounded-xl border transition-all cursor-pointer shrink-0 mt-0.5 sm:mt-0 ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-700'
                : 'bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
            title="Back to Dashboard"
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/15 border border-emerald-500/30 text-emerald-500">
                <GitPullRequest className="w-3 h-3" />
                <span>Open Source</span>
              </span>

              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span>Powered by</span>
                <a
                  href={FIRSTPR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-indigo-500 hover:underline inline-flex items-center gap-0.5"
                >
                  <span>FirstPR</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-1">
              Open Source Guide
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
              Learn how to make your first open source contribution and master git pull requests.
            </p>
          </div>
        </div>

        {/* Action Controls: Reload & Open in New Tab */}
        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={handleReload}
            className={`px-3 py-2 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              isDark
                ? 'bg-slate-800/80 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 hover:text-slate-900 shadow-2xs'
            }`}
            title="Reload embedded guide"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Reload</span>
          </button>

          <a
            href={FIRSTPR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer touch-target"
            title="Open FirstPR in a new browser tab"
          >
            <span>Open in new tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Main Container: Embedded Iframe OR Clean Fallback Card */}
      <div
        className={`relative w-full rounded-2xl border overflow-hidden transition-colors ${
          isDark ? 'border-slate-800/80 bg-slate-950/60' : 'border-slate-200/80 bg-slate-50/60'
        }`}
        style={{
          height: 'calc(100dvh - 220px)',
          minHeight: '560px',
        }}
      >
        {/* Loading Skeleton / Spinner Overlay */}
        <AnimatePresence>
          {isLoading && !showFallbackCard && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md"
            >
              <div className="relative flex items-center justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 animate-pulse">
                  <GitPullRequest className="w-7 h-7" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-indigo-500 border-t-transparent animate-spin" />
              </div>

              <div className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <span>Connecting to FirstPR Guide</span>
                <span className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-sm text-center">
                Fetching interactive tutorials and pull request walkthroughs...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Fallback Card: Displayed if embedding is blocked or times out after 6 seconds */}
        {showFallbackCard ? (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center p-6 sm:p-10 text-center bg-slate-900/90 dark:bg-slate-950/95 backdrop-blur-md overflow-y-auto">
            <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-700/80 bg-slate-900 text-white shadow-2xl space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-indigo-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-inner">
                <GitPullRequest className="w-8 h-8" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  Interactive Guide
                </span>
                <h3 className="text-xl sm:text-2xl font-black mt-2">FirstPR</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed">
                  Learn how to make your first open source contribution on GitHub with step-by-step interactive exercises.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 text-left flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Due to browser security policies or network configurations, FirstPR opens best directly in its dedicated window. No student data is shared.
                </span>
              </div>

              {/* Primary Launch Action */}
              <div className="space-y-2 pt-2">
                <a
                  href={FIRSTPR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-emerald-500/25 hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open FirstPR</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                <div className="flex items-center justify-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleReload}
                    className="text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1 px-2"
                  >
                    Try Reloading
                  </button>

                  <span className="text-slate-600">·</span>

                  <button
                    type="button"
                    onClick={() => setShowEmbeddedAnyway(true)}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer py-1 px-2"
                  >
                    View Embedded Anyway
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* The Responsive Embedded Iframe */}
        <iframe
          key={reloadKey}
          src={FIRSTPR_URL}
          title="FirstPR - Open Source Contribution Guide"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          referrerPolicy="no-referrer-when-downgrade"
          loading="lazy"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className="w-full h-full border-0 rounded-2xl block"
        />
      </div>
    </div>
  );
};
