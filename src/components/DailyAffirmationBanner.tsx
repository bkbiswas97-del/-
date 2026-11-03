import React, { useState } from 'react';
import {
  SunMedium,
  Sparkles,
  Volume2,
  VolumeX,
  ArrowRight,
  Flame,
  Check,
  Copy,
} from 'lucide-react';
import { Affirmation } from '../types/affirmation';
import { getTodaysAffirmation } from '../data/affirmationsData';

interface DailyAffirmationBannerProps {
  lang: 'bn' | 'en';
  onOpenFullAffirmations: () => void;
}

export const DailyAffirmationBanner: React.FC<DailyAffirmationBannerProps> = ({
  lang,
  onOpenFullAffirmations,
}) => {
  const [affirmation] = useState<Affirmation>(getTodaysAffirmation());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const streakCount = (() => {
    try {
      const saved = localStorage.getItem('charitra_affirmation_streak');
      return saved ? parseInt(saved, 10) : 1;
    } catch {
      return 1;
    }
  })();

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(affirmation.bengaliAffirmation);
    utterance.rate = 0.9;
    const voices = window.speechSynthesis.getVoices();
    const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
    if (bnVoice) utterance.voice = bnVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(
      `"${affirmation.bengaliAffirmation}" — ${affirmation.focusVirtueBn}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-amber-500/30 p-4 sm:p-5 shadow-lg hover:border-amber-500/50 transition-all duration-300">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Left Side: Badge + Quote */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
              <SunMedium className="w-3 h-3 text-amber-400" />
              <span>{lang === 'bn' ? 'আজকের আত্মপ্রত্যয়' : "Today's Affirmation"}</span>
            </div>

            <span className="text-xs text-slate-400 font-medium">
              {lang === 'bn' ? affirmation.focusVirtueBn : affirmation.focusVirtueEn}
            </span>

            <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>{streakCount} {lang === 'bn' ? 'দিন স্ট্রিক' : 'd streak'}</span>
            </div>
          </div>

          <p className="text-sm sm:text-base font-bold text-slate-100 leading-snug line-clamp-2">
            "{affirmation.bengaliAffirmation}"
          </p>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
            <span className="font-semibold text-emerald-300">
              {lang === 'bn' ? 'আজকের মিশন:' : 'Action:'}
            </span>
            <span className="text-slate-300 line-clamp-1">
              {lang === 'bn' ? affirmation.microActionBn : affirmation.microActionEn}
            </span>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
          <button
            onClick={handleSpeak}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title={lang === 'bn' ? 'শুনুন' : 'Listen'}
          >
            {isSpeaking ? <VolumeX className="w-4 h-4 text-amber-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={handleCopy}
            className="p-2 rounded-xl bg-slate-800/80 border border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title={lang === 'bn' ? 'কপি' : 'Copy'}
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={onOpenFullAffirmations}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-slate-950" />
            <span>{lang === 'bn' ? 'পূর্ণ হাব খুলুন' : 'Open Hub'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
