import React, { useState, useEffect } from 'react';
import { useApp } from '../../store/appStore';
import { StudentProfile, FacultyProfile, StudentSocialLinks, Campus, AcademicYear } from '../../types';
import {
  X,
  User,
  Shield,
  Edit3,
  Check,
  Lock,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Globe,
  Github,
  Linkedin,
  Code2,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Sparkles,
  Trophy,
  Flame,
  Search,
  ArrowUpDown,
  ExternalLink,
  Award,
  KeyRound,
  ShieldCheck,
  Users,
  Bell,
  Volume2,
  VolumeX,
  Swords,
  BookOpen,
  Zap,
  MessageSquare,
} from 'lucide-react';
import { StreakFlame } from '../common/StreakFlame';
import { LeagueEmblem } from '../common/GameIcons';
import { BadgeEmblem } from '../common/BadgeEmblem';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=160&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
];

export const UserProfileModal: React.FC = () => {
  const {
    isProfileModalOpen,
    closeProfileModal,
    profileModalUserId,
    profileModalRole,
    profileActiveTab,
    setProfileActiveTab,
    role,
    activeStudent,
    activeFaculty,
    students,
    facultyList,
    theme,
    setTheme,
    toggleTheme,
    isDark,
    updateStudentProfile,
    updateFacultyProfile,
    requestPhoneOtp,
    verifyPhoneOtp,
    badges,
    notificationPreferences,
    updateNotificationPreferences,
    studentBgAnimationEnabled,
    setStudentBgAnimationEnabled,
    studentBgStyle,
    setStudentBgStyle,
    soundEffectsEnabled,
    setSoundEffectsEnabled,
  } = useApp();

  const isStudent = profileModalRole === 'student';
  const targetStudent: StudentProfile =
    (profileModalUserId && students.find((s) => s.id === profileModalUserId)) || activeStudent;
  const targetFaculty: FacultyProfile =
    (profileModalUserId && facultyList.find((f) => f.id === profileModalUserId)) || activeFaculty;

  const isSelf =
    (isStudent && activeStudent.id === targetStudent.id && role === 'student') ||
    (!isStudent && activeFaculty.id === targetFaculty.id && role !== 'student');

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(isStudent ? targetStudent.name : targetFaculty.name);
  const [editNickname, setEditNickname] = useState(targetStudent.nickname || targetStudent.name.split(' ')[0]);
  const [editBio, setEditBio] = useState(
    (isStudent ? targetStudent.bio : targetFaculty.bio) ||
      'Learning algorithms and building scalable systems on MiraiQuest.'
  );
  const [editDob, setEditDob] = useState(targetStudent.dateOfBirth || '2004-06-15');
  const [editGender, setEditGender] = useState(targetStudent.gender || 'Prefer not to say');
  const [editEmail, setEditEmail] = useState(isStudent ? targetStudent.email : targetFaculty.email);
  const [editCity, setEditCity] = useState(targetStudent.city || 'Coimbatore');
  const [editSkills, setEditSkills] = useState<string[]>(targetStudent.skills || ['DSA', 'Python', 'Web Dev']);
  const [newSkillTag, setNewSkillTag] = useState('');
  const [editAvatar, setEditAvatar] = useState(isStudent ? targetStudent.avatar : targetFaculty.avatar || AVATAR_PRESETS[0]);
  const [editSocial, setEditSocial] = useState<StudentSocialLinks>(
    (isStudent ? targetStudent.socialLinks : targetFaculty.socialLinks) || {}
  );

  // Status & Validation Messages
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Phone OTP State
  const [showOtpFlow, setShowOtpFlow] = useState(false);
  const [newPhoneInput, setNewPhoneInput] = useState('');
  const [otpCodeInput, setOtpCodeInput] = useState('');
  const [otpStep, setOtpStep] = useState<'input_phone' | 'input_otp'>('input_phone');
  const [otpNotice, setOtpNotice] = useState<string | null>(null);

  // Batchmates Search & Sort State
  const [batchmateSearch, setBatchmateSearch] = useState('');
  const [batchmateSort, setBatchmateSort] = useState<'name' | 'xp' | 'level' | 'streak'>('xp');
  const [selectedBatchmateMiniProfile, setSelectedBatchmateMiniProfile] = useState<StudentProfile | null>(null);

  if (!isProfileModalOpen) return null;

  // Filter batchmates: MUST HAVE EXACT SAME campus, year, section
  const batchmatesList = students.filter((s) => {
    if (s.id === targetStudent.id) return false;
    return s.campus === targetStudent.campus && s.year === targetStudent.year && s.section === targetStudent.section;
  });

  const filteredBatchmates = batchmatesList
    .filter((s) => {
      if (!batchmateSearch.trim()) return true;
      const q = batchmateSearch.toLowerCase();
      const matchName = s.name.toLowerCase().includes(q);
      const matchRoll = s.rollNumber.toLowerCase().includes(q);
      return matchName || matchRoll;
    })
    .sort((a, b) => {
      if (batchmateSort === 'name') return a.name.localeCompare(b.name);
      if (batchmateSort === 'level') return b.level - a.level;
      if (batchmateSort === 'streak') return b.streakDays - a.streakDays;
      return b.totalXp - a.totalXp;
    });

  // Handle Save Personal Details & Social Links
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Bio length validation
    if (editBio.length > 200) {
      setStatusMessage({ type: 'error', text: 'Bio cannot exceed 200 characters.' });
      return;
    }

    // URL validation
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
    for (const [key, val] of Object.entries(editSocial)) {
      if (val && val.trim().length > 0 && !urlPattern.test(val.trim())) {
        setStatusMessage({ type: 'error', text: `Please provide a valid URL for ${key}.` });
        return;
      }
    }

    if (isStudent) {
      const res = await updateStudentProfile(targetStudent.id, {
        name: editName.trim(),
        nickname: editNickname.trim(),
        bio: editBio.trim(),
        dateOfBirth: editDob,
        gender: editGender,
        email: editEmail.trim(),
        city: editCity.trim(),
        skills: editSkills,
        avatar: editAvatar,
        socialLinks: editSocial,
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Profile changes saved successfully!' });
        setIsEditing(false);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
      }
    } else {
      const res = await updateFacultyProfile(targetFaculty.id, {
        name: editName.trim(),
        email: editEmail.trim(),
        bio: editBio.trim(),
        avatar: editAvatar,
        socialLinks: editSocial,
      });

      if (res.success) {
        setStatusMessage({ type: 'success', text: 'Faculty profile changes saved successfully!' });
        setIsEditing(false);
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setStatusMessage(null);
    setEditName(isStudent ? targetStudent.name : targetFaculty.name);
    setEditBio((isStudent ? targetStudent.bio : targetFaculty.bio) || '');
  };

  const handleAddSkillTag = () => {
    if (!newSkillTag.trim()) return;
    const clean = newSkillTag.trim();
    if (!editSkills.includes(clean)) {
      setEditSkills([...editSkills, clean]);
    }
    setNewSkillTag('');
  };

  const handleRemoveSkillTag = (tag: string) => {
    setEditSkills(editSkills.filter((s) => s !== tag));
  };

  // OTP Handlers
  const handleRequestOtp = async () => {
    setOtpNotice(null);
    if (!newPhoneInput.trim()) return;
    const res = await requestPhoneOtp(targetStudent.id, newPhoneInput.trim());
    if (res.success) {
      setOtpStep('input_otp');
      setOtpNotice(`OTP dispatched to ${newPhoneInput}! For this demo: use code ${res.mockOtp || '729410'}`);
    } else {
      setOtpNotice(res.message || 'Failed to dispatch verification OTP.');
    }
  };

  const handleVerifyOtp = async () => {
    setOtpNotice(null);
    if (!otpCodeInput.trim()) return;
    const res = await verifyPhoneOtp(targetStudent.id, newPhoneInput.trim(), otpCodeInput.trim());
    if (res.success) {
      setShowOtpFlow(false);
      setOtpStep('input_phone');
      setNewPhoneInput('');
      setOtpCodeInput('');
      setStatusMessage({ type: 'success', text: 'Phone number verified and updated successfully!' });
    } else {
      setOtpNotice(res.error || 'Invalid OTP code. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className={`w-full sm:max-w-4xl h-[100dvh] sm:h-auto sm:max-h-[92vh] flex flex-col rounded-none sm:rounded-2xl border-0 sm:border shadow-2xl overflow-hidden transition-colors pb-safe ${
          isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                {isStudent ? 'Student Profile & Persona' : 'Faculty Member Profile'}
              </h3>
              <p className="text-xs text-slate-400">
                {isStudent
                  ? 'Manage personal bio, verified social links, batchmates, and account credentials.'
                  : 'Faculty credentials, curriculum departments, and academic coordination.'}
              </p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Identity Hero Banner (Section A) */}
        <div
          className={`p-6 border-b transition-colors ${
            isDark
              ? 'bg-slate-950/80 border-slate-800'
              : 'bg-gradient-to-r from-indigo-50/70 via-purple-50/40 to-slate-50 border-slate-200'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <img
                src={isEditing ? editAvatar : isStudent ? targetStudent.avatar : targetFaculty.avatar || AVATAR_PRESETS[0]}
                alt={targetStudent.name}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
              />
              {isEditing && (
                <div className="absolute inset-0 bg-black/60 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] text-white font-semibold">Change</span>
                </div>
              )}
            </div>

            {/* Profile Overview Meta */}
            <div className="flex-1 text-center sm:text-left space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-bold">{isStudent ? targetStudent.name : targetFaculty.name}</h2>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-0.5">
                    <span className="font-semibold text-indigo-500">{targetStudent.campus} Campus</span>
                    {isStudent && (
                      <>
                        <span>·</span>
                        <span>{targetStudent.year}</span>
                        <span>·</span>
                        <span className="font-semibold">Section {targetStudent.section}</span>
                        <span>·</span>
                        <span className="font-mono text-[11px] text-slate-400">{targetStudent.rollNumber}</span>
                      </>
                    )}
                    {!isStudent && (
                      <>
                        <span>·</span>
                        <span>{targetFaculty.department}</span>
                      </>
                    )}
                  </div>
                </div>

                {isSelf && !isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="self-center sm:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-xs cursor-pointer transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {/* Student Stat Badges */}
              {isStudent && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    <Trophy className="w-3.5 h-3.5" />
                    <span>Level {targetStudent.level}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{targetStudent.totalXp.toLocaleString()} XP</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <StreakFlame streakDays={targetStudent.streakDays} size="xs" />
                    <span>{targetStudent.streakDays} Day Streak</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                    <LeagueEmblem league={targetStudent.league} size="sm" />
                    <span>{targetStudent.league} League</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{targetStudent.acceptedAnswerCount || 0} Answers Accepted</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation (Details vs Batchmates for Students) */}
        {isStudent && (
          <div className="flex items-center gap-4 px-6 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
            <button
              onClick={() => setProfileActiveTab('profile')}
              className={`py-3 border-b-2 transition-colors cursor-pointer ${
                profileActiveTab === 'profile'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              Profile & Details
            </button>
            <button
              onClick={() => setProfileActiveTab('batchmates')}
              className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                profileActiveTab === 'batchmates'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Batchmates</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300">
                {batchmatesList.length}
              </span>
            </button>
            {isSelf && (
              <button
                onClick={() => setProfileActiveTab('notifications')}
                className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  profileActiveTab === 'notifications'
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Notification Settings</span>
              </button>
            )}
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Status Feedback Toast */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-2 animate-in fade-in ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-500'
              }`}
            >
              <div className="flex items-center gap-2">
                {statusMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{statusMessage.text}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-xs hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* TAB 1: Profile & Details */}
          {(profileActiveTab === 'profile' || !isStudent) && (
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Preset Avatar Picker in Edit Mode */}
              {isEditing && (
                <div className="p-4 rounded-xl border border-dashed border-indigo-300 dark:border-indigo-800 space-y-2">
                  <label className="block text-xs font-bold text-indigo-500 uppercase tracking-wider">
                    Select Avatar Preset or Custom Image
                  </label>
                  <div className="flex items-center gap-2 overflow-x-auto pb-1">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setEditAvatar(preset)}
                        className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                          editAvatar === preset
                            ? 'border-indigo-600 scale-105 shadow-md'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    placeholder="Or paste custom image URL..."
                    value={editAvatar}
                    onChange={(e) => setEditAvatar(e.target.value)}
                    className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Section B: Personal Details */}
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Personal Information
                  </h4>
                  {isEditing && (
                    <span className="text-[11px] text-indigo-500 font-semibold">Editing Mode Active</span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        required
                      />
                    ) : (
                      <div className="text-xs font-medium py-1.5">{targetStudent.name}</div>
                    )}
                  </div>

                  {/* Nickname */}
                  {isStudent && (
                    <div>
                      <label className="block text-xs font-semibold mb-1">Nickname</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editNickname}
                          onChange={(e) => setEditNickname(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      ) : (
                        <div className="text-xs font-medium py-1.5">{targetStudent.nickname || 'Not specified'}</div>
                      )}
                    </div>
                  )}

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-semibold mb-1">Official Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        required
                      />
                    ) : (
                      <div className="text-xs font-medium py-1.5 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{targetStudent.email}</span>
                      </div>
                    )}
                  </div>

                  {/* City */}
                  {isStudent && (
                    <div>
                      <label className="block text-xs font-semibold mb-1">City / Hometown</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editCity}
                          onChange={(e) => setEditCity(e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                        />
                      ) : (
                        <div className="text-xs font-medium py-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{targetStudent.city || 'Not specified'}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Date of Birth & Gender (Students) */}
                  {isStudent && (
                    <>
                      <div>
                        <label className="block text-xs font-semibold mb-1">Date of Birth</label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={editDob}
                            onChange={(e) => setEditDob(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          />
                        ) : (
                          <div className="text-xs font-medium py-1.5 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{targetStudent.dateOfBirth || 'Private / Unspecified'}</span>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold mb-1">Gender</label>
                        {isEditing ? (
                          <select
                            value={editGender}
                            onChange={(e) => setEditGender(e.target.value)}
                            className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                          >
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Non-Binary">Non-Binary</option>
                            <option value="Prefer not to say">Prefer not to say</option>
                          </select>
                        ) : (
                          <div className="text-xs font-medium py-1.5">{targetStudent.gender || 'Prefer not to say'}</div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Bio (Max 200 Characters) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold">Bio / Learning Philosophy</label>
                    {isEditing && (
                      <span className={`text-[10px] ${editBio.length > 200 ? 'text-rose-500 font-bold' : 'text-slate-400'}`}>
                        {editBio.length}/200 max
                      </span>
                    )}
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      maxLength={200}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="Share your interests, aspirations or current focus (max 200 chars)..."
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-hidden"
                    />
                  ) : (
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {isStudent ? targetStudent.bio || 'No bio written yet.' : targetFaculty.bio || 'Faculty coordinator.'}
                    </p>
                  )}
                </div>

                {/* Skills & Interest Tags */}
                {isStudent && (
                  <div>
                    <label className="block text-xs font-semibold mb-1.5">Skills & Technical Interests</label>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(isEditing ? editSkills : targetStudent.skills || ['DSA', 'Python']).map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                        >
                          <span>{tag}</span>
                          {isEditing && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSkillTag(tag)}
                              className="text-slate-400 hover:text-rose-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </span>
                      ))}

                      {isEditing && (
                        <div className="flex items-center gap-1">
                          <input
                            type="text"
                            placeholder="+ Add skill tag"
                            value={newSkillTag}
                            onChange={(e) => setNewSkillTag(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddSkillTag();
                              }
                            }}
                            className="text-xs py-1 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white w-28"
                          />
                          <button
                            type="button"
                            onClick={handleAddSkillTag}
                            className="text-xs px-2 py-1 rounded-lg bg-indigo-600 text-white font-semibold"
                          >
                            Add
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* MSOT Read-Only Academic Records Notice */}
              {isStudent && (
                <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-start gap-3">
                  <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <div className="font-semibold text-slate-700 dark:text-slate-300">
                      MSOT Registrar Controlled Credentials (Read-Only)
                    </div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Campus: <strong className="text-slate-700 dark:text-slate-200">{targetStudent.campus}</strong> · Year:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">{targetStudent.year}</strong> · Section:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">{targetStudent.section}</strong> · Roll No:{' '}
                      <strong className="text-slate-700 dark:text-slate-200">{targetStudent.rollNumber}</strong>. These fields can only be modified by university administration.
                    </div>
                  </div>
                </div>
              )}

              {/* Section C: Social Links */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Social & Developer Links
                  </h4>
                  <span className="text-[11px] text-slate-400">Clickable icons open in new tabs</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5 text-blue-500">
                      <Linkedin className="w-3.5 h-3.5" />
                      <span>LinkedIn Profile</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        placeholder="https://linkedin.com/in/username"
                        value={editSocial.linkedin || ''}
                        onChange={(e) => setEditSocial({ ...editSocial, linkedin: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    ) : editSocial.linkedin ? (
                      <a
                        href={editSocial.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        <Linkedin className="w-3.5 h-3.5" />
                        <span>{editSocial.linkedin.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not provided</span>
                    )}
                  </div>

                  {/* GitHub */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5">
                      <Github className="w-3.5 h-3.5" />
                      <span>GitHub Profile</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        placeholder="https://github.com/username"
                        value={editSocial.github || ''}
                        onChange={(e) => setEditSocial({ ...editSocial, github: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    ) : editSocial.github ? (
                      <a
                        href={editSocial.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:underline font-medium"
                      >
                        <Github className="w-3.5 h-3.5" />
                        <span>{editSocial.github.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not provided</span>
                    )}
                  </div>

                  {/* LeetCode */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5 text-amber-500">
                      <Code2 className="w-3.5 h-3.5" />
                      <span>LeetCode Profile</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        placeholder="https://leetcode.com/username"
                        value={editSocial.leetcode || ''}
                        onChange={(e) => setEditSocial({ ...editSocial, leetcode: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    ) : editSocial.leetcode ? (
                      <a
                        href={editSocial.leetcode}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 hover:underline font-medium"
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        <span>{editSocial.leetcode.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not provided</span>
                    )}
                  </div>

                  {/* Portfolio Website */}
                  <div>
                    <label className="block text-xs font-semibold mb-1 flex items-center gap-1.5 text-indigo-500">
                      <Globe className="w-3.5 h-3.5" />
                      <span>Portfolio / Website</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="url"
                        placeholder="https://yourdomain.com"
                        value={editSocial.portfolio || ''}
                        onChange={(e) => setEditSocial({ ...editSocial, portfolio: e.target.value })}
                        className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                      />
                    ) : editSocial.portfolio ? (
                      <a
                        href={editSocial.portfolio}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{editSocial.portfolio.replace(/^https?:\/\//, '')}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Not provided</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section D: Account & Phone Login Identity (Requires OTP) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Account Identity & Security
                  </h4>
                  <span className="text-[11px] font-semibold text-amber-500 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" /> Login Credential Protected
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Registered Phone Number</span>
                    </div>
                    <div className="text-sm font-mono font-bold mt-1 text-slate-800 dark:text-slate-200">
                      {targetStudent.phoneNumber || '+91 98765 43210'}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Never shared with other students. Changing your verified login phone requires OTP authentication.
                    </p>
                  </div>

                  {isSelf && (
                    <button
                      type="button"
                      onClick={() => setShowOtpFlow(!showOtpFlow)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
                    >
                      {showOtpFlow ? 'Cancel Phone Change' : 'Update Phone (OTP)'}
                    </button>
                  )}
                </div>

                {/* OTP Drawer/Flow */}
                {showOtpFlow && (
                  <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/50 dark:bg-amber-950/20 space-y-3 animate-in fade-in">
                    <h5 className="text-xs font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>OTP Identity Verification</span>
                    </h5>

                    {otpNotice && (
                      <div className="text-xs p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                        {otpNotice}
                      </div>
                    )}

                    {otpStep === 'input_phone' ? (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="tel"
                          placeholder="Enter new phone number (+91...)"
                          value={newPhoneInput}
                          onChange={(e) => setNewPhoneInput(e.target.value)}
                          className="flex-1 text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={handleRequestOtp}
                          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold touch-target cursor-pointer shrink-0"
                        >
                          Send OTP
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          placeholder="• • • • • •"
                          value={otpCodeInput}
                          onChange={(e) => setOtpCodeInput(e.target.value)}
                          className="flex-1 text-base sm:text-lg tracking-[0.4em] text-center font-bold font-mono p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:tracking-normal"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold touch-target cursor-pointer shrink-0"
                        >
                          Verify & Save
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Section E: Privacy Preferences */}
              {isStudent && isSelf && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Privacy Preferences
                    </h4>
                    <span className="text-[11px] text-slate-400">Takes effect immediately</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Share Social Links with Batchmates */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-blue-500" />
                          <span>Share Links with Batch</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Display GitHub / LinkedIn icons to classmates in your section.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          updateStudentProfile(targetStudent.id, {
                            shareSocialLinksWithBatchmates: !targetStudent.shareSocialLinksWithBatchmates,
                          })
                        }
                        className={`w-full py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          targetStudent.shareSocialLinksWithBatchmates
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {targetStudent.shareSocialLinksWithBatchmates ? 'Shared with Batch' : 'Keep Links Private'}
                      </button>
                    </div>

                    {/* Cohort Privacy Notice */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex flex-col justify-between space-y-2">
                      <div>
                        <div className="text-xs font-bold flex items-center gap-1.5 text-indigo-500">
                          <Shield className="w-3.5 h-3.5" />
                          <span>Cohort Privacy Protection</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Students only see classmates within their same campus, academic year, and section. Phone numbers are always protected.
                        </p>
                      </div>
                      <div className="text-[10px] font-semibold text-slate-400 px-2 py-1 rounded bg-slate-200/60 dark:bg-slate-800/60 text-center">
                        Strict Cohort Isolation Active
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Section F: Appearance (Light / Dark Only + Background Animation) */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Interface Theme Mode
                  </h4>
                  <span className="text-[11px] text-slate-400">Strict Light & Dark (No Auto / System)</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Light Mode</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('dark')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-indigo-400" />
                    <span>Dark Mode</span>
                  </button>
                </div>

                {/* Student Quest Background Animation Toggle */}
                {isStudent && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/40 dark:bg-indigo-950/20">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 mt-0.5 shrink-0">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                            <span>Animated Quest Background</span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              Mirai Japanese Theme
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                            Futuristic Japanese visuals: Rising sun, Mount Fuji, cyber skyline, torii gate, floating lanterns, falling sakura & data particles. Pauses during quizzes & coding.
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setStudentBgAnimationEnabled(!studentBgAnimationEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          studentBgAnimationEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        role="switch"
                        aria-checked={studentBgAnimationEnabled}
                        title="Toggle animated quest background on/off"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            studentBgAnimationEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Background Style Options (Orbs + Particles, Orbs, Particles, Aurora, Off) */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60">
                      <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center justify-between">
                        <span>Background Style</span>
                        <span className="text-[10px] text-indigo-500 font-semibold uppercase tracking-wider">
                          Active:{' '}
                          {studentBgStyle === 'all'
                            ? 'Orbs + Particles (Default)'
                            : studentBgStyle === 'orbs'
                            ? 'Orbs'
                            : studentBgStyle === 'particles'
                            ? 'Particles'
                            : studentBgStyle === 'aurora'
                            ? 'Aurora'
                            : 'Off'}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {[
                          { id: 'all', label: 'Orbs + Particles' },
                          { id: 'orbs', label: 'Orbs' },
                          { id: 'particles', label: 'Particles' },
                          { id: 'aurora', label: 'Aurora' },
                          { id: 'off', label: 'Off' },
                        ].map((styleOption) => {
                          const isSelected = studentBgStyle === styleOption.id;
                          return (
                            <button
                              key={styleOption.id}
                              type="button"
                              onClick={() => setStudentBgStyle(styleOption.id as any)}
                              className={`py-2 px-2 rounded-xl text-xs font-bold transition-all text-center cursor-pointer border ${
                                isSelected
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm ring-2 ring-indigo-500/30'
                                  : 'bg-black/5 dark:bg-white/5 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-black/10 dark:hover:bg-white/10'
                              }`}
                            >
                              {styleOption.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sound Effects Toggle (Chest creak, chimes, coins) */}
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-amber-500" />
                          <span>Reward & Quest Audio Effects</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                          Play soft wooden chest creak, angelic opening chime, and metallic coin sounds on claim.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setSoundEffectsEnabled(!soundEffectsEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          soundEffectsEnabled ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                        role="switch"
                        aria-checked={soundEffectsEnabled}
                        title="Toggle reward claim sound effects on/off"
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            soundEffectsEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Save / Cancel Footer for Edit Mode */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save All Changes</span>
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: Batchmates (Classmates Section) */}
          {profileActiveTab === 'batchmates' && isStudent && (
            <div className="space-y-5">
              {/* Scope Banner */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>
                      Section Classmates: {targetStudent.campus} · {targetStudent.year} · Section {targetStudent.section}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Showing students strictly enrolled in your campus, year, and section ({filteredBatchmates.length} classmates).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search batchmate..."
                      value={batchmateSearch}
                      onChange={(e) => setBatchmateSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                    />
                  </div>

                  {/* Sort */}
                  <select
                    value={batchmateSort}
                    onChange={(e) => setBatchmateSort(e.target.value as any)}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                  >
                    <option value="xp">Sort: Total XP</option>
                    <option value="name">Sort: Name (A-Z)</option>
                    <option value="level">Sort: Level</option>
                    <option value="streak">Sort: Streak</option>
                  </select>
                </div>
              </div>

              {/* Batchmate Cards Grid */}
              {filteredBatchmates.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 space-y-2 border rounded-xl border-dashed">
                  <Users className="w-8 h-8 mx-auto opacity-50 text-indigo-400" />
                  <div className="font-semibold text-slate-600 dark:text-slate-300">No other batchmates found</div>
                  <p className="text-[11px]">
                    No other students currently match Section {targetStudent.section} of {targetStudent.campus} ({targetStudent.year}).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredBatchmates.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBatchmateMiniProfile(b)}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all cursor-pointer flex flex-col justify-between space-y-3 group"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={b.avatar}
                          alt={b.name}
                          className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <span className="font-bold text-xs truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {b.name}
                            </span>
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-500">
                              Lvl {b.level}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {b.rollNumber}
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-2 text-[10px] mt-1 text-slate-500 dark:text-slate-400 font-medium">
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <StreakFlame streakDays={b.streakDays} size="xs" />
                              <span>{b.streakDays}d</span>
                            </span>
                            <span>·</span>
                            <span>
                              {b.totalXp.toLocaleString()} XP
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Social Link Icons (Only if batchmate shared them!) */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {b.league}
                        </span>

                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {b.shareSocialLinksWithBatchmates && b.socialLinks?.github && (
                            <a
                              href={b.socialLinks.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                              title="GitHub Profile"
                            >
                              <Github className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {b.shareSocialLinksWithBatchmates && b.socialLinks?.linkedin && (
                            <a
                              href={b.socialLinks.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-slate-400 hover:text-blue-500 transition-colors"
                              title="LinkedIn Profile"
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {b.shareSocialLinksWithBatchmates && b.socialLinks?.leetcode && (
                            <a
                              href={b.socialLinks.leetcode}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 rounded-md text-slate-400 hover:text-amber-500 transition-colors"
                              title="LeetCode Profile"
                            >
                              <Code2 className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Read-Only Mini Profile Modal for Batchmate */}
              {selectedBatchmateMiniProfile && (
                <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in zoom-in-95 duration-150">
                  <div
                    className={`w-full max-w-md rounded-2xl border p-5 shadow-2xl space-y-4 ${
                      isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3">
                        <img
                          src={selectedBatchmateMiniProfile.avatar}
                          alt="avatar"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                        />
                        <div>
                          <h4 className="font-bold text-sm">
                            {selectedBatchmateMiniProfile.name}
                          </h4>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Section {selectedBatchmateMiniProfile.section} · {selectedBatchmateMiniProfile.year}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedBatchmateMiniProfile(null)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Bio */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        About Batchmate
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                        {selectedBatchmateMiniProfile.bio || 'Passionate about coding and algorithms.'}
                      </p>
                    </div>

                    {/* Verified Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-semibold">Level</div>
                        <div className="font-bold text-indigo-500 text-sm">{selectedBatchmateMiniProfile.level}</div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-semibold">Streak</div>
                        <div className="font-bold text-amber-500 text-sm">
                          {selectedBatchmateMiniProfile.streakDays}d
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                        <div className="text-[10px] text-slate-400 font-semibold">Solves</div>
                        <div className="font-bold text-emerald-500 text-sm">
                          {selectedBatchmateMiniProfile.codingHandles?.verifiedProblemsCount || 0}
                        </div>
                      </div>
                    </div>

                    {/* Badges Preview */}
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                        Unlocked Milestones ({selectedBatchmateMiniProfile.unlockedBadgeIds.length})
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedBatchmateMiniProfile.unlockedBadgeIds.map((bId) => {
                          const badgeObj = badges.find((b) => b.id === bId);
                          return (
                            <span
                              key={bId}
                              className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-md font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                            >
                              <BadgeEmblem
                                iconType={badgeObj?.iconType || 'brackets_trophy'}
                                shape={badgeObj?.shape || 'shield'}
                                rarity={badgeObj?.rarity || 'bronze'}
                                size="xs"
                                isLocked={false}
                              />
                              <span>{badgeObj?.title || bId}</span>
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Privacy Guarantee Note */}
                    <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-950 text-[10px] text-slate-400 text-center flex items-center justify-center gap-1.5">
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Phone numbers, emails, and dates of birth are protected by university privacy regulations.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Notification Settings (Students Only) */}
          {profileActiveTab === 'notifications' && isStudent && isSelf && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <h4 className="text-sm font-bold flex items-center gap-2">
                    <Bell className="w-4 h-4 text-indigo-500" />
                    <span>Student Real-Time Alerts & Notification Center</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize your alerts for coursework deadlines, live team battle updates, streak freezes, and peer doubt solutions.
                  </p>
                </div>
              </div>

              {/* Preferences Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Academic Alerts */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-4 h-4" />
                      <span>Academic & Coursework</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Faculty assignment releases, approaching submission deadlines, and graded solution evaluations.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNotificationPreferences({ academic: !notificationPreferences.academic })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      notificationPreferences.academic
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {notificationPreferences.academic ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                {/* Team Battles */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold flex items-center gap-2 text-blue-600 dark:text-blue-400">
                      <Swords className="w-4 h-4" />
                      <span>Inter-Campus Battles</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Live arena invites, team scoreboard lead changes, and weekend cohort match completions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNotificationPreferences({ battles: !notificationPreferences.battles })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      notificationPreferences.battles
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {notificationPreferences.battles ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                {/* Peer Doubts & Collaboration */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                      <MessageSquare className="w-4 h-4" />
                      <span>Peer Doubts & Answers</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Notifications when a classmate answers your question or marks your solution as verified.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNotificationPreferences({ doubts: !notificationPreferences.doubts })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      notificationPreferences.doubts
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {notificationPreferences.doubts ? 'Enabled' : 'Muted'}
                  </button>
                </div>

                {/* Gamification & Streaks */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-bold flex items-center gap-2 text-amber-600 dark:text-amber-400">
                      <Zap className="w-4 h-4" />
                      <span>Streaks & League Alerts</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Reminders before midnight streak expiry, Freeze Shield auto-activation notices, and league promotions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNotificationPreferences({ gamification: !notificationPreferences.gamification })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                      notificationPreferences.gamification
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {notificationPreferences.gamification ? 'Enabled' : 'Muted'}
                  </button>
                </div>
              </div>

              {/* Browser Web Push Notifications */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/50 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="text-xs font-bold flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                    <Bell className="w-4 h-4" />
                    <span>Browser Web Push Notifications</span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">
                    Receive urgent quiz releases and battle invitations on your device even when MiraiQuest is in the background.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    if (!notificationPreferences.pushEnabled && 'Notification' in window) {
                      try {
                        const perm = await Notification.requestPermission();
                        if (perm === 'granted') {
                          updateNotificationPreferences({ pushEnabled: true });
                          setStatusMessage({ type: 'success', text: 'Web push notifications enabled for this device!' });
                        } else {
                          setStatusMessage({ type: 'error', text: 'Notification permission was denied in your browser.' });
                        }
                      } catch {
                        updateNotificationPreferences({ pushEnabled: !notificationPreferences.pushEnabled });
                      }
                    } else {
                      updateNotificationPreferences({ pushEnabled: !notificationPreferences.pushEnabled });
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    notificationPreferences.pushEnabled
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {notificationPreferences.pushEnabled ? 'Push Active' : 'Enable Web Push'}
                </button>
              </div>

              {/* Quiet Hours */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold flex items-center gap-2">
                      {notificationPreferences.quietHoursEnabled ? (
                        <VolumeX className="w-4 h-4 text-purple-500" />
                      ) : (
                        <Volume2 className="w-4 h-4 text-slate-400" />
                      )}
                      <span>Study & Quiet Hours</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Temporarily silence audio rings and popups during focused lecture sessions and late nights.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => updateNotificationPreferences({ quietHoursEnabled: !notificationPreferences.quietHoursEnabled })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      notificationPreferences.quietHoursEnabled
                        ? 'bg-purple-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {notificationPreferences.quietHoursEnabled ? 'Active' : 'Disabled'}
                  </button>
                </div>

                {notificationPreferences.quietHoursEnabled && (
                  <div className="flex items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-800/80 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">From:</span>
                      <input
                        type="time"
                        value={notificationPreferences.quietHoursStart || '22:00'}
                        onChange={(e) => updateNotificationPreferences({ quietHoursStart: e.target.value })}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">To:</span>
                      <input
                        type="time"
                        value={notificationPreferences.quietHoursEnd || '07:00'}
                        onChange={(e) => updateNotificationPreferences({ quietHoursEnd: e.target.value })}
                        className="px-2 py-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
