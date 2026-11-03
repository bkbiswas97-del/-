import React from 'react';
import { History, Eye, Trash2, Calendar, Award, Sparkles, BookOpen } from 'lucide-react';
import { SavedProfile, CharacterAnalysisResult } from '../types/character';

interface HistoryViewProps {
  lang: 'bn' | 'en';
  savedProfiles: SavedProfile[];
  onSelectProfile: (result: CharacterAnalysisResult) => void;
  onDeleteProfile: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  lang,
  savedProfiles,
  onSelectProfile,
  onDeleteProfile,
  onClearAll,
}) => {
  if (savedProfiles.length === 0) {
    return (
      <div className="max-w-3xl mx-auto py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">
          {lang === 'bn' ? 'কোনো সংরক্ষিত রিপোর্ট নেই' : 'No Saved Analyses Yet'}
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6">
          {lang === 'bn'
            ? 'আপনি যখনই কোনো চরিত্র বা স্বভাব বিশ্লেষণ সম্পন্ন করবেন, তা স্বয়ংক্রিয়ভাবে এখানে সংরক্ষিত থাকবে।'
            : 'Whenever you generate a character assessment, it will be safely remembered here for future reference.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-400" />
            <span>{lang === 'bn' ? 'সংরক্ষিত চরিত্রলিপি ও বিশ্লেষণ রেকর্ড' : 'Saved Assessment History'}</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {lang === 'bn'
              ? 'আপনার নিজের ও প্রিয়জনদের অতীতের মূল্যায়ন ফলাফল'
              : 'Past personality assessments and comparative snapshots'}
          </p>
        </div>

        <button
          onClick={onClearAll}
          className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1.5 rounded-lg border border-rose-900/40 hover:bg-rose-950/40 transition-colors"
        >
          {lang === 'bn' ? 'সব মুছে ফেলুন' : 'Clear All'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savedProfiles.map((p) => (
          <div
            key={p.id}
            className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all shadow-md group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {p.date}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  {p.result.merits?.length || 0} {lang === 'bn' ? 'গুণ' : 'Virtues'} • {p.result.flaws?.length || 0} {lang === 'bn' ? 'দোষ' : 'Flaws'}
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors mb-1">
                {p.name}
              </h3>
              <p className="text-xs font-semibold text-teal-400 mb-2">
                {p.result.archetypeTitle}
              </p>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {p.result.archetypeSummary}
              </p>
            </div>

            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => onSelectProfile(p.result)}
                className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{lang === 'bn' ? 'রিপোর্ট দেখুন' : 'View Full Report'}</span>
              </button>

              <button
                onClick={() => onDeleteProfile(p.id)}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
