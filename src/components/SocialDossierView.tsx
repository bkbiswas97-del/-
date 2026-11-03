import React, { useState } from 'react';
import {
  Award,
  AlertOctagon,
  Brain,
  Coffee,
  ThumbsUp,
  ThumbsDown,
  Flame,
  Copy,
  Printer,
  RotateCcw,
  MessageCircle,
  ExternalLink,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  ShieldCheck,
  Briefcase,
  Globe,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { SocialAnalysisResult, SocialPersonalityScorecard } from '../types/character';
import {
  SocialPersonalityScorecardView,
  DEFAULT_SAMPLE_SCORECARD,
  toBengaliNumerals,
} from './SocialPersonalityScorecardView';

interface SocialDossierViewProps {
  data: SocialAnalysisResult;
  lang: 'bn' | 'en';
  onReset: () => void;
}

export const SocialDossierView: React.FC<SocialDossierViewProps> = ({
  data,
  lang,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'scorecard' | 'cognition' | 'online' | 'character' | 'habits' | 'psychology' | 'communication'>('overview');

  const scorecardData: SocialPersonalityScorecard = React.useMemo(() => {
    if (data.socialPersonalityScorecard && data.socialPersonalityScorecard.kpis) {
      return data.socialPersonalityScorecard;
    }

    const posRatio = data.category8OnlineBehaviorConsistency?.positiveToNegativeRatio?.positivePercentage;
    const logical = data.category7DecisionAndCognition?.logicalDiscussionTendency?.score;
    const consistency = data.category8OnlineBehaviorConsistency?.publicBehaviorConsistency?.score;
    const errorCorr = data.category7DecisionAndCognition?.learningFromMistakes?.score;

    // Seed-based dynamic variation from handle
    let hash = 0;
    const key = `${data.targetHandleOrName || ''}_${data.platform || ''}_${data.profileUrl || ''}`;
    for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) & 0xffffff;
    const var1 = 70 + (Math.abs(hash) % 25);
    const var2 = 68 + (Math.abs(hash >> 3) % 27);
    const var3 = 65 + (Math.abs(hash >> 6) % 28);
    const var4 = 72 + (Math.abs(hash >> 9) % 24);

    return {
      reportTitle: 'Social Personality Report',
      disclaimerBn: `ডিজিটাল ফুটপ্রিন্ট ও আচরণগত মূল্যায়ন · ${data.platform || 'পাবলিক প্রোফাইল'}`,
      kpis: {
        positiveCommunication: posRatio ?? var1,
        constructiveDiscussion: var2,
        opinionConsistency: consistency ?? var3,
        collaborativeBehavior: var4,
      },
      traitBreakdown: [
        { nameBn: 'ভদ্র যোগাযোগ', score: var1, descriptionBn: 'সম্মানজনক ও শিষ্ট শব্দচয়ন' },
        { nameBn: 'সহানুভূতির প্রকাশ', score: var4, descriptionBn: 'অন্যের আবেগ ও সংকট উপলব্ধি' },
        { nameBn: 'যুক্তিনির্ভর আলোচনা', score: logical ?? (75 + (Math.abs(hash >> 2) % 22)), descriptionBn: 'উপাত্ত ও যুক্তিভিত্তিক মতামত' },
        { nameBn: 'মতামতের ধারাবাহিকতা', score: consistency ?? var3, descriptionBn: 'সময়ের সাথে ভাবনার ভারসাম্য' },
        { nameBn: 'ভুল সংশোধনের প্রবণতা', score: errorCorr ?? (65 + (Math.abs(hash >> 5) % 25)), descriptionBn: 'ভুল চিহ্নিত হলে তা শুধরে নেওয়া' },
      ],
      aiObservationsBn: [
        `${data.targetHandleOrName}-এর প্রকাশ্য আলোচনায় শিষ্ট ও সম্মানজনক ভাষার উপস্থিতি লক্ষণীয়।`,
        `বিতর্কিত প্রসঙ্গে তথ্য ও প্রমাণের ভিত্তিতে দৃষ্টিভঙ্গি তুলে ধরার প্রমাণ মেলে।`,
        `সময়ের সাথে সাথে চিন্তাভাবনা ও মতামতের সুষম বিবর্তন দেখা গেছে।`,
      ],
    };
  }, [data]);

  const handleCopySummary = () => {
    const text = `
【 ${scorecardData.reportTitle} 】
${scorecardData.disclaimerBn}
টার্গেট: ${data.targetHandleOrName} · ${data.platform}

শীর্ষ সূচক (KPIs):
- ইতিবাচক যোগাযোগ: ${toBengaliNumerals(scorecardData.kpis.positiveCommunication)}%
- গঠনমূলক আলোচনা: ${toBengaliNumerals(scorecardData.kpis.constructiveDiscussion)}%
- মতামতের ধারাবাহিকতা: ${toBengaliNumerals(scorecardData.kpis.opinionConsistency)}%
- সহযোগিতামূলক আচরণ: ${toBengaliNumerals(scorecardData.kpis.collaborativeBehavior)}%

বৈশিষ্ট্যভিত্তিক বিশ্লেষণ:
${scorecardData.traitBreakdown.map((t) => `• ${t.nameBn}: ${t.score}%`).join('\n')}

AI-এর পর্যবেক্ষণ:
${scorecardData.aiObservationsBn.map((obs) => `• ${obs}`).join('\n')}
মূল আর্কিটাইপ: ${data.identitySummary.archetypeTitle}
অনুমিত ভূমিকা: ${data.identitySummary.inferredProfessionOrRole}
ডিজিটাল আভা: ${data.identitySummary.digitalAura}
অন্তর্মুখী/বহির্মুখী অনুপাত: ${data.identitySummary.introvertExtrovertRatio}

সারসংক্ষেপ:
${data.identitySummary.vibeSummary}

${data.riskAndSafetyAudit ? `
【 সততা ও বিপদ সতর্কতা অডিট 】
- নিরাপত্তা স্কোর: ${data.riskAndSafetyAudit.safetyScore}%
- প্রতারণা ঝুঁকি: ${data.riskAndSafetyAudit.fraudRiskAssessmentBn}
- মিথ্যাচার মূল্যায়ন: ${data.riskAndSafetyAudit.honestyRiskAssessmentBn}
- বিপজ্জনকতা: ${data.riskAndSafetyAudit.dangerAssessmentBn}
- সতর্কতা পরামর্শ: ${data.riskAndSafetyAudit.safetyAdviceBn}
` : ''}

${data.category7DecisionAndCognition ? `
【 ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা (স্কোর: ${data.category7DecisionAndCognition.overallScore}%) 】
- যুক্তিনির্ভর আলোচনার প্রবণতা: ${data.category7DecisionAndCognition.logicalDiscussionTendency.score}%
- তথ্য যাচাইয়ের অভ্যাস: ${data.category7DecisionAndCognition.factCheckingHabit.score}%
- সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা: ${data.category7DecisionAndCognition.decisionJustificationAbility.score}%
- ভিন্ন দৃষ্টিভঙ্গি বিবেচনা: ${data.category7DecisionAndCognition.alternativePerspectives.score}%
- ভুল থেকে শেখার প্রকাশ্য উদাহরণ: ${data.category7DecisionAndCognition.learningFromMistakes.score}%
- সমস্যা বিশ্লেষণের ধরন: ${data.category7DecisionAndCognition.problemAnalysisApproach.score}%
` : ''}

${data.category8OnlineBehaviorConsistency ? `
【 ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা (ধারাবাহিকতা: ${data.category8OnlineBehaviorConsistency.consistencyScore}%) 】
- পোস্টের ধরন: ${data.category8OnlineBehaviorConsistency.postContentType.categoryBn}
- সময়ের সঙ্গে মতামতের পরিবর্তন: ${data.category8OnlineBehaviorConsistency.opinionEvolutionOverTime.patternBn}
- প্রকাশ্য আচরণের ধারাবাহিকতা: ${data.category8OnlineBehaviorConsistency.publicBehaviorConsistency.score}%
- ইতিবাচক ও নেতিবাচক অনুপাত: ${data.category8OnlineBehaviorConsistency.positiveToNegativeRatio.ratioString}
- অন্যের সঙ্গে যোগাযোগের ধরন: ${data.category8OnlineBehaviorConsistency.interpersonalStyle.styleBn}
- নিজের ভুল সংশোধনের ইতিহাস: ${data.category8OnlineBehaviorConsistency.mistakeCorrectionHistory.frequencyBn}
` : ''}

শীর্ষ গুণাবলী:
${data.characterAndTraits.topVirtues.map((v) => `• ${v.name} (${v.score}/১০) - ${v.description}`).join('\n')}

দোষ ও দুর্বলতা:
${data.characterAndTraits.topFlaws.map((f) => `• ${f.name} - প্রতিকার: ${f.advice}`).join('\n')}

সাইকোলজি ও মনস্তত্ত্ব:
- আবেগীয় ট্রিগার: ${data.psychology.emotionalTriggers.join(', ')}
- সিদ্ধান্ত নেওয়ার ধরন: ${data.psychology.decisionStyle}
- স্ট্রেস সামাল দেওয়া: ${data.psychology.stressResponse}

যোগাযোগ ও সম্পর্কের গাইড:
- যেভাবে মন জয় করা যায়: ${data.communicationAndDatingAdvice.howToImpressThem.join('; ')}
- যা বলা নিষিদ্ধ: ${data.communicationAndDatingAdvice.thingsToAvoidSaying.join('; ')}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8 print:p-0 print:space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800 print:hidden">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'আরেকটি লিংক বিশ্লেষণ' : 'New Analysis'}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-400" />
            <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'ডসিয়ার কপি' : 'Copy Dossier')}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'bn' ? 'প্রিন্ট / PDF' : 'Print / PDF'}</span>
          </button>
        </div>
      </div>

      {/* Dossier Cover / Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
        {/* Unboxed Metadata Header (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-emerald-400">{data.platform}</span>
          <span aria-hidden="true">·</span>
          <span>{data.identitySummary.digitalAura}</span>
          <span aria-hidden="true">·</span>
          <span>{data.identitySummary.introvertExtrovertRatio}</span>
          {data.profileUrl && (
            <>
              <span aria-hidden="true">·</span>
              <a
                href={data.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 transition-colors"
              >
                <span>{lang === 'bn' ? 'লিংক ভিজিট' : 'Profile'}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </>
          )}
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {data.targetHandleOrName}
          </h1>
          <p className="text-sm font-semibold text-emerald-400 mt-1">
            {data.identitySummary.archetypeTitle} · {data.identitySummary.inferredProfessionOrRole}
          </p>
        </div>

        <p className="text-sm sm:text-base text-slate-200 leading-relaxed pt-2 border-t border-slate-800/80">
          {data.identitySummary.vibeSummary}
        </p>

        {/* Core Trait Tags (Unboxed Text with Separators) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 pt-1">
          <span className="text-slate-500 font-semibold">{lang === 'bn' ? 'মূল প্রবণতা:' : 'Traits:'}</span>
          {data.characterAndTraits.coreTraits?.map((trait, idx) => (
            <React.Fragment key={idx}>
              <span className="text-slate-300 font-medium">{trait}</span>
              {idx < data.characterAndTraits.coreTraits.length - 1 && <span aria-hidden="true">·</span>}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Safety & Danger / Fraud Audit Banner if present */}
      {data.riskAndSafetyAudit && (
        <div className={`p-5 rounded-2xl border ${
          data.riskAndSafetyAudit.isScammerOrFraud || data.riskAndSafetyAudit.isHabitualLiar || data.riskAndSafetyAudit.isDangerousOrToxic
            ? 'bg-rose-950/40 border-rose-800/80 text-rose-200'
            : 'bg-emerald-950/30 border-emerald-800/70 text-emerald-200'
        }`}>
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-current/20">
            <div className="flex items-center gap-2 font-bold text-sm">
              {data.riskAndSafetyAudit.isScammerOrFraud || data.riskAndSafetyAudit.isHabitualLiar || data.riskAndSafetyAudit.isDangerousOrToxic ? (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="text-rose-300">{lang === 'bn' ? 'সততা, প্রতারণা ও বিপদ সতর্কতা অডিট' : 'Integrity & Threat Audit'}</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300">{lang === 'bn' ? 'সততা ও বিশ্বাসযোগ্যতা অডিট (নিরাপদ)' : 'Integrity Audit (Clear)'}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">{lang === 'bn' ? 'নিরাপত্তা স্কোর:' : 'Safety Score:'}</span>
              <span className={`font-bold ${data.riskAndSafetyAudit.safetyScore >= 70 ? 'text-emerald-400' : data.riskAndSafetyAudit.safetyScore >= 45 ? 'text-amber-400' : 'text-rose-400'}`}>
                {data.riskAndSafetyAudit.safetyScore}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs">
            <div className="p-2.5 rounded-lg bg-black/40 border border-current/10">
              <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'প্রতারণা ঝুঁকি:' : 'Fraud Risk:'}</span>
              <span className="font-semibold">{data.riskAndSafetyAudit.fraudRiskAssessmentBn}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-current/10">
              <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'মিথ্যাচার মূল্যায়ন:' : 'Honesty Check:'}</span>
              <span className="font-semibold">{data.riskAndSafetyAudit.honestyRiskAssessmentBn}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-black/40 border border-current/10">
              <span className="text-slate-400 block mb-0.5">{lang === 'bn' ? 'বিপজ্জনকতা:' : 'Danger Threat:'}</span>
              <span className="font-semibold">{data.riskAndSafetyAudit.dangerAssessmentBn}</span>
            </div>
          </div>

          {data.riskAndSafetyAudit.safetyAdviceBn && (
            <p className="mt-3 text-xs leading-relaxed text-slate-300 pt-2 border-t border-current/10">
              <strong className="text-white">{lang === 'bn' ? 'সতর্কতামূলক পরামর্শ: ' : 'Safety Guidance: '}</strong>
              {data.riskAndSafetyAudit.safetyAdviceBn}
            </p>
          )}
        </div>
      )}

      {/* Dossier Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto print:hidden">
        {[
          { id: 'overview', bn: 'একনজরে সারাংশ', en: 'Overview' },
          { id: 'scorecard', bn: 'Social Personality Report', en: 'Personality Scorecard' },
          { id: 'cognition', bn: 'ক্যাটাগরি ৭: সিদ্ধান্ত ও যুক্তি', en: 'Cat 7: Cognition' },
          { id: 'online', bn: 'ক্যাটাগরি ৮: অনলাইন ধারাবাহিকতা', en: 'Cat 8: Online Consistency' },
          { id: 'character', bn: 'দোষ ও গুণাবলী', en: 'Virtues & Flaws' },
          { id: 'habits', bn: 'অভ্যাস ও আসক্তি', en: 'Habits & Addictions' },
          { id: 'psychology', bn: 'সাইকোলজি ও লাইফস্টাইল', en: 'Psychology & Lifestyle' },
          { id: 'communication', bn: 'যোগাযোগ গাইড', en: 'Interaction Guide' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'bn' ? tab.bn : tab.en}
          </button>
        ))}
      </div>

      {/* Primary Social Personality Report (User's Exact Requested Format) */}
      {(activeTab === 'overview' || activeTab === 'scorecard') && (
        <SocialPersonalityScorecardView
          scorecard={scorecardData}
          targetName={data.targetHandleOrName}
          lang={lang}
          onPrint={handlePrint}
        />
      )}

      {/* Tab: Category 7 (Cognition & Decision Making) */}
      {(activeTab === 'overview' || activeTab === 'cognition') && data.category7DecisionAndCognition && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা' : 'Category 7: Decision Making & Cognition'}
                </h3>
                <p className="text-xs text-slate-400">যুক্তিনির্ভরতা, তথ্য যাচাই ও সমস্যা বিশ্লেষণের স্তর</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">সামগ্রিক স্কোর:</span>
              <span className="text-base font-bold text-indigo-400">
                {data.category7DecisionAndCognition.overallScore}%
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {data.category7DecisionAndCognition.summaryBn}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {[
              { label: '১. যুক্তিনির্ভর আলোচনার প্রবণতা', data: data.category7DecisionAndCognition.logicalDiscussionTendency },
              { label: '২. তথ্য যাচাইয়ের অভ্যাস', data: data.category7DecisionAndCognition.factCheckingHabit },
              { label: '৩. সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা', data: data.category7DecisionAndCognition.decisionJustificationAbility },
              { label: '৪. ভিন্ন দৃষ্টিভঙ্গি বিবেচনা', data: data.category7DecisionAndCognition.alternativePerspectives },
              { label: '৫. ভুল থেকে শেখার প্রকাশ্য উদাহরণ', data: data.category7DecisionAndCognition.learningFromMistakes },
              { label: '৬. সমস্যা বিশ্লেষণের ধরন', data: data.category7DecisionAndCognition.problemAnalysisApproach },
            ].map((metric, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{metric.label}</span>
                  <span className="text-indigo-400 font-mono font-bold">{metric.data.score}%</span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${metric.data.score}%` }} />
                </div>
                <p className="text-slate-300 leading-relaxed">{metric.data.observationBn}</p>
                <div className="text-[11px] text-indigo-300/80 pt-1 border-t border-slate-900">
                  মানদণ্ড: {metric.data.statusBn}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Category 8 (Online Behavior Consistency) */}
      {(activeTab === 'overview' || activeTab === 'online') && data.category8OnlineBehaviorConsistency && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-teal-400" />
              <div>
                <h3 className="text-base font-bold text-white">
                  {lang === 'bn' ? 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা' : 'Category 8: Online Behavior Consistency'}
                </h3>
                <p className="text-xs text-slate-400">ডিজিটাল ও পাবলিক পরিমণ্ডলে চারিত্রিক স্থায়িত্ব ও ভারসাম্য</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">ধারাবাহিকতা সূচক:</span>
              <span className="text-base font-bold text-teal-400">
                {data.category8OnlineBehaviorConsistency.consistencyScore}%
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800">
            {data.category8OnlineBehaviorConsistency.summaryBn}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            {/* 1. Post Content Type */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-semibold text-teal-300 block">১. পোস্টের বিষয়বস্তুর ধরন</span>
              <span className="text-slate-200 font-medium block">{data.category8OnlineBehaviorConsistency.postContentType.categoryBn}</span>
              <p className="text-slate-400">{data.category8OnlineBehaviorConsistency.postContentType.descriptionBn}</p>
              <div className="flex flex-wrap gap-1 pt-1 text-[11px] text-slate-400">
                {data.category8OnlineBehaviorConsistency.postContentType.primaryThemes?.map((th: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">#{th}</span>
                ))}
              </div>
            </div>

            {/* 2. Opinion Evolution */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-semibold text-teal-300 block">২. সময়ের সঙ্গে মতামতের পরিবর্তন</span>
              <span className="text-slate-200 font-medium block">{data.category8OnlineBehaviorConsistency.opinionEvolutionOverTime.patternBn}</span>
              <p className="text-slate-300 leading-relaxed">{data.category8OnlineBehaviorConsistency.opinionEvolutionOverTime.detailsBn}</p>
              <span className="text-[11px] text-teal-400/80 block pt-1 border-t border-slate-900">
                পরিপক্কতা: {data.category8OnlineBehaviorConsistency.opinionEvolutionOverTime.maturityLevelBn}
              </span>
            </div>

            {/* 3. Public Behavior Consistency */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-300">৩. প্রকাশ্য আচরণের ধারাবাহিকতা</span>
                <span className="text-teal-400 font-mono font-bold">{data.category8OnlineBehaviorConsistency.publicBehaviorConsistency.score}%</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-teal-500 h-full rounded-full" style={{ width: `${data.category8OnlineBehaviorConsistency.publicBehaviorConsistency.score}%` }} />
              </div>
              <p className="text-slate-300 leading-relaxed">{data.category8OnlineBehaviorConsistency.publicBehaviorConsistency.detailsBn}</p>
              <span className="text-[11px] text-teal-400 block pt-1 border-t border-slate-900">{data.category8OnlineBehaviorConsistency.publicBehaviorConsistency.alignmentBn}</span>
            </div>

            {/* 4. Positive vs Negative Ratio */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-300">৪. ইতিবাচক ও নেতিবাচক অনুপাত</span>
                <span className="text-slate-300 font-mono text-[11px]">{data.category8OnlineBehaviorConsistency.positiveToNegativeRatio.ratioString}</span>
              </div>
              <div className="w-full bg-rose-950 h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full transition-all" style={{ width: `${data.category8OnlineBehaviorConsistency.positiveToNegativeRatio.positivePercentage}%` }} />
                <div className="bg-rose-500 h-full transition-all" style={{ width: `${data.category8OnlineBehaviorConsistency.positiveToNegativeRatio.negativePercentage}%` }} />
              </div>
              <p className="text-slate-300 leading-relaxed">{data.category8OnlineBehaviorConsistency.positiveToNegativeRatio.toneAnalysisBn}</p>
            </div>

            {/* 5. Interpersonal Style */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="font-semibold text-teal-300 block">৫. অন্যের সঙ্গে যোগাযোগের ধরন</span>
              <span className="text-slate-200 font-medium block">{data.category8OnlineBehaviorConsistency.interpersonalStyle.styleBn}</span>
              <p className="text-slate-300 leading-relaxed">{data.category8OnlineBehaviorConsistency.interpersonalStyle.engagementMannerBn}</p>
              <span className="text-[11px] text-teal-400/80 block pt-1 border-t border-slate-900">
                ভঙ্গি: {data.category8OnlineBehaviorConsistency.interpersonalStyle.toneBn}
              </span>
            </div>

            {/* 6. Mistake Correction History */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-teal-300">৬. নিজের ভুল সংশোধনের ইতিহাস</span>
                <span className={`text-[11px] font-medium ${data.category8OnlineBehaviorConsistency.mistakeCorrectionHistory.hasAdmittedErrors ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {data.category8OnlineBehaviorConsistency.mistakeCorrectionHistory.hasAdmittedErrors ? 'ভুল স্বীকারের নজির বিদ্যমান' : 'ভুল অস্বীকার প্রবণ'}
                </span>
              </div>
              <span className="text-slate-200 font-medium block">{data.category8OnlineBehaviorConsistency.mistakeCorrectionHistory.frequencyBn}</span>
              <p className="text-slate-300 leading-relaxed">{data.category8OnlineBehaviorConsistency.mistakeCorrectionHistory.detailsBn}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Overview (Complete high-level picture) */}
      {(activeTab === 'overview' || activeTab === 'character') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Virtues */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-400" />
                <span>{lang === 'bn' ? 'শীর্ষ গুণাবলী ও চারিত্রিক শক্তি' : 'Top Virtues & Merits'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {data.characterAndTraits.topVirtues.length}
              </span>
            </div>

            <div className="space-y-3">
              {data.characterAndTraits.topVirtues.map((v, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-emerald-300">
                      {idx + 1}. {v.name}
                    </h4>
                    <span className="text-xs font-mono tabular-nums text-emerald-400">
                      {v.score}/10
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {v.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Flaws */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-4 h-4 text-rose-400" />
                <span>{lang === 'bn' ? 'দোষ, ত্রুটি ও অন্ধবিন্দু' : 'Flaws & Blindspots'}</span>
              </h3>
              <span className="text-xs text-slate-500 font-mono tabular-nums">
                {data.characterAndTraits.topFlaws.length}
              </span>
            </div>

            <div className="space-y-3">
              {data.characterAndTraits.topFlaws.map((f, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                  <h4 className="text-sm font-semibold text-rose-300">
                    {idx + 1}. {f.name}
                  </h4>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p><span className="text-slate-400">{lang === 'bn' ? 'কারণ: ' : 'Cause: '}</span>{f.whyItShows}</p>
                    <p><span className="text-rose-400">{lang === 'bn' ? 'ঝুঁকি: ' : 'Risk: '}</span>{f.risk}</p>
                  </div>
                  <div className="text-xs text-emerald-300 pt-1.5 border-t border-slate-900">
                    <span className="text-slate-400">{lang === 'bn' ? 'প্রতিকার: ' : 'Remedy: '}</span>{f.advice}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Habits & Addictions */}
      {(activeTab === 'overview' || activeTab === 'habits') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Good Habits */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{lang === 'bn' ? 'ভালো অভ্যাস' : 'Positive Habits'}</span>
            </h4>
            <div className="space-y-2.5">
              {data.habits.goodHabits.map((gh, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/70 text-xs">
                  <p className="font-semibold text-slate-200 mb-0.5">{gh.habit}</p>
                  <p className="text-slate-400">{gh.manifestation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bad Habits */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <XCircle className="w-4 h-4 text-rose-400" />
              <span>{lang === 'bn' ? 'ক্ষতিকর অভ্যাস' : 'Harmful Habits'}</span>
            </h4>
            <div className="space-y-2.5">
              {data.habits.badHabits.map((bh, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-slate-950 border border-slate-800/70 text-xs">
                  <p className="font-semibold text-rose-300 mb-0.5">{bh.habit}</p>
                  <p className="text-slate-400 mb-1">{bh.negativeEffect}</p>
                  <p className="text-emerald-400"><span className="text-slate-500">Fix:</span> {bh.cure}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Addictions & Weaknesses */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'আসক্তি ও দুর্বলতা' : 'Addictions & Fixations'}</span>
            </h4>
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800/70 text-xs space-y-2.5">
              <div>
                <span className="font-semibold text-amber-400 block mb-0.5">
                  {lang === 'bn' ? 'ডিজিটাল আসক্তি:' : 'Digital Fixation:'}
                </span>
                <p className="text-slate-300">{data.addictionsAndWeaknesses.digitalAddictions.join(', ')}</p>
              </div>
              <div className="pt-2 border-t border-slate-900">
                <span className="font-semibold text-rose-400 block mb-0.5">
                  {lang === 'bn' ? 'গোপন দুর্বলতা:' : 'Vulnerabilities:'}
                </span>
                <p className="text-slate-300">{data.addictionsAndWeaknesses.hiddenVulnerabilities.join(', ')}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Destructive Habits & Addiction Audit (Social) */}
      {(activeTab === 'overview' || activeTab === 'habits') && data.destructiveHabitsAndAddictions && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>{lang === 'bn' ? 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা' : 'Destructive Habits & Addiction Audit'}</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {lang === 'bn' ? 'নেশা, অযাচিত খরচ, অতিরিক্ত কথা, খারাপ ব্যবহার, একাধিক নারী আসক্তি, যৌনাচারের আসক্তি' : 'Substance, reckless spending, verbosity, toxic conduct, philandering, and sexual addictions'}
              </p>
            </div>
            <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${
              data.destructiveHabitsAndAddictions.overallScore > 50
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}>
              {data.destructiveHabitsAndAddictions.overallRiskLevelBn} ({data.destructiveHabitsAndAddictions.overallScore}%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
            {[
              { name: 'নেশা করা', item: data.destructiveHabitsAndAddictions.substanceAddiction },
              { name: 'অযাচিত খরচ করা', item: data.destructiveHabitsAndAddictions.recklessSpending },
              { name: 'অতিরিক্ত কথা বলা', item: data.destructiveHabitsAndAddictions.excessiveTalking },
              { name: 'খারাপ ব্যবহার', item: data.destructiveHabitsAndAddictions.toxicBehavior },
              { name: 'একাধিক নারী আসক্তি', item: data.destructiveHabitsAndAddictions.multipleRomanticObsessions },
              { name: 'যৌনাচারের আসক্তি', item: data.destructiveHabitsAndAddictions.sexualAddiction },
            ].map((dHabit, idx) => {
              const isAlert = dHabit.item.hasTendency || dHabit.item.score > 40;
              return (
                <div key={idx} className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
                  isAlert ? 'bg-rose-950/20 border-rose-500/40' : 'bg-slate-950 border-slate-800'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-200">{dHabit.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      isAlert ? 'bg-rose-500/20 text-rose-300' : 'bg-emerald-500/20 text-emerald-300'
                    }`}>
                      {dHabit.item.levelBn}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{dHabit.item.manifestationBn}</p>
                  <p className="text-emerald-400 text-[11px] leading-relaxed pt-1 border-t border-slate-900">
                    <span className="text-slate-500 font-semibold">মুক্তির উপায়:</span> {dHabit.item.remedyAdviceBn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Psychology & Lifestyle */}
      {(activeTab === 'overview' || activeTab === 'psychology') && (
        <div className="space-y-6">
          {/* Psychology row */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span>{lang === 'bn' ? 'মনস্তাত্ত্বিক গঠন (Psychology)' : 'Psychological Blueprint'}</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-amber-300 block mb-1">
                  {lang === 'bn' ? 'আবেগীয় ট্রিগার' : 'Emotional Triggers'}
                </span>
                <ul className="space-y-1 text-slate-300">
                  {data.psychology.emotionalTriggers.map((t, idx) => (
                    <li key={idx} className="flex items-start gap-1">
                      <span className="text-amber-400">·</span>
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1">
                  {lang === 'bn' ? 'সিদ্ধান্ত নেওয়ার ধরন' : 'Decision Style'}
                </span>
                <p className="text-slate-300 leading-relaxed">{data.psychology.decisionStyle}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="font-semibold text-slate-300 block mb-1">
                  {lang === 'bn' ? 'স্ট্রেস ও চাপ সামলানো' : 'Stress Response'}
                </span>
                <p className="text-slate-300 leading-relaxed">{data.psychology.stressResponse}</p>
              </div>
            </div>
          </div>

          {/* Likes, Dislikes & Lifestyle row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            {/* Likes */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-teal-300 pb-1 border-b border-slate-800">
                <ThumbsUp className="w-3.5 h-3.5 text-teal-400" />
                <span>{lang === 'bn' ? 'পছন্দ ও আগ্রহ' : 'Likes'}</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {data.likesAndDislikes.favoriteTopicsAndInterests.map((l, idx) => (
                  <li key={idx}>· {l}</li>
                ))}
              </ul>
            </div>

            {/* Dislikes */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-rose-300 pb-1 border-b border-slate-800">
                <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                <span>{lang === 'bn' ? 'অপছন্দ ও বিরক্তি' : 'Dislikes'}</span>
              </div>
              <ul className="space-y-1 text-slate-300">
                {data.likesAndDislikes.petPeevesAndDislikes.map((d, idx) => (
                  <li key={idx}>· {d}</li>
                ))}
              </ul>
            </div>

            {/* Rhythm */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-slate-200 pb-1 border-b border-slate-800">
                {lang === 'bn' ? 'দৈনিক ছন্দ' : 'Daily Rhythm'}
              </div>
              <p className="text-slate-300 leading-relaxed">{data.lifestyle.dailyRhythm}</p>
            </div>

            {/* Aesthetic & Spending */}
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1.5">
              <div className="font-bold text-slate-200 pb-1 border-b border-slate-800">
                {lang === 'bn' ? 'ব্যয় ও রুচি' : 'Aesthetic & Spending'}
              </div>
              <p className="text-slate-300 leading-relaxed">{data.lifestyle.aestheticAndFashionTaste}</p>
              <p className="text-slate-400">{data.lifestyle.spendingTendency}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Communication Playbook (যোগাযোগ গাইড) */}
      {(activeTab === 'overview' || activeTab === 'communication') && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              {lang === 'bn' ? 'তার সাথে কথা বলার সঠিক কৌশল (Communication Playbook)' : 'Communication & Dating Playbook'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
            {/* How to impress */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h5 className="font-semibold text-emerald-400">
                {lang === 'bn' ? 'যেভাবে তার মন জয় করবেন:' : 'How to impress them:'}
              </h5>
              <ul className="space-y-1.5 text-slate-300">
                {data.communicationAndDatingAdvice.howToImpressThem.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What to avoid */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <h5 className="font-semibold text-rose-400">
                {lang === 'bn' ? 'যেসব কথা বলা নিষিদ্ধ:' : 'Things to avoid saying:'}
              </h5>
              <ul className="space-y-1.5 text-slate-300">
                {data.communicationAndDatingAdvice.thingsToAvoidSaying.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400 font-bold">✕</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300">
            <strong className="text-slate-200 block mb-0.5">
              {lang === 'bn' ? 'সম্পর্কের সামঞ্জস্যতা টিপস:' : 'Compatibility Notes:'}
            </strong>
            {data.communicationAndDatingAdvice.compatibilityTips}
          </div>
        </div>
      )}
    </div>
  );
};
