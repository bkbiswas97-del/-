import React, { useState } from 'react';
import { Moon, Sparkles, CheckCircle2, AlertOctagon, ShieldAlert, Award } from 'lucide-react';
import { ZODIAC_TRAITS } from '../data/zodiacTraits';

interface ZodiacExplorerViewProps {
  lang: 'bn' | 'en';
}

export const ZodiacExplorerView: React.FC<ZodiacExplorerViewProps> = ({ lang }) => {
  const [selectedSignIdx, setSelectedSignIdx] = useState(0);

  const currentSign = ZODIAC_TRAITS[selectedSignIdx];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-violet-950/60 via-slate-900 to-indigo-950/40 border border-violet-500/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-semibold mb-2">
          <Moon className="w-3.5 h-3.5" />
          {lang === 'bn' ? 'রাশি ও জন্মমাসভিত্তিক দোষ-গুণ ডিরেক্টরি' : 'Zodiac Virtues & Archetypes'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {lang === 'bn' ? '১২টি রাশির অন্তর্নিহিত দোষ-গুণ ও স্বভাবের রহস্য' : 'Virtues, Flaws & Blindspots Across 12 Signs'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          {lang === 'bn'
            ? 'ঐতিহ্যবাহী আর্কিটাইপ ও মনস্তাত্ত্বিক বিশ্লেষণের মাধ্যমে জানুন কোন রাশির মানুষের স্বভাবের প্রধান শক্তি কী এবং কোন বিষয়ে সতর্ক থাকা প্রয়োজন।'
            : 'Explore archetypal merits, vulnerabilities, and ideal behavioral habits for each astrological profile.'}
        </p>
      </div>

      {/* Sign Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
        {ZODIAC_TRAITS.map((z, idx) => {
          const isSelected = selectedSignIdx === idx;
          return (
            <button
              key={z.signEn}
              type="button"
              onClick={() => setSelectedSignIdx(idx)}
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                isSelected
                  ? 'bg-violet-950/60 border-violet-400 text-white shadow-lg scale-105'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <span className="text-xl">{z.symbol}</span>
              <span className="text-xs font-bold">
                {lang === 'bn' ? z.signBn.split(' ')[0] : z.signEn}
              </span>
              <span className="text-[10px] text-slate-500">{z.elementEn}</span>
            </button>
          );
        })}
      </div>

      {/* Selected Sign Detailed Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/20 text-violet-300 flex items-center justify-center text-3xl font-bold shadow-inner">
              {currentSign.symbol}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-2xl font-black text-white">
                  {lang === 'bn' ? currentSign.signBn : currentSign.signEn}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800">
                  {lang === 'bn' ? currentSign.elementBn : currentSign.elementEn}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                {lang === 'bn' ? currentSign.dateRangeBn : currentSign.dateRangeEn}
              </p>
            </div>
          </div>
        </div>

        {/* Virtues & Flaws Side by Side */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Top Virtues */}
          <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-800/40">
            <h4 className="text-sm font-bold text-emerald-400 flex items-center gap-2 mb-3">
              <Award className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রধান গুণাবলী ও শক্তি (Key Virtues)' : 'Top Virtues & Merits'}</span>
            </h4>
            <ul className="space-y-2">
              {(lang === 'bn' ? currentSign.topVirtuesBn : currentSign.topVirtuesEn).map(
                (virtue, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <span className="text-emerald-400 mt-0.5">✦</span>
                    <span>{virtue}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Top Flaws */}
          <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-800/40">
            <h4 className="text-sm font-bold text-rose-400 flex items-center gap-2 mb-3">
              <AlertOctagon className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রধান দোষ ও দুর্বলতা (Flaws & Blindspots)' : 'Top Flaws & Blindspots'}</span>
            </h4>
            <ul className="space-y-2">
              {(lang === 'bn' ? currentSign.topFlawsBn : currentSign.topFlawsEn).map(
                (flaw, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200">
                    <span className="text-rose-400 mt-0.5">✕</span>
                    <span>{flaw}</span>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Habits & Caution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ideal Habits */}
          <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800">
            <h4 className="text-sm font-bold text-teal-400 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'bn' ? 'যেসব অভ্যাস গড়ে তোলা উচিত' : 'Ideal Habits to Cultivate'}</span>
            </h4>
            <ul className="space-y-2">
              {(lang === 'bn' ? currentSign.idealHabitsBn : currentSign.idealHabitsEn).map(
                (habit, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                    <span className="w-4 h-4 rounded-full bg-teal-950 text-teal-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{habit}</span>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Cautionary advice */}
          <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex flex-col justify-center">
            <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4" />
              <span>{lang === 'bn' ? 'সতর্ক থাকার বিষয় (Caution)' : 'Life Caution'}</span>
            </h4>
            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
              {lang === 'bn' ? currentSign.cautionBn : currentSign.cautionEn}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
