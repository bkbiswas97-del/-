import React from 'react';
import {
  Compass,
  Link2,
  ClipboardCheck,
  CheckCircle2,
  Scale,
  Moon,
  Sparkles,
  History,
  Languages,
  Rocket,
  SunMedium,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  savedCount: number;
  onOpenPublishGuide?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  savedCount,
  onOpenPublishGuide,
}) => {
  const navItems = [
    {
      id: 'social',
      labelBn: 'সোসাল লিংক প্রোফাইলার',
      labelEn: 'Social Profiler',
      icon: Link2,
    },
    {
      id: 'affirmations',
      labelBn: 'দৈনিক ইতিবাচক বাণী',
      labelEn: 'Daily Affirmations',
      icon: SunMedium,
    },
    {
      id: 'analyzer',
      labelBn: 'গভীর চরিত্র বিশ্লেষণ',
      labelEn: 'Deep Profiler',
      icon: Compass,
    },
    {
      id: 'quiz',
      labelBn: 'দ্রুত চরিত্র কুইজ',
      labelEn: 'Quick Quiz',
      icon: ClipboardCheck,
    },
    {
      id: 'habits',
      labelBn: 'অভ্যাস সংস্কারক',
      labelEn: 'Habit Reformer',
      icon: CheckCircle2,
    },
    {
      id: 'dilemma',
      labelBn: 'নৈতিক পরীক্ষা',
      labelEn: 'Moral Dilemmas',
      icon: Scale,
    },
    {
      id: 'zodiac',
      labelBn: 'রাশির দোষ-গুণ',
      labelEn: 'Zodiac Archetypes',
      icon: Moon,
    },
    {
      id: 'advisor',
      labelBn: 'এআই অভ্যাস কোচ',
      labelEn: 'Habit Coach',
      icon: Sparkles,
    },
    {
      id: 'history',
      labelBn: `রেকর্ড (${savedCount})`,
      labelEn: `Records (${savedCount})`,
      icon: History,
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/80 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top brand & language row */}
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo & Brand Identity */}
          <div
            onClick={() => setActiveTab('social')}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-indigo-600 p-0.5 shadow-sm transition-transform duration-300 group-hover:scale-105">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Compass className="w-5 h-5 text-emerald-400 transition-transform duration-500 group-hover:rotate-45" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  {lang === 'bn' ? 'চরিত্র দর্পন' : 'Charitra Darpan'}
                </h1>
                <span className="hidden md:inline text-xs text-slate-500">·</span>
                <span className="hidden md:inline text-xs text-slate-400 font-medium">
                  {lang === 'bn' ? 'সোশ্যাল মিডিয়া ও সাইকোলজিক্যাল অ্যানালাইসিস' : 'Cyber-Psychological Intelligence'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                {lang === 'bn'
                  ? 'মানুষের অন্তর্নিহিত স্বভাব, দোষ-গুণ, আসক্তি ও মনস্তাত্ত্বিক রূপরেখা'
                  : 'Unveil virtues, flaws, addictions & cognitive architecture'}
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            {onOpenPublishGuide && (
              <button
                onClick={onOpenPublishGuide}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 hover:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm group"
                title={lang === 'bn' ? 'পাবলিশ ও শেয়ার গাইড' : 'Publish & Share Guide'}
              >
                <Rocket className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-translate-y-0.5" />
                <span className="hidden sm:inline">
                  {lang === 'bn' ? 'পাবলিশ গাইড' : 'Publish Guide'}
                </span>
                <span className="sm:hidden">
                  {lang === 'bn' ? 'গাইড' : 'Guide'}
                </span>
              </button>
            )}

            <button
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all shadow-sm"
              title="Change Language"
            >
              <Languages className="w-3.5 h-3.5 text-emerald-400" />
              <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Segmented Control */}
        <div className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-emerald-400' : 'text-slate-500'
                  }`}
                />
                <span>{lang === 'bn' ? item.labelBn : item.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
