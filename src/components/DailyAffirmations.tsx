import React, { useState, useEffect } from 'react';
import {
  SunMedium,
  Sparkles,
  Volume2,
  VolumeX,
  Bookmark,
  BookmarkCheck,
  Share2,
  Copy,
  Check,
  Flame,
  Shuffle,
  Compass,
  ArrowRight,
  Send,
  Loader2,
  Heart,
  Quote,
  Target,
  Clock,
  BookOpen,
} from 'lucide-react';
import { Affirmation, AffirmationCategory } from '../types/affirmation';
import { AFFIRMATIONS_DATA, getTodaysAffirmation } from '../data/affirmationsData';
import confetti from 'canvas-confetti';

interface DailyAffirmationsProps {
  lang: 'bn' | 'en';
}

export const DailyAffirmations: React.FC<DailyAffirmationsProps> = ({ lang }) => {
  const [currentAffirmation, setCurrentAffirmation] = useState<Affirmation>(getTodaysAffirmation());
  const [selectedCategory, setSelectedCategory] = useState<AffirmationCategory>('all');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [customTopic, setCustomTopic] = useState('');
  const [customContext, setCustomContext] = useState('');
  const [showAIGenerator, setShowAIGenerator] = useState(false);

  // Streak tracker
  const [streakCount, setStreakCount] = useState<number>(() => {
    const saved = localStorage.getItem('charitra_affirmation_streak');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [hasCompletedTodayAction, setHasCompletedTodayAction] = useState<boolean>(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    const lastCompleted = localStorage.getItem('charitra_last_action_date');
    return lastCompleted === todayStr;
  });

  // Saved Bookmarks
  const [savedFavorites, setSavedFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem('charitra_saved_affirmations');
    return saved ? JSON.parse(saved) : ['aff_1', 'aff_3'];
  });

  const [activeSubTab, setActiveSubTab] = useState<'today' | 'explore' | 'favorites'>('today');

  useEffect(() => {
    localStorage.setItem('charitra_saved_affirmations', JSON.stringify(savedFavorites));
  }, [savedFavorites]);

  const toggleBookmark = (id: string) => {
    if (savedFavorites.includes(id)) {
      setSavedFavorites((prev) => prev.filter((item) => item !== id));
    } else {
      setSavedFavorites((prev) => [...prev, id]);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.7 } });
    }
  };

  const isBookmarked = (id: string) => savedFavorites.includes(id);

  const handleCompleteAction = () => {
    if (!hasCompletedTodayAction) {
      const todayStr = new Date().toISOString().slice(0, 10);
      localStorage.setItem('charitra_last_action_date', todayStr);
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem('charitra_affirmation_streak', newStreak.toString());
      setHasCompletedTodayAction(true);
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }
  };

  const handleCopy = (aff: Affirmation) => {
    const textToCopy = `✨ ${aff.titleBn} (${aff.focusVirtueBn})\n\n"${aff.bengaliAffirmation}"\n\n📌 আজকের ছোট কাজ: ${aff.microActionBn}\n\n— চরিত্র ও ব্যক্তিত্ব দর্পণ (AI Studio)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Check for Bengali voice or default
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
    if (bnVoice) {
      utterance.voice = bnVoice;
    }

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleShuffle = () => {
    const available = selectedCategory === 'all'
      ? AFFIRMATIONS_DATA
      : AFFIRMATIONS_DATA.filter((a) => a.category === selectedCategory);
    
    if (available.length > 0) {
      const filteredOther = available.filter((a) => a.id !== currentAffirmation.id);
      const next = filteredOther.length > 0
        ? filteredOther[Math.floor(Math.random() * filteredOther.length)]
        : available[0];
      setCurrentAffirmation(next);
    }
  };

  const handleGenerateCustomAffirmation = async (topicToUse?: string) => {
    const topic = topicToUse || customTopic || 'আত্মবিশ্বাস ও মানসিক একাগ্রতা';
    setIsGeneratingAI(true);

    try {
      const res = await fetch('/api/affirmations/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focusTopic: topic,
          personalContext: customContext,
          lang,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setCurrentAffirmation(json.data);
        setActiveSubTab('today');
        setShowAIGenerator(false);
        setCustomTopic('');
        setCustomContext('');
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
      }
    } catch (e) {
      console.error('Failed to generate affirmation', e);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const categories = [
    { id: 'all', labelBn: 'সব বাণী', labelEn: 'All' },
    { id: 'confidence', labelBn: 'আত্মবিশ্বাস ও তেজ', labelEn: 'Confidence' },
    { id: 'patience', labelBn: 'ধৈর্য ও সহনশীলতা', labelEn: 'Patience' },
    { id: 'peace', labelBn: 'মানসিক প্রশান্তি', labelEn: 'Inner Peace' },
    { id: 'integrity', labelBn: 'সততা ও নীতিবোধ', labelEn: 'Integrity' },
    { id: 'empathy', labelBn: 'সহমর্মিতা ও ক্ষমা', labelEn: 'Empathy' },
    { id: 'discipline', labelBn: 'সংকল্প ও অধ্যবসায়', labelEn: 'Discipline' },
  ];

  const filteredAffirmations = AFFIRMATIONS_DATA.filter((item) => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });

  const bookmarkedAffirmations = AFFIRMATIONS_DATA.filter((item) =>
    savedFavorites.includes(item.id)
  );

  const formattedDate = new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8 animate-fadeIn">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800/80 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-10 w-60 h-60 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <SunMedium className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'দৈনিক ইতিবাচক বাণী ও আত্মপ্রত্যয়' : 'Daily Character Affirmation'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'bn' ? 'চরিত্র গঠন ও মানসিক শক্তির প্রাত্যহিক পাঠ' : 'Thoughts for Character & Inner Strength'}
            </h1>
            <p className="text-sm text-slate-400 max-w-xl">
              {lang === 'bn'
                ? 'প্রতিদিনের চিন্তা মানুষের অবচেতন চরিত্র তৈরি করে। দিনটি শুরু করুন এমন এক গভীর প্রত্যয় নিয়ে যা আপনার ধৈর্য, সততা ও আত্মবিশ্বাস বাড়িয়ে তুলবে।'
                : 'Every daily thought sculpts your unconscious character. Ground your day with unwavering resilience, calm virtue, and clarity.'}
            </p>
          </div>

          {/* Streak Counter and AI Generator Launch */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex-1 md:flex-initial flex items-center gap-3 bg-slate-900/90 border border-amber-500/30 px-4 py-2.5 rounded-2xl shadow-inner">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                <Flame className="w-5 h-5 fill-amber-400 animate-pulse" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  {lang === 'bn' ? 'উন্নয়ন স্ট্রিক' : 'Growth Streak'}
                </div>
                <div className="text-lg font-black text-amber-300">
                  {streakCount} {lang === 'bn' ? 'দিন' : 'Days'}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowAIGenerator(!showAIGenerator)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm shadow-lg transition-all transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>{lang === 'bn' ? 'ব্যক্তিগত বাণী তৈরি' : 'AI Custom'}</span>
            </button>
          </div>
        </div>

        {/* AI Custom Generator Drawer/Form */}
        {showAIGenerator && (
          <div className="mt-6 pt-6 border-t border-slate-800/80 animate-slideDown">
            <div className="bg-slate-950/70 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">
                    {lang === 'bn' ? 'আপনার নির্দিষ্ট পরিস্থিতির জন্য আত্মপ্রত্যয় বাণী তৈরি করুন' : 'Craft a Personalized Affirmation for Your Need'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Quick Pills */}
              <div className="flex flex-wrap gap-2">
                {[
                  { bn: 'ক্রোধ ও রাগ নিয়ন্ত্রণ', en: 'Anger Management' },
                  { bn: 'চাকরি ও ক্যারিয়ারে আত্মবিশ্বাস', en: 'Career Confidence' },
                  { bn: 'অফিস বা জীবনের চাপ ও ক্লান্তি', en: 'Stress Relief' },
                  { bn: 'সম্পর্কে ক্ষমা ও সহনশীলতা', en: 'Forgiveness' },
                  { bn: 'অলসতা দূর ও সংকল্প রক্ষা', en: 'Beating Procrastination' },
                  { bn: 'অযথা অন্যের তুলনায় অসন্তোষ দূর', en: 'Inner Contentment' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleGenerateCustomAffirmation(item.bn)}
                    disabled={isGeneratingAI}
                    className="text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 hover:bg-emerald-500/10 text-slate-300 hover:text-emerald-300 transition-all"
                  >
                    {lang === 'bn' ? item.bn : item.en}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder={lang === 'bn' ? 'বিষয় লিখুন (যেমন: কথা দিয়ে কথা রাখার সংকল্প)' : 'Enter topic (e.g. Keeping promises)'}
                  className="sm:col-span-2 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                <button
                  onClick={() => handleGenerateCustomAffirmation()}
                  disabled={isGeneratingAI}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow transition-all disabled:opacity-50"
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{lang === 'bn' ? 'তৈরি হচ্ছে...' : 'Generating...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{lang === 'bn' ? 'বাণী তৈরি করুন' : 'Generate'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActiveSubTab('today')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'today'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900'
            }`}
          >
            {lang === 'bn' ? 'আজকের মূল বাণী' : "Today's Feature"}
          </button>
          <button
            onClick={() => setActiveSubTab('explore')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'explore'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900'
            }`}
          >
            {lang === 'bn' ? 'বাণী ভাণ্ডার (সব দেখুন)' : 'Explore Library'}
          </button>
          <button
            onClick={() => setActiveSubTab('favorites')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'favorites'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white bg-slate-900/40 hover:bg-slate-900'
            }`}
          >
            <Bookmark className="w-3 h-3 text-amber-400" />
            <span>
              {lang === 'bn'
                ? `পছন্দের বাণী (${savedFavorites.length})`
                : `Favorites (${savedFavorites.length})`}
            </span>
          </button>
        </div>
      </div>

      {/* Main View: Today's Featured Card */}
      {activeSubTab === 'today' && (
        <div className="space-y-6">
          {/* Main Card */}
          <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 border border-slate-800 p-6 sm:p-10 shadow-2xl transition-all">
            {/* Top Row: Date, Virtue Tag, Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <SunMedium className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-400">{formattedDate}</div>
                  <div className="text-sm font-bold text-amber-300">
                    {lang === 'bn' ? currentAffirmation.focusVirtueBn : currentAffirmation.focusVirtueEn}
                  </div>
                </div>
              </div>

              {/* Utility actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleSpeak(currentAffirmation.bengaliAffirmation)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isSpeaking
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={lang === 'bn' ? 'উচ্চারণ শুনুন' : 'Listen with Audio'}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => toggleBookmark(currentAffirmation.id)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isBookmarked(currentAffirmation.id)
                      ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                      : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                  title={lang === 'bn' ? 'বুকমার্ক করুন' : 'Save to Favorites'}
                >
                  {isBookmarked(currentAffirmation.id) ? (
                    <BookmarkCheck className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Bookmark className="w-4 h-4" />
                  )}
                </button>

                <button
                  onClick={() => handleCopy(currentAffirmation)}
                  className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
                  title={lang === 'bn' ? 'কপি করুন' : 'Copy'}
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="text-xs font-semibold hidden sm:inline">
                    {copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}
                  </span>
                </button>

                <button
                  onClick={handleShuffle}
                  className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1.5"
                  title={lang === 'bn' ? 'অন্য বাণী দেখুন' : 'Shuffle'}
                >
                  <Shuffle className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold hidden sm:inline">
                    {lang === 'bn' ? 'নতুন চিন্তা' : 'Next'}
                  </span>
                </button>
              </div>
            </div>

            {/* Central Affirmation Quote */}
            <div className="py-8 space-y-4">
              <Quote className="w-10 h-10 text-indigo-500/30 -mb-2" />
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white leading-relaxed tracking-tight">
                "{currentAffirmation.bengaliAffirmation}"
              </h2>
              <p className="text-sm sm:text-base text-slate-400 italic font-serif">
                "{currentAffirmation.englishAffirmation}"
              </p>
            </div>

            {/* Micro-Action Daily Challenge */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                    {lang === 'bn' ? 'আজকের চারিত্রিক মিশন (Micro-Action)' : "Today's Micro-Action"}
                  </span>
                </div>
                {hasCompletedTodayAction && (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {lang === 'bn' ? '✓ আজকের কাজ সম্পন্ন!' : '✓ Completed Today!'}
                  </span>
                )}
              </div>

              <p className="text-sm text-slate-200 font-medium">
                {lang === 'bn' ? currentAffirmation.microActionBn : currentAffirmation.microActionEn}
              </p>

              <div className="pt-1">
                <button
                  onClick={handleCompleteAction}
                  disabled={hasCompletedTodayAction}
                  className={`w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all ${
                    hasCompletedTodayAction
                      ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md transform active:scale-95'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>
                    {hasCompletedTodayAction
                      ? lang === 'bn'
                        ? 'অভিনন্দন! স্ট্রিকে যুক্ত হয়েছে'
                        : 'Action Complete for Today!'
                      : lang === 'bn'
                      ? 'আমি আজ এই কাজটি সম্পন্ন করব'
                      : 'I Commit to Doing This Today'}
                  </span>
                </button>
              </div>
            </div>

            {/* Wisdom & Evening Reflection Two-Column Footer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{lang === 'bn' ? 'দার্শনিক তাৎপর্য ও উৎস' : 'Wisdom & Cultural Anchor'}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'bn'
                    ? currentAffirmation.philosophicalContextBn
                    : currentAffirmation.philosophicalContextEn}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'রাতের আত্মপর্যালোচনা' : 'Nightly Self-Reflection'}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {lang === 'bn'
                    ? currentAffirmation.reflectionPromptBn
                    : currentAffirmation.reflectionPromptEn}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Explore Library Tab */}
      {activeSubTab === 'explore' && (
        <div className="space-y-6">
          {/* Category Filter Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as AffirmationCategory)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {lang === 'bn' ? cat.labelBn : cat.labelEn}
              </button>
            ))}
          </div>

          {/* Grid of Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAffirmations.map((aff) => {
              const bookmarked = isBookmarked(aff.id);
              return (
                <div
                  key={aff.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                        {lang === 'bn' ? aff.focusVirtueBn : aff.focusVirtueEn}
                      </span>
                      <button
                        onClick={() => toggleBookmark(aff.id)}
                        className={`p-1.5 rounded-lg border transition-all ${
                          bookmarked
                            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                            : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                        }`}
                      >
                        {bookmarked ? (
                          <BookmarkCheck className="w-3.5 h-3.5" />
                        ) : (
                          <Bookmark className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <h3 className="text-sm font-bold text-white leading-snug">
                      "{aff.bengaliAffirmation}"
                    </h3>

                    <p className="text-xs text-slate-400 line-clamp-2">
                      {aff.englishAffirmation}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500 text-[11px]">
                      {lang === 'bn' ? aff.titleBn : aff.titleEn}
                    </span>
                    <button
                      onClick={() => {
                        setCurrentAffirmation(aff);
                        setActiveSubTab('today');
                      }}
                      className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 font-bold text-[11px]"
                    >
                      <span>{lang === 'bn' ? 'আজকের ফোকাস করুন' : 'Focus Today'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Favorites SubTab */}
      {activeSubTab === 'favorites' && (
        <div className="space-y-6">
          {bookmarkedAffirmations.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6">
              <Bookmark className="w-10 h-10 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">
                {lang === 'bn' ? 'কোনো পছন্দের বাণী যোগ করা হয়নি' : 'No favorites saved yet'}
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {lang === 'bn'
                  ? 'বাণীর উপরের বুকমার্ক আইকনে ক্লিক করে আপনার প্রিয় আত্মপ্রত্যয়গুলো এখানে জমিয়ে রাখুন।'
                  : 'Click the bookmark icon on any thought to save it here for quick inspiration.'}
              </p>
              <button
                onClick={() => setActiveSubTab('explore')}
                className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-xs font-bold text-slate-200 hover:bg-slate-700"
              >
                {lang === 'bn' ? 'বাণী ভাণ্ডার দেখুন' : 'Explore Library'}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bookmarkedAffirmations.map((aff) => (
                <div
                  key={aff.id}
                  className="bg-slate-900/90 border border-amber-500/20 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-lg"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-300">
                        {lang === 'bn' ? aff.focusVirtueBn : aff.focusVirtueEn}
                      </span>
                      <button
                        onClick={() => toggleBookmark(aff.id)}
                        className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                      >
                        <BookmarkCheck className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-sm font-bold text-white">"{aff.bengaliAffirmation}"</p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => handleCopy(aff)}
                      className="text-xs text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{lang === 'bn' ? 'কপি' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => {
                        setCurrentAffirmation(aff);
                        setActiveSubTab('today');
                      }}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                    >
                      <span>{lang === 'bn' ? 'আজকের ফোকাস' : 'Make Today’s'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
