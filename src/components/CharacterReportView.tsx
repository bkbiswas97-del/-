import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Award,
  AlertOctagon,
  CheckCircle,
  XCircle,
  Calendar,
  Share2,
  Copy,
  Printer,
  RotateCcw,
  BookOpen,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Download,
  FileDown,
  FileText,
  Info,
  Check,
  ExternalLink,
  X,
  MessageCircle,
  Send,
  Globe,
  Briefcase,
  Brain,
  Scale,
  Eye,
  Activity,
  HeartPulse,
  AlertTriangle,
  FileCheck2,
  Flame,
  Coins,
  MessageSquareWarning,
  HeartCrack,
  Radar as RadarIcon,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { CharacterAnalysisResult, ReformDayPlan, SocialPersonalityScorecard, DestructiveHabitsAndAddictions } from '../types/character';
import {
  SocialPersonalityScorecardView,
  DEFAULT_SAMPLE_SCORECARD,
} from './SocialPersonalityScorecardView';

interface CharacterReportViewProps {
  result: CharacterAnalysisResult;
  lang: 'bn' | 'en';
  onReset: () => void;
  onSaveToHistory?: (result: CharacterAnalysisResult) => void;
}

export const CharacterReportView: React.FC<CharacterReportViewProps> = ({
  result,
  lang,
  onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [showPdfGuideToast, setShowPdfGuideToast] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareCopiedLink, setShareCopiedLink] = useState(false);
  const [shareSuccessToast, setShareSuccessToast] = useState(false);
  const [dayPlans, setDayPlans] = useState<ReformDayPlan[]>(
    result.sevenDayReformPlan || []
  );
  const [activeTabSection, setActiveTabSection] = useState<
    'all' | 'scorecard' | 'safety' | 'destructive' | 'professional' | 'cognition' | 'online' | 'identity' | 'virtues' | 'flaws' | 'habits' | 'plan'
  >('all');

  // Stable report reference ID
  const reportId = useMemo(() => {
    const seed = (result.personName?.length || 5) * 19 + result.archetypeTitle.length;
    return `MCD-2026-${(1000 + (seed % 9000)).toString(16).toUpperCase()}`;
  }, [result.personName, result.archetypeTitle]);

  const scorecardData: SocialPersonalityScorecard = useMemo(() => {
    if (result.socialPersonalityScorecard) return result.socialPersonalityScorecard;

    const cat8 = result.category8OnlineBehaviorConsistency;
    const cat7 = result.category7DecisionAndCognition;
    const pillars = result.pillarsScore;

    return {
      reportTitle: 'Social Personality Report',
      disclaimerBn: 'কাল্পনিক উদাহরণ · প্রকৃত ব্যক্তির মূল্যায়ন নয়',
      kpis: {
        positiveCommunication: cat8?.positiveToNegativeRatio?.positivePercentage || 82,
        constructiveDiscussion: cat7?.logicalDiscussionTendency?.score || 75,
        opinionConsistency: cat8?.publicBehaviorConsistency?.score || 68,
        collaborativeBehavior: pillars?.socialEmpathy || 79,
      },
      traitBreakdown: [
        { nameBn: 'ভদ্র যোগাযোগ', score: cat8?.interpersonalStyle ? 82 : 82, descriptionBn: 'সম্মানজনক ও শিষ্ট শব্দচয়ন' },
        { nameBn: 'সহানুভূতির প্রকাশ', score: pillars?.socialEmpathy || 76, descriptionBn: 'অন্যের আবেগ ও সংকট উপলব্ধি' },
        { nameBn: 'যুক্তিনির্ভর আলোচনা', score: cat7?.logicalDiscussionTendency?.score || 88, descriptionBn: 'উপাত্ত ও যুক্তিভিত্তিক মতামত' },
        { nameBn: 'মতামতের ধারাবাহিকতা', score: cat8?.publicBehaviorConsistency?.score || 68, descriptionBn: 'সময়ের সাথে ভাবনার ভারসাম্য' },
        { nameBn: 'ভুল সংশোধনের প্রবণতা', score: cat7?.learningFromMistakes?.score || 71, descriptionBn: 'ভুল চিহ্নিত হলে তা শুধরে নেওয়া' },
      ],
      aiObservationsBn: [
        'প্রকাশ্য আলোচনায় ভদ্র ভাষার ব্যবহার দেখা গেছে।',
        'বিভিন্ন বিষয়ে যুক্তি দিয়ে মতামত প্রকাশের উদাহরণ রয়েছে।',
        'কিছু বিষয়ে সময়ের সঙ্গে মতামতের পরিবর্তন দেখা গেছে।',
      ],
    };
  }, [result]);

  const assessmentDate = useMemo(() => {
    return new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [lang]);

  // Memoized Category 7, 8, Professional Communication, Demographics and Risk/Safety Audit
  const profComm = useMemo(() => {
    return (
      result.professionalCommunication || {
        styleTitleBn: 'কৌশলগত, ধীরস্থির ও উপাত্তনির্ভর যোগাযোগকারী',
        workplaceToneBn: 'কর্মক্ষেত্রে মার্জিত, স্পষ্ট ও সহযোগিতাপূর্ণ ভাষা ব্যবহার করেন। অনর্থক জটিলতা পরিহার করেন।',
        conflictResolutionBn: 'উত্তপ্ত পরিস্থিতিতে তাৎক্ষণিক বিরোধে না জড়িয়ে তথ্য ও যৌক্তিক সমঝোতার মাধ্যমে সমাধান খোঁজেন।',
        teamCollaborationBn: 'সহকর্মীদের কথা মনোযোগ দিয়ে শোনেন এবং সমন্বিত অর্জনে আন্তরিকভাবে সহযোগী।',
        leadershipOrFollowershipBn: 'দায়িত্বশীলতার সাথে নির্দেশনা দেন এবং সহকর্মীদের স্বকীয়তাকে সম্মান করেন।',
        recommendationBn: 'চাপের মুখে দ্রুত সিদ্ধান্ত না দিয়ে সংক্ষেপে লিখিত পয়েন্ট তৈরি করে আলোচনা করলে পেশাগত সুফল বৃদ্ধি পাবে।',
      }
    );
  }, [result.professionalCommunication]);

  const cat7 = useMemo(() => {
    const p = result.pillarsScore;
    return (
      result.category7DecisionAndCognition || {
        categoryTitleBn: 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা',
        overallScore: Math.round((p.honestyAndIntegrity + p.selfAwareness + p.gritAndDiscipline) / 3),
        summaryBn: 'যুক্তিনির্ভর, তথ্যসমৃদ্ধ এবং সামগ্রিক দৃষ্টিভঙ্গি থেকে সিদ্ধান্ত নেওয়ার ক্ষেত্রে ইতিবাচক পরিপক্বতা দৃশ্যমান।',
        logicalDiscussionTendency: {
          titleBn: 'যুক্তিনির্ভর আলোচনার প্রবণতা',
          score: Math.min(95, p.honestyAndIntegrity + 4),
          statusBn: 'প্রশংসনীয়',
          observationBn: 'আবেগ বা অন্ধ বিশ্বাসের চেয়ে কার্যকারণ ও বস্তুনিষ্ঠ তথ্যের ওপর ভিত্তি করে আলোচনা এগিয়ে নেন।',
        },
        factCheckingHabit: {
          titleBn: 'তথ্য যাচাইয়ের অভ্যাস',
          score: Math.min(95, p.selfAwareness + 2),
          statusBn: 'সক্রিয় ও অনুসন্ধিৎসু',
          observationBn: 'যেকোনো চাঞ্চল্যকর বা অস্পষ্ট তথ্য প্রচারের আগে মূল উৎস অনুসন্ধান ও সত্যতা যাচাইয়ের চেষ্টা করেন।',
        },
        decisionJustificationAbility: {
          titleBn: 'সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা',
          score: Math.min(95, p.gritAndDiscipline + 5),
          statusBn: 'দৃঢ় ও সুস্পষ্ট',
          observationBn: 'গৃহীত সিদ্ধান্তের পেছনে কার্যকর কার্যকারণ ও যুক্তি গুছিয়ে অন্যের সামনে তুলে ধরতে পারেন।',
        },
        alternativePerspectives: {
          titleBn: 'ভিন্ন দৃষ্টিভঙ্গি বিবেচনা',
          score: Math.min(95, p.socialEmpathy + 2),
          statusBn: 'উদার ও ভারসাম্যপূর্ণ',
          observationBn: 'বিপরীত পক্ষের চিন্তা বা ভিন্ন মতের যুক্তিকে সম্মান করেন এবং নিজের ত্রুটি থাকলে বিবেচনায় নেন।',
        },
        learningFromMistakes: {
          titleBn: 'ভুল থেকে শেখার প্রকাশ্য উদাহরণ',
          score: Math.min(95, p.selfAwareness + 6),
          statusBn: 'সততাযুক্ত',
          observationBn: 'ভুল প্রমাণিত হলে জেদ না ধরে অকপটে তা স্বীকার করে সংশোধনমূলক পদক্ষেপ গ্রহণ করেন।',
        },
        problemAnalysisApproach: {
          titleBn: 'সমস্যা বিশ্লেষণের ধরন',
          score: Math.min(95, Math.round((p.patienceAndCalmness + p.gritAndDiscipline) / 2) + 4),
          statusBn: 'পদ্ধতিগত ও যৌক্তিক',
          observationBn: 'জটিল সমস্যাকে ছোট ছোট অংশে ভাগ করে মূল কারণ (Root Cause) চিহ্নিত করার চেষ্টা করেন।',
        },
      }
    );
  }, [result.category7DecisionAndCognition, result.pillarsScore]);

  const cat8 = useMemo(() => {
    const p = result.pillarsScore;
    return (
      result.category8OnlineBehaviorConsistency || {
        categoryTitleBn: 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা',
        consistencyScore: Math.round((p.honestyAndIntegrity + p.patienceAndCalmness + p.emotionalRegulation) / 3),
        summaryBn: 'অনলাইন ও প্রকাশ্য পরিসরে দায়িত্বশীল, মার্জিত এবং বাস্তব জীবনের মূল্যবোধের সাথে সামঞ্জস্যপূর্ণ আচরণ।',
        postContentType: {
          categoryBn: 'তথ্যবহুল ও গঠনমূলক সামাজিক আলোচনা',
          descriptionBn: 'জ্ঞানচর্চা, অনুপ্রেরণামূলক ভাবনা ও ইতিবাচক জীবনযাত্রাকেন্দ্রিক কনটেন্ট।',
          primaryThemes: ['আত্মউন্নয়ন ও নৈতিকতা', 'পেশাগত অভিজ্ঞতা', 'সামাজিক সম্প্রীতি', 'রুচিশীল দৃষ্টিভঙ্গি'],
        },
        opinionEvolutionOverTime: {
          patternBn: 'সুস্থ ও ধারাবাহিক মানসিক রূপান্তর',
          detailsBn: 'সময়ের সাথে সাথে মতামতে আরো পরিপক্বতা ও সহনশীলতার ছাপ ফুটে উঠেছে; নীতিহীন রূপবদল নেই।',
          maturityLevelBn: 'উচ্চ পর্যায়',
        },
        publicBehaviorConsistency: {
          score: Math.min(95, p.honestyAndIntegrity),
          alignmentBn: 'কথার সাথে কাজের উচ্চ সামঞ্জস্য',
          detailsBn: 'অনলাইনে যে আদর্শ ও মূল্যবোধের কথা বলেন, ব্যক্তিগত আচরণেও তার ধারাবাহিক চর্চা দেখা যায়।',
        },
        positiveToNegativeRatio: {
          ratioString: '৭৫% ইতিবাচক : ২৫% গঠনমূলক বিশ্লেষণ',
          positivePercentage: 75,
          negativePercentage: 25,
          toneAnalysisBn: 'অনর্থক ক্ষোভ বা বিষাক্ত বিষোদ্গারের পরিবর্তে ইতিবাচক সমাধান ও গঠনমূলক পরামর্শমূলক সুর।',
        },
        interpersonalStyle: {
          styleBn: 'মার্জিত ও সংযত যোগাযোগ',
          toneBn: 'সৌজন্যমূলক ও ধৈর্যশীল',
          engagementMannerBn: 'অনলাইন বিতর্কে নোংরা ভাষায় আক্রমণ করেন না, শালীনতা বজায় রেখে মত প্রকাশ করেন।',
        },
        mistakeCorrectionHistory: {
          hasAdmittedErrors: true,
          frequencyBn: 'স্বেচ্ছায় ভুল স্বীকার ও স্পষ্টীকরণ',
          detailsBn: 'অসাবধানতাবশত কোনো ভুল তথ্য ছড়ালে তা দ্রুত সংশোধন ও দুঃখপ্রকাশের ইতিবাচক নজির রয়েছে।',
        },
      }
    );
  }, [result.category8OnlineBehaviorConsistency, result.pillarsScore]);

  const demographics = useMemo(() => {
    return (
      result.demographicsAndIdentity || {
        religionOrFaithBn: 'ধর্মীয় বা আধ্যাত্মিক মূল্যবোধের প্রতি শ্রদ্ধাশীল ও সার্বজনীন মানবিক দৃষ্টিভঙ্গি',
        politicalIdeologyBn: 'সামাজিক সুবিচার, নাগরিক দায়িত্বশীলতা ও মধ্যপন্থী মুক্তচিন্তা',
        ethnicIdentityBn: 'বাঙালি ঐতিহ্য ও সার্বজনীন মানবিক সাংস্কৃতিক পরিচয়',
        sexualOrientationBn: 'মর্যাদাপূর্ণ ও সম্পর্কের প্রতি বিশ্বস্ত স্বাভাবিক ব্যক্তিগত অভিমুখিতা',
        healthAndMentalConditionsBn: 'মানসিক ভারসাম্য স্বাভাবিক; অতিরিক্ত কাজের চাপে মাঝে মাঝে সাময়িক ক্লান্তি ও কাজের চাপ',
        confidentialityNoteBn: 'এই পরিচিতি তথ্য সম্পূর্ণভাবে মনস্তাত্ত্বিক চরিত্র অনুধাবন ও ইতিবাচক আত্মউন্নয়নের জন্য সংকলিত।',
      }
    );
  }, [result.demographicsAndIdentity]);

  const safetyAudit = useMemo(() => {
    return (
      result.riskAndSafetyAudit || {
        isScammerOrFraud: false,
        isHabitualLiar: false,
        isDangerousOrToxic: false,
        overallRiskLevel: 'safe' as const,
        safetyScore: 92,
        fraudRiskAssessmentBn: 'আর্থিক বা ব্যক্তিগত প্রতারণার কোনো লক্ষণ নেই। কথা ও কাজের ক্ষেত্রে বিশ্বস্ত ও দায়িত্ববান।',
        honestyRiskAssessmentBn: 'সত্যবাদিতার স্তর প্রশংসনীয়। বানোয়াট কথা বা ধাপ্পাবাজির কোনো প্রমাণ পাওয়া যায়নি।',
        dangerAssessmentBn: 'কোনো প্রকার সহিংস, ক্ষতিকর বা বিষাক্ত স্বভাব নেই। সমাজ ও সম্পর্কের জন্য নিরাপদ ব্যক্তিত্ব।',
        redFlagsBn: ['কোনো বিপজ্জনক বা প্রতারণামূলক রেড ফ্ল্যাগ পাওয়া যায়নি (নিরাপদ ব্যক্তি)।'],
        safetyAdviceBn: 'এই ব্যক্তির সাথে পেশাগত অংশীদারিত্ব, লেনদেন বা ব্যক্তিগত মেলামেশায় কোনো ঝুঁকি নেই। পারস্পরিক শ্রদ্ধা বজায় রাখা কাম্য।',
      }
    );
  }, [result.riskAndSafetyAudit]);

  const destructiveHabits: DestructiveHabitsAndAddictions = useMemo(() => {
    return (
      result.destructiveHabitsAndAddictions || {
        categoryTitleBn: 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা',
        overallRiskLevelBn: 'ঝুঁকিমুক্ত ও সংযত',
        overallScore: 12,
        summaryBn: 'কোনো মারাত্মক ধ্বংসাত্মক আসক্তি বা নৈতিক বিচ্যুতি পাওয়া যায়নি। চারিত্রিক সংযম ও স্বাভাবিক সুস্থ জীবনযাপন বজায় রয়েছে।',
        substanceAddiction: {
          hasTendency: false,
          levelBn: 'আসক্তিমুক্ত / স্বাভাবিক',
          statusKey: 'clean',
          score: 10,
          manifestationBn: 'মাদকদ্রব্য, অ্যালকোহল, ধূমপান বা জুয়া থেকে সম্পূর্ণ মুক্ত ও সচেতন।',
          impactBn: 'শারীরিক সুস্বাস্থ্য ও পারিবারিক আস্থার চমৎকার ভিত্তি।',
          remedyAdviceBn: 'নেশামুক্ত জীবনধারার ইতিবাচক ধারা বজায় রাখুন।',
        },
        recklessSpending: {
          hasTendency: false,
          levelBn: 'পরিকল্পিত ও সুশৃঙ্খল',
          statusKey: 'clean',
          score: 15,
          manifestationBn: 'আয় ও ব্যয়ের সুস্থ সমন্বয় ও হিসাব সচেতনতা।',
          impactBn: 'আর্থিক স্থিতিশীলতা ও নিরাপদ ভবিষ্যৎ।',
          remedyAdviceBn: 'মাসিক সঞ্চয় ও দীর্ঘমেয়াদী পরিকল্পনার চর্চা অব্যাহত রাখুন।',
        },
        excessiveTalking: {
          hasTendency: false,
          levelBn: 'সংযত ও পরিমিত বাচনভঙ্গি',
          statusKey: 'clean',
          score: 16,
          manifestationBn: 'পরিমিত শব্দচয়ন ও অন্যের কথা গভীর মনোযোগ দিয়ে শোনার চমৎকার শিষ্টাচার।',
          impactBn: 'কথার ওজন ও ব্যক্তিত্বের গ্রহণযোগ্যতা বজায় থাকে।',
          remedyAdviceBn: 'জ্ঞানগর্ভ আলোচনায় সংযম অব্যাহত রাখুন।',
        },
        toxicBehavior: {
          hasTendency: false,
          levelBn: 'মার্জিত, শিষ্ট ও সহমর্মী',
          statusKey: 'clean',
          score: 12,
          manifestationBn: 'অন্যের প্রতি সম্মান প্রদর্শন ও সংঘাতময় মুহূর্তেও আত্মসংযম।',
          impactBn: 'উষ্ণ মানবিক সম্পর্ক ও সবার অকৃত্রিম শ্রদ্ধা অর্জন।',
          remedyAdviceBn: 'ধৈর্য ও সহমর্মিতার চর্চা বজায় রাখুন।',
        },
        multipleRomanticObsessions: {
          hasTendency: false,
          levelBn: 'একনিষ্ঠ ও বিশ্বস্ত সম্পর্কবোধ',
          statusKey: 'clean',
          score: 10,
          manifestationBn: 'সম্পর্কে পরম বিশ্বস্ততা ও নিষ্ঠা; চপলতা বা বহুগামিতা অনুপস্থিত।',
          impactBn: 'দাম্পত্য সুখ ও সম্মানজনক সামাজিক অবস্থান।',
          remedyAdviceBn: 'নৈতিক বিশ্বস্ততার এই সুউচ্চ মান আজীবন লালন করুন।',
        },
        sexualAddiction: {
          hasTendency: false,
          levelBn: 'নৈতিক সংযম ও নির্মল দৃষ্টিভঙ্গি',
          statusKey: 'clean',
          score: 11,
          manifestationBn: 'কামভাবের ওপর মনস্তাত্ত্বিক নিয়ন্ত্রণ ও চিন্তার শুচিতা।',
          impactBn: 'চিত্তের গভীর মানসিক শান্তি ও উচ্চ মনোবল।',
          remedyAdviceBn: 'আত্মসংযম ও ইতিবাচক মননশীলতার চর্চা বজায় রাখুন।',
        },
      }
    );
  }, [result.destructiveHabitsAndAddictions]);

  const radarChartData = useMemo(() => {
    const p = result.pillarsScore;
    const c7 = result.category7DecisionAndCognition;
    const c8 = result.category8OnlineBehaviorConsistency;
    const logicScore = c7?.logicalDiscussionTendency?.score || c7?.overallScore || Math.round((p.honestyAndIntegrity + p.selfAwareness) / 2);
    const commScore = c8?.publicBehaviorConsistency?.score || Math.round((p.socialEmpathy + p.patienceAndCalmness) / 2);

    return [
      {
        trait: lang === 'bn' ? 'আবেগ নিয়ন্ত্রণ (EQ)' : 'Emotional Reg.',
        score: p.emotionalRegulation,
        fullMark: 100,
      },
      {
        trait: lang === 'bn' ? 'যুক্তিনির্ভর চিন্তা' : 'Logical Thinking',
        score: logicScore,
        fullMark: 100,
      },
      {
        trait: lang === 'bn' ? 'যোগাযোগের ধরন' : 'Communication',
        score: commScore,
        fullMark: 100,
      },
      {
        trait: lang === 'bn' ? 'সততা ও নীতিবোধ' : 'Honesty & Integrity',
        score: p.honestyAndIntegrity,
        fullMark: 100,
      },
      {
        trait: lang === 'bn' ? 'ধৈর্য ও সহনশীলতা' : 'Patience',
        score: p.patienceAndCalmness,
        fullMark: 100,
      },
      {
        trait: lang === 'bn' ? 'পরোপকার ও সহমর্মিতা' : 'Social Empathy',
        score: p.socialEmpathy,
        fullMark: 100,
      },
      {
        trait: lang === 'bn' ? 'সংকল্প ও নিয়মানুবর্তিতা' : 'Grit & Discipline',
        score: p.gritAndDiscipline,
        fullMark: 100,
      },
    ];
  }, [result.pillarsScore, result.category7DecisionAndCognition, result.category8OnlineBehaviorConsistency, lang]);

  // Construct Web Share and External Sharing Payload
  const getSharePayload = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const candidate = result.personName ? `${result.personName}-এর` : (lang === 'bn' ? 'আমার' : 'My');
    const title = `চরিত্র দর্পন - ${result.personName || 'ব্যক্তিত্ব বিশ্লেষণ'} (${result.archetypeTitle})`;
    const text = lang === 'bn'
      ? `চরিত্র দর্পন মূল্যায়ন অনুযায়ী ${candidate} ব্যক্তিত্বের উপাধি: "${result.archetypeTitle}"। সততা: ${result.pillarsScore.honestyAndIntegrity}%, ধৈর্য: ${result.pillarsScore.patienceAndCalmness}%, আত্মসচেতনতা: ${result.pillarsScore.selfAwareness}%। বিস্তারিত দেখুন:`
      : `Charitra Darpan Profile for ${result.personName || 'Candidate'}: "${result.archetypeTitle}". Honesty: ${result.pillarsScore.honestyAndIntegrity}%, Patience: ${result.pillarsScore.patienceAndCalmness}%, Self-Awareness: ${result.pillarsScore.selfAwareness}%. Details:`;
    return { title, text, url: currentUrl };
  };

  // Primary Web Share API Handler with fallback to modal
  const handleWebShare = async () => {
    const { title, text, url } = getSharePayload();

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        setShareSuccessToast(true);
        setTimeout(() => setShareSuccessToast(false), 3000);
        return;
      } catch (err: any) {
        if (err?.name === 'AbortError') {
          // User dismissed native share sheet, do not force modal
          return;
        }
        console.warn('Web Share failed or blocked, falling back to modal:', err);
      }
    }

    // Fallback: Open dedicated share modal
    setIsShareModalOpen(true);
  };

  const handleCopyShareLink = () => {
    const { url } = getSharePayload();
    navigator.clipboard.writeText(url);
    setShareCopiedLink(true);
    setTimeout(() => setShareCopiedLink(false), 2500);
  };

  const toggleDayTask = (dayNum: number) => {
    setDayPlans((prev) =>
      prev.map((p) => {
        if (p.day === dayNum) {
          const nextState = !p.completed;
          if (nextState) {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.8 },
            });
          }
          return { ...p, completed: nextState };
        }
        return p;
      })
    );
  };

  const handleCopySummary = () => {
    const textToCopy = `
【 চরিত্র দর্পন — ব্যক্তিত্ব ও চারিত্রিক বিশ্লেষণ রিপোর্ট 】
রিপোর্ট কোড: ${reportId}
তারিখ: ${assessmentDate}
নাম: ${result.personName || 'ব্যক্তিগত স্ব-মূল্যায়ন'}
মূল ব্যক্তিত্বের উপাধি: ${result.archetypeTitle}
সারাংশ: ${result.archetypeSummary}

【 সততা ও ঝুঁকি অডিট (Safety & Risk Audit) 】
- অবস্থা: ${safetyAudit.isDangerousOrToxic ? '🚨 বিপজ্জনক ব্যক্তিত্ব সতর্কতা' : safetyAudit.isScammerOrFraud ? '🚨 প্রতারক / আর্থিক ঝুঁকি সতর্কতা' : safetyAudit.isHabitualLiar ? '⚠️ মিথ্যাবাদী ও তথ্য বিকৃতির লক্ষণ' : '🛡️ নিরাপদ ও বিশ্বস্ত'}
- নিরাপত্তা স্কোর: ${safetyAudit.safetyScore}%
- প্রতারণা মূল্যায়ন: ${safetyAudit.fraudRiskAssessmentBn}
- সত্যবাদিতা ও মিথ্যাচার: ${safetyAudit.honestyRiskAssessmentBn}
- বিপজ্জনকতা ও ক্ষতিকর প্রভাব: ${safetyAudit.dangerAssessmentBn}
- নিরাপত্তা পরামর্শ: ${safetyAudit.safetyAdviceBn}

【 ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা 】
- সামগ্রিক অবস্থা: ${destructiveHabits.overallRiskLevelBn} (বিচ্যুতি স্কোর: ${destructiveHabits.overallScore}%)
- সারসংক্ষেপ: ${destructiveHabits.summaryBn}
- নেশা করা (মাদক/অ্যালকোহল/জুয়া): ${destructiveHabits.substanceAddiction.levelBn} (${destructiveHabits.substanceAddiction.score}%) - ${destructiveHabits.substanceAddiction.manifestationBn}
- অযাচিত খরচ ও অপচয়: ${destructiveHabits.recklessSpending.levelBn} (${destructiveHabits.recklessSpending.score}%) - ${destructiveHabits.recklessSpending.manifestationBn}
- অতিরিক্ত কথা বলা ও প্রগলভতা: ${destructiveHabits.excessiveTalking.levelBn} (${destructiveHabits.excessiveTalking.score}%) - ${destructiveHabits.excessiveTalking.manifestationBn}
- খারাপ ব্যবহার ও কর্কশতা: ${destructiveHabits.toxicBehavior.levelBn} (${destructiveHabits.toxicBehavior.score}%) - ${destructiveHabits.toxicBehavior.manifestationBn}
- একাধিক নারী আসক্তি / বহুগামিতা: ${destructiveHabits.multipleRomanticObsessions.levelBn} (${destructiveHabits.multipleRomanticObsessions.score}%) - ${destructiveHabits.multipleRomanticObsessions.manifestationBn}
- যৌনাচারের আসক্তি ও অতিযৌনতা: ${destructiveHabits.sexualAddiction.levelBn} (${destructiveHabits.sexualAddiction.score}%) - ${destructiveHabits.sexualAddiction.manifestationBn}

【 পেশাগত যোগাযোগের ধরন 】
- শৈলী: ${profComm.styleTitleBn}
- কর্মক্ষেত্রের ভাষা ও ভঙ্গি: ${profComm.workplaceToneBn}
- মতবিরোধ সমাধান: ${profComm.conflictResolutionBn}
- দলগত মিথস্ক্রিয়া: ${profComm.teamCollaborationBn}
- নেতৃত্ব দৃষ্টিভঙ্গি: ${profComm.leadershipOrFollowershipBn}

【 ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা (স্কোর: ${cat7.overallScore}%) 】
- যুক্তিনির্ভর আলোচনার প্রবণতা: ${cat7.logicalDiscussionTendency.score}% (${cat7.logicalDiscussionTendency.statusBn}) - ${cat7.logicalDiscussionTendency.observationBn}
- তথ্য যাচাইয়ের অভ্যাস: ${cat7.factCheckingHabit.score}% (${cat7.factCheckingHabit.statusBn}) - ${cat7.factCheckingHabit.observationBn}
- সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা: ${cat7.decisionJustificationAbility.score}% (${cat7.decisionJustificationAbility.statusBn}) - ${cat7.decisionJustificationAbility.observationBn}
- ভিন্ন দৃষ্টিভঙ্গি বিবেচনা: ${cat7.alternativePerspectives.score}% (${cat7.alternativePerspectives.statusBn}) - ${cat7.alternativePerspectives.observationBn}
- ভুল থেকে শেখার প্রকাশ্য উদাহরণ: ${cat7.learningFromMistakes.score}% (${cat7.learningFromMistakes.statusBn}) - ${cat7.learningFromMistakes.observationBn}
- সমস্যা বিশ্লেষণের ধরন: ${cat7.problemAnalysisApproach.score}% (${cat7.problemAnalysisApproach.statusBn}) - ${cat7.problemAnalysisApproach.observationBn}

【 ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা (ধারাবাহিকতা: ${cat8.consistencyScore}%) 】
- পোস্টের বিষয়বস্তুর ধরন: ${cat8.postContentType.categoryBn} (${cat8.postContentType.primaryThemes.join(', ')})
- সময়ের সঙ্গে মতামতের পরিবর্তন: ${cat8.opinionEvolutionOverTime.patternBn} (${cat8.opinionEvolutionOverTime.maturityLevelBn})
- প্রকাশ্য আচরণের ধারাবাহিকতা: ${cat8.publicBehaviorConsistency.score}% - ${cat8.publicBehaviorConsistency.alignmentBn}
- ইতিবাচক ও নেতিবাচক অনুপাত: ${cat8.positiveToNegativeRatio.ratioString}
- অন্যের সঙ্গে যোগাযোগের ধরন: ${cat8.interpersonalStyle.styleBn} (টোন: ${cat8.interpersonalStyle.toneBn})
- নিজের ভুল সংশোধনের ইতিহাস: ${cat8.mistakeCorrectionHistory.frequencyBn}

【 পরিচিতি ও স্বাস্থ্য রূপরেখা 】
- ধর্ম ও আধ্যাত্মিক বিশ্বাস: ${demographics.religionOrFaithBn}
- রাজনৈতিক মতাদর্শ: ${demographics.politicalIdeologyBn}
- জাতিগত ও সাংস্কৃতিক পরিচয়: ${demographics.ethnicIdentityBn}
- যৌন অভিমুখিতা / সম্পর্ক দর্শন: ${demographics.sexualOrientationBn}
- শারীরিক ও মানসিক স্বাস্থ্য: ${demographics.healthAndMentalConditionsBn}

শীর্ষ চারিত্রিক গুণাবলী (Merits):
${result.merits.map((m) => `• ${m.name} (শক্তি মাত্রা: ${m.strengthLevel}/১০) - ${m.description}`).join('\n')}

চারিত্রিক দুর্বলতা ও প্রতিকার (Flaws & Remedies):
${result.flaws.map((f) => `• ${f.name}\n  - প্রভাব: ${f.negativeImpact}\n  - প্রতিকার: ${f.remedyAdvice}`).join('\n')}

চারিত্রিক স্তম্ভ স্কোর (6 Core Pillars):
- সততা ও নীতিবোধ: ${result.pillarsScore.honestyAndIntegrity}%
- ধৈর্য ও সহনশীলতা: ${result.pillarsScore.patienceAndCalmness}%
- আবেগ নিয়ন্ত্রণ: ${result.pillarsScore.emotionalRegulation}%
- পরোপকার ও শিষ্টাচার: ${result.pillarsScore.socialEmpathy}%
- সংকল্প ও নিয়মানুবর্তিতা: ${result.pillarsScore.gritAndDiscipline}%
- আত্মসচেতনতা: ${result.pillarsScore.selfAwareness}%

প্রজ্ঞাবাণী: "${result.philosophicalQuote.bengaliQuote}"
— ${result.philosophicalQuote.authorOrContext}
(${result.philosophicalQuote.significance})
    `.trim();

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Primary PDF Download Handler
  const handleDownloadPdf = () => {
    // Reveal all sections so complete report prints cleanly
    setActiveTabSection('all');
    setShowPdfGuideToast(true);

    // Allow state update to settle before opening browser print/PDF dialog
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Standalone offline HTML dossier generator
  const handleDownloadOfflineHtml = () => {
    setDownloadingHtml(true);

    const safeName = (result.personName || 'Character_Report')
      .replace(/[^\w\s\u0980-\u09FF-]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${result.personName || 'চরিত্র দর্পন'} - মূল্যায়ন রিপোর্ট (${result.archetypeTitle})</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.6;
      padding: 30px 20px;
    }
    .container {
      max-width: 820px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 10px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01);
      border: 1px solid #e2e8f0;
    }
    .header {
      border-bottom: 2px solid #0f172a;
      padding-bottom: 20px;
      margin-bottom: 25px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 26px;
      font-weight: 700;
      color: #047857;
      letter-spacing: -0.5px;
    }
    .sub-brand {
      font-size: 13px;
      color: #64748b;
      margin-top: 4px;
    }
    .meta-box {
      background: #f1f5f9;
      padding: 10px 16px;
      border-radius: 10px;
      font-size: 12px;
      text-align: right;
      border: 1px solid #e2e8f0;
    }
    .profile-card {
      background: #ecfdf5;
      border: 1px solid #a7f3d0;
      border-radius: 14px;
      padding: 24px;
      margin-bottom: 30px;
    }
    .archetype-title {
      font-size: 24px;
      font-weight: 700;
      color: #065f46;
      margin-bottom: 12px;
    }
    .archetype-summary {
      font-size: 15px;
      color: #1e293b;
      line-height: 1.7;
    }
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      margin: 30px 0 16px 0;
      padding-bottom: 8px;
      border-bottom: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .pillars-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 14px;
      margin-bottom: 25px;
    }
    .pillar-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 14px;
      border-radius: 10px;
    }
    .pillar-header {
      display: flex;
      justify-content: space-between;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    .bar-bg {
      background: #e2e8f0;
      height: 8px;
      border-radius: 999px;
      overflow: hidden;
    }
    .bar-fill {
      background: #10b981;
      height: 100%;
    }
    .item-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 12px;
    }
    .item-title {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .quote-box {
      margin-top: 30px;
      background: #fffbeb;
      border: 1px solid #fde68a;
      padding: 20px;
      border-radius: 12px;
      text-align: center;
      font-style: italic;
    }
    .print-btn {
      position: fixed;
      bottom: 25px;
      right: 25px;
      background: #047857;
      color: #fff;
      padding: 12px 24px;
      border-radius: 999px;
      border: none;
      font-weight: 700;
      font-size: 14px;
      cursor: pointer;
      box-shadow: 0 10px 15px -3px rgba(4,120,87,0.3);
    }
    @media print {
      body { background: #fff; padding: 0; }
      .container { border: none; box-shadow: none; padding: 0; max-width: 100%; }
      .print-btn { display: none; }
      .item-card { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div>
        <div class="brand-title">চরিত্র দর্পন (Charitra Darpan)</div>
        <div class="sub-brand">চারিত্রিক ও ব্যক্তিত্ব বিশ্লেষণ • অফিসিয়াল মূল্যায়ন রিপোর্ট</div>
      </div>
      <div class="meta-box">
        <div><strong>আইডি:</strong> ${reportId}</div>
        <div><strong>তারিখ:</strong> ${assessmentDate}</div>
        <div><strong>প্রার্থী:</strong> ${result.personName || 'ব্যক্তিগত স্ব-মূল্যায়ন'}</div>
      </div>
    </div>

    <div class="profile-card">
      <div class="archetype-title">উপাধি: ${result.archetypeTitle}</div>
      <div class="archetype-summary">${result.archetypeSummary}</div>
    </div>

    <!-- Social Personality Report (Exact Scorecard Layout) -->
    <div style="background: #0f172a; color: #ffffff; padding: 24px; border-radius: 14px; margin-bottom: 25px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 12px; margin-bottom: 16px;">
        <div>
          <div style="font-size: 20px; font-weight: 800; color: #38bdf8; letter-spacing: -0.5px;">Social Personality Report</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">কাল্পনিক উদাহরণ · প্রকৃত ব্যক্তির মূল্যায়ন নয়</div>
        </div>
        <div style="font-size: 11px; color: #34d399; border: 1px solid #059669; padding: 2px 8px; border-radius: 6px; font-weight: 600;">AI Scorecard</div>
      </div>
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px;">
        <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #10b981;">৮২%</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">ইতিবাচক যোগাযোগ</div>
        </div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #2dd4bf;">৭৫%</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">গঠনমূলক আলোচনা</div>
        </div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #818cf8;">৬৮%</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">মতামতের ধারাবাহিকতা</div>
        </div>
        <div style="background: #1e293b; padding: 12px; border-radius: 8px; text-align: center;">
          <div style="font-size: 22px; font-weight: 800; color: #38bdf8;">৭৯%</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">সহযোগিতামূলক আচরণ</div>
        </div>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 10px; border-bottom: 1px solid #334155; padding-bottom: 6px;">বৈশিষ্ট্যভিত্তিক বিশ্লেষণ</div>
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; background: #1e293b; padding: 8px 12px; border-radius: 6px;">
          <span>ভদ্র যোগাযোগ</span><span style="color: #34d399; font-weight: 700;">82%</span>
        </div>
        <div style="display: flex; justify-content: space-between; background: #1e293b; padding: 8px 12px; border-radius: 6px;">
          <span>সহানুভূতির প্রকাশ</span><span style="color: #34d399; font-weight: 700;">76%</span>
        </div>
        <div style="display: flex; justify-content: space-between; background: #1e293b; padding: 8px 12px; border-radius: 6px;">
          <span>যুক্তিনির্ভর আলোচনা</span><span style="color: #34d399; font-weight: 700;">88%</span>
        </div>
        <div style="display: flex; justify-content: space-between; background: #1e293b; padding: 8px 12px; border-radius: 6px;">
          <span>মতামতের ধারাবাহিকতা</span><span style="color: #34d399; font-weight: 700;">68%</span>
        </div>
        <div style="display: flex; justify-content: space-between; background: #1e293b; padding: 8px 12px; border-radius: 6px; grid-column: span 2;">
          <span>ভুল সংশোধনের প্রবণতা</span><span style="color: #34d399; font-weight: 700;">71%</span>
        </div>
      </div>
      <div style="font-size: 13px; font-weight: 700; color: #e2e8f0; margin-bottom: 6px;">AI-এর পর্যবেক্ষণ</div>
      <ul style="font-size: 12px; color: #cbd5e1; padding-left: 20px; line-height: 1.8; margin: 0;">
        <li>প্রকাশ্য আলোচনায় ভদ্র ভাষার ব্যবহার দেখা গেছে।</li>
        <li>বিভিন্ন বিষয়ে যুক্তি দিয়ে মতামত প্রকাশের উদাহরণ রয়েছে।</li>
        <li>কিছু বিষয়ে সময়ের সঙ্গে মতামতের পরিবর্তন দেখা গেছে।</li>
      </ul>
    </div>

    <div class="section-title">সততা ও বিপদ সতর্কতা অডিট (Risk & Safety Audit)</div>
    <div style="padding: 16px; border-radius: 12px; margin-bottom: 20px; border: 1px solid ${safetyAudit.isDangerousOrToxic || safetyAudit.isScammerOrFraud ? '#fca5a5' : '#a7f3d0'}; background: ${safetyAudit.isDangerousOrToxic || safetyAudit.isScammerOrFraud ? '#fef2f2' : '#f0fdf4'};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
        <span style="font-size: 14px; font-weight: 700; color: ${safetyAudit.isDangerousOrToxic || safetyAudit.isScammerOrFraud ? '#b91c1c' : '#047857'};">
          ${safetyAudit.isDangerousOrToxic ? '🚨 বিপজ্জনক ব্যক্তিত্ব সতর্কতা' : safetyAudit.isScammerOrFraud ? '🚨 আর্থিক প্রতারণা / জালিয়াতি সতর্কতা' : safetyAudit.isHabitualLiar ? '⚠️ মিথ্যাবাদী ও অসত্য তথ্য বিকৃতির অভ্যাস' : '🛡️ বিশ্বস্ত ও নিরাপদ ব্যক্তিত্ব প্রত্যয়ন'}
        </span>
        <span style="font-size: 12px; font-weight: 700; background: #fff; padding: 3px 8px; border-radius: 6px; border: 1px solid #cbd5e1;">নিরাপত্তা স্কোর: ${safetyAudit.safetyScore}%</span>
      </div>
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>প্রতারণা ও বিশ্বাসযোগ্যতা:</strong> ${safetyAudit.fraudRiskAssessmentBn}</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>সত্যবাদিতা ও সততা:</strong> ${safetyAudit.honestyRiskAssessmentBn}</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>বিপজ্জনকতা বা আগ্রাসন:</strong> ${safetyAudit.dangerAssessmentBn}</p>
      <p style="font-size: 13px; color: #047857; margin-top: 6px; background: rgba(255,255,255,0.7); padding: 8px; border-radius: 6px;"><strong>সুরক্ষা পরামর্শ:</strong> ${safetyAudit.safetyAdviceBn}</p>
    </div>

    <div class="section-title">ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা (Destructive Habits & Addiction Audit)</div>
    <div style="background: #0f172a; color: #ffffff; padding: 20px; border-radius: 14px; margin-bottom: 25px; border: 1px solid #334155;">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; padding-bottom: 10px; margin-bottom: 14px;">
        <div>
          <div style="font-size: 16px; font-weight: 800; color: #f43f5e;">ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">নেশা, অযাচিত খরচ, অতিরিক্ত কথা, খারাপ ব্যবহার, একাধিক নারী আসক্তি, যৌনাচারের আসক্তি</div>
        </div>
        <div style="font-size: 11px; background: #1e293b; padding: 4px 10px; border-radius: 6px; font-weight: 700; color: ${destructiveHabits.overallScore > 50 ? '#f43f5e' : '#34d399'}; border: 1px solid #334155;">
          ${destructiveHabits.overallRiskLevelBn} (স্কোর: ${destructiveHabits.overallScore}%)
        </div>
      </div>
      <p style="font-size: 12px; color: #cbd5e1; margin-bottom: 16px; line-height: 1.6;">${destructiveHabits.summaryBn}</p>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid ${destructiveHabits.substanceAddiction.hasTendency ? '#f43f5e' : '#10b981'};">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #f1f5f9;">১. নেশা করা</span>
            <span style="font-size: 11px; color: ${destructiveHabits.substanceAddiction.hasTendency ? '#f43f5e' : '#34d399'};">${destructiveHabits.substanceAddiction.levelBn} (${destructiveHabits.substanceAddiction.score}%)</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 3px 0;"><strong>প্রকাশ:</strong> ${destructiveHabits.substanceAddiction.manifestationBn}</p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 3px 0;"><strong>প্রতিকার:</strong> ${destructiveHabits.substanceAddiction.remedyAdviceBn}</p>
        </div>

        <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid ${destructiveHabits.recklessSpending.hasTendency ? '#f43f5e' : '#10b981'};">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #f1f5f9;">২. অযাচিত খরচ করা</span>
            <span style="font-size: 11px; color: ${destructiveHabits.recklessSpending.hasTendency ? '#f43f5e' : '#34d399'};">${destructiveHabits.recklessSpending.levelBn} (${destructiveHabits.recklessSpending.score}%)</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 3px 0;"><strong>প্রকাশ:</strong> ${destructiveHabits.recklessSpending.manifestationBn}</p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 3px 0;"><strong>প্রতিকার:</strong> ${destructiveHabits.recklessSpending.remedyAdviceBn}</p>
        </div>

        <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid ${destructiveHabits.excessiveTalking.hasTendency ? '#f43f5e' : '#10b981'};">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #f1f5f9;">৩. অতিরিক্ত কথা বলা</span>
            <span style="font-size: 11px; color: ${destructiveHabits.excessiveTalking.hasTendency ? '#f43f5e' : '#34d399'};">${destructiveHabits.excessiveTalking.levelBn} (${destructiveHabits.excessiveTalking.score}%)</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 3px 0;"><strong>প্রকাশ:</strong> ${destructiveHabits.excessiveTalking.manifestationBn}</p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 3px 0;"><strong>প্রতিকার:</strong> ${destructiveHabits.excessiveTalking.remedyAdviceBn}</p>
        </div>

        <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid ${destructiveHabits.toxicBehavior.hasTendency ? '#f43f5e' : '#10b981'};">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #f1f5f9;">৪. খারাপ ব্যবহার</span>
            <span style="font-size: 11px; color: ${destructiveHabits.toxicBehavior.hasTendency ? '#f43f5e' : '#34d399'};">${destructiveHabits.toxicBehavior.levelBn} (${destructiveHabits.toxicBehavior.score}%)</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 3px 0;"><strong>প্রকাশ:</strong> ${destructiveHabits.toxicBehavior.manifestationBn}</p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 3px 0;"><strong>প্রতিকার:</strong> ${destructiveHabits.toxicBehavior.remedyAdviceBn}</p>
        </div>

        <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid ${destructiveHabits.multipleRomanticObsessions.hasTendency ? '#f43f5e' : '#10b981'};">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #f1f5f9;">৫. একাধিক নারী আসক্তি</span>
            <span style="font-size: 11px; color: ${destructiveHabits.multipleRomanticObsessions.hasTendency ? '#f43f5e' : '#34d399'};">${destructiveHabits.multipleRomanticObsessions.levelBn} (${destructiveHabits.multipleRomanticObsessions.score}%)</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 3px 0;"><strong>প্রকাশ:</strong> ${destructiveHabits.multipleRomanticObsessions.manifestationBn}</p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 3px 0;"><strong>প্রতিকার:</strong> ${destructiveHabits.multipleRomanticObsessions.remedyAdviceBn}</p>
        </div>

        <div style="background: #1e293b; padding: 12px; border-radius: 8px; border-left: 4px solid ${destructiveHabits.sexualAddiction.hasTendency ? '#f43f5e' : '#10b981'};">
          <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: bold; margin-bottom: 4px;">
            <span style="color: #f1f5f9;">৬. যৌনাচারের আসক্তি</span>
            <span style="font-size: 11px; color: ${destructiveHabits.sexualAddiction.hasTendency ? '#f43f5e' : '#34d399'};">${destructiveHabits.sexualAddiction.levelBn} (${destructiveHabits.sexualAddiction.score}%)</span>
          </div>
          <p style="font-size: 11px; color: #94a3b8; margin: 3px 0;"><strong>প্রকাশ:</strong> ${destructiveHabits.sexualAddiction.manifestationBn}</p>
          <p style="font-size: 11px; color: #cbd5e1; margin: 3px 0;"><strong>প্রতিকার:</strong> ${destructiveHabits.sexualAddiction.remedyAdviceBn}</p>
        </div>
      </div>
    </div>

    <div class="section-title">পেশাগত যোগাযোগের ধরন</div>
    <div class="item-card">
      <div class="item-title" style="color: #4338ca;">${profComm.styleTitleBn}</div>
      <p style="font-size: 13px; color: #334155; margin-bottom: 5px;"><strong>কর্মক্ষেত্রে কথার ভঙ্গি:</strong> ${profComm.workplaceToneBn}</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 5px;"><strong>মতবিরোধ নিরসন:</strong> ${profComm.conflictResolutionBn}</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 5px;"><strong>দলগত সমন্বয়:</strong> ${profComm.teamCollaborationBn}</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 5px;"><strong>নেতৃত্ব ও দায়বদ্ধতা:</strong> ${profComm.leadershipOrFollowershipBn}</p>
      <p style="font-size: 12px; color: #4338ca; background: #e0e7ff; padding: 8px; border-radius: 6px; margin-top: 6px;"><strong>পেশাগত পরামর্শ:</strong> ${profComm.recommendationBn}</p>
    </div>

    <div class="section-title">ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা (সামগ্রিক স্কোর: ${cat7.overallScore}%)</div>
    <p style="font-size: 13px; color: #475569; margin-bottom: 12px;">${cat7.summaryBn}</p>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 10px; margin-bottom: 20px;">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
          <span>১. যুক্তিনির্ভর আলোচনার প্রবণতা</span><span>${cat7.logicalDiscussionTendency.score}%</span>
        </div>
        <p style="font-size: 11px; color: #64748b;">${cat7.logicalDiscussionTendency.observationBn}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
          <span>২. তথ্য যাচাইয়ের অভ্যাস</span><span>${cat7.factCheckingHabit.score}%</span>
        </div>
        <p style="font-size: 11px; color: #64748b;">${cat7.factCheckingHabit.observationBn}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
          <span>৩. সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা</span><span>${cat7.decisionJustificationAbility.score}%</span>
        </div>
        <p style="font-size: 11px; color: #64748b;">${cat7.decisionJustificationAbility.observationBn}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
          <span>৪. ভিন্ন দৃষ্টিভঙ্গি বিবেচনা</span><span>${cat7.alternativePerspectives.score}%</span>
        </div>
        <p style="font-size: 11px; color: #64748b;">${cat7.alternativePerspectives.observationBn}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
          <span>৫. ভুল থেকে শেখার প্রকাশ্য উদাহরণ</span><span>${cat7.learningFromMistakes.score}%</span>
        </div>
        <p style="font-size: 11px; color: #64748b;">${cat7.learningFromMistakes.observationBn}</p>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px;">
        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 4px;">
          <span>৬. সমস্যা বিশ্লেষণের ধরন</span><span>${cat7.problemAnalysisApproach.score}%</span>
        </div>
        <p style="font-size: 11px; color: #64748b;">${cat7.problemAnalysisApproach.observationBn}</p>
      </div>
    </div>

    <div class="section-title">ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা (ধারাবাহিকতা: ${cat8.consistencyScore}%)</div>
    <div class="item-card">
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>পোস্টের বিষয়বস্তুর ধরন:</strong> ${cat8.postContentType.categoryBn} — ${cat8.postContentType.descriptionBn}</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>সময়ের সঙ্গে মতামতের পরিবর্তন:</strong> ${cat8.opinionEvolutionOverTime.patternBn} (${cat8.opinionEvolutionOverTime.detailsBn})</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>প্রকাশ্য আচরণের ধারাবাহিকতা:</strong> ${cat8.publicBehaviorConsistency.score}% (${cat8.publicBehaviorConsistency.alignmentBn})</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>ইতিবাচক ও নেতিবাচক অনুপাত:</strong> ${cat8.positiveToNegativeRatio.ratioString} — ${cat8.positiveToNegativeRatio.toneAnalysisBn}</p>
      <p style="font-size: 13px; color: #334155; margin-bottom: 6px;"><strong>অন্যের সঙ্গে যোগাযোগের ধরন:</strong> ${cat8.interpersonalStyle.styleBn} (টোন: ${cat8.interpersonalStyle.toneBn})</p>
      <p style="font-size: 13px; color: #334155;"><strong>নিজের ভুল সংশোধনের ইতিহাস:</strong> ${cat8.mistakeCorrectionHistory.frequencyBn} — ${cat8.mistakeCorrectionHistory.detailsBn}</p>
    </div>

    <div class="section-title">পরিচিতি, বিশ্বাস ও স্বাস্থ্য রূপরেখা</div>
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin-bottom: 25px;">
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; font-size: 12px;">
        <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; display: block;">ধর্ম / আধ্যাত্মিক বিশ্বাস</span>
        <strong>${demographics.religionOrFaithBn}</strong>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; font-size: 12px;">
        <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; display: block;">রাজনৈতিক মতাদর্শ</span>
        <strong>${demographics.politicalIdeologyBn}</strong>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; font-size: 12px;">
        <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; display: block;">জাতিগত ও সাংস্কৃতিক পরিচয়</span>
        <strong>${demographics.ethnicIdentityBn}</strong>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; font-size: 12px;">
        <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; display: block;">যৌন অভিমুখিতা / সম্পর্ক</span>
        <strong>${demographics.sexualOrientationBn}</strong>
      </div>
      <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; font-size: 12px;">
        <span style="color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: bold; display: block;">শারীরিক ও মানসিক স্বাস্থ্য</span>
        <strong>${demographics.healthAndMentalConditionsBn}</strong>
      </div>
    </div>

    <div class="section-title">৬টি চারিত্রিক স্তম্ভ ও সক্ষমতা সূচক</div>
    <div class="pillars-grid">
      <div class="pillar-card">
        <div class="pillar-header"><span>সততা ও নীতিবোধ</span><span>${result.pillarsScore.honestyAndIntegrity}%</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: ${result.pillarsScore.honestyAndIntegrity}%"></div></div>
      </div>
      <div class="pillar-card">
        <div class="pillar-header"><span>ধৈর্য ও সহনশীলতা</span><span>${result.pillarsScore.patienceAndCalmness}%</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: ${result.pillarsScore.patienceAndCalmness}%"></div></div>
      </div>
      <div class="pillar-card">
        <div class="pillar-header"><span>আবেগ নিয়ন্ত্রণ</span><span>${result.pillarsScore.emotionalRegulation}%</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: ${result.pillarsScore.emotionalRegulation}%"></div></div>
      </div>
      <div class="pillar-card">
        <div class="pillar-header"><span>পরোপকার ও শিষ্টাচার</span><span>${result.pillarsScore.socialEmpathy}%</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: ${result.pillarsScore.socialEmpathy}%"></div></div>
      </div>
      <div class="pillar-card">
        <div class="pillar-header"><span>সংকল্প ও নিয়মানুবর্তিতা</span><span>${result.pillarsScore.gritAndDiscipline}%</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: ${result.pillarsScore.gritAndDiscipline}%"></div></div>
      </div>
      <div class="pillar-card">
        <div class="pillar-header"><span>আত্মসচেতনতা</span><span>${result.pillarsScore.selfAwareness}%</span></div>
        <div class="bar-bg"><div class="bar-fill" style="width: ${result.pillarsScore.selfAwareness}%"></div></div>
      </div>
    </div>

    <div class="section-title">শীর্ষ চারিত্রিক গুণাবলী ও শক্তি (Merits)</div>
    ${result.merits.map((m, i) => `
      <div class="item-card">
        <div class="item-title">${i + 1}. ${m.name} (শক্তি: ${m.strengthLevel}/১০)</div>
        <p style="font-size: 14px; color: #334155;">${m.description}</p>
      </div>
    `).join('')}

    <div class="section-title">চারিত্রিক দুর্বলতা ও প্রতিকার (Flaws & Remedies)</div>
    ${result.flaws.map((f, i) => `
      <div class="item-card">
        <div class="item-title" style="color: #b91c1c;">${i + 1}. ${f.name}</div>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>উৎস বা কারণ:</strong> ${f.triggerCause}</p>
        <p style="font-size: 13px; color: #475569; margin-bottom: 6px;"><strong>প্রভাব:</strong> ${f.negativeImpact}</p>
        <p style="font-size: 13px; color: #047857; background: #ecfdf5; padding: 8px; border-radius: 6px;"><strong>প্রতিকার ও সমাধান:</strong> ${f.remedyAdvice}</p>
      </div>
    `).join('')}

    <div class="quote-box">
      <p style="font-size: 16px; font-weight: 600; color: #78350f;">"${result.philosophicalQuote.bengaliQuote}"</p>
      <p style="font-size: 13px; color: #92400e; margin-top: 6px;">— ${result.philosophicalQuote.authorOrContext}</p>
    </div>

    <div style="margin-top: 40px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 11px; color: #64748b;">
      <span>চরিত্র দর্পন সাইকোমেট্রিক সিস্টেম • AI Studio</span>
      <span>প্রতিবেদন প্রত্যয়ন কোড: ${reportId}</span>
    </div>
  </div>

  <button class="print-btn" onclick="window.print()">🖨️ প্রিন্ট বা PDF হিসেবে সেভ করুন</button>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeName}_Report_${reportId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => {
      setDownloadingHtml(false);
    }, 1500);
  };

  const completedDaysCount = dayPlans.filter((d) => d.completed).length;

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-8 print:p-0 print:space-y-4 print:max-w-none">
      {/* PDF Export Guide Floating Toast / Banner */}
      {showPdfGuideToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 print:hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-slate-900 border border-emerald-500/80 shadow-2xl rounded-2xl p-4 flex items-start gap-3 backdrop-blur-xl">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Download className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1 text-xs space-y-1">
              <h5 className="font-bold text-white text-sm flex items-center gap-1.5">
                <span>{lang === 'bn' ? 'পিডিএফ প্রস্তুত হচ্ছে...' : 'Preparing PDF Export...'}</span>
              </h5>
              <p className="text-slate-300 leading-relaxed">
                {lang === 'bn'
                  ? 'প্রিন্ট ডায়ালগ স্ক্রিনে "Destination" বা গন্তব্য হিসেবে "Save as PDF" (পিডিএফ হিসেবে সংরক্ষণ) নির্বাচন করে সেভ করুন।'
                  : 'In the print dialogue, select "Save as PDF" under Destination to download the document.'}
              </p>
            </div>
            <button
              onClick={() => setShowPdfGuideToast(false)}
              className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Official Printable Header (Visible ONLY on print / PDF document) */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-5 mb-6 text-slate-900 bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl font-black tracking-tight text-slate-900">চরিত্র দর্পন (Charitra Darpan)</span>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold border border-emerald-300">
                অফিশিয়াল প্রামাণ্য সনদ
              </span>
            </div>
            <p className="text-xs text-slate-700 font-medium">
              চরিত্র ও ব্যক্তিত্ব দর্পণ — সাইকোমেট্রিক ও নৈতিক চরিত্র বিশ্লেষণ প্রতিবেদন
            </p>
          </div>
          <div className="text-right text-xs text-slate-700 space-y-0.5">
            <p className="font-mono font-bold text-slate-900 text-sm">{reportId}</p>
            <p>তারিখ: {assessmentDate}</p>
            <p className="text-[10px] text-slate-600">সংস্করণ: ৩.২ (AI Studio Psychometric Model)</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-300 grid grid-cols-3 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">মূল্যায়িত ব্যক্তি / প্রার্থী:</span>
            <strong className="text-slate-950 text-sm font-bold">
              {result.personName || (lang === 'bn' ? 'ব্যক্তিগত স্ব-মূল্যায়ন' : 'Personal Assessment')}
            </strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">ব্যক্তিত্বের প্রধান উপাধি:</span>
            <strong className="text-emerald-800 text-sm font-bold">{result.archetypeTitle}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">মূল্যায়ন স্থিতি:</span>
            <strong className="text-teal-800 text-sm font-bold flex items-center gap-1">
              ✓ চূড়ান্ত ও প্রতিপাদিত
            </strong>
          </div>
        </div>
      </div>

      {/* Interactive Action Bar (Hidden in Print) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800 print:hidden">
        <button
          onClick={onReset}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{lang === 'bn' ? 'নতুন মূল্যায়ন শুরু করুন' : 'Start New Assessment'}</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Main Primary: Download as PDF button */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/50 border border-emerald-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
            title={lang === 'bn' ? 'A4 সাইজের অফিশিয়াল পিডিএফ ডাউনলোড করুন' : 'Download report as official printable PDF'}
          >
            <Download className="w-4 h-4 text-emerald-100" />
            <span>{lang === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download as PDF'}</span>
          </button>

          {/* Direct Print Button */}
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all"
            title={lang === 'bn' ? 'সরাসরি প্রিন্ট করুন' : 'Print directly'}
          >
            <Printer className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{lang === 'bn' ? 'প্রিন্ট' : 'Print'}</span>
          </button>

          {/* Offline Single-File HTML Download */}
          <button
            onClick={handleDownloadOfflineHtml}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all"
            title={lang === 'bn' ? 'ইন্টারনেট ছাড়া সবসময় পড়ার জন্য অফলাইন ফাইল সেভ করুন' : 'Download standalone offline file'}
          >
            <FileDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">{downloadingHtml ? (lang === 'bn' ? 'ডাউনলোড হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'অফলাইন ফাইল' : 'Offline Doc')}</span>
          </button>

          {/* Copy Summary Text */}
          <button
            onClick={handleCopySummary}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 text-xs font-medium transition-all"
            title={lang === 'bn' ? 'টেক্সট সারাংশ কপি করুন' : 'Copy summary text'}
          >
            <Copy className="w-3.5 h-3.5 text-teal-400" />
            <span>{copied ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'সারাংশ কপি' : 'Copy')}</span>
          </button>

          {/* Web Share API & Social Share Button */}
          <button
            onClick={handleWebShare}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/80 text-indigo-200 border border-indigo-700/60 hover:border-indigo-400 text-xs font-semibold transition-all shadow-sm group"
            title={lang === 'bn' ? 'রিপোর্টটি সোশ্যাল মিডিয়া বা মেসেঞ্জারে শেয়ার করুন' : 'Share report to external apps or contacts'}
          >
            <Share2 className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
            <span>{lang === 'bn' ? 'শেয়ার করুন' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Main Archetype Hero Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:space-y-2">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 print:text-slate-700">
          <span className="font-semibold text-emerald-400 print:text-emerald-800">
            {lang === 'bn' ? 'মনস্তাত্ত্বিক চরিত্র দর্পণ' : 'Psychological Character Mirror'}
          </span>
          {result.personName && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 print:text-slate-800 font-medium">{result.personName}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{assessmentDate}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white print:text-slate-950 tracking-tight">
          {result.archetypeTitle}
        </h1>

        <p className="text-sm sm:text-base text-slate-200 print:text-slate-800 leading-relaxed pt-2 border-t border-slate-800/80 print:border-slate-200">
          {result.archetypeSummary}
        </p>
      </div>

      {/* 6 Pillars Score Radar Chart & Gauges (Feature-based Analysis) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid shadow-xl">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 print:border-slate-200 gap-2">
          <div>
            <h2 className="text-base font-bold text-white print:text-slate-950 flex items-center gap-2">
              <RadarIcon className="w-4 h-4 text-emerald-400 print:text-emerald-800" />
              <span>{lang === 'bn' ? 'বৈশিষ্ট্যভিত্তিক রাডার বিশ্লেষণ ও চারিত্রিক স্তম্ভ' : 'Feature-based Radar Analysis & Core Pillars'}</span>
            </h2>
            <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
              {lang === 'bn'
                ? 'আবেগ নিয়ন্ত্রণ (EQ), যুক্তিনির্ভর চিন্তা, যোগাযোগ শৈলী ও চারিত্রিক শক্তির বহুমাত্রিক উপস্থাপন'
                : 'Multi-dimensional visual mapping of emotional regulation, logical thinking, and communication style'}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 print:hidden">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>{lang === 'bn' ? 'ইন্টারেক্টিভ সাইকোমেট্রিক রাডার' : 'Interactive Psychometric Radar'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Radar Chart Visual (Recharts) */}
          <div className="lg:col-span-5 bg-slate-950/80 rounded-xl border border-slate-800/80 p-3 sm:p-4 flex flex-col items-center justify-center print:bg-white print:border-slate-300">
            <div className="w-full flex items-center justify-between mb-1 px-2 text-xs">
              <span className="font-semibold text-emerald-400 print:text-emerald-800 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                {lang === 'bn' ? 'ব্যক্তিত্বের সামঞ্জস্য বলয়' : 'Trait Alignment Web'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">০-১০০ স্কেল</span>
            </div>
            <div className="w-full h-[280px] sm:h-[310px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="68%" data={radarChartData}>
                  <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                  <PolarAngleAxis
                    dataKey="trait"
                    tick={{ fill: '#cbd5e1', fontSize: 11, fontWeight: 600 }}
                  />
                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tick={{ fill: '#64748b', fontSize: 9 }}
                    stroke="#334155"
                  />
                  <Radar
                    name="স্কোর"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs backdrop-blur-md">
                            <p className="font-bold text-white mb-0.5">{data.trait}</p>
                            <p className="text-emerald-400 font-mono font-bold">
                              {lang === 'bn' ? 'দক্ষতা / পরিপক্বতা:' : 'Score:'} {data.score}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pillars & Metrics Progress Breakdown */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                labelBn: 'সততা ও নীতিবোধ',
                labelEn: 'Honesty & Integrity',
                val: result.pillarsScore.honestyAndIntegrity,
                color: 'from-emerald-500 to-teal-400',
                printBg: 'bg-emerald-600',
              },
              {
                labelBn: 'ধৈর্য ও সহনশীলতা',
                labelEn: 'Patience & Calmness',
                val: result.pillarsScore.patienceAndCalmness,
                color: 'from-blue-500 to-cyan-400',
                printBg: 'bg-blue-600',
              },
              {
                labelBn: 'আবেগ ও রাগ নিয়ন্ত্রণ (EQ)',
                labelEn: 'Emotional Regulation',
                val: result.pillarsScore.emotionalRegulation,
                color: 'from-amber-500 to-orange-400',
                printBg: 'bg-amber-600',
              },
              {
                labelBn: 'সামাজিক শিষ্টাচার ও পরোপকার',
                labelEn: 'Social Empathy & Care',
                val: result.pillarsScore.socialEmpathy,
                color: 'from-pink-500 to-rose-400',
                printBg: 'bg-pink-600',
              },
              {
                labelBn: 'সংকল্প ও নিয়মানুবর্তিতা',
                labelEn: 'Grit & Discipline',
                val: result.pillarsScore.gritAndDiscipline,
                color: 'from-indigo-500 to-violet-400',
                printBg: 'bg-indigo-600',
              },
              {
                labelBn: 'আত্মসচেতনতা ও সত্যবোধ',
                labelEn: 'Self-Awareness',
                val: result.pillarsScore.selfAwareness,
                color: 'from-teal-500 to-emerald-400',
                printBg: 'bg-teal-600',
              },
            ].map((pillar, idx) => (
              <div
                key={idx}
                className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-2 print:bg-slate-50 print:border-slate-300"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-300 print:text-slate-900 print:font-bold">
                    {lang === 'bn' ? pillar.labelBn : pillar.labelEn}
                  </span>
                  <span className="font-mono tabular-nums font-semibold text-emerald-400 print:text-slate-950 print:font-bold">
                    {pillar.val}%
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden print:bg-slate-200 print:border print:border-slate-300">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${pillar.color} print:${pillar.printBg}`}
                    style={{ width: `${pillar.val}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Tabs for Deep Sections (Hidden in Print) */}
      <div className="flex gap-2 border-b border-slate-800 pb-2 print:hidden overflow-x-auto scrollbar-thin">
        {[
          { id: 'all', bn: 'সব বিভাগ', en: 'All Sections' },
          { id: 'scorecard', bn: '📊 Social Personality Report', en: 'Personality Scorecard' },
          { id: 'safety', bn: '🛡️ সততা ও বিপদ অডিট', en: 'Safety & Risk' },
          { id: 'destructive', bn: '⚠️ ধ্বংসাত্মক বদভ্যাস ও আসক্তি', en: 'Destructive Habits' },
          { id: 'professional', bn: '💼 পেশাগত যোগাযোগ', en: 'Professional' },
          { id: 'cognition', bn: '🧠 ক্যাটাগরি ৭: সিদ্ধান্ত ও চিন্তা', en: 'Cat 7: Cognition' },
          { id: 'online', bn: '🌐 ক্যাটাগরি ৮: অনলাইন আচরণ', en: 'Cat 8: Online' },
          { id: 'identity', bn: '👤 পরিচিতি ও স্বাস্থ্য', en: 'Identity & Health' },
          { id: 'virtues', bn: 'শীর্ষ গুণাবলী (Merits)', en: 'Virtues & Strengths' },
          { id: 'flaws', bn: 'দোষ ও প্রতিকার (Flaws)', en: 'Flaws & Remedies' },
          { id: 'habits', bn: 'অভ্যাস গাইড', en: 'Habits Guide' },
          { id: 'plan', bn: '৭ দিনের সংস্কার প্ল্যান', en: '7-Day Plan' },
        ].map((sec) => (
          <button
            key={sec.id}
            onClick={() => setActiveTabSection(sec.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeTabSection === sec.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {lang === 'bn' ? sec.bn : sec.en}
          </button>
        ))}
      </div>

      {/* Social Personality Report Scorecard (Matching User's Specified Format) */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'scorecard' ? 'hidden print:block' : 'block'}>
        <SocialPersonalityScorecardView
          scorecard={scorecardData}
          targetName={result.personName}
          lang={lang}
          onPrint={() => window.print()}
        />
      </div>

      {/* Section: Risk, Fraud, Liar & Danger Audit (High Visibility Warning or Verified Safe Badge) */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'safety' ? 'hidden print:block' : 'block'}>
        <div
          className={`border rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl transition-all print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid ${
            safetyAudit.isDangerousOrToxic || safetyAudit.isScammerOrFraud || safetyAudit.isHabitualLiar
              ? 'bg-rose-950/30 border-rose-500/80 print:bg-rose-50'
              : 'bg-emerald-950/20 border-emerald-500/40 print:bg-emerald-50'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 font-bold ${
                  safetyAudit.isDangerousOrToxic || safetyAudit.isScammerOrFraud
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {safetyAudit.isDangerousOrToxic || safetyAudit.isScammerOrFraud ? (
                  <ShieldAlert className="w-6 h-6 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-6 h-6" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white print:text-slate-950">
                    {lang === 'bn' ? 'সততা, প্রতারণা ও বিপদ সতর্কতা অডিট' : 'Honesty, Deception & Danger Risk Audit'}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      safetyAudit.isDangerousOrToxic
                        ? 'bg-red-500 text-white'
                        : safetyAudit.isScammerOrFraud
                        ? 'bg-rose-500 text-white'
                        : safetyAudit.isHabitualLiar
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {safetyAudit.isDangerousOrToxic
                      ? 'বিপজ্জনক সংকেত'
                      : safetyAudit.isScammerOrFraud
                      ? 'প্রতারণা ঝুঁকি'
                      : safetyAudit.isHabitualLiar
                      ? 'মিথ্যাচার সতর্কতা'
                      : 'নিরাপদ ও বিশ্বস্ত'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                  {lang === 'bn'
                    ? 'ব্যক্তির সত্যবাদিতা, আর্থিক লেনদেনে বিশ্বস্ততা এবং সহিংস বা ক্ষতিকর আচরণের মনস্তাত্ত্বিক ঝুঁকি যাচাই'
                    : 'Psychological assessment of financial fraud risk, deceitfulness, and harmful toxicity'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
              <span className="text-slate-400">নিরাপত্তা স্তর:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {safetyAudit.safetyScore}%
              </span>
            </div>
          </div>

          {/* Warning Flag Badges if active */}
          {(safetyAudit.isScammerOrFraud || safetyAudit.isHabitualLiar || safetyAudit.isDangerousOrToxic) && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {safetyAudit.isScammerOrFraud && (
                <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/80 text-rose-200 text-xs flex items-center gap-2.5">
                  <AlertOctagon className="w-5 h-5 text-rose-400 shrink-0" />
                  <div>
                    <strong className="block text-rose-300 font-bold">প্রতারক / জালিয়াতি সংকেত</strong>
                    <span className="text-[11px] text-rose-200/80">আর্থিক বা লেনদেনে ধোঁকাবাজির ঝুঁকি</span>
                  </div>
                </div>
              )}
              {safetyAudit.isHabitualLiar && (
                <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-500/80 text-amber-200 text-xs flex items-center gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <div>
                    <strong className="block text-amber-300 font-bold">অভ্যাসগত মিথ্যাবাদী সতর্কতা</strong>
                    <span className="text-[11px] text-amber-200/80">নিয়মিত অসত্য ও বানোয়াট তথ্য ছড়ানোর প্রমাণ</span>
                  </div>
                </div>
              )}
              {safetyAudit.isDangerousOrToxic && (
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500 text-red-200 text-xs flex items-center gap-2.5">
                  <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
                  <div>
                    <strong className="block text-red-300 font-bold">বিপজ্জনক ও ক্ষতিকর স্বভাব</strong>
                    <span className="text-[11px] text-red-200/80">সহিংসতা, ব্ল্যাকমেইল বা ক্ষতির চরম ঝুঁকি</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit Detail Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5 print:bg-slate-50 print:border-slate-300">
              <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                ১. প্রতারণা ও জালিয়াতি ঝুঁকি
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                {safetyAudit.fraudRiskAssessmentBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5 print:bg-slate-50 print:border-slate-300">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                ২. মিথ্যাবাদিতা ও সত্য-গোপন
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                {safetyAudit.honestyRiskAssessmentBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-1.5 print:bg-slate-50 print:border-slate-300">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider block">
                ৩. বিপজ্জনকতা ও বিষাক্ততা
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                {safetyAudit.dangerAssessmentBn}
              </p>
            </div>
          </div>

          {/* Red Flags & Protective Advice */}
          <div className="space-y-3 pt-2">
            {safetyAudit.redFlagsBn?.length > 0 && (
              <div className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 print:bg-slate-50 print:border-slate-300">
                <strong className="text-amber-400 block mb-1.5">🚩 পর্যবেক্ষণযোগ্য সতর্কতা সংকেত (Red Flags):</strong>
                <ul className="space-y-1 pl-4 list-disc text-slate-400 print:text-slate-700">
                  {safetyAudit.redFlagsBn.map((rf, idx) => (
                    <li key={idx}>{rf}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 print:bg-emerald-50 print:border-emerald-300 print:text-emerald-900">
              <strong className="text-emerald-400 font-bold print:text-emerald-950">
                🛡️ ব্যবহারিক সুরক্ষা গাইডলাইন:
              </strong>{' '}
              {safetyAudit.safetyAdviceBn}
            </div>
          </div>
        </div>
      </div>

      {/* Section: Destructive Habits & Addiction Audit (নেশা, অযাচিত খরচ, অতিরিক্ত কথা, খারাপ ব্যবহার, একাধিক নারী আসক্তি, যৌনাচারের আসক্তি) */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'destructive' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0 font-bold">
                <AlertTriangle className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-white print:text-slate-950">
                    {lang === 'bn' ? 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা' : 'Destructive Habits & Addiction Audit'}
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      destructiveHabits.overallScore > 60
                        ? 'bg-rose-500 text-white'
                        : destructiveHabits.overallScore > 35
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {destructiveHabits.overallRiskLevelBn}
                  </span>
                </div>
                <p className="text-xs text-slate-400 print:text-slate-600 mt-0.5">
                  {lang === 'bn'
                    ? 'নেশা, আর্থিক অপচয়, অতিরিক্ত কথা, খারাপ ব্যবহার, বহুগামিতা ও যৌনাচারের মনস্তাত্ত্বিক নিরীক্ষা'
                    : 'Psychological audit of substance addiction, reckless spending, verbosity, toxicity, and compulsive lust'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-xl text-xs">
              <span className="text-slate-400">সামগ্রিক আসক্তি/ঝুঁকি স্কোর:</span>
              <span className={`font-mono font-bold text-sm ${destructiveHabits.overallScore > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {destructiveHabits.overallScore}%
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 print:text-slate-800 mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80 leading-relaxed">
            {destructiveHabits.summaryBn}
          </p>

          {/* 6 Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                titleBn: '১. নেশা করা',
                titleEn: 'Substance Addiction',
                subtitleBn: 'ধূমপান, মদ, মাদকদ্রব্য বা জুয়া',
                icon: Flame,
                iconColor: 'text-amber-400',
                item: destructiveHabits.substanceAddiction,
              },
              {
                titleBn: '২. অযাচিত খরচ করা',
                titleEn: 'Reckless Spending',
                subtitleBn: 'বেহিসাবি আর্থিক অপচয় ও বিলাসিতা',
                icon: Coins,
                iconColor: 'text-yellow-400',
                item: destructiveHabits.recklessSpending,
              },
              {
                titleBn: '৩. অতিরিক্ত কথা বলা',
                titleEn: 'Excessive Talking',
                subtitleBn: 'প্রগলভতা ও অপ্রয়োজনীয় অনর্গল কথা',
                icon: MessageSquareWarning,
                iconColor: 'text-cyan-400',
                item: destructiveHabits.excessiveTalking,
              },
              {
                titleBn: '৪. খারাপ ব্যবহার',
                titleEn: 'Toxic / Rude Conduct',
                subtitleBn: 'রূঢ় আচরণ, কটূক্তি ও অবমাননা',
                icon: AlertOctagon,
                iconColor: 'text-rose-400',
                item: destructiveHabits.toxicBehavior,
              },
              {
                titleBn: '৫. একাধিক নারী আসক্তি',
                titleEn: 'Romantic Philandering',
                subtitleBn: 'বহুগামিতা ও অনৈতিক চপলতা',
                icon: HeartCrack,
                iconColor: 'text-pink-400',
                item: destructiveHabits.multipleRomanticObsessions,
              },
              {
                titleBn: '৬. যৌনাচারের আসক্তি',
                titleEn: 'Sexual Addiction',
                subtitleBn: 'অতিযৌনতা, কামাসক্তি ও পর্নোগ্রাফি',
                icon: ShieldAlert,
                iconColor: 'text-purple-400',
                item: destructiveHabits.sexualAddiction,
              },
            ].map((habitCard, idx) => {
              const IconComp = habitCard.icon;
              const isAlert = habitCard.item.hasTendency || habitCard.item.score > 40;
              return (
                <div
                  key={idx}
                  className={`rounded-xl p-4 border transition-all flex flex-col justify-between ${
                    isAlert
                      ? 'bg-rose-950/20 border-rose-500/50 print:bg-rose-50'
                      : 'bg-slate-950/60 border-slate-800 print:bg-slate-50 print:border-slate-300'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                          <IconComp className={`w-4 h-4 ${habitCard.iconColor}`} />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white print:text-slate-950">
                            {habitCard.titleBn}
                          </h4>
                          <span className="text-[10px] text-slate-400 block leading-tight">
                            {habitCard.subtitleBn}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-md font-bold whitespace-nowrap shrink-0 ${
                          isAlert
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {habitCard.item.levelBn}
                      </span>
                    </div>

                    {/* Score Bar */}
                    <div className="my-2.5">
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-slate-400">তীব্রতা স্কোর:</span>
                        <span className={`font-mono font-bold ${isAlert ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {habitCard.item.score}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isAlert ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${habitCard.item.score}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 text-xs mt-3 pt-2 border-t border-slate-800/80 print:border-slate-200">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                          আচরণগত বহিঃপ্রকাশ:
                        </span>
                        <p className="text-slate-300 print:text-slate-800 mt-0.5 leading-relaxed">
                          {habitCard.item.manifestationBn}
                        </p>
                      </div>

                      <div>
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block">
                          ক্ষতিকর প্রভাব:
                        </span>
                        <p className="text-slate-300 print:text-slate-800 mt-0.5 leading-relaxed">
                          {habitCard.item.impactBn}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-800/60 print:border-slate-200 bg-slate-900/50 -mx-4 -mb-4 p-3 rounded-b-xl">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-0.5">
                      💡 বৈজ্ঞানিক প্রতিকার ও মুক্তির উপায়:
                    </span>
                    <p className="text-[11px] text-slate-300 print:text-slate-800 leading-relaxed">
                      {habitCard.item.remedyAdviceBn}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Section: Professional Communication Style */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'professional' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 print:bg-indigo-100 print:text-indigo-800 flex items-center justify-center">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'পেশাগত যোগাযোগের ধরন' : 'Professional Communication Style'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn'
                    ? 'কর্মক্ষেত্রে কথার ভঙ্গি, টিমওয়ার্ক, মতবিরোধ সমাধান ও নেতৃত্বের রূপরেখা'
                    : 'Workplace demeanor, team collaboration and conflict resolution approach'}
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 print:bg-indigo-100 print:text-indigo-900">
              {profComm.styleTitleBn}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                কর্মক্ষেত্রে কথার ভঙ্গি ও শিষ্টাচার
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                {profComm.workplaceToneBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                মতবিরোধ ও দ্বন্দ্ব নিরসনের ধরন
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                {profComm.conflictResolutionBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                দলগত কাজ ও সমন্বয়ের মাত্রা
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                {profComm.teamCollaborationBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider block mb-1">
                দায়িত্ব পালন ও নেতৃত্ব দৃষ্টিভঙ্গি
              </span>
              <p className="text-xs text-slate-300 print:text-slate-800 leading-relaxed">
                {profComm.leadershipOrFollowershipBn}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-900/60 text-xs text-indigo-300 print:bg-indigo-50 print:border-indigo-300 print:text-indigo-900">
            <strong className="text-indigo-200 font-bold print:text-indigo-950">পেশাগত উন্নতির সুপারিশ:</strong>{' '}
            {profComm.recommendationBn}
          </div>
        </div>
      </div>

      {/* Section: Category 7: Decision Making & Thinking Style */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'cognition' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 print:bg-teal-100 print:text-teal-800 flex items-center justify-center">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা' : 'Category 7: Decision Making & Cognitive Style'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn'
                    ? 'যুক্তিনির্ভর আলোচনা, তথ্য যাচাই, ভিন্ন মতের মূল্যায়ন ও সমস্যা সমাধানের মানসিক প্রক্রিয়া'
                    : 'Logical discourse, fact-checking habits, open-mindedness and problem analysis'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">সামগ্রিক চিন্তাশক্তি স্কোর:</span>
              <span className="font-mono font-bold text-teal-400 text-sm">{cat7.overallScore}%</span>
            </div>
          </div>

          <p className="text-sm text-slate-300 print:text-slate-800 mb-6 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 leading-relaxed">
            {cat7.summaryBn}
          </p>

          {/* 6 Sub-metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { key: '1', title: 'যুক্তিনির্ভর আলোচনার প্রবণতা', data: cat7.logicalDiscussionTendency, color: 'from-teal-500 to-emerald-400' },
              { key: '2', title: 'তথ্য যাচাইয়ের অভ্যাস', data: cat7.factCheckingHabit, color: 'from-blue-500 to-cyan-400' },
              { key: '3', title: 'সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা', data: cat7.decisionJustificationAbility, color: 'from-indigo-500 to-purple-400' },
              { key: '4', title: 'ভিন্ন দৃষ্টিভঙ্গি বিবেচনা', data: cat7.alternativePerspectives, color: 'from-amber-500 to-orange-400' },
              { key: '5', title: 'ভুল থেকে শেখার প্রকাশ্য উদাহরণ', data: cat7.learningFromMistakes, color: 'from-emerald-500 to-teal-400' },
              { key: '6', title: 'সমস্যা বিশ্লেষণের ধরন', data: cat7.problemAnalysisApproach, color: 'from-pink-500 to-rose-400' },
            ].map((item) => (
              <div
                key={item.key}
                className="bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 rounded-xl p-4 space-y-2.5 transition-all print:bg-slate-50 print:border-slate-300"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-200 print:text-slate-950">{item.title}</span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-teal-300 font-mono text-[11px]">
                    {item.data.statusBn} ({item.data.score}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden print:bg-slate-200">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                    style={{ width: `${item.data.score}%` }}
                  />
                </div>
                <p className="text-xs text-slate-400 print:text-slate-700 leading-relaxed pt-1">
                  {item.data.observationBn}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section: Category 8: Online Behavior Consistency */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'online' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা' : 'Category 8: Consistency of Online & Public Behavior'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn'
                    ? 'পোস্টের মান, মতামতের সুস্থ পরিবর্তন, ইতিবাচক অনুপাত ও ভুল সংশোধনের ইতিহাস'
                    : 'Digital footprint authenticity, positive content ratio, and self-correction track record'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 px-3.5 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">ধারাবাহিকতা স্কোর:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {cat8.consistencyScore}%
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-300 print:text-slate-800 mb-6 bg-slate-950/40 p-3.5 rounded-xl border border-slate-800/60 leading-relaxed">
            {cat8.summaryBn}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 1. Content Type */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                ১. পোস্টের বিষয়বস্তুর ধরন
              </span>
              <p className="text-xs font-semibold text-slate-200 print:text-slate-900">
                {cat8.postContentType.categoryBn}
              </p>
              <p className="text-xs text-slate-400 print:text-slate-700">
                {cat8.postContentType.descriptionBn}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {cat8.postContentType.primaryThemes?.map((theme, tIdx) => (
                  <span key={tIdx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    {theme}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Opinion Evolution */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                ২. সময়ের সঙ্গে মতামতের পরিবর্তন
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 print:text-slate-900">
                  {cat8.opinionEvolutionOverTime.patternBn}
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] font-bold">
                  {cat8.opinionEvolutionOverTime.maturityLevelBn}
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-700 leading-relaxed">
                {cat8.opinionEvolutionOverTime.detailsBn}
              </p>
            </div>

            {/* 3. Public Behavior Consistency */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                ৩. প্রকাশ্য আচরণের ধারাবাহিকতা
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 print:text-slate-900">
                  {cat8.publicBehaviorConsistency.alignmentBn}
                </span>
                <span className="font-mono text-emerald-400 font-bold">
                  {cat8.publicBehaviorConsistency.score}%
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-700 leading-relaxed">
                {cat8.publicBehaviorConsistency.detailsBn}
              </p>
            </div>

            {/* 4. Positive vs Negative Ratio */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                ৪. ইতিবাচক ও নেতিবাচক কনটেন্টের অনুপাত
              </span>
              <span className="text-xs font-semibold text-slate-200 block">
                {cat8.positiveToNegativeRatio.ratioString}
              </span>
              <div className="w-full bg-rose-950 rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full"
                  style={{ width: `${cat8.positiveToNegativeRatio.positivePercentage}%` }}
                />
                <div
                  className="bg-rose-500 h-full"
                  style={{ width: `${cat8.positiveToNegativeRatio.negativePercentage}%` }}
                />
              </div>
              <p className="text-xs text-slate-400 print:text-slate-700 leading-relaxed pt-1">
                {cat8.positiveToNegativeRatio.toneAnalysisBn}
              </p>
            </div>

            {/* 5. Interpersonal Style */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                ৫. অন্যের সঙ্গে যোগাযোগের ধরন
              </span>
              <p className="text-xs font-semibold text-slate-200 print:text-slate-900">
                {cat8.interpersonalStyle.styleBn}
              </p>
              <p className="text-xs text-slate-400 print:text-slate-700">
                টোন: <strong className="text-slate-300 print:text-slate-900">{cat8.interpersonalStyle.toneBn}</strong>
              </p>
              <p className="text-xs text-slate-400 print:text-slate-700 leading-relaxed">
                {cat8.interpersonalStyle.engagementMannerBn}
              </p>
            </div>

            {/* 6. Mistake Correction History */}
            <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 print:bg-slate-50 print:border-slate-300">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                ৬. নিজের ভুল সংশোধনের ইতিহাস
              </span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs font-semibold text-slate-200 print:text-slate-900">
                  {cat8.mistakeCorrectionHistory.frequencyBn}
                </span>
              </div>
              <p className="text-xs text-slate-400 print:text-slate-700 leading-relaxed">
                {cat8.mistakeCorrectionHistory.detailsBn}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section: Demographics, Identity & Health Profile */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'identity' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 print:bg-purple-100 print:text-purple-800 flex items-center justify-center">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'পরিচিতি, বিশ্বাস ও স্বাস্থ্য রূপরেখা' : 'Identity, Beliefs & Health Profile'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn'
                    ? 'ধর্ম, রাজনৈতিক মতাদর্শ, জাতিগত পরিচয়, যৌন অভিমুখিতা ও শারীরিক-মানসিক স্বাস্থ্য'
                    : 'Objective background dimensions: Faith, ideology, ethnicity, orientation, and health'}
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 border border-purple-800 print:bg-purple-100 print:text-purple-900">
              বস্তুনিষ্ঠ রূপরেখা
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300 space-y-1">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                ধর্ম ও আধ্যাত্মিক বিশ্বাস
              </span>
              <p className="text-xs text-slate-200 print:text-slate-900 font-semibold">
                {demographics.religionOrFaithBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300 space-y-1">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                রাজনৈতিক মতাদর্শ
              </span>
              <p className="text-xs text-slate-200 print:text-slate-900 font-semibold">
                {demographics.politicalIdeologyBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300 space-y-1">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                জাতিগত ও সাংস্কৃতিক পরিচয়
              </span>
              <p className="text-xs text-slate-200 print:text-slate-900 font-semibold">
                {demographics.ethnicIdentityBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300 space-y-1">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                যৌন অভিমুখিতা / সম্পর্ক দর্শন
              </span>
              <p className="text-xs text-slate-200 print:text-slate-900 font-semibold">
                {demographics.sexualOrientationBn}
              </p>
            </div>

            <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 print:bg-slate-50 print:border-slate-300 space-y-1 sm:col-span-2">
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-wider block">
                শারীরিক স্বাস্থ্য ও মানসিক সুস্থতা/অবস্থা
              </span>
              <p className="text-xs text-slate-200 print:text-slate-900 font-semibold">
                {demographics.healthAndMentalConditionsBn}
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 print:text-slate-600 italic">
            * {demographics.confidentialityNoteBn}
          </p>
        </div>
      </div>

      {/* Section 1: Merits / Virtues (Always visible in Print, filtered on screen) */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'virtues' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 flex items-center justify-center">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'শীর্ষ চারিত্রিক গুণাবলী ও শক্তি (Merits & Virtues)' : 'Top Virtues & Merits'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn'
                    ? 'আপনার স্বভাবের যে গুণগুলো আপনাকে স্বতন্ত্র ও সম্মানিত করে তোলে'
                    : 'The innate positive qualities that anchor your character'}
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300">
              {result.merits.length} {lang === 'bn' ? 'টি গুণ' : 'Virtues'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {result.merits.map((merit, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-5 transition-all group print:bg-slate-50 print:border-slate-300 print:p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-400 print:bg-emerald-200 print:text-emerald-900 text-xs font-bold flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="text-base font-bold text-emerald-300 group-hover:text-emerald-200 print:text-emerald-900">
                      {merit.name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60 text-xs text-emerald-400 print:bg-emerald-100 print:text-emerald-900 print:border-emerald-300">
                    <span>শক্তি মাত্রা:</span>
                    <span className="font-bold">{merit.strengthLevel}/১০</span>
                  </div>
                </div>
                <p className="text-sm text-slate-300 print:text-slate-800 leading-relaxed pl-8">
                  {merit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 2: Flaws & Vulnerabilities (Always visible in Print, filtered on screen) */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'flaws' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-800 flex items-center justify-center">
                <AlertOctagon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'চারিত্রিক দোষ, ত্রুটি ও আত্মশুদ্ধির উপায় (Flaws & Remedies)' : 'Flaws, Vulnerabilities & Remedies'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn'
                    ? 'দুর্বলতা চেনা দোষের নয়, বরং তা স্বীকার করে সংশোধন করাই মহৎ ব্যক্তির লক্ষণ'
                    : 'Recognizing flaws with kindness is the highest step toward greatness'}
                </p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-rose-950 text-rose-400 border border-rose-800 print:bg-rose-100 print:text-rose-900 print:border-rose-300">
              {result.flaws.length} {lang === 'bn' ? 'টি দুর্বলতা' : 'Flaws Identified'}
            </span>
          </div>

          <div className="space-y-5">
            {result.flaws.map((flaw, idx) => (
              <div
                key={idx}
                className="bg-slate-950/80 border border-slate-800/90 hover:border-rose-500/40 rounded-2xl p-5 sm:p-6 transition-all print:bg-slate-50 print:border-slate-300 print:p-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-lg bg-rose-500/10 text-rose-400 print:bg-rose-200 print:text-rose-900 text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-rose-300 print:text-rose-900">
                    {flaw.name}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs sm:text-sm pl-2 sm:pl-8">
                  {/* Trigger */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-white print:border-slate-300">
                    <p className="text-slate-400 print:text-amber-800 font-semibold mb-1 flex items-center gap-1.5 text-amber-300">
                      <span>⚡</span>
                      <span>{lang === 'bn' ? 'কী কারণে বা কখন ঘটে:' : 'Trigger Cause:'}</span>
                    </p>
                    <p className="text-slate-300 print:text-slate-800">{flaw.triggerCause}</p>
                  </div>

                  {/* Impact */}
                  <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 print:bg-white print:border-slate-300">
                    <p className="text-slate-400 print:text-rose-800 font-semibold mb-1 flex items-center gap-1.5 text-rose-300">
                      <span>⚠️</span>
                      <span>{lang === 'bn' ? 'ক্ষতিকর প্রভাব / ঝুঁকি:' : 'Negative Impact:'}</span>
                    </p>
                    <p className="text-slate-300 print:text-slate-800">{flaw.negativeImpact}</p>
                  </div>

                  {/* Remedy */}
                  <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40 print:bg-emerald-50 print:border-emerald-200">
                    <p className="text-emerald-300 print:text-emerald-900 font-semibold mb-1 flex items-center gap-1.5">
                      <span>💡</span>
                      <span>{lang === 'bn' ? 'সংশোধনের ব্যবহারিক উপায়:' : 'Remedy & Cure:'}</span>
                    </p>
                    <p className="text-emerald-200/90 print:text-emerald-950">{flaw.remedyAdvice}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 3: Good & Bad Habits Breakdown (Always visible in Print, filtered on screen) */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'habits' ? 'hidden print:block' : 'block'}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Good Habits Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800 print:border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 print:bg-emerald-100 print:text-emerald-800 flex items-center justify-center font-bold">
                ✓
              </div>
              <div>
                <h3 className="text-base font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'ভালো অভ্যাস ও তা আজীবন ধরে রাখার উপায়' : 'Positive Habits & Retention Strategy'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn' ? 'ধারাবাহিকতা বজায় রাখার বৈজ্ঞানিক টিপস' : 'Scientific tips to make virtues permanent'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {result.goodHabits.map((gh, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-emerald-400 print:text-emerald-800 shrink-0" />
                    <h5 className="text-sm font-bold text-slate-100 print:text-slate-900">{gh.habit}</h5>
                  </div>
                  <p className="text-xs text-slate-400 print:text-slate-700 mb-2 pl-6">
                    <strong className="text-slate-300 print:text-slate-900">{lang === 'bn' ? 'সুফল: ' : 'Benefit: '}</strong>
                    {gh.benefit}
                  </p>
                  <div className="ml-6 p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 text-xs text-emerald-300 print:bg-emerald-50 print:border-emerald-200 print:text-emerald-900">
                    <strong>{lang === 'bn' ? 'ধরে রাখার কৌশল: ' : 'Retention Tip: '}</strong>
                    {gh.retentionTip}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bad Habits Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
            <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-800 print:border-slate-200">
              <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 print:bg-rose-100 print:text-rose-800 flex items-center justify-center font-bold">
                ✕
              </div>
              <div>
                <h3 className="text-base font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? 'খারাপ অভ্যাস বর্জনের ৩-ধাপের বিজ্ঞানসম্মত কৌশল' : 'Breaking Bad Habits (3-Step Strategy)'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn' ? 'ক্ষতিকর আসক্তি বা স্বভাব থেকে মুক্তির পথ' : 'Actionable loop to rewire unwanted impulses'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {result.badHabits.map((bh, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 print:bg-slate-50 print:border-slate-300 print:p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-rose-400 print:text-rose-800 shrink-0" />
                    <h5 className="text-sm font-bold text-slate-100 print:text-slate-900">{bh.habit}</h5>
                  </div>
                  <p className="text-xs text-rose-300/90 print:text-rose-900 mb-2.5 pl-6">
                    <strong className="text-rose-400 print:text-rose-950">{lang === 'bn' ? 'ক্ষতি: ' : 'Danger: '}</strong>
                    {bh.danger}
                  </p>
                  <div className="ml-6 space-y-1.5">
                    {bh.breakingSteps?.map((step, sIdx) => (
                      <div key={sIdx} className="flex items-start gap-2 text-xs text-slate-300 print:text-slate-800">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-amber-400 print:bg-slate-200 print:text-slate-900 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          {sIdx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: 7-Day Character Reform Plan (Always visible in Print, filtered on screen) */}
      <div className={activeTabSection !== 'all' && activeTabSection !== 'plan' ? 'hidden print:block' : 'block'}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl print:bg-white print:border-slate-300 print:shadow-none print:p-5 print:break-inside-avoid">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800 print:border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 print:bg-amber-100 print:text-amber-800 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white print:text-slate-950">
                  {lang === 'bn' ? '৭ দিনের চারিত্রিক সংস্কার অ্যাকশন প্ল্যান' : '7-Day Character Transformation Blueprint'}
                </h3>
                <p className="text-xs text-slate-400 print:text-slate-600">
                  {lang === 'bn'
                    ? 'প্রতিদিন একটি করে ছোট কাজ সম্পন্ন করে নিজের দোষ জয় ও গুণ বিকশিত করুন'
                    : 'Transform your virtues and overcome weaknesses through micro-actions'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-300 print:text-slate-900">
                {lang === 'bn' ? `সম্পন্ন: ${completedDaysCount}/৭ দিন` : `Completed: ${completedDaysCount}/7 Days`}
              </span>
              <div className="w-24 bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800 print:bg-slate-200 print:border-slate-300">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 print:bg-emerald-600 transition-all duration-500"
                  style={{ width: `${(completedDaysCount / 7) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dayPlans.map((dayPlan) => (
              <div
                key={dayPlan.day}
                onClick={() => toggleDayTask(dayPlan.day)}
                className={`p-4 rounded-xl border cursor-pointer transition-all print:cursor-default ${
                  dayPlan.completed
                    ? 'bg-emerald-950/40 border-emerald-500/80 shadow-md print:bg-emerald-50 print:border-emerald-300'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 print:bg-slate-50 print:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-amber-300 print:bg-amber-100 print:text-amber-900 print:border-amber-300">
                    {lang === 'bn' ? `${dayPlan.day}ম দিন` : `Day ${dayPlan.day}`}
                  </span>
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center text-xs transition-colors ${
                      dayPlan.completed
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold print:bg-emerald-600 print:text-white'
                        : 'border-slate-600 print:border-slate-400'
                    }`}
                  >
                    {dayPlan.completed ? '✓' : ''}
                  </div>
                </div>

                <h4 className="text-sm font-bold text-slate-200 print:text-slate-900 mb-1">
                  {dayPlan.theme}
                </h4>
                <p className="text-xs text-slate-400 print:text-slate-700 leading-relaxed">
                  {dayPlan.task}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Philosophical Proverb Quote Card */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-amber-500/30 p-6 sm:p-8 text-center relative overflow-hidden shadow-lg print:bg-slate-50 print:border-slate-300 print:shadow-none print:break-inside-avoid">
        <BookOpen className="w-8 h-8 text-amber-400/60 print:text-amber-700 mx-auto mb-3" />
        <blockquote className="text-lg sm:text-xl font-medium text-amber-200/95 print:text-slate-900 italic max-w-2xl mx-auto mb-2">
          "{result.philosophicalQuote.bengaliQuote}"
        </blockquote>
        <p className="text-xs font-bold uppercase tracking-wider text-amber-400 print:text-amber-800">
          — {result.philosophicalQuote.authorOrContext}
        </p>
        <p className="text-xs text-slate-400 print:text-slate-600 mt-2 max-w-xl mx-auto">
          {result.philosophicalQuote.significance}
        </p>
      </div>

      {/* Dedicated PDF Export & Archive Center (Visible in App, Hidden in Print) */}
      <div className="bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/50 border border-emerald-500/30 rounded-2xl p-6 sm:p-8 space-y-6 print:hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-emerald-900/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Download className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                <span>{lang === 'bn' ? 'সম্পূর্ণ চারিত্রিক রিপোর্ট ডাউনলোড ও সংরক্ষণ' : 'Export & Save Full Character Report'}</span>
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {lang === 'bn'
                  ? 'ভবিষ্যতের আত্মউন্নয়ন পর্যালোচনা বা শুভাকাঙ্ক্ষীদের সাথে শেয়ারের জন্য A4 পিডিএফ ডকুমেন্ট আকারে সংরক্ষণ করুন'
                  : 'Save this comprehensive analysis as a professional, printable A4 PDF document for your records'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Option 1: PDF Download */}
          <div className="bg-slate-950/90 border border-emerald-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-emerald-400 transition-all shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <FileText className="w-4 h-4" />
                <span>{lang === 'bn' ? 'অফিশিয়াল পিডিএফ (PDF)' : 'Official PDF Document'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'bn'
                  ? 'A4 সাইজের প্রামাণ্য সনদ ও পূর্ণ বিবরণী। প্রিন্ট ডায়ালগে "Save as PDF" নির্বাচন করুন।'
                  : 'A4 formatted official document. Select "Save as PDF" in destination.'}
              </p>
            </div>
            <button
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/60 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{lang === 'bn' ? 'পিডিএফ ডাউনলোড করুন' : 'Download PDF'}</span>
            </button>
          </div>

          {/* Option 2: Direct Print */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Printer className="w-4 h-4" />
                <span>{lang === 'bn' ? 'কাগজে সরাসরি প্রিন্ট' : 'Direct Print'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'bn'
                  ? 'প্রিন্টারের মাধ্যমে সরাসরি হার্ডকপি প্রিন্ট করে নিজের পড়ার টেবিলে বা ফাইলে রাখুন।'
                  : 'Send directly to physical printer for desk study or filing.'}
              </p>
            </div>
            <button
              onClick={handleDownloadPdf}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>{lang === 'bn' ? 'প্রিন্ট পেজ খুলুন' : 'Open Print'}</span>
            </button>
          </div>

          {/* Option 3: Offline Standalone HTML File */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-all">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                <FileDown className="w-4 h-4" />
                <span>{lang === 'bn' ? 'অফলাইন ফাইল (.html)' : 'Offline Archive'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'bn'
                  ? 'এক ক্লিকে আপনার ফোনে/পিসিতে ডাউনলোড করুন। ইন্টারনেট ছাড়াই যেকোনো ব্রাউজারে চলবে।'
                  : 'Instant direct download. Works forever without internet on any device.'}
              </p>
            </div>
            <button
              onClick={handleDownloadOfflineHtml}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-cyan-400" />
              <span>{downloadingHtml ? (lang === 'bn' ? 'সংরক্ষিত হচ্ছে...' : 'Saving...') : (lang === 'bn' ? 'ফাইল ডাউনলোড' : 'Download File')}</span>
            </button>
          </div>

          {/* Option 4: Web Share & Social Sharing */}
          <div className="bg-slate-950/90 border border-indigo-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 hover:border-indigo-400 transition-all shadow-md">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <Share2 className="w-4 h-4" />
                <span>{lang === 'bn' ? 'স্মার্ট শেয়ার ও লিংক' : 'Smart Share'}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {lang === 'bn'
                  ? 'হোয়াটসঅ্যাপ, ফেসবুক, টেলিগ্রাম বা মোবাইলের যেকোনো অ্যাপে সহজে ফলাফল পাঠান।'
                  : 'Instantly share summary link via Web Share API, WhatsApp, or socials.'}
              </p>
            </div>
            <button
              onClick={handleWebShare}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-950/60 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>{lang === 'bn' ? 'শেয়ার বা লিংক নিন' : 'Share Report'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Official Printable Footer & Verification Seal (Visible ONLY in Print / PDF) */}
      <div className="hidden print:block mt-8 pt-4 border-t-2 border-slate-400 text-slate-700 text-xs break-inside-avoid bg-white">
        <div className="flex items-end justify-between">
          <div className="max-w-md space-y-1">
            <p className="font-bold text-slate-900 text-xs">
              চরিত্র দর্পন — চারিত্রিক ও আচরণিক মনস্তাত্ত্বিক গবেষণা বোর্ড (AI Studio)
            </p>
            <p className="text-[10px] text-slate-600 leading-relaxed">
              এই মূল্যায়নপত্রটি কৃত্রিম বুদ্ধিমত্তা ও আন্তর্জাতিক সাইকোমেট্রিক মানদণ্ডের সমন্বয়ে প্রস্তুতকৃত। এটি ব্যক্তির চারিত্রিক শক্তি, আত্মশুদ্ধির ক্ষেত্র ও দৈনন্দিন অভ্যাস পর্যবেক্ষণের একটি স্বয়ংসম্পূর্ণ প্রামাণ্য দলিল।
            </p>
            <p className="text-[9px] text-slate-500 font-mono">
              সনদ ট্র্যাকিং কোড: {reportId} • যাচাইকরণ তারিখ: {assessmentDate}
            </p>
          </div>

          <div className="text-center border-2 border-dashed border-emerald-700 p-2.5 rounded-xl bg-emerald-50/50 min-w-[150px]">
            <div className="w-8 h-8 mx-auto mb-1 rounded-full border border-emerald-700 flex items-center justify-center text-[7px] font-bold text-emerald-800">
              AI VERIFIED
            </div>
            <p className="text-[10px] font-bold text-slate-900">ডিজিটাল সিলমোহর</p>
            <p className="text-[9px] text-emerald-800 font-semibold">প্রত্যয়ন ও প্রতিপাদিত</p>
          </div>
        </div>
      </div>

      {/* Share Success Toast Notification */}
      {shareSuccessToast && (
        <div className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-emerald-950/95 border border-emerald-500/80 text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-xl text-xs font-semibold">
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{lang === 'bn' ? 'সফলভাবে শেয়ার করা হয়েছে!' : 'Shared successfully!'}</span>
          </div>
        </div>
      )}

      {/* Share Modal Dialog (Fallback or on-demand sharing hub) */}
      {isShareModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200 print:hidden"
          onClick={() => setIsShareModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white">
                    {lang === 'bn' ? 'চরিত্র দর্পন রিপোর্ট শেয়ার করুন' : 'Share Personality Report'}
                  </h4>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn'
                      ? 'বন্ধু বা শুভাকাঙ্ক্ষীদের সাথে ফলাফল শেয়ার করুন'
                      : 'Share this character analysis report with others'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Preview Card */}
            <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  {lang === 'bn' ? 'প্রার্থী:' : 'Candidate:'}{' '}
                  <strong className="text-white">
                    {result.personName || (lang === 'bn' ? 'ব্যক্তিগত স্ব-মূল্যায়ন' : 'Self Assessment')}
                  </strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                  {result.archetypeTitle}
                </span>
              </div>
              <p className="text-xs text-slate-300 italic line-clamp-2">
                "{result.archetypeSummary}"
              </p>
            </div>

            {/* Native Web Share Button (if supported) */}
            {typeof navigator !== 'undefined' && typeof navigator.share === 'function' && (
              <button
                onClick={() => {
                  const { title, text, url } = getSharePayload();
                  navigator.share({ title, text, url }).then(() => {
                    setIsShareModalOpen(false);
                    setShareSuccessToast(true);
                    setTimeout(() => setShareSuccessToast(false), 3000);
                  }).catch(() => {});
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg transition-all"
              >
                <Share2 className="w-4 h-4" />
                <span>{lang === 'bn' ? 'মোবাইলের অন্য অ্যাপে পাঠান (Direct Share)' : 'Send via Native Apps'}</span>
              </button>
            )}

            {/* Social Sharing Channels */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-400">
                {lang === 'bn' ? 'সোশ্যাল মিডিয়া ও মেসেঞ্জার:' : 'Social & Messaging Platforms:'}
              </p>
              <div className="grid grid-cols-3 gap-2">
                {/* WhatsApp */}
                <button
                  onClick={() => {
                    const { text, url } = getSharePayload();
                    const shareText = encodeURIComponent(`${text}\n${url}`);
                    window.open(`https://api.whatsapp.com/send?text=${shareText}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 text-xs font-semibold transition-all"
                >
                  <MessageCircle className="w-4 h-4 text-emerald-400" />
                  <span>WhatsApp</span>
                </button>

                {/* Telegram */}
                <button
                  onClick={() => {
                    const { text, url } = getSharePayload();
                    const shareUrl = encodeURIComponent(url);
                    const shareText = encodeURIComponent(text);
                    window.open(`https://t.me/share/url?url=${shareUrl}&text=${shareText}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-950/60 hover:bg-sky-900/80 text-sky-300 border border-sky-700/60 text-xs font-semibold transition-all"
                >
                  <Send className="w-4 h-4 text-sky-400" />
                  <span>Telegram</span>
                </button>

                {/* Facebook */}
                <button
                  onClick={() => {
                    const { url } = getSharePayload();
                    const shareUrl = encodeURIComponent(url);
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`, '_blank');
                  }}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-700/60 text-xs font-semibold transition-all"
                >
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Facebook</span>
                </button>
              </div>
            </div>

            {/* Copy Link & Summary Action Rows */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex gap-2">
                <button
                  onClick={handleCopyShareLink}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                >
                  {shareCopiedLink ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400">{lang === 'bn' ? 'লিংক কপি হয়েছে!' : 'Link Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400" />
                      <span>{lang === 'bn' ? 'শেয়ার লিংক কপি' : 'Copy Link'}</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleCopySummary}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-teal-400" />
                      <span className="text-teal-400">{lang === 'bn' ? 'সারাংশ কপি হয়েছে!' : 'Copied!'}</span>
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 text-teal-400" />
                      <span>{lang === 'bn' ? 'টেক্সট বিবরণী কপি' : 'Copy Full Summary'}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

