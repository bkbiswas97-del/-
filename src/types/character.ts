export interface QuizQuestion {
  id: string;
  category: 'integrity' | 'patience' | 'emotion' | 'empathy' | 'grit' | 'humility' | 'cognition' | 'online_behavior';
  categoryTitleBn: string;
  categoryTitleEn: string;
  questionBn: string;
  questionEn: string;
  options: {
    textBn: string;
    textEn: string;
    score: number; // 1 to 5
    traitRefBn: string;
    traitRefEn: string;
  }[];
}

export interface HabitItem {
  id: string;
  nameBn: string;
  nameEn: string;
  categoryBn: string;
  categoryEn: string;
  type: 'good' | 'bad';
  descriptionBn: string;
  descriptionEn: string;
}

export interface SituationalDilemma {
  id: string;
  titleBn: string;
  titleEn: string;
  scenarioBn: string;
  scenarioEn: string;
  choices: {
    id: string;
    textBn: string;
    textEn: string;
    moralQualityBn: string;
    moralQualityEn: string;
    characterWeight: {
      integrity: number;
      empathy: number;
      patience: number;
      courage: number;
    };
  }[];
}

export interface ZodiacTrait {
  signBn: string;
  signEn: string;
  symbol: string;
  dateRangeBn: string;
  dateRangeEn: string;
  elementBn: string;
  elementEn: string;
  topVirtuesBn: string[];
  topVirtuesEn: string[];
  topFlawsBn: string[];
  topFlawsEn: string[];
  idealHabitsBn: string[];
  idealHabitsEn: string[];
  cautionBn: string;
  cautionEn: string;
}

export interface Merit {
  name: string;
  description: string;
  strengthLevel: number; // 1-10
}

export interface Flaw {
  name: string;
  triggerCause: string;
  negativeImpact: string;
  remedyAdvice: string;
}

export interface GoodHabitAdvice {
  habit: string;
  benefit: string;
  retentionTip: string;
}

export interface BadHabitAdvice {
  habit: string;
  danger: string;
  breakingSteps: string[];
}

export interface PillarsScore {
  honestyAndIntegrity: number;
  patienceAndCalmness: number;
  emotionalRegulation: number;
  socialEmpathy: number;
  gritAndDiscipline: number;
  selfAwareness: number;
}

export interface ReformDayPlan {
  day: number;
  theme: string;
  task: string;
  completed?: boolean;
}

export interface PhilosophicalQuote {
  bengaliQuote: string;
  authorOrContext: string;
  significance: string;
}

export interface SubMetric {
  titleBn: string;
  score: number; // 0-100
  statusBn: string; // যেমন: "উচ্চ", "মধ্যম", "উন্নতি প্রয়োজন"
  observationBn: string; // সুনির্দিষ্ট পর্যবেক্ষণ ও বিশ্লেষণ
}

export interface ProfessionalCommunication {
  styleTitleBn: string; // যেমন: "কৌশলী, ধীরস্থির ও উপাত্তনির্ভর যোগাযোগ"
  workplaceToneBn: string; // কর্মক্ষেত্রে কথার ভঙ্গি ও পেশাগত শিষ্টাচার
  conflictResolutionBn: string; // সহকর্মী বা পার্টনারের সাথে মতবিরোধ নিরসনের ধরন
  teamCollaborationBn: string; // দলগত কাজ ও সহমর্মিতার মাত্রা
  leadershipOrFollowershipBn: string; // দায়িত্ব পালন ও নেতৃত্ব গ্রহণের দৃষ্টিভঙ্গি
  recommendationBn: string; // পেশাগত যোগাযোগের মান বৃদ্ধির পরামর্শ
}

export interface Category7DecisionAndCognition {
  categoryTitleBn: string; // "ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা"
  overallScore: number; // 0-100
  summaryBn: string;
  logicalDiscussionTendency: SubMetric; // যুক্তিনির্ভর আলোচনার প্রবণতা
  factCheckingHabit: SubMetric; // তথ্য যাচাইয়ের অভ্যাস
  decisionJustificationAbility: SubMetric; // সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা
  alternativePerspectives: SubMetric; // ভিন্ন দৃষ্টিভঙ্গি বিবেচনা
  learningFromMistakes: SubMetric; // ভুল থেকে শেখার প্রকাশ্য উদাহরণ
  problemAnalysisApproach: SubMetric; // সমস্যা বিশ্লেষণের ধরন
}

