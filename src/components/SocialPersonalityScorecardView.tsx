import React, { useState } from 'react';
import {
  MessageSquare,
  Sparkles,
  TrendingUp,
  Users,
  Compass,
  CheckCircle2,
  Copy,
  Printer,
  Share2,
  Brain,
  ShieldCheck,
} from 'lucide-react';
import { SocialPersonalityScorecard } from '../types/character';

// Bengali numeral conversion helper
export const toBengaliNumerals = (num: number | string): string => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(num).replace(/[0-9]/g, (d) => bnDigits[parseInt(d, 10)]);
};

interface SocialPersonalityScorecardViewProps {
  scorecard?: SocialPersonalityScorecard;
  targetName?: string;
  lang?: 'bn' | 'en';
  onPrint?: () => void;
  className?: string;
}

export const DEFAULT_SAMPLE_SCORECARD: SocialPersonalityScorecard = {
  reportTitle: 'Social Personality Report',
  disclaimerBn: 'কাল্পনিক উদাহরণ · প্রকৃত ব্যক্তির মূল্যায়ন নয়',
  kpis: {
    positiveCommunication: 82,
    constructiveDiscussion: 75,
    opinionConsistency: 68,
    collaborativeBehavior: 79,
  },
  traitBreakdown: [
    { nameBn: 'ভদ্র যোগাযোগ', score: 82, descriptionBn: 'সম্মানজনক ও শিষ্ট শব্দচয়ন' },
    { nameBn: 'সহানুভূতির প্রকাশ', score: 76, descriptionBn: 'অন্যের আবেগ ও সংকট উপলব্ধি' },
    { nameBn: 'যুক্তিনির্ভর আলোচনা', score: 88, descriptionBn: 'উপাত্ত ও যুক্তিভিত্তিক মতামত' },
    { nameBn: 'মতামতের ধারাবাহিকতা', score: 68, descriptionBn: 'সময়ের সাথে ভাবনার ভারসাম্য' },
    { nameBn: 'ভুল সংশোধনের প্রবণতা', score: 71, descriptionBn: 'ভুল চিহ্নিত হলে তা শুধরে নেওয়া' },
  ],
  aiObservationsBn: [
    'প্রকাশ্য আলোচনায় ভদ্র ভাষার ব্যবহার দেখা গেছে।',
    'বিভিন্ন বিষয়ে যুক্তি দিয়ে মতামত প্রকাশের উদাহরণ রয়েছে।',
    'কিছু বিষয়ে সময়ের সঙ্গে মতামতের পরিবর্তন দেখা গেছে।',
  ],
};

