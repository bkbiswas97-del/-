import React, { useState } from 'react';
import { Sparkles, Brain, ArrowRight, Lightbulb, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AIHabitCoachViewProps {
  lang: 'bn' | 'en';
  initialHabitName?: string;
  initialHabitType?: 'good' | 'bad';
}

export const AIHabitCoachView: React.FC<AIHabitCoachViewProps> = ({
  lang,
  initialHabitName = '',
  initialHabitType = 'bad',
}) => {
  const [habitName, setHabitName] = useState(initialHabitName);
  const [habitType, setHabitType] = useState<'good' | 'bad'>(initialHabitType);
  const [personalContext, setPersonalContext] = useState('');
  const [adviceResult, setAdviceResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const quickPresets = [
    { name: 'হুট করে রেগে যাওয়া ও কটু কথা বলা', type: 'bad' as const },
    { name: 'দেরিতে ঘুমানো ও ফোন স্ক্রল করা', type: 'bad' as const },
    { name: 'গুরুত্বপূর্ণ কাজ ফেলে রাখা (Procrastination)', type: 'bad' as const },
    { name: 'অন্যের কথা ধৈর্য ধরে শোনা', type: 'good' as const },
    { name: 'ভোরে উঠে দিন শুরু করা', type: 'good' as const },
    { name: 'অন্যের ভালো দেখে হিংসা না করে খুশি হওয়া', type: 'good' as const },
  ];

  const handleAskAdvice = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!habitName.trim()) return;

    setIsLoading(true);
    setAdviceResult(null);

    try {
      const res = await fetch('/api/habit-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          habitName: habitName.trim(),
          habitType,
          personalContext: personalContext.trim(),
        }),
      });

      const data = await res.json();
      if (data.success && data.advice) {
        setAdviceResult(data.advice);
      } else {
        setAdviceResult(
          'অভ্যাস পরিবর্তনের জন্য প্রতিদিন একই সময়ে ছোট পদক্ষেপ নিন এবং ট্রিগার পয়েন্টগুলো নিয়ন্ত্রণে রাখুন।'
        );
      }
    } catch (err) {
      console.error(err);
      setAdviceResult(
        'পরামর্শ লোড করতে কিছুটা সমস্যা হয়েছে। মনস্তাত্ত্বিক নিয়মে ২১ দিন নিয়ম মেনে চলার চেষ্টা করুন।'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-emerald-950/40 border border-teal-500/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-xs font-semibold mb-2">
          <Brain className="w-3.5 h-3.5" />
          {lang === 'bn' ? 'এআই মনস্তাত্ত্বিক স্বভাব ও অভ্যাস পরামর্শক' : 'AI Habit & Behavioral Coach'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {lang === 'bn'
            ? 'যেকোনো নির্দিষ্ট দোষ দূর বা গুণ গঠনের সুনির্দিষ্ট সমাধান'
            : 'Targeted Solutions to Rewire Any Habit or Virtue'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          {lang === 'bn'
            ? 'আপনার কোনো বিশেষ খারাপ অভ্যাস আছে যা ত্যাগ করতে পারছেন না? কিংবা কোনো ভালো গুণ স্থায়ী করতে চান? আচরণ বিজ্ঞান ও এআই-এর সমন্বয়ে নিন বাস্তবিক প্রতিকার।'
            : 'Need tailored psychological tactics to dissolve a nagging flaw or cement an inspiring habit? Get actionable advice below.'}
        </p>
      </div>

      {/* Preset Pills */}
      <div>
        <p className="text-xs font-semibold text-slate-400 mb-2">
          {lang === 'bn' ? 'সাধারণ কিছু চ্যালেঞ্জ (ক্লিক করে নির্বাচন করুন):' : 'Common Challenges:'}
        </p>
        <div className="flex flex-wrap gap-2">
          {quickPresets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setHabitName(p.name);
                setHabitType(p.type);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-teal-500/50 text-slate-300 hover:text-white text-xs transition-all flex items-center gap-1.5"
            >
              <span>{p.type === 'good' ? '🟢' : '🔴'}</span>
              <span>{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleAskAdvice}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-5"
      >
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {lang === 'bn' ? 'অভ্যাস বা চারিত্রিক বৈশিষ্ট্যটির নাম' : 'Habit or Trait Name'}
          </label>
          <input
            type="text"
            value={habitName}
            onChange={(e) => setHabitName(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'যেমন: মানুষের সাথে অতিরিক্ত তর্কে জড়িয়ে পড়া'
                : 'e.g. Getting into unnecessary arguments'
            }
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {lang === 'bn' ? 'লক্ষ্য কি?' : 'Your Goal'}
            </label>
            <select
              value={habitType}
              onChange={(e) => setHabitType(e.target.value as any)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-sm text-slate-100 outline-none"
            >
              <option value="bad">{lang === 'bn' ? '🔴 খারাপ অভ্যাস বর্জন / দোষ জয়' : '🔴 Break Bad Habit'}</option>
              <option value="good">{lang === 'bn' ? '🟢 ভালো অভ্যাস গঠন / গুণ বৃদ্ধি' : '🟢 Build Good Habit'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              {lang === 'bn' ? 'ব্যক্তিগত প্রেক্ষাপট (ঐচ্ছিক)' : 'Personal Context (Optional)'}
            </label>
            <input
              type="text"
              value={personalContext}
              onChange={(e) => setPersonalContext(e.target.value)}
              placeholder={lang === 'bn' ? 'যেমন: অফিসে বা পড়াশোনার সময় বেশি হয়' : 'e.g. Happens during work stress'}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-teal-500 text-sm text-slate-100 placeholder-slate-500 outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={!habitName.trim() || isLoading}
          className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg flex items-center justify-center gap-2 ${
            !habitName.trim() || isLoading
              ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-teal-500 to-emerald-400 hover:from-teal-400 hover:to-emerald-300 text-slate-950 hover:scale-[1.01]'
          }`}
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>{lang === 'bn' ? 'উপদেশ সংকলন হচ্ছে...' : 'Generating Advice...'}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>{lang === 'bn' ? 'মনস্তাত্ত্বিক সমাধান ও দিকনির্দেশনা পান' : 'Get Psychological Action Plan'}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Advice Result Card */}
      {adviceResult && (
        <div className="bg-slate-900 border border-teal-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
            <div className="w-9 h-9 rounded-xl bg-teal-500/20 text-teal-300 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? `"${habitName}" এর সমাধানের রূপরেখা` : `Strategy for "${habitName}"`}
              </h3>
              <span className="text-xs text-teal-400">
                {habitType === 'bad'
                  ? (lang === 'bn' ? 'বর্জনের বিজ্ঞানসম্মত উপায়' : 'Deconstruction Tactic')
                  : (lang === 'bn' ? 'স্থায়ী করার কৌশল' : 'Cultivation Strategy')}
              </span>
            </div>
          </div>

          <div className="text-sm text-slate-200 leading-relaxed whitespace-pre-line p-4 rounded-xl bg-slate-950/70 border border-slate-800">
            {adviceResult}
          </div>
        </div>
      )}
    </div>
  );
};