export interface Category8OnlineBehaviorConsistency {
  categoryTitleBn: string; // "ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা"
  consistencyScore: number; // 0-100
  summaryBn: string;
  postContentType: {
    categoryBn: string;
    descriptionBn: string;
    primaryThemes: string[];
  }; // পোস্টের বিষয়বস্তুর ধরন
  opinionEvolutionOverTime: {
    patternBn: string;
    detailsBn: string;
    maturityLevelBn: string;
  }; // সময়ের সঙ্গে মতামতের পরিবর্তন
  publicBehaviorConsistency: {
    score: number; // 0-100
    alignmentBn: string; // মুখের কথা ও প্রকাশ্য আচরণের সামঞ্জস্য
    detailsBn: string;
  }; // প্রকাশ্য আচরণের ধারাবাহিকতা
  positiveToNegativeRatio: {
    ratioString: string; // যেমন: "৭০% ইতিবাচক : ৩০% সমালোচনামূলক"
    positivePercentage: number;
    negativePercentage: number;
    toneAnalysisBn: string;
  }; // ইতিবাচক ও নেতিবাচক কনটেন্টের অনুপাত
  interpersonalStyle: {
    styleBn: string;
    toneBn: string;
    engagementMannerBn: string;
  }; // অন্যের সঙ্গে যোগাযোগের ধরন
  mistakeCorrectionHistory: {
    hasAdmittedErrors: boolean;
    frequencyBn: string;
    detailsBn: string;
  }; // নিজের ভুল সংশোধনের ইতিহাস
}

export interface DemographicsAndIdentity {
  religionOrFaithBn: string; // ধর্ম বা বিশ্বাসের রূপরেখা
  politicalIdeologyBn: string; // রাজনৈতিক মতাদর্শ ও বিশ্বদর্শন
  ethnicIdentityBn: string; // জাতিগত ও সাংস্কৃতিক পরিচয়
  sexualOrientationBn: string; // যৌন অভিমুখিতা ও সম্পর্ক দর্শন
  healthAndMentalConditionsBn: string; // শারীরিক স্বাস্থ্য বা মানসিক সুস্থতা/উদ্বেগ
  confidentialityNoteBn: string; // গোপনীয়তা ও সুরক্ষা ব্যাখ্যা
}

export interface RiskAndSafetyAudit {
  isScammerOrFraud: boolean; // প্রতারক বা জালিয়াতির স্পষ্ট লক্ষণ
  isHabitualLiar: boolean; // মিথ্যাবাদী বা বানোয়াট তথ্য প্রকাশের অভ্যাস
  isDangerousOrToxic: boolean; // বিপজ্জনক, সহিংস বা ক্ষতিকর মনোভাব
  overallRiskLevel: 'safe' | 'low_risk' | 'moderate_risk' | 'high_danger' | 'critical';
  safetyScore: number; // ০ থেকে ১০০ (১০০ মানে পরম নিরাপদ ও বিশ্বস্ত, ৩০ এর নিচে মানে উচ্চ ঝুঁকি)
  fraudRiskAssessmentBn: string; // প্রতারণা ও আর্থিক সততার মূল্যায়ন
  honestyRiskAssessmentBn: string; // সত্যবাদিতা ও মিথ্যাচার প্রবণতা বিশ্লেষণ
  dangerAssessmentBn: string; // বিপজ্জনকতা, বিষাক্ততা বা ক্ষতির ঝুঁকি বিশ্লেষণ
  redFlagsBn: string[]; // সতর্কতা সংকেত (Red Flags)
  safetyAdviceBn: string; // সুরক্ষার জন্য ব্যবহারিক করণীয় ও গাইডলাইন
}

export interface SocialPersonalityScorecard {
  reportTitle: string; // 'Social Personality Report'
  disclaimerBn: string; // 'কাল্পনিক উদাহরণ · প্রকৃত ব্যক্তির মূল্যায়ন নয়'
  kpis: {
    positiveCommunication: number; // e.g. 82
    constructiveDiscussion: number; // e.g. 75
    opinionConsistency: number; // e.g. 68
    collaborativeBehavior: number; // e.g. 79
  };
  traitBreakdown: {
    nameBn: string;
    score: number;
    descriptionBn?: string;
  }[];
  aiObservationsBn: string[];
}

export interface DestructiveHabitItem {
  hasTendency: boolean; // আসক্তি বা ক্ষতিকর প্রবণতা আছে কি না
  levelBn: string; // যেমন: "আসক্তিমুক্ত / স্বাভাবিক", "মৃদু প্রবণতা", "মাঝারি ঝুঁকি", "উচ্চ আসক্তি / চরম সংকট"
  statusKey: 'clean' | 'mild' | 'moderate' | 'severe';
  score: number; // ০ থেকে ১০০ (০ মানে আসক্তিমুক্ত, ১০০ মানে চরম আসক্তি)
  manifestationBn: string; // আচরণগত বা মনস্তাত্ত্বিক বহিঃপ্রকাশ
  impactBn: string; // ব্যক্তিগত, পারিবারিক বা সামাজিক জীবনে ক্ষতিকর প্রভাব
  remedyAdviceBn: string; // মুক্তির বৈজ্ঞানিক ও মনস্তাত্ত্বিক উপায়
}

