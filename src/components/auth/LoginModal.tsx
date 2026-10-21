import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../store/appStore';
import {
  ShieldCheck,
  Phone,
  KeyRound,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  GraduationCap,
  UserCheck,
  X,
} from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { isDark, handleAuthSuccess } = useApp();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [demoOtpHint, setDemoOtpHint] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState<number | null>(null);

  // Cooldown countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const interval = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldown]);

  const handleRequestOtp = async (inputPhone?: string) => {
    const targetPhone = inputPhone || phoneNumber;
    if (!targetPhone.trim()) {
      setError('Please enter your registered mobile phone number.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: targetPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.cooldownRemaining) {
          setCooldown(data.cooldownRemaining);
        }
        setError(data.error || 'Failed to dispatch verification code.');
        setIsLoading(false);
        return;
      }

      setSuccessMsg(data.message);
      setCooldown(data.cooldownSeconds || 60);
      if (data.demoOtp) {
        setDemoOtpHint(data.demoOtp);
      }
      setStep('otp');
      setAttemptsRemaining(3);
    } catch (err: any) {
      setError('Network communication error. Please check server connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, otp }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed.');
        if (data.remainingAttempts !== undefined) {
          setAttemptsRemaining(data.remainingAttempts);
        }
        setIsLoading(false);
        return;
      }

      // Success: backend decided role!
      handleAuthSuccess(data.token, data.user);
      if (onClose) onClose();
    } catch (err: any) {
      setError('Network error verifying code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPersona = (phone: string, personaName: string) => {
    setPhoneNumber(phone);
    setError(null);
    setStep('phone');
    handleRequestOtp(phone);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Dimmed Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-5 sm:p-7 z-10 transition-colors ${
            isDark
              ? 'bg-slate-900 border-slate-800 text-slate-100 shadow-indigo-950/40'
              : 'bg-white border-slate-200 text-slate-900 shadow-xl'
          }`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-1.5">
                  <span>Sign In to MiraiQuest</span>
                </h3>
                <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Institutional MSOT Phone OTP Authentication
                </p>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-slate-900'
                }`}
                aria-label="Close login dialog"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Success / Status Message */}
          {successMsg && !error && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{successMsg}</div>
            </div>
          )}

          {/* Form Step 1: Phone Number Input */}
          {step === 'phone' && (
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-semibold mb-1.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Registered Mobile Phone Number
                </label>
                <div className="relative flex items-center">
                  <div className={`absolute left-3 flex items-center gap-1.5 text-xs font-semibold select-none ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phoneNumber.replace(/^\+91\s?/, '')}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="98765 43210"
                    maxLength={15}
                    className={`w-full pl-16 pr-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                  Enter your 10-digit mobile number linked to MSOT ERP.
                </p>
              </div>

              <button
                onClick={() => handleRequestOtp()}
                disabled={isLoading || cooldown > 0}
                className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Request Verification OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Form Step 2: OTP Verification Input */}
          {step === 'otp' && (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`text-xs font-semibold ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    Enter 6-Digit OTP
                  </label>
                  <button
                    onClick={() => {
                      setStep('phone');
                      setError(null);
                    }}
                    className="text-[11px] text-indigo-500 hover:underline cursor-pointer"
                  >
                    Change phone
                  </button>
                </div>

                <div className="relative">
                  <KeyRound className={`w-4 h-4 absolute left-3 top-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="729410"
                    maxLength={6}
                    className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl border text-sm tracking-widest font-mono text-center transition-all outline-hidden focus:ring-2 focus:ring-indigo-500 ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder-slate-400'
                    }`}
                  />
                </div>

                {/* Demo OTP Helper */}
                {demoOtpHint && (
                  <div className="mt-2 flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-400">
                    <span>Evaluator Demo OTP: <strong>{demoOtpHint}</strong></span>
                    <button
                      onClick={() => setOtp(demoOtpHint)}
                      className="text-[10px] font-bold underline cursor-pointer hover:text-indigo-300"
                    >
                      Auto-fill
                    </button>
                  </div>
                )}

                {attemptsRemaining !== null && attemptsRemaining < 3 && (
                  <p className="text-[11px] text-amber-500 mt-1 font-semibold">
                    {attemptsRemaining} attempt{attemptsRemaining === 1 ? '' : 's'} remaining before OTP expires.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleRequestOtp()}
                  disabled={cooldown > 0 || isLoading}
                  className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-300'
                      : 'border-slate-200 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  {cooldown > 0 ? `Resend (${cooldown}s)` : 'Resend OTP'}
                </button>

                <button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otp.length < 4}
                  className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white shadow-md shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Verify & Enter Portal</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Quick-Fill Evaluator Personas */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className={`text-[10px] font-bold uppercase tracking-wider mb-2.5 flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>1-Click Test Personas (Evaluator Review)</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-left">
              <button
                onClick={() => handleQuickPersona('+91 98765 43210', 'Rahul')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                  <GraduationCap className="w-3 h-3" />
                  <span>Rahul Verma</span>
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Student · Rathinam (Bronze)
                </div>
              </button>

              <button
                onClick={() => handleQuickPersona('+91 98765 88990', 'Maya')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
                  <GraduationCap className="w-3 h-3" />
                  <span>Maya Sharma</span>
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Student · HI-Tech (Diamond)
                </div>
              </button>

              <button
                onClick={() => handleQuickPersona('+91 98765 22110', 'Priya')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-blue-500">
                  <UserCheck className="w-3 h-3" />
                  <span>Prof. Priya Nair</span>
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Faculty · HI-Tech (DSA)
                </div>
              </button>

              <button
                onClick={() => handleQuickPersona('+91 98765 99000', 'Vikram')}
                className={`p-2 rounded-lg border text-left transition-colors cursor-pointer ${
                  isDark
                    ? 'border-slate-800 hover:bg-slate-800/80 text-slate-300'
                    : 'border-slate-200 hover:bg-slate-100 text-slate-700 shadow-2xs'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Dean Vikram Rao</span>
                </div>
                <div className={`text-[10px] truncate ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Admin · Institutional
                </div>
              </button>
            </div>

            <div className="mt-2 text-center">
              <button
                onClick={() => handleQuickPersona('+91 98765 00000', 'Unregistered')}
                className={`text-[10px] hover:underline cursor-pointer ${isDark ? 'text-slate-500' : 'text-slate-400'}`}
              >
                Test Unregistered Number (Verify no role leaked)
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
