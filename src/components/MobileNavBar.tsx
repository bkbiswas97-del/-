import React, { useState } from 'react';
import {
  Link2,
  Compass,
  ClipboardCheck,
  CheckCircle2,
  Menu,
  Scale,
  Moon,
  Sparkles,
  History,
  Rocket,
  X,
  Languages,
  SunMedium,
} from 'lucide-react';

interface MobileNavBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  savedCount: number;
  onOpenPublishGuide: () => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  setActiveTab,
  lang,
  setLang,
  savedCount,
  onOpenPublishGuide,
}) => {
  const [showDrawer, setShowDrawer] = useState(false);

  const mainTabs = [
    {
      id: 'social',
      labelBn: 'সোসাল',
      labelEn: 'Social',
      icon: Link2,
    },
    {
      id: 'analyzer',
      labelBn: 'চরিত্র',
      labelEn: 'Character',
      icon: Compass,
    },
    {
      id: 'quiz',
      labelBn: 'কুইজ',
      labelEn: 'Quiz',
      icon: ClipboardCheck,
    },
    {
      id: 'habits',
      labelBn: 'অভ্যাস',
      labelEn: 'Habits',
      icon: CheckCircle2,
    },
  ];

  const drawerTabs = [
    {
      id: 'affirmations',
      labelBn: 'দৈনিক ইতিবাচক বাণী ও আত্মপ্রত্যয়',
      labelEn: 'Daily Affirmations',
      icon: SunMedium,
      descBn: 'চরিত্র গঠন, স্ট্রিক ট্র্যাকিং ও প্রাত্যহিক মননশীল বাণী',
      descEn: 'Positive character thoughts & daily growth streak',
    },
    {
      id: 'dilemma',
      labelBn: 'নৈতিক সংকট পরীক্ষা',
      labelEn: 'Moral Dilemmas',
      icon: Scale,
      descBn: 'বাস্তব জীবনের জটিল পরিস্থিতিতে নৈতিক সিদ্ধান্ত',
      descEn: 'Real-world moral decision simulator',
    },
    {
      id: 'zodiac',
      labelBn: 'রাশির স্বভাব ও দোষ-গুণ',
      labelEn: 'Zodiac Archetypes',
      icon: Moon,
      descBn: '১২টি রাশির অন্তর্নিহিত মনস্তত্ত্ব ও বৈশিষ্ট্য',
      descEn: '12 Astrological psychologies and habits',
    },
    {
      id: 'advisor',
      labelBn: 'এআই অভ্যাস সংস্কার কোচ',
      labelEn: 'AI Habit Coach',
      icon: Sparkles,
      descBn: 'খারাপ অভ্যাস ত্যাগ ও ভালো অভ্যাস গড়ার বিজ্ঞানসম্মত গাইড',
      descEn: 'Science-backed habit transformation',
    },
    {
      id: 'history',
      labelBn: `সংরক্ষিত রেকর্ড (${savedCount})`,
      labelEn: `Saved Records (${savedCount})`,
      icon: History,
      descBn: 'পূর্বে সংরক্ষিত চরিত্র বিশ্লেষণ ও প্রোফাইল',
      descEn: 'Past saved dossiers & assessments',
    },
  ];

  const handleSelectDrawerTab = (id: string) => {
    setActiveTab(id);
    setShowDrawer(false);
  };

  return (
    <>
      {/* Fixed Bottom Bar on Mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl px-2 py-1.5 print:hidden">
        <div className="flex items-center justify-around">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'text-emerald-400 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-emerald-500/15' : 'bg-transparent'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] mt-0.5 tracking-tight">
                  {lang === 'bn' ? tab.labelBn : tab.labelEn}
                </span>
              </button>
            );
          })}

          {/* More Drawer Button */}
          <button
            onClick={() => setShowDrawer(true)}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all ${
              ['affirmations', 'dilemma', 'zodiac', 'advisor', 'history'].includes(activeTab)
                ? 'text-emerald-400 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div
              className={`p-1 rounded-lg ${
                ['affirmations', 'dilemma', 'zodiac', 'advisor', 'history'].includes(activeTab)
                  ? 'bg-emerald-500/15'
                  : 'bg-transparent'
              }`}
            >
              <Menu className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">
              {lang === 'bn' ? 'আরও' : 'More'}
            </span>
          </button>
        </div>
      </nav>

      {/* Slide-over Drawer for Mobile */}
      {showDrawer && (
        <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            className="w-full bg-slate-900 border-t border-slate-700/80 rounded-t-3xl p-5 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header of Drawer */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {lang === 'bn' ? 'অতিরিক্ত ফিচার ও টুলস' : 'Additional Features & Tools'}
                </span>
              </div>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of features */}
            <div className="grid grid-cols-1 gap-2">
              {drawerTabs.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectDrawerTab(item.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      isActive
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                        : 'bg-slate-950/50 border-slate-800/80 text-slate-300 hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-slate-800 text-emerald-400 shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {lang === 'bn' ? item.labelBn : item.labelEn}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                        {lang === 'bn' ? item.descBn : item.descEn}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Deploy & Language actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <button
                onClick={() => {
                  setShowDrawer(false);
                  onOpenPublishGuide();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md"
              >
                <Rocket className="w-4 h-4" />
                <span>{lang === 'bn' ? 'পাবলিশ ও মোবাইল গাইড' : 'Publish & Mobile Guide'}</span>
              </button>

              <button
                onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700"
              >
                <Languages className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'Switch to English' : 'বাংলা ভাষায় দেখুন'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
