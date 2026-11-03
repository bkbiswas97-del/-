import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  XCircle,
  Plus,
  Flame,
  Award,
  Sparkles,
  RefreshCw,
  Trash2,
  Lightbulb,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HABITS_CATALOG } from '../data/habitsCatalog';

interface TrackedHabit {
  id: string;
  name: string;
  type: 'good' | 'bad';
  category: string;
  completedToday: boolean;
  streak: number;
}

interface HabitsTrackerViewProps {
  lang: 'bn' | 'en';
  onGetHabitAdvice: (habitName: string, habitType: 'good' | 'bad') => void;
}

export const HabitsTrackerView: React.FC<HabitsTrackerViewProps> = ({
  lang,
  onGetHabitAdvice,
}) => {
  const initialHabits: TrackedHabit[] = [
    {
      id: 'h1',
      name: 'ভোরে ওঠা ও সুশৃঙ্খল দিন শুরু',
      type: 'good',
      category: 'শৃঙ্খলা',
      completedToday: true,
      streak: 4,
    },
    {
      id: 'h2',
      name: 'সত্যবাদিতা ও অঙ্গীকার রক্ষা',
      type: 'good',
      category: 'চরিত্র',
      completedToday: false,
      streak: 7,
    },
    {
      id: 'h3',
      name: 'অন্যের কথা ধৈর্য ধরে শোনা',
      type: 'good',
      category: 'শিষ্টাচার',
      completedToday: false,
      streak: 3,
    },
    {
      id: 'h4',
      name: 'প্রতিদিন অন্তত ২০ মিনিট বই পড়া',
      type: 'good',
      category: 'জ্ঞান',
      completedToday: true,
      streak: 5,
    },
    {
      id: 'b1',
      name: 'অযথা সোশ্যাল মিডিয়া স্ক্রলিং বর্জন',
      type: 'bad',
      category: 'সময় রক্ষা',
      completedToday: false,
      streak: 2,
    },
    {
      id: 'b2',
      name: 'হুট করে রেগে যাওয়া ও কটু কথা বলা বর্জন',
      type: 'bad',
      category: 'আবেগ সংযম',
      completedToday: true,
      streak: 6,
    },
    {
      id: 'b3',
      name: 'কাজ ফেলে রাখা বা দীর্ঘসূত্রিতা বর্জন',
      type: 'bad',
      category: 'কর্মনিষ্ঠা',
      completedToday: false,
      streak: 1,
    },
  ];

  const [habits, setHabits] = useState<TrackedHabit[]>(() => {
    const saved = localStorage.getItem('charitra_habits_tracker');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return initialHabits;
      }
    }
    return initialHabits;
  });

  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitType, setNewHabitType] = useState<'good' | 'bad'>('good');

  useEffect(() => {
    localStorage.setItem('charitra_habits_tracker', JSON.stringify(habits));
  }, [habits]);

  const toggleHabit = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const nextState = !h.completedToday;
          const nextStreak = nextState ? h.streak + 1 : Math.max(0, h.streak - 1);
          if (nextState) {
            confetti({
              particleCount: 35,
              spread: 50,
              origin: { y: 0.7 },
            });
          }
          return { ...h, completedToday: nextState, streak: nextStreak };
        }
        return h;
      })
    );
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const handleAddNewHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newH: TrackedHabit = {
      id: `custom_${Date.now()}`,
      name: newHabitName.trim(),
      type: newHabitType,
      category: newHabitType === 'good' ? 'ভালো অভ্যাস' : 'বর্জনীয় ত্রুটি',
      completedToday: false,
      streak: 0,
    };

    setHabits((prev) => [newH, ...prev]);
    setNewHabitName('');
  };

  const goodHabits = habits.filter((h) => h.type === 'good');
  const badHabits = habits.filter((h) => h.type === 'bad');
  const completedTodayCount = habits.filter((h) => h.completedToday).length;

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Tracker Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
              {lang === 'bn' ? 'দৈনন্দিন অভ্যাস সংস্কারক ও ট্র্যাকার' : 'Daily Habit Reformer & Tracker'}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              {lang === 'bn' ? 'গুণ বিকাশ ও দোষ বর্জনের প্রত্যয়' : 'Build Virtues, Eliminate Vices'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
              {lang === 'bn'
                ? 'বড় পরিবর্তন হঠাৎ আসে না—প্রতিদিনের ছোট অভ্যাসের আলোতেই মানুষের উন্নত চরিত্রের ভিত্তি রচিত হয়।'
                : 'Character is not built overnight; small daily acts shape our moral core.'}
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">
              {lang === 'bn' ? 'আজকের অগ্রগতি' : 'Today’s Progress'}
            </span>
            <span className="text-2xl sm:text-3xl font-mono tabular-nums font-extrabold text-emerald-400">
              {completedTodayCount} / {habits.length}
            </span>
          </div>
        </div>
      </div>

      {/* Add New Habit Bar */}
      <form
        onSubmit={handleAddNewHabit}
        className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-3 items-center shadow-lg"
      >
        <input
          type="text"
          value={newHabitName}
          onChange={(e) => setNewHabitName(e.target.value)}
          placeholder={
            lang === 'bn'
              ? 'নতুন অভ্যাস যোগ করুন (যেমন: রাগ হলে চুপ থাকা, প্রতিদিন বই পড়া...)'
              : 'Add a new habit to track...'
          }
          className="flex-1 w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={newHabitType}
            onChange={(e) => setNewHabitType(e.target.value as any)}
            className="px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 outline-none"
          >
            <option value="good">{lang === 'bn' ? '🟢 ভালো গুণ গঠন' : '🟢 Good Virtue'}</option>
            <option value="bad">{lang === 'bn' ? '🔴 খারাপ দোষ বর্জন' : '🔴 Bad Habit Abstinence'}</option>
          </select>

          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>{lang === 'bn' ? 'যোগ করুন' : 'Add Habit'}</span>
          </button>
        </div>
      </form>

      {/* Habits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Good Habits Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ভালো অভ্যাস গঠন (Virtues to Cultivate)' : 'Good Virtues'}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {goodHabits.length} {lang === 'bn' ? 'টি অভ্যাস' : 'habits'}
            </span>
          </div>

          <div className="space-y-3">
            {goodHabits.map((habit) => (
              <div
                key={habit.id}
                className={`p-4 rounded-2xl border transition-all ${
                  habit.completedToday
                    ? 'bg-emerald-950/30 border-emerald-500/60 shadow-md'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => toggleHabit(habit.id)}
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        habit.completedToday
                          ? 'bg-emerald-500 text-slate-950 scale-105'
                          : 'border border-slate-700 text-transparent hover:border-emerald-400'
                      }`}
                    >
                      ✓
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-semibold transition-colors ${
                          habit.completedToday ? 'text-emerald-300 line-through' : 'text-slate-100'
                        }`}
                      >
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/50">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {habit.streak} {lang === 'bn' ? 'দিনের স্ট্রিক' : 'day streak'}
                        </span>
                        <span className="text-[10px] text-slate-500">{habit.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onGetHabitAdvice(habit.name, 'good')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs transition-colors"
                      title={lang === 'bn' ? 'এআই বৈজ্ঞানিক পরামর্শ নিন' : 'Get AI Advice'}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bad Habits Abstinence Column */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <XCircle className="w-4 h-4" />
              <span>{lang === 'bn' ? 'দোষ ও খারাপ অভ্যাস বর্জন (Vices to Overcome)' : 'Breaking Vices'}</span>
            </h3>
            <span className="text-xs text-slate-500">
              {badHabits.length} {lang === 'bn' ? 'টি দোষ' : 'vices'}
            </span>
          </div>

          <div className="space-y-3">
            {badHabits.map((habit) => (
              <div
                key={habit.id}
                className={`p-4 rounded-2xl border transition-all ${
                  habit.completedToday
                    ? 'bg-rose-950/30 border-rose-500/60 shadow-md'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    onClick={() => toggleHabit(habit.id)}
                    className="flex items-start gap-3 flex-1 cursor-pointer"
                  >
                    <div
                      className={`mt-0.5 w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-all ${
                        habit.completedToday
                          ? 'bg-rose-500 text-slate-950 scale-105'
                          : 'border border-slate-700 text-transparent hover:border-rose-400'
                      }`}
                    >
                      ✓
                    </div>
                    <div>
                      <h4
                        className={`text-sm font-semibold transition-colors ${
                          habit.completedToday ? 'text-rose-300' : 'text-slate-100'
                        }`}
                      >
                        {habit.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/50">
                          <Flame className="w-3 h-3 text-amber-500" />
                          {habit.streak} {lang === 'bn' ? 'দিন মুক্ত' : 'days free'}
                        </span>
                        <span className="text-[10px] text-slate-500">{habit.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => onGetHabitAdvice(habit.name, 'bad')}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-teal-400 text-xs transition-colors"
                      title={lang === 'bn' ? 'এআই বর্জনের উপায় জানুন' : 'Get AI Advice'}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteHabit(habit.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-950/50 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