export interface DestructiveHabitsAndAddictions {
  categoryTitleBn: string; // 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা'
  overallRiskLevelBn: string; // 'ঝুঁকিমুক্ত' | 'সতর্কতা প্রয়োজন' | 'উচ্চ আসক্তি সংকেত'
  overallScore: number; // সামগ্রিক আসক্তি ও নৈতিক বিচ্যুতি স্কোর (০-১০০)
  summaryBn: string; // সামগ্রিক মনস্তাত্ত্বিক সারসংক্ষেপ
  substanceAddiction: DestructiveHabitItem; // ১. নেশা করা (ধূমপান, অ্যালকোহল, মাদকদ্রব্য, জুয়া)
  recklessSpending: DestructiveHabitItem; // ২. অযাচিত খরচ করা ও আর্থিক বেহিসাবিপনা
  excessiveTalking: DestructiveHabitItem; // ৩. অতিরিক্ত কথা বলা ও প্রগলভতা
  toxicBehavior: DestructiveHabitItem; // ৪. খারাপ ব্যবহার, কর্কশতা ও অবমাননাকর আচরণ
  multipleRomanticObsessions: DestructiveHabitItem; // ৫. একাধিক নারী আসক্তি / বহুগামিতা / অনৈতিক সম্পর্ক
  sexualAddiction: DestructiveHabitItem; // ৬. যৌনাচারের আসক্তি / নৈতিক কামাসক্তি / অতিযৌনতা
}

export interface CharacterAnalysisResult {
  archetypeTitle: string;
  archetypeSummary: string;
  merits: Merit[];
  flaws: Flaw[];
  goodHabits: GoodHabitAdvice[];
  badHabits: BadHabitAdvice[];
  pillarsScore: PillarsScore;
  sevenDayReformPlan: ReformDayPlan[];
  philosophicalQuote: PhilosophicalQuote;
  professionalCommunication?: ProfessionalCommunication;
  category7DecisionAndCognition?: Category7DecisionAndCognition;
  category8OnlineBehaviorConsistency?: Category8OnlineBehaviorConsistency;
  demographicsAndIdentity?: DemographicsAndIdentity;
  riskAndSafetyAudit?: RiskAndSafetyAudit;
  socialPersonalityScorecard?: SocialPersonalityScorecard;
  destructiveHabitsAndAddictions?: DestructiveHabitsAndAddictions;
  timestamp?: number;
  personName?: string;
}

export interface SocialAnalysisResult {
  targetHandleOrName: string;
  platform: string;
  profileUrl: string;
  identitySummary: {
    archetypeTitle: string;
    vibeSummary: string;
    inferredProfessionOrRole: string;
    introvertExtrovertRatio: string;
    digitalAura: string;
  };
  characterAndTraits: {
    coreTraits: string[];
    topVirtues: { name: string; description: string; score: number }[];
    topFlaws: { name: string; whyItShows: string; risk: string; advice: string }[];
  };
  habits: {
    goodHabits: { habit: string; manifestation: string }[];
    badHabits: { habit: string; negativeEffect: string; cure: string }[];
  };
  psychology: {
    emotionalTriggers: string[];
    decisionStyle: string;
    stressResponse: string;
    mindsetArchetype: string;
  };
  likesAndDislikes: {
    favoriteTopicsAndInterests: string[];
    petPeevesAndDislikes: string[];
    contentPreferences: string[];
  };
  addictionsAndWeaknesses: {
    digitalAddictions: string[];
    materialOrEmotionalWeaknesses: string[];
    hiddenVulnerabilities: string[];
  };
  lifestyle: {
    dailyRhythm: string;
    aestheticAndFashionTaste: string;
    socialCircleNature: string;
    spendingTendency: string;
  };
  communicationAndDatingAdvice: {
    howToImpressThem: string[];
    thingsToAvoidSaying: string[];
    compatibilityTips: string;
  };
  professionalCommunication?: ProfessionalCommunication;
  category7DecisionAndCognition?: Category7DecisionAndCognition;
  category8OnlineBehaviorConsistency?: Category8OnlineBehaviorConsistency;
  demographicsAndIdentity?: DemographicsAndIdentity;
  riskAndSafetyAudit?: RiskAndSafetyAudit;
  socialPersonalityScorecard?: SocialPersonalityScorecard;
  destructiveHabitsAndAddictions?: DestructiveHabitsAndAddictions;
  timestamp?: number;
}

export interface SavedProfile {
  id: string;
  name: string;
  date: string;
  result: CharacterAnalysisResult;
}

export interface SavedSocialReport {
  id: string;
  target: string;
  platform: string;
  date: string;
  data: SocialAnalysisResult;
}