export const SocialPersonalityScorecardView: React.FC<SocialPersonalityScorecardViewProps> = ({
  scorecard = DEFAULT_SAMPLE_SCORECARD,
  targetName,
  lang = 'bn',
  onPrint,
  className = '',
}) => {
  const [copied, setCopied] = useState(false);
  const data = scorecard || DEFAULT_SAMPLE_SCORECARD;

  const handleCopyText = () => {
    const text = `
【 ${data.reportTitle} 】
${data.disclaimerBn}
${targetName ? `টার্গেট প্রোফাইল: ${targetName}\n` : ''}
শীর্ষ সূচক (KPIs):
- ইতিবাচক যোগাযোগ: ${toBengaliNumerals(data.kpis.positiveCommunication)}%
- গঠনমূলক আলোচনা: ${toBengaliNumerals(data.kpis.constructiveDiscussion)}%
- মতামতের ধারাবাহিকতা: ${toBengaliNumerals(data.kpis.opinionConsistency)}%
- সহযোগিতামূলক আচরণ: ${toBengaliNumerals(data.kpis.collaborativeBehavior)}%

বৈশিষ্ট্যভিত্তিক বিশ্লেষণ:
${data.traitBreakdown.map((t) => `• ${t.nameBn}: ${t.score}%`).join('\n')}

AI-এর পর্যবেক্ষণ:
${data.aiObservationsBn.map((obs) => `• ${obs}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.reportTitle,
          text: `${data.reportTitle} - ${data.disclaimerBn}\nইতিবাচক যোগাযোগ: ${toBengaliNumerals(data.kpis.positiveCommunication)}%, গঠনমূলক আলোচনা: ${toBengaliNumerals(data.kpis.constructiveDiscussion)}%`,
          url: window.location.href,
        });
      } catch (e) {}
    } else {
      handleCopyText();
    }
  };

  return (
    <div
      className={`bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-7 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800/90 relative z-10">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {data.reportTitle}
            </h2>
          </div>
          <p className="text-xs sm:text-sm font-medium text-slate-400 flex items-center gap-2">
            <span className="text-emerald-400 font-semibold">{data.disclaimerBn}</span>
            {targetName && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">প্রোফাইল: {targetName}</span>
              </>
            )}
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex items-center gap-2 self-start sm:self-auto print:hidden">
          <button
            onClick={handleCopyText}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
            title="রিপোর্ট কপি করুন"
          >
            <Copy className="w-3.5 h-3.5 text-teal-400" />
            <span>{copied ? 'কপি হয়েছে' : 'কপি'}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
            title="শেয়ার করুন"
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>শেয়ার</span>
          </button>

          {onPrint && (
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
              title="প্রিন্ট / PDF"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>প্রিন্ট</span>
            </button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metrics (Exact Structure Requested: ৮২% ইতিবাচক যোগাযোগ, ৭৫% গঠনমূলক আলোচনা, ৬৮% মতামতের ধারাবাহিকতা, ৭৯% সহযোগিতামূলক আচরণ) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 relative z-10">
        {/* KPI 1 */}
        <div className="bg-slate-950/80 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-emerald-400/90 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>যোগাযোগ সুর</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {data.kpis.positiveCommunication}%
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-emerald-400 transition-colors">
              {toBengaliNumerals(data.kpis.positiveCommunication)}%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
              ইতিবাচক যোগাযোগ
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${data.kpis.positiveCommunication}%` }}
            />
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-950/80 border border-slate-800/80 hover:border-teal-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-teal-400/90 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              <span>বিতর্ক মানদণ্ড</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {data.kpis.constructiveDiscussion}%
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-teal-400 transition-colors">
              {toBengaliNumerals(data.kpis.constructiveDiscussion)}%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
              গঠনমূলক আলোচনা
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-teal-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${data.kpis.constructiveDiscussion}%` }}
            />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-950/80 border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-indigo-400/90 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>স্থায়িত্ব</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {data.kpis.opinionConsistency}%
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-indigo-400 transition-colors">
              {toBengaliNumerals(data.kpis.opinionConsistency)}%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
              মতামতের ধারাবাহিকতা
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${data.kpis.opinionConsistency}%` }}
            />
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 rounded-2xl p-4 sm:p-5 flex flex-col justify-between transition-all group">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-medium text-cyan-400/90 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" />
              <span>সহমর্মিতা</span>
            </span>
            <span className="text-[11px] font-mono text-slate-500">
              {data.kpis.collaborativeBehavior}%
            </span>
          </div>
          <div>
            <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight group-hover:text-cyan-400 transition-colors">
              {toBengaliNumerals(data.kpis.collaborativeBehavior)}%
            </div>
            <div className="text-xs sm:text-sm font-semibold text-slate-300 mt-1">
              সহযোগিতামূলক আচরণ
            </div>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-cyan-400 h-full rounded-full transition-all duration-700"
              style={{ width: `${data.kpis.collaborativeBehavior}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Breakdown & Observations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* Left: বৈশিষ্ট্যভিত্তিক বিশ্লেষণ (Trait-based Breakdown) */}
        <div className="lg:col-span-7 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Brain className="w-4 h-4 text-emerald-400" />
              <span>বৈশিষ্ট্যভিত্তিক বিশ্লেষণ</span>
            </h3>
            <span className="text-xs text-slate-500 font-mono">
              {data.traitBreakdown.length} টি মানদণ্ড
            </span>
          </div>

          <div className="space-y-4">
            {data.traitBreakdown.map((trait, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="font-semibold text-slate-200">
                    {trait.nameBn}
                  </span>
                  <div className="flex items-center gap-2">
                    {trait.descriptionBn && (
                      <span className="hidden sm:inline text-[11px] text-slate-500">
                        {trait.descriptionBn}
                      </span>
                    )}
                    <span className="font-bold font-mono text-emerald-400 tabular-nums">
                      {trait.score}%
                    </span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-teal-500 via-emerald-400 to-indigo-500"
                    style={{ width: `${trait.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: AI-এর পর্যবেক্ষণ (AI Observations) */}
        <div className="lg:col-span-5 bg-slate-950/80 border border-slate-800/80 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>AI-এর পর্যবেক্ষণ</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                মডেল অডিট
              </span>
            </div>

            <ul className="space-y-3 pt-3">
              {data.aiObservationsBn.map((obs, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 text-xs sm:text-sm text-slate-300 leading-relaxed"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{obs}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>স্বয়ংক্রিয় মনস্তাত্ত্বিক প্যাটার্ন বিশ্লেষণ</span>
            </span>
            <span className="font-mono text-[11px] text-slate-500">চরিত্র দর্পন AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};
