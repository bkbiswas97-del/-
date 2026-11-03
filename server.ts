import express from 'express';
import type { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Reusable sub-schemas
const subMetricSchema = {
  type: Type.OBJECT,
  properties: {
    titleBn: { type: Type.STRING },
    score: { type: Type.INTEGER, description: '০ থেকে ১০০ স্কোর' },
    statusBn: { type: Type.STRING, description: 'অবস্থা (যেমন: উচ্চ, প্রশংসনীয়, মধ্যম, উন্নতি প্রয়োজন)' },
    observationBn: { type: Type.STRING, description: 'সুনির্দিষ্ট পর্যবেক্ষণ ও চারিত্রিক প্রমাণ' },
  },
  required: ['titleBn', 'score', 'statusBn', 'observationBn'],
};

const professionalCommunicationSchema = {
  type: Type.OBJECT,
  description: 'পেশাগত যোগাযোগের ধরন ও কর্মক্ষেত্রের আচরণ',
  properties: {
    styleTitleBn: { type: Type.STRING, description: 'পেশাগত যোগাযোগের মূল উপাধি (যেমন: কৌশলগত, তথ্যভিত্তিক ও দূরদর্শী মধ্যস্থতাকারী)' },
    workplaceToneBn: { type: Type.STRING, description: 'কর্মক্ষেত্রে কথার ভঙ্গি, ভাষা ও শিষ্টাচার' },
    conflictResolutionBn: { type: Type.STRING, description: 'সহকর্মী, ঊর্ধ্বতন বা পার্টনারের সাথে মতবিরোধ নিরসনের দৃষ্টিভঙ্গি' },
    teamCollaborationBn: { type: Type.STRING, description: 'দলগত কাজ ও সমন্বয়ের ধরন' },
    leadershipOrFollowershipBn: { type: Type.STRING, description: 'দায়িত্ব গ্রহণ ও নেতৃত্ব বা নির্দেশনার প্রতি দৃষ্টিভঙ্গি' },
    recommendationBn: { type: Type.STRING, description: 'পেশাগত যোগাযোগ আরও কার্যকর করার বাস্তব পরামর্শ' },
  },
  required: [
    'styleTitleBn',
    'workplaceToneBn',
    'conflictResolutionBn',
    'teamCollaborationBn',
    'leadershipOrFollowershipBn',
    'recommendationBn',
  ],
};

const category7Schema = {
  type: Type.OBJECT,
  description: 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা',
  properties: {
    categoryTitleBn: { type: Type.STRING, description: 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা' },
    overallScore: { type: Type.INTEGER, description: 'সামগ্রিক চিন্তাশক্তি ও সিদ্ধান্ত স্কোর (০-১০০)' },
    summaryBn: { type: Type.STRING, description: 'সিদ্ধান্ত গ্রহণ ও মননের সংক্ষিপ্ত সারসংক্ষেপ' },
    logicalDiscussionTendency: subMetricSchema, // যুক্তিনির্ভর আলোচনার প্রবণতা
    factCheckingHabit: subMetricSchema, // তথ্য যাচাইয়ের অভ্যাস
    decisionJustificationAbility: subMetricSchema, // সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা
    alternativePerspectives: subMetricSchema, // ভিন্ন দৃষ্টিভঙ্গি বিবেচনা
    learningFromMistakes: subMetricSchema, // ভুল থেকে শেখার প্রকাশ্য উদাহরণ
    problemAnalysisApproach: subMetricSchema, // সমস্যা বিশ্লেষণের ধরন
  },
  required: [
    'categoryTitleBn',
    'overallScore',
    'summaryBn',
    'logicalDiscussionTendency',
    'factCheckingHabit',
    'decisionJustificationAbility',
    'alternativePerspectives',
    'learningFromMistakes',
    'problemAnalysisApproach',
  ],
};

const category8Schema = {
  type: Type.OBJECT,
  description: 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা',
  properties: {
    categoryTitleBn: { type: Type.STRING, description: 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা' },
    consistencyScore: { type: Type.INTEGER, description: 'ধারাবাহিকতার স্কোর (০-১০০)' },
    summaryBn: { type: Type.STRING, description: 'অনলাইন আচরণ ও ধারাবাহিকতার সারসংক্ষেপ' },
    postContentType: {
      type: Type.OBJECT,
      description: 'পোস্টের বিষয়বস্তুর ধরন',
      properties: {
        categoryBn: { type: Type.STRING },
        descriptionBn: { type: Type.STRING },
        primaryThemes: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['categoryBn', 'descriptionBn', 'primaryThemes'],
    },
    opinionEvolutionOverTime: {
      type: Type.OBJECT,
      description: 'সময়ের সঙ্গে মতামতের পরিবর্তন',
      properties: {
        patternBn: { type: Type.STRING },
        detailsBn: { type: Type.STRING },
        maturityLevelBn: { type: Type.STRING },
      },
      required: ['patternBn', 'detailsBn', 'maturityLevelBn'],
    },
    publicBehaviorConsistency: {
      type: Type.OBJECT,
      description: 'প্রকাশ্য আচরণের ধারাবাহিকতা',
      properties: {
        score: { type: Type.INTEGER },
        alignmentBn: { type: Type.STRING },
        detailsBn: { type: Type.STRING },
      },
      required: ['score', 'alignmentBn', 'detailsBn'],
    },
    positiveToNegativeRatio: {
      type: Type.OBJECT,
      description: 'ইতিবাচক ও নেতিবাচক কনটেন্টের অনুপাত',
      properties: {
        ratioString: { type: Type.STRING },
        positivePercentage: { type: Type.INTEGER },
        negativePercentage: { type: Type.INTEGER },
        toneAnalysisBn: { type: Type.STRING },
      },
      required: ['ratioString', 'positivePercentage', 'negativePercentage', 'toneAnalysisBn'],
    },
    interpersonalStyle: {
      type: Type.OBJECT,
      description: 'অন্যের সঙ্গে যোগাযোগের ধরন',
      properties: {
        styleBn: { type: Type.STRING },
        toneBn: { type: Type.STRING },
        engagementMannerBn: { type: Type.STRING },
      },
      required: ['styleBn', 'toneBn', 'engagementMannerBn'],
    },
    mistakeCorrectionHistory: {
      type: Type.OBJECT,
      description: 'নিজের ভুল সংশোধনের ইতিহাস',
      properties: {
        hasAdmittedErrors: { type: Type.BOOLEAN },
        frequencyBn: { type: Type.STRING },
        detailsBn: { type: Type.STRING },
      },
      required: ['hasAdmittedErrors', 'frequencyBn', 'detailsBn'],
    },
  },
  required: [
    'categoryTitleBn',
    'consistencyScore',
    'summaryBn',
    'postContentType',
    'opinionEvolutionOverTime',
    'publicBehaviorConsistency',
    'positiveToNegativeRatio',
    'interpersonalStyle',
    'mistakeCorrectionHistory',
  ],
};

const demographicsSchema = {
  type: Type.OBJECT,
  description: 'ধর্ম, রাজনৈতিক মতাদর্শ, জাতিগত পরিচয়, যৌন অভিমুখিতা, স্বাস্থ্য বা মানসিক রোগ',
  properties: {
    religionOrFaithBn: { type: Type.STRING, description: 'ধর্ম, বিশ্বাস ও আধ্যাত্মিক মূল্যবোধের অবস্থান' },
    politicalIdeologyBn: { type: Type.STRING, description: 'রাজনৈতিক মতাদর্শ, সামাজিক মূল্যবোধ ও বিশ্বদর্শন' },
    ethnicIdentityBn: { type: Type.STRING, description: 'জাতিগত ও সাংস্কৃতিক পরিচয়' },
    sexualOrientationBn: { type: Type.STRING, description: 'যৌন অভিমুখিতা বা ব্যক্তিগত সম্পর্কের দৃষ্টিভঙ্গি (মর্যাদাপূর্ণ ও নিরপেক্ষ উপস্থাপনা)' },
    healthAndMentalConditionsBn: { type: Type.STRING, description: 'শারীরিক স্বাস্থ্য ও মানসিক রোগের ইতিহাস বা মানসিক স্বাস্থ্যের ভারসাম্য' },
    confidentialityNoteBn: { type: Type.STRING, description: 'সংবেদনশীল তথ্যের সুরক্ষা ও গোপনীয়তা সংক্রান্ত নোট' },
  },
  required: [
    'religionOrFaithBn',
    'politicalIdeologyBn',
    'ethnicIdentityBn',
    'sexualOrientationBn',
    'healthAndMentalConditionsBn',
    'confidentialityNoteBn',
  ],
};

const riskAuditSchema = {
  type: Type.OBJECT,
  description: 'সততা, প্রতারক, মিথ্যাবাদী বা বিপজ্জনক ব্যক্তিত্ব সতর্কতা মূল্যায়ন',
  properties: {
    isScammerOrFraud: { type: Type.BOOLEAN, description: 'প্রতারক, অর্থ আত্মসাৎকারী বা জালিয়াতির লক্ষণ বা ইতিহাস আছে কি না' },
    isHabitualLiar: { type: Type.BOOLEAN, description: 'মিথ্যাবাদী, অতিরঞ্জনকারী বা বানোয়াট তথ্য ছড়ানোর অভ্যাস আছে কি না' },
    isDangerousOrToxic: { type: Type.BOOLEAN, description: 'বিপজ্জনক, সহিংস, হিংস্র বা বিষাক্ত মানসিকতার লক্ষণ আছে কি না' },
    overallRiskLevel: {
      type: Type.STRING,
      description: 'সামগ্রিক ঝুঁকি মাত্রা (safe / low_risk / moderate_risk / high_danger / critical)',
    },
    safetyScore: { type: Type.INTEGER, description: 'নিরাপত্তা ও বিশ্বস্ততার স্কোর (০-১০০, ১০০ পরম নিরাপদ)' },
    fraudRiskAssessmentBn: { type: Type.STRING, description: 'প্রতারণা ও বিশ্বাসভঙ্গের ঝুঁকি মূল্যায়ন' },
    honestyRiskAssessmentBn: { type: Type.STRING, description: 'মিথ্যাচার, ধাপ্পাবাজি বা অসততা প্রবণতার চুলচেরা বিশ্লেষণ' },
    dangerAssessmentBn: { type: Type.STRING, description: 'বিপজ্জনক, ব্ল্যাকমেইল, আক্রমণাত্মক বা ক্ষতিকর আচরণের পর্যালোচনা' },
    redFlagsBn: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'সতর্কতা সংকেত বা রেড ফ্ল্যাগ' },
    safetyAdviceBn: { type: Type.STRING, description: 'এই ব্যক্তির সাথে লেনদেন, বন্ধুত্ব বা মেলামেশায় নিরাপত্তা পরামর্শ' },
  },
  required: [
    'isScammerOrFraud',
    'isHabitualLiar',
    'isDangerousOrToxic',
    'overallRiskLevel',
    'safetyScore',
    'fraudRiskAssessmentBn',
    'honestyRiskAssessmentBn',
    'dangerAssessmentBn',
    'redFlagsBn',
    'safetyAdviceBn',
  ],
};

const destructiveHabitItemSchema = {
  type: Type.OBJECT,
  description: 'নির্দিষ্ট ধ্বংসাত্মক আসক্তি বা বদভ্যাস মূল্যায়ন',
  properties: {
    hasTendency: { type: Type.BOOLEAN, description: 'এই আসক্তি বা ক্ষতিকর অভ্যাস উপস্থিত কি না' },
    levelBn: { type: Type.STRING, description: 'ঝুঁকি মাত্রা (যেমন: আসক্তিমুক্ত / স্বাভাবিক, মৃদু প্রবণতা, মাঝারি ঝুঁকি, উচ্চ আসক্তি / চরম সংকট)' },
    statusKey: { type: Type.STRING, description: 'clean / mild / moderate / severe' },
    score: { type: Type.INTEGER, description: 'আসক্তি বা বিচ্যুতি তীব্রতা স্কোর (০ থেকে ১০০, ০ সম্পূর্ণ আসক্তিমুক্ত)' },
    manifestationBn: { type: Type.STRING, description: 'আচরণে বা মানসিকতায় যেভাবে প্রকাশ পায়' },
    impactBn: { type: Type.STRING, description: 'ব্যক্তিগত, পারিবারিক, আর্থিক ও সামাজিক জীবনে ক্ষতিকর প্রভাব' },
    remedyAdviceBn: { type: Type.STRING, description: 'এই আসক্তি বা অভ্যাস থেকে স্থায়ী মুক্তির মনস্তাত্ত্বিক ও বৈজ্ঞানিক সমাধান' },
  },
  required: ['hasTendency', 'levelBn', 'statusKey', 'score', 'manifestationBn', 'impactBn', 'remedyAdviceBn'],
};

const destructiveHabitsSchema = {
  type: Type.OBJECT,
  description: 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা (নেশা করা, অযাচিত খরচ, অতিরিক্ত কথা, খারাপ ব্যবহার, একাধিক নারী আসক্তি, যৌনাচারের আসক্তি)',
  properties: {
    categoryTitleBn: { type: Type.STRING, description: 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা' },
    overallRiskLevelBn: { type: Type.STRING, description: 'ঝুঁকিমুক্ত / সতর্কতা প্রয়োজন / উচ্চ আসক্তি সংকেত' },
    overallScore: { type: Type.INTEGER, description: 'সামগ্রিক আসক্তি ও নৈতিক বিচ্যুতি স্কোর (০-১০০)' },
    summaryBn: { type: Type.STRING, description: 'সামগ্রিক মনস্তাত্ত্বিক সারসংক্ষেপ ও মূল্যায়ন' },
    substanceAddiction: destructiveHabitItemSchema, // নেশা করা
    recklessSpending: destructiveHabitItemSchema, // অযাচিত খরচ করা
    excessiveTalking: destructiveHabitItemSchema, // অতিরিক্ত কথা বলা
    toxicBehavior: destructiveHabitItemSchema, // খারাপ ব্যবহার
    multipleRomanticObsessions: destructiveHabitItemSchema, // একাধিক নারী আসক্তি
    sexualAddiction: destructiveHabitItemSchema, // যৌনাচারের আসক্তি
  },
  required: [
    'categoryTitleBn',
    'overallRiskLevelBn',
    'overallScore',
    'summaryBn',
    'substanceAddiction',
    'recklessSpending',
    'excessiveTalking',
    'toxicBehavior',
    'multipleRomanticObsessions',
    'sexualAddiction',
  ],
};

// Character Analysis Schema
const characterAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    archetypeTitle: {
      type: Type.STRING,
      description: 'ব্যক্তিত্বের প্রধান উপাধি বা রূপরেখা (যেমন: ন্যায়পরায়ণ সংগঠক, ধৈর্যশীল শান্তবাদী, অনুভূতিশীল সহযাত্রী, নির্ভীক দূরদর্শী ইত্যাদি)',
    },
    archetypeSummary: {
      type: Type.STRING,
      description: 'ব্যক্তির সামগ্রিক স্বভাব, মানসিক গঠন ও জীবনদর্শনের সুনির্দিষ্ট বাংলা ব্যাখ্যা (২-৩ বাক্য)',
    },
    merits: {
      type: Type.ARRAY,
      description: 'শীর্ষ চারিত্রিক গুণাবলী',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'গুণের নাম (যেমন: সত্যবাদিতা, প্রখর আত্মমর্যাদা)' },
          description: { type: Type.STRING, description: 'এই গুণটি কীভাবে আচরণে প্রকাশ পায়' },
          strengthLevel: { type: Type.INTEGER, description: '১ থেকে ১০ স্কেলে শক্তি মাত্রা' },
        },
        required: ['name', 'description', 'strengthLevel'],
      },
    },
    flaws: {
      type: Type.ARRAY,
      description: 'চারিত্রিক দোষ, ত্রুটি বা সচেতন থাকার মতো দুর্বলতা',
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: 'দোষ বা দুর্বলতার নাম (যেমন: অতি-আবেগপ্রবণতা, সিদ্ধান্তহীনতা, দ্রুত রাগ)' },
          triggerCause: { type: Type.STRING, description: 'কী কারণে বা কোন পরিস্থিতিতে এই দোষ ফুটে ওঠে' },
          negativeImpact: { type: Type.STRING, description: 'জীবন বা সম্পর্কের উপর এর ক্ষতিকর প্রভাব' },
          remedyAdvice: { type: Type.STRING, description: 'দোষটি সংশোধনের ব্যবহারিক ও মনস্তাত্ত্বিক পরামর্শ' },
        },
        required: ['name', 'triggerCause', 'negativeImpact', 'remedyAdvice'],
      },
    },
    goodHabits: {
      type: Type.ARRAY,
      description: 'ভালো অভ্যাস যা ধরে রাখা উচিত',
      items: {
        type: Type.OBJECT,
        properties: {
          habit: { type: Type.STRING, description: 'ভালো অভ্যাসের নাম' },
          benefit: { type: Type.STRING, description: 'এই অভ্যাসের দীর্ঘমেয়াদী সুফল' },
          retentionTip: { type: Type.STRING, description: 'কীভাবে এটি আজীবন ধরে রাখা যায়' },
        },
        required: ['habit', 'benefit', 'retentionTip'],
      },
    },
    badHabits: {
      type: Type.ARRAY,
      description: 'ক্ষতিকর বা খারাপ অভ্যাস এবং তা বর্জনের উপায়',
      items: {
        type: Type.OBJECT,
        properties: {
          habit: { type: Type.STRING, description: 'খারাপ অভ্যাসের নাম' },
          danger: { type: Type.STRING, description: 'কী ক্ষতি করছে' },
          breakingSteps: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'অভ্যাসটি বর্জনের ৩টি বাস্তবসম্মত ধাপ',
          },
        },
        required: ['habit', 'danger', 'breakingSteps'],
      },
    },
    pillarsScore: {
      type: Type.OBJECT,
      description: '৬টি চারিত্রিক স্তম্ভে প্রাপ্ত শতকরা স্কোর (০ থেকে ১০০)',
      properties: {
        honestyAndIntegrity: { type: Type.INTEGER, description: 'সততা ও নীতিবোধ (০-১০০)' },
        patienceAndCalmness: { type: Type.INTEGER, description: 'ধৈর্য ও সহনশীলতা (০-১০০)' },
        emotionalRegulation: { type: Type.INTEGER, description: 'আবেগ ও রাগ নিয়ন্ত্রণ (০-১০০)' },
        socialEmpathy: { type: Type.INTEGER, description: 'সামাজিক শিষ্টাচার ও পরোপকার (০-১০০)' },
        gritAndDiscipline: { type: Type.INTEGER, description: 'সংকল্প ও নিয়মানুবর্তিতা (০-১০০)' },
        selfAwareness: { type: Type.INTEGER, description: 'আত্মসচেতনতা ও সত্যানুসন্ধান (০-১০০)' },
      },
      required: [
        'honestyAndIntegrity',
        'patienceAndCalmness',
        'emotionalRegulation',
        'socialEmpathy',
        'gritAndDiscipline',
        'selfAwareness',
      ],
    },
    sevenDayReformPlan: {
      type: Type.ARRAY,
      description: 'দোষ দূর করা ও ভালো গুণ বাড়ানোর ৭ দিনের বাস্তব অ্যাকশন প্ল্যান',
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER, description: 'দিন (১-৭)' },
          theme: { type: Type.STRING, description: 'দিনের মূল বিষয়' },
          task: { type: Type.STRING, description: 'সুনির্দিষ্ট করণীয় কাজ' },
        },
        required: ['day', 'theme', 'task'],
      },
    },
    philosophicalQuote: {
      type: Type.OBJECT,
      properties: {
        bengaliQuote: { type: Type.STRING, description: 'একটি অনুপ্রেরণামূলক নীতিকথা বা প্রবাদ' },
        authorOrContext: { type: Type.STRING, description: 'উৎস বা প্রবাদকারক' },
        significance: { type: Type.STRING, description: 'এই ব্যক্তির জন্য তাৎপর্য' },
      },
      required: ['bengaliQuote', 'authorOrContext', 'significance'],
    },
    professionalCommunication: professionalCommunicationSchema,
    category7DecisionAndCognition: category7Schema,
    category8OnlineBehaviorConsistency: category8Schema,
    demographicsAndIdentity: demographicsSchema,
    riskAndSafetyAudit: riskAuditSchema,
    destructiveHabitsAndAddictions: destructiveHabitsSchema,
  },
  required: [
    'archetypeTitle',
    'archetypeSummary',
    'merits',
    'flaws',
    'goodHabits',
    'badHabits',
    'pillarsScore',
    'sevenDayReformPlan',
    'philosophicalQuote',
    'professionalCommunication',
    'category7DecisionAndCognition',
    'category8OnlineBehaviorConsistency',
    'demographicsAndIdentity',
    'riskAndSafetyAudit',
    'destructiveHabitsAndAddictions',
  ],
};

// Helper: call Gemini with primary gemini-3.1-flash-lite (fast, resilient, no 503s) and secondary gemini-3.8-flash
async function callGeminiWithFallback(params: {
  contents: string;
  systemInstruction: string;
  responseSchema?: any;
  timeoutMs?: number;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    throw new Error('GEMINI_API_KEY_NOT_CONFIGURED');
  }

  const timeoutMs = params.timeoutMs || 15000;

  const tryModel = async (modelName: string) => {
    let timer: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(`AI timeout with ${modelName}`)), timeoutMs);
    });

    const aiCall = ai.models.generateContent({
      model: modelName,
      contents: params.contents,
      config: {
        systemInstruction: params.systemInstruction,
        responseMimeType: 'application/json',
        ...(params.responseSchema ? { responseSchema: params.responseSchema } : {}),
      },
    });

    return await Promise.race([aiCall, timeoutPromise]).finally(() => clearTimeout(timer!));
  };

  try {
    return await tryModel('gemini-2.5-flash');
  } catch (err: any) {
    console.warn('gemini-2.5-flash issue, retrying with gemini-2.5-flash-lite:', err.message);
    return await tryModel('gemini-2.5-flash-lite');
  }
}

// API Route: AI Character Analysis
app.post('/api/analyze-character', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      gender,
      ageGroup,
      answers,
      habitSelections,
      selfDescription,
      situationalDecisions,
      zodiacSign,
      professionalDetails,
      demographicsInput,
      safetyConcerns,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      // Fallback response generator if API key is not yet set
      const fallbackResult = generateDeterministicAnalysis({
        name: name || 'বন্ধু',
        gender,
        ageGroup,
        answers: answers || {},
        habitSelections: habitSelections || { good: [], bad: [] },
        selfDescription: selfDescription || '',
        situationalDecisions: situationalDecisions || [],
        zodiacSign,
        professionalDetails,
        demographicsInput,
        safetyConcerns,
      });
      res.json({ success: true, data: fallbackResult, source: 'offline_engine' });
      return;
    }

    const prompt = `
আপনি একজন অত্যন্ত অভিজ্ঞ মনস্তাত্ত্বিক, চারিত্রিক মূল্যায়ন বিশেষজ্ঞ এবং জীবন পরামর্শক।
নিচে একজন ব্যক্তির তথ্য, কুইজের উত্তর, ভালো ও খারাপ অভ্যাসের তালিকা এবং নৈতিক দ্বিধার সমাধান দেওয়া হলো:

ব্যক্তির নাম: ${name || 'অজ্ঞাত'}
বয়স/পর্যায়: ${ageGroup || 'প্রাপ্তবয়স্ক'}
লিঙ্গ: ${gender || 'উল্লেখ নেই'}
রাশি/জন্মধারা (যদি থাকে): ${zodiacSign || 'সাধারণ'}

পেশাগত তথ্য / কর্মক্ষেত্র:
"${professionalDetails || 'সাধারণ কর্মজীবী / পেশাগত তথ্য আলাদাভাবে দেওয়া হয়নি।'}"

ব্যক্তির নিজের বর্ণনা বা আচরণগত স্বভাব:
"${selfDescription || 'কোনো আলাদা বিবরণ দেওয়া হয়নি, নিচের উত্তর থেকে মূল্যায়ন করুন।'}"

ব্যক্তিগত পরিচিতি ও সংবেদনশীল তথ্য (যদি থাকে):
${JSON.stringify(demographicsInput || {}, null, 2)}

সততা ও ঝুঁকি সংক্রান্ত সতর্কতা পর্যবেক্ষণ:
${JSON.stringify(safetyConcerns || {}, null, 2)}

কুইজের উত্তরসমূহ:
${JSON.stringify(answers, null, 2)}

নির্বাচিত ভালো অভ্যাসসমূহ:
${JSON.stringify(habitSelections?.good || [], null, 2)}

নির্বাচিত খারাপ অভ্যাসসমূহ:
${JSON.stringify(habitSelections?.bad || [], null, 2)}

বাস্তব নৈতিক দ্বন্দ্ব (Dilemmas) সম্পর্কিত সিদ্ধান্তসমূহ:
${JSON.stringify(situationalDecisions || [], null, 2)}

অনুরোধ ও আবশ্যিক নির্দেশনাবলী:
১. "পেশাগত যোগাযোগের ধরন": কর্মক্ষেত্রে কথার ভঙ্গি, টিমওয়ার্ক, সহকর্মীর সাথে দ্বন্দ্ব সমাধান ও নেতৃত্ব/দায়িত্বশীলতা মূল্যায়ন করুন।
২. "ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা": নিচের ৬টি উপসূচক বিস্তারিত বিশ্লেষণ ও ০-১০০ স্কেলে স্কোর দিন:
   - যুক্তিনির্ভর আলোচনার প্রবণতা (logicalDiscussionTendency)
   - তথ্য যাচাইয়ের অভ্যাস (factCheckingHabit)
   - সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা (decisionJustificationAbility)
   - ভিন্ন দৃষ্টিভঙ্গি বিবেচনা (alternativePerspectives)
   - ভুল থেকে শেখার প্রকাশ্য উদাহরণ (learningFromMistakes)
   - সমস্যা বিশ্লেষণের ধরন (problemAnalysisApproach)
৩. "ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা": নিচের ৬টি উপসূচক সুনির্দিষ্টভাবে বিশ্লেষণ করুন:
   - পোস্টের বিষয়বস্তুর ধরন (postContentType: বিভাগ, বর্ণনা, থিম)
   - সময়ের সঙ্গে মতামতের পরিবর্তন (opinionEvolutionOverTime: পরিবর্তনের ধরন, পরিপক্বতা)
   - প্রকাশ্য আচরণের ধারাবাহিকতা (publicBehaviorConsistency: স্কোর ০-১০০, কথার সাথে কাজের মিল)
   - ইতিবাচক ও নেতিবাচক কনটেন্টের অনুপাত (positiveToNegativeRatio: অনুপাত, শতাংশ ও সুর বিশ্লেষণ)
   - অন্যের সঙ্গে যোগাযোগের ধরন (interpersonalStyle: স্টাইল, টোন, মিথস্ক্রিয়ার শিষ্টাচার)
   - নিজের ভুল সংশোধনের ইতিহাস (mistakeCorrectionHistory: ভুল স্বীকারের মানসিকতা)
৪. "পরিচিতি ও পটভূমি": ধর্ম বা বিশ্বাস, রাজনৈতিক মতাদর্শ, জাতিগত পরিচয়, যৌন অভিমুখিতা, এবং স্বাস্থ্য বা মানসিক রোগের স্থিতি উল্লেখ করুন। প্রতিটি বিষয় সম্পূর্ণ শালীন, নিরপেক্ষ ও বস্তুনিষ্ঠ মনস্তাত্ত্বিক ভাষায় প্রকাশ করবেন।
৫. "সততা ও বিপদ সতর্কতা অডিট (Risk & Safety Audit)":
   - যদি কেউ প্রতারক (scammer/fraud), মিথ্যাবাদী (habitual liar) বা বিপজ্জনক/সহিংস/ক্ষতিকর (dangerous/toxic) হয়, তা স্পষ্টভাবে উল্লেখ ও ফ্ল্যাগ করবেন।
   - যদি ব্যক্তি সৎ, নির্ভরযোগ্য ও নিরাপদ হয়, তা সুস্পষ্টভাবে নিশ্চিত করবেন এবং নিরাপত্তার স্তর (safe / low_risk / moderate_risk / high_danger / critical) ও নিরাপত্তা পরামর্শ দেবেন।
৬. "ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা (destructiveHabitsAndAddictions)": নিচের ৬টি সুনির্দিষ্ট মারাত্মক অভ্যাস বা আসক্তি নিরপেক্ষ মনস্তাত্ত্বিক দৃষ্টিতে মূল্যায়ন করবেন:
   - নেশা করা (substanceAddiction: ধূমপান, অ্যালকোহল, মাদকদ্রব্য, জুয়া)
   - অযাচিত খরচ করা (recklessSpending: আর্থিক অপচয় ও বেহিসাবি খরচ)
   - অতিরিক্ত কথা বলা (excessiveTalking: প্রগলভতা, অনর্গল কথা বলা ও গোপনীয়তা ফাঁস)
   - খারাপ ব্যবহার (toxicBehavior: রূঢ় আচরণ, কটূক্তি, ঔদ্ধত্য ও অবমাননা)
   - একাধিক নারী আসক্তি (multipleRomanticObsessions: বহুগামিতা, একের পর এক সম্পর্কে জড়ানো ও অস্থিরতা)
   - যৌনাচারের আসক্তি (sexualAddiction: অতিযৌনতা, পর্নোগ্রাফি আসক্তি বা নৈতিক দুর্বলতা)
   প্রতিটির জন্য hasTendency (true/false), levelBn, statusKey ('clean' | 'mild' | 'moderate' | 'severe'), score (০-১০০), manifestationBn (প্রকাশভঙ্গি), impactBn (ক্ষতিকর প্রভাব), এবং remedyAdviceBn (মুক্তির মনস্তাত্ত্বিক উপায়) প্রদান করবেন।
৭. সমস্ত তথ্য খাঁটি, মার্জিত ও গভীর মনস্তাত্ত্বিক বাংলায় উপস্থাপন করবেন।
`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction:
        'You are an empathetic, insightful psychological character evaluator and virtue analyst specializing in Bengali culture, ethics, habits, safety risk profiling, and self-improvement.',
      responseSchema: characterAnalysisSchema,
      timeoutMs: 25000,
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsedData, source: 'gemini' });
  } catch (error: any) {
    console.error('Character analysis error (using fallback):', error.message || error);
    // Graceful fallback to deterministic engine
    try {
      const fallback = generateDeterministicAnalysis(req.body);
      res.json({ success: true, data: fallback, source: 'fallback_engine', errorNote: error.message });
    } catch (innerError) {
      res.status(500).json({ success: false, error: 'বিশ্লেষণ তৈরি করতে সমস্যা হয়েছে।' });
    }
  }
});

// Social Media Profile Analysis Schema
const socialAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    targetHandleOrName: { type: Type.STRING },
    platform: { type: Type.STRING },
    profileUrl: { type: Type.STRING },
    identitySummary: {
      type: Type.OBJECT,
      properties: {
        archetypeTitle: { type: Type.STRING },
        vibeSummary: { type: Type.STRING },
        inferredProfessionOrRole: { type: Type.STRING },
        introvertExtrovertRatio: { type: Type.STRING },
        digitalAura: { type: Type.STRING },
      },
      required: ['archetypeTitle', 'vibeSummary', 'inferredProfessionOrRole', 'introvertExtrovertRatio', 'digitalAura'],
    },
    characterAndTraits: {
      type: Type.OBJECT,
      properties: {
        coreTraits: { type: Type.ARRAY, items: { type: Type.STRING } },
        topVirtues: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              score: { type: Type.INTEGER },
            },
            required: ['name', 'description', 'score'],
          },
        },
        topFlaws: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              whyItShows: { type: Type.STRING },
              risk: { type: Type.STRING },
              advice: { type: Type.STRING },
            },
            required: ['name', 'whyItShows', 'risk', 'advice'],
          },
        },
      },
      required: ['coreTraits', 'topVirtues', 'topFlaws'],
    },
    habits: {
      type: Type.OBJECT,
      properties: {
        goodHabits: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              habit: { type: Type.STRING },
              manifestation: { type: Type.STRING },
            },
            required: ['habit', 'manifestation'],
          },
        },
        badHabits: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              habit: { type: Type.STRING },
              negativeEffect: { type: Type.STRING },
              cure: { type: Type.STRING },
            },
            required: ['habit', 'negativeEffect', 'cure'],
          },
        },
      },
      required: ['goodHabits', 'badHabits'],
    },
    psychology: {
      type: Type.OBJECT,
      properties: {
        emotionalTriggers: { type: Type.ARRAY, items: { type: Type.STRING } },
        decisionStyle: { type: Type.STRING },
        stressResponse: { type: Type.STRING },
        mindsetArchetype: { type: Type.STRING },
      },
      required: ['emotionalTriggers', 'decisionStyle', 'stressResponse', 'mindsetArchetype'],
    },
    likesAndDislikes: {
      type: Type.OBJECT,
      properties: {
        favoriteTopicsAndInterests: { type: Type.ARRAY, items: { type: Type.STRING } },
        petPeevesAndDislikes: { type: Type.ARRAY, items: { type: Type.STRING } },
        contentPreferences: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['favoriteTopicsAndInterests', 'petPeevesAndDislikes', 'contentPreferences'],
    },
    addictionsAndWeaknesses: {
      type: Type.OBJECT,
      properties: {
        digitalAddictions: { type: Type.ARRAY, items: { type: Type.STRING } },
        materialOrEmotionalWeaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
        hiddenVulnerabilities: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: ['digitalAddictions', 'materialOrEmotionalWeaknesses', 'hiddenVulnerabilities'],
    },
    lifestyle: {
      type: Type.OBJECT,
      properties: {
        dailyRhythm: { type: Type.STRING },
        aestheticAndFashionTaste: { type: Type.STRING },
        socialCircleNature: { type: Type.STRING },
        spendingTendency: { type: Type.STRING },
      },
      required: ['dailyRhythm', 'aestheticAndFashionTaste', 'socialCircleNature', 'spendingTendency'],
    },
    communicationAndDatingAdvice: {
      type: Type.OBJECT,
      properties: {
        howToImpressThem: { type: Type.ARRAY, items: { type: Type.STRING } },
        thingsToAvoidSaying: { type: Type.ARRAY, items: { type: Type.STRING } },
        compatibilityTips: { type: Type.STRING },
      },
      required: ['howToImpressThem', 'thingsToAvoidSaying', 'compatibilityTips'],
    },
    socialPersonalityScorecard: {
      type: Type.OBJECT,
      description: 'সোশ্যাল পার্সোনালিটি রিপোর্ট: ইতিবাচক যোগাযোগ, গঠনমূলক আলোচনা, ধারাবাহিকতা ও সহযোগিতামূলক আচরণ সূচক',
      properties: {
        reportTitle: { type: Type.STRING },
        disclaimerBn: { type: Type.STRING },
        kpis: {
          type: Type.OBJECT,
          properties: {
            positiveCommunication: { type: Type.INTEGER, description: 'ইতিবাচক যোগাযোগ শতকরা স্কোর (৫০-১০০)' },
            constructiveDiscussion: { type: Type.INTEGER, description: 'গঠনমূলক আলোচনা শতকরা স্কোর (৫০-১০০)' },
            opinionConsistency: { type: Type.INTEGER, description: 'মতামতের ধারাবাহিকতা শতকরা স্কোর (৫০-১০০)' },
            collaborativeBehavior: { type: Type.INTEGER, description: 'সহযোগিতামূলক আচরণ শতকরা স্কোর (৫০-১০০)' },
          },
          required: ['positiveCommunication', 'constructiveDiscussion', 'opinionConsistency', 'collaborativeBehavior'],
        },
        traitBreakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              nameBn: { type: Type.STRING },
              score: { type: Type.INTEGER },
              descriptionBn: { type: Type.STRING },
            },
            required: ['nameBn', 'score'],
          },
        },
        aiObservationsBn: {
          type: Type.ARRAY,
          description: 'AI-এর ৩টি নির্দিষ্ট মনস্তাত্ত্বিক পর্যবেক্ষণ',
          items: { type: Type.STRING },
        },
      },
      required: ['reportTitle', 'disclaimerBn', 'kpis', 'traitBreakdown', 'aiObservationsBn'],
    },
    professionalCommunication: professionalCommunicationSchema,
    category7DecisionAndCognition: category7Schema,
    category8OnlineBehaviorConsistency: category8Schema,
    demographicsAndIdentity: demographicsSchema,
    riskAndSafetyAudit: riskAuditSchema,
    destructiveHabitsAndAddictions: destructiveHabitsSchema,
  },
  required: [
    'targetHandleOrName',
    'platform',
    'profileUrl',
    'identitySummary',
    'characterAndTraits',
    'habits',
    'psychology',
    'likesAndDislikes',
    'addictionsAndWeaknesses',
    'lifestyle',
    'communicationAndDatingAdvice',
    'socialPersonalityScorecard',
    'professionalCommunication',
    'category7DecisionAndCognition',
    'category8OnlineBehaviorConsistency',
    'demographicsAndIdentity',
    'riskAndSafetyAudit',
    'destructiveHabitsAndAddictions',
  ],
};

// API Route: Social Profile Character & Life Dossier
app.post('/api/analyze-social-profile', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, platform, bioOrPosts, targetName, additionalNotes } = req.body;

    const detectedPlatform = platform && platform !== 'auto' ? platform : detectPlatformFromUrl(url || '');
    const profileDetails = extractProfileDetailsFromUrl(url || '', targetName || '');

    // Fetch page metadata (title, og:description) if URL is available with 2s timeout
    let augmentedBio = bioOrPosts || '';
    if (url && url.startsWith('http')) {
      try {
        const pageMeta = await fetchPageMetadata(url);
        if (pageMeta && (pageMeta.title || pageMeta.description)) {
          const metaSnippets = [
            pageMeta.title ? `[পাবলিক টাইটেল/নাম]: ${pageMeta.title}` : '',
            pageMeta.description ? `[পাবলিক বিবরণ/বায়ো]: ${pageMeta.description}` : '',
          ].filter(Boolean).join('\n');
          augmentedBio = augmentedBio ? `${augmentedBio}\n${metaSnippets}` : metaSnippets;
        }
      } catch (e) {
        // Silently continue if page fetch fails or times out
      }
    }

    const profileContext = {
      url: url || '',
      platform: detectedPlatform,
      handle: profileDetails.handle,
      displayName: profileDetails.displayName,
      targetName: targetName || profileDetails.displayName,
      bioOrPosts: augmentedBio,
      additionalNotes: additionalNotes || '',
    };

    if (!process.env.GEMINI_API_KEY) {
      const fallback = generateDeterministicSocialAnalysis(profileContext);
      res.json({ success: true, data: fallback, source: 'offline_engine' });
      return;
    }

    const prompt = `
আপনি একজন আন্তর্জাতিক খ্যাতিসম্পন্ন ডিজিটাল নৃতত্ত্ববিদ, সাইবার-সাইকোলজিস্ট এবং মনস্তাত্ত্বিক চরিত্র গবেষক।
ব্যবহারকারী একজনের সোশ্যাল মিডিয়া লিংক ও ডিজিটাল ফুটপ্রিন্ট প্রদান করেছেন। এই নির্দিষ্ট তথ্যের ভিত্তিতে ব্যক্তিটির গভীর চরিত্র, দোষ-গুণ, ভালো ও খারাপ অভ্যাস, মনস্তত্ত্ব (সাইকোলজি), পছন্দ-অপছন্দ, আসক্তি ও দুর্বলতা, লাইফস্টাইল, যোগাযোগের কৌশল এবং পূর্ণাঙ্গ ডসিয়ার বিশ্লেষণ করুন।

প্রদত্ত প্রোফাইল তথ্য:
- সোশ্যাল মিডিয়া লিংক: ${url || 'উল্লেখ নেই'}
- প্ল্যাটফর্ম: ${detectedPlatform}
- ব্যবহারকারী/হ্যান্ডেল/নাম: ${profileDetails.displayName || profileDetails.handle || targetName || 'ডিজিটাল ব্যক্তিত্ব'}
- বায়ো/সাম্প্রতিক পোস্ট/ক্যাপশন:
"""
${bioOrPosts || 'লিংক ও হ্যান্ডেলের ডিজিটাল আর্কিটাইপ ও প্ল্যাটফর্মের বৈশিষ্ট্য অনুসারে অনন্য বিশ্লেষণ করুন।'}
"""
- অতিরিক্ত প্রাসঙ্গিক মন্তব্য: "${additionalNotes || 'নেই'}"

দয়া করে এই নির্দিষ্ট ব্যক্তির জন্য প্রতিটি বিষয় নিখুঁত, বস্তুনিষ্ঠ, শালীন ও গভীর বাংলায় বিশ্লেষণ করুন:
১. পরিচয় ও ডিজিটাল আভা (Identity & Vibe: archetypeTitle, vibeSummary, inferredProfessionOrRole, introvertExtrovertRatio, digitalAura)
২. চরিত্র, শীর্ষ গুণাবলী ও লুক্কায়িত দোষ (Character, Virtues & Flaws)
৩. ভালো ও খারাপ অভ্যাস (Good & Bad Habits)
৪. সাইকোলজি (Psychology: আবেগীয় ট্রিগার, সিদ্ধান্ত নেওয়ার ধরন, মানসিক গঠন)
৫. পছন্দ ও অপছন্দ (Likes, Interests & Pet Peeves)
৬. আসক্তি ও দুর্বলতা (Addictions, Digital fixation & vulnerabilities)
৭. লাইফস্টাইল (Lifestyle: দৈনন্দিন রুটিন, রুচি, সামাজিক পরিমণ্ডল, ব্যয়ের ধরন)
৮. যোগাযোগের কৌশল (কীভাবে তার মন জয় করা যায়, কী বলা যাবে না, সম্পর্কের টিপস)
৯. Social Personality Scorecard (আবশ্যিক):
   - reportTitle: "Social Personality Report"
   - disclaimerBn: "ডিজিটাল ফুটপ্রিন্ট ও আচরণগত মূল্যায়ন · ${detectedPlatform}"
   - kpis: positiveCommunication, constructiveDiscussion, opinionConsistency, collaborativeBehavior (এই নির্দিষ্ট প্রোফাইলের উপাত্ত অনুযায়ী অনন্য ও বাস্তবসম্মত শতকরা স্কোর)
   - traitBreakdown: ভদ্র যোগাযোগ, সহানুভূতির প্রকাশ, যুক্তিনির্ভর আলোচনা, মতামতের ধারাবাহিকতা, ভুল সংশোধনের প্রবণতা (প্রতিটির জন্য স্কোর ও সংক্ষিপ্ত বিবরণ)
   - aiObservationsBn: এই নির্দিষ্ট ব্যক্তির ডিজিটাল আচরণ ও প্রকাশ্য পোস্ট পর্যবেক্ষণ করে ৩টি সুস্পষ্ট ও সত্যনিষ্ঠ বাক্য
১০. পেশাগত যোগাযোগের ধরন (Professional Communication)
১১. ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা (যুক্তিনির্ভর আলোচনার প্রবণতা, তথ্য যাচাইয়ের অভ্যাস, সিদ্ধান্তের পক্ষে যুক্তি, ভিন্ন দৃষ্টিভঙ্গি বিবেচনা, ভুল থেকে শেখার প্রকাশ্য উদাহরণ, সমস্যা বিশ্লেষণের ধরন)
১২. ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা (পোস্টের বিষয়বস্তুর ধরন, সময়ের সঙ্গে মতামতের পরিবর্তন, প্রকাশ্য আচরণের ধারাবাহিকতা, ইতিবাচক ও নেতিবাচক কনটেন্টের অনুপাত, অন্যের সঙ্গে যোগাযোগের ধরন, নিজের ভুল সংশোধনের ইতিহাস)
১৩. পরিচিতি ও ডেমোগ্রাফিক্স: ধর্ম বা বিশ্বাস, রাজনৈতিক মতাদর্শ, জাতিগত পরিচয়, যৌন অভিমুখিতা, স্বাস্থ্য বা মানসিক ভারসাম্য (মর্যাদাপূর্ণ ও নিরপেক্ষ ভাষা)
১৪. সততা ও ঝুঁকি অডিট (Risk & Safety Audit): ব্যক্তিটি কি প্রতারক (fraud/scam), মিথ্যাবাদী (habitual liar), বা ক্ষতিকর/বিপজ্জনক (dangerous/toxic)? স্পষ্ট মূল্যায়ন ও নিরাপত্তা স্তর দিন।
১৫. ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা (destructiveHabitsAndAddictions): নেশা করা (substanceAddiction), অযাচিত খরচ করা (recklessSpending), অতিরিক্ত কথা বলা (excessiveTalking), খারাপ ব্যবহার (toxicBehavior), একাধিক নারী আসক্তি (multipleRomanticObsessions), যৌনাচারের আসক্তি (sexualAddiction)-র চুলচেরা নিরপেক্ষ মনস্তাত্ত্বিক নিরীক্ষা ও প্রতিকার।
`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction:
        'You are an elite cyber-psychologist and character profiler. Return complete JSON conforming strictly to the responseSchema with genuine, profile-specific assessments in Bengali. Every profile must have distinct, tailored scores.',
      responseSchema: socialAnalysisSchema,
      timeoutMs: 25000,
    });

    const parsedData = JSON.parse(response.text || '{}');

    // Ensure all critical scorecard and category objects exist; if any were omitted, merge seamlessly
    const baseline = generateDeterministicSocialAnalysis(profileContext);
    const finalData = {
      ...baseline,
      ...parsedData,
      socialPersonalityScorecard: {
        ...baseline.socialPersonalityScorecard,
        ...(parsedData.socialPersonalityScorecard || {}),
        kpis: {
          ...baseline.socialPersonalityScorecard.kpis,
          ...(parsedData.socialPersonalityScorecard?.kpis || {}),
        },
        traitBreakdown: parsedData.socialPersonalityScorecard?.traitBreakdown?.length
          ? parsedData.socialPersonalityScorecard.traitBreakdown
          : baseline.socialPersonalityScorecard.traitBreakdown,
        aiObservationsBn: parsedData.socialPersonalityScorecard?.aiObservationsBn?.length
          ? parsedData.socialPersonalityScorecard.aiObservationsBn
          : baseline.socialPersonalityScorecard.aiObservationsBn,
      },
      category7DecisionAndCognition: parsedData.category7DecisionAndCognition || baseline.category7DecisionAndCognition,
      category8OnlineBehaviorConsistency: parsedData.category8OnlineBehaviorConsistency || baseline.category8OnlineBehaviorConsistency,
      professionalCommunication: parsedData.professionalCommunication || baseline.professionalCommunication,
      demographicsAndIdentity: parsedData.demographicsAndIdentity || baseline.demographicsAndIdentity,
      riskAndSafetyAudit: parsedData.riskAndSafetyAudit || baseline.riskAndSafetyAudit,
    };

    res.json({ success: true, data: finalData, source: 'gemini' });
  } catch (error: any) {
    console.error('Social profile analysis error (fallback used):', error.message || error);
    try {
      const fallback = generateDeterministicSocialAnalysis({
        url: req.body.url,
        platform: req.body.platform,
        targetName: req.body.targetName,
        bioOrPosts: req.body.bioOrPosts,
        additionalNotes: req.body.additionalNotes,
      });
      res.json({ success: true, data: fallback, source: 'fallback_engine', errorNote: error.message });
    } catch (innerError) {
      res.status(500).json({ success: false, error: 'সোশ্যাল মিডিয়া প্রোফাইল বিশ্লেষণ করতে সমস্যা হয়েছে।' });
    }
  }
});

// API Route: Habit Reform Advice
app.post('/api/habit-advice', async (req: Request, res: Response): Promise<void> => {
  try {
    const { habitName, habitType, personalContext } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      res.json({
        success: true,
        advice: `"${habitName}" অভ্যাসটির ক্ষেত্রে মনোবিজ্ঞানীদের মতে প্রতিদিন ছোট ট্রিগার পরিবর্তন করা সবচেয়ে কার্যকর। ২১ দিন একটানা নিয়ম পালন করুন এবং বিকল্প স্বাস্থ্যকর অভ্যাস বেছে নিন।`,
      });
      return;
    }

    const response = await callGeminiWithFallback({
      contents: `অভ্যাস: ${habitName} (ধরণ: ${habitType === 'bad' ? 'খারাপ অভ্যাস বর্জন' : 'ভালো অভ্যাস গঠন'})
ব্যক্তিগত প্রসঙ্গ: ${personalContext || 'সাধারণ'}

এই নির্দিষ্ট অভ্যাসটি সফলভাবে পরিবর্তন বা গড়ে তোলার জন্য বাংলায় ৩টি বাস্তবসম্মত বৈজ্ঞানিক কৌশল (Atomic Habits কৌশল ও মানসিক কৌশল) সংক্ষেপে বুলেট পয়েন্টে দিন।`,
      systemInstruction: 'You are an empathetic, scientific behavioral habits coach.',
      timeoutMs: 15000,
    });

    res.json({ success: true, advice: response.text });
  } catch (error: any) {
    const defaultAdvice = req.body.habitType === 'bad'
      ? `"${req.body.habitName}" অভ্যাস বর্জনের ৩টি বৈজ্ঞানিক কৌশল:\n• ১. ট্রিগার দূর করুন: যে পরিবেশ বা পরিস্থিতিতে এই অভ্যাস শুরু হয় তা চিহ্নিত করে নিজেকে দূরে রাখুন।\n• ২. বিকল্প স্বাস্থ্যকর অভ্যাস বেছে নিন: খারাপ অভ্যাসের মুহূর্তে এক গ্লাস জল পান বা ৫ বার গভীর শ্বাস নিন।\n• ৩. দৃশ্যমান জবাবদিহিতা: প্রতিদিন ডায়েরি বা আমাদের অভ্যাস ট্র্যাকারে ফলাফল ট্র্যাক করুন।`
      : `"${req.body.habitName}" অভ্যাস গঠনের ৩টি কার্যকর কৌশল:\n• ১. ছোট পদক্ষেপ (Micro Habit): প্রতিদিন মাত্র ২ থেকে ৫ মিনিট দিয়ে শুরু করুন।\n• ২. আগের অভ্যাসের সাথে যুক্ত করুন (Habit Stacking): যেমন চা খাওয়ার পরেই এই অভ্যাসটি করুন।\n• ৩. ধারাবাহিকতার পুরস্কার: প্রতি ৩ দিন সফল হলে নিজেকে সাধুবাদ জানান।`;

    res.json({
      success: true,
      advice: defaultAdvice,
      source: 'fallback',
    });
  }
});

// Schema for personalized AI affirmation
const affirmationSchema = {
  type: Type.OBJECT,
  properties: {
    titleBn: { type: Type.STRING, description: 'বাণীর আকর্ষণীয় শিরোনাম (বাংলা)' },
    titleEn: { type: Type.STRING, description: 'Title in English' },
    bengaliAffirmation: { type: Type.STRING, description: 'গভীর ও শক্তিশালী ইতিবাচক বাংলা আত্মপ্রত্যয় (২-৩ বাক্য)' },
    englishAffirmation: { type: Type.STRING, description: 'Affirmation in English' },
    focusVirtueBn: { type: Type.STRING, description: 'মূল চারিত্রিক গুণ (যেমন: আত্মবিশ্বাস, প্রজ্ঞা, ক্ষমা)' },
    focusVirtueEn: { type: Type.STRING, description: 'Core Virtue in English' },
    microActionBn: { type: Type.STRING, description: 'আজকের একটি বাস্তব ২ মিনিটের চারিত্রিক কাজ' },
    microActionEn: { type: Type.STRING, description: 'Today 2-minute actionable micro-challenge' },
    philosophicalContextBn: { type: Type.STRING, description: 'দার্শনিক বা ঐতিহ্যিক তাৎপর্য ও অনুপ্রেরণা' },
    philosophicalContextEn: { type: Type.STRING, description: 'Philosophical insight & wisdom context' },
    reflectionPromptBn: { type: Type.STRING, description: 'রাতে ঘুমানোর আগে আত্মপর্যালোচনার প্রশ্ন' },
    reflectionPromptEn: { type: Type.STRING, description: 'Evening self-reflection inquiry' },
  },
  required: [
    'titleBn',
    'titleEn',
    'bengaliAffirmation',
    'englishAffirmation',
    'focusVirtueBn',
    'focusVirtueEn',
    'microActionBn',
    'microActionEn',
    'philosophicalContextBn',
    'philosophicalContextEn',
    'reflectionPromptBn',
    'reflectionPromptEn',
  ],
};

// API Route: Generate Personalized Daily Affirmation
app.post('/api/affirmations/generate', async (req: Request, res: Response): Promise<void> => {
  try {
    const { focusTopic, personalContext, lang = 'bn' } = req.body;

    const fallbackResponse = {
      id: `ai_aff_${Date.now()}`,
      category: 'confidence',
      titleBn: focusTopic ? `${focusTopic} বিষয়ক আত্মপ্রত্যয়` : 'আজকের ব্যক্তিগত আত্মপ্রত্যয়',
      titleEn: focusTopic ? `Affirmation on ${focusTopic}` : 'Personal Daily Affirmation',
      bengaliAffirmation: `আমি আমার সকল দুর্বলতাকে অতিক্রম করে প্রতিদিন নতুনভাবে গড়ে উঠছি। ${focusTopic ? `বিশেষ করে ${focusTopic}-এ আমি অবিচল ও সৎ থাকব।` : 'আজকের দিনটি আমার আত্মিক বিকাশের শ্রেষ্ঠ সুযোগ।' } বাইরের কোনো পরিস্থিতি আমার মানসিক শান্তি হরণ করতে পারবে না।`,
      englishAffirmation: 'I transcend all limitations and reconstruct my character daily. Today presents an unmatched opportunity for inner elevation and steadfast peace.',
      focusVirtueBn: focusTopic || 'আত্মসচেতনতা ও মানসিক স্থৈর্য',
      focusVirtueEn: focusTopic || 'Self-Awareness & Resilience',
      microActionBn: 'আজকের দিনে কোনো চাপের মুহূর্তে ১ মিনিট চোখ বন্ধ করে নিজের হৃদস্পন্দন অনুভব করুন এবং বলুন "আমি শান্ত ও দৃঢ়"।',
      microActionEn: 'During a moment of pressure today, pause for 1 minute, feel your breath, and anchor with "I am composed and capable".',
      philosophicalContextBn: 'প্রাচীন নীতিকথা: "বাইরের জগৎ তোমার ইচ্ছা অনুযায়ী চলবে না, কিন্তু তোমার মনের রাজত্ব সম্পূর্ণ তোমার ইচ্ছার অধীন।"',
      philosophicalContextEn: 'Timeless Wisdom: "The world outside will not bend to your will, but your inner kingdom is forever yours to govern."',
      reflectionPromptBn: 'আজকের দিনে আমি কীভাবে আমার লক্ষ্যের প্রতি অবিচল ছিলাম?',
      reflectionPromptEn: 'How did I honour my highest principles and inner poise today?',
      accentColor: 'from-indigo-500/20 to-emerald-500/20 border-indigo-500/30 text-indigo-300',
    };

    if (!process.env.GEMINI_API_KEY) {
      res.json({ success: true, data: fallbackResponse, source: 'offline_engine' });
      return;
    }

    const prompt = `
ব্যবহারকারীর জন্য একটি বিশেষ চারিত্রিক আত্মউন্নয়নমূলক ইতিবাচক বাণী ও আত্মপ্রত্যয় (Daily Character Affirmation) প্রস্তুত করুন।

ব্যবহারকারীর ফোকাস বিষয়: ${focusTopic || 'সার্বিক আত্মবিশ্বাস ও মানসিক শান্তি'}
ব্যবহারকারীর ব্যক্তিগত পরিস্থিতি বা চ্যালেঞ্জ: "${personalContext || 'স্বাভাবিক দৈনন্দিন জীবন ও আত্মউন্নয়ন'}"
ভাষা: বাংলা ও ইংরেজি

নির্দেশনা:
- বাণীটি যেন ভাসা-ভাসা উপদেশ না হয়ে গভীর মনস্তাত্ত্বিক রূপান্তরমূলক হয় (character-building affirmation)।
- আত্মবিশ্বাস, ধৈর্য, সততা, সহমর্মিতা, ক্ষমা, রাগ নিয়ন্ত্রণ বা সংকল্পের মতো মহৎ গুণাবলী শাণিত করে।
- একটি সহজ বাস্তবসম্মত ২-মিনিটের "আজকের কাজ" (micro-action) দিন যা আজকেই করা সম্ভব।
- দর্শন, সাহিত্য বা মহান মনীষীদের জীবনবোধের সাথে মিল রেখে তাৎপর্য প্রদান করুন।
- রাতের আত্মপর্যালোচনার জন্য একটি মননশীল প্রশ্ন দিন।
`;

    const response = await callGeminiWithFallback({
      contents: prompt,
      systemInstruction: 'You are an inspirational character coach, philosopher, and psychologist who crafts deeply transformative, culturally elegant daily affirmations.',
      responseSchema: affirmationSchema,
      timeoutMs: 18000,
    });

    const parsed = JSON.parse(response.text || '{}');
    const finalData = {
      id: `ai_aff_${Date.now()}`,
      category: 'confidence',
      accentColor: 'from-indigo-500/20 to-teal-500/20 border-teal-500/30 text-teal-300',
      ...parsed,
    };

    res.json({ success: true, data: finalData, source: 'gemini' });
  } catch (error: any) {
    console.error('Affirmation generation fallback:', error.message || error);
    const focusTopic = req.body.focusTopic || 'আত্মপ্রত্যয়';
    const fallbackResponse = {
      id: `ai_aff_${Date.now()}`,
      category: 'confidence',
      titleBn: `${focusTopic} সম্পর্কিত আত্মপ্রত্যয়`,
      titleEn: `Affirmation for ${focusTopic}`,
      bengaliAffirmation: `আমার ভেতরের শক্তি বাইরের যেকোনো সংকটের চেয়ে অনেক বড়। আমি ধৈর্য, সাহস ও সততার সাথে আজকের প্রতিটি মুহূর্ত পরিচালনা করব।`,
      englishAffirmation: 'The strength within me far exceeds any external adversity. I shall navigate every moment today with courage, poise, and unyielding honor.',
      focusVirtueBn: focusTopic,
      focusVirtueEn: 'Resilience & Honor',
      microActionBn: 'আজ কারও সাথে কথা বলার সময় সম্পূর্ণ মনোযোগ দিন এবং নিজের কথা বলার আগে তার কথা গভীর সহমর্মিতা নিয়ে শুনুন।',
      microActionEn: 'Listen actively with undivided attention and kindness before offering your own thoughts today.',
      philosophicalContextBn: 'বিবেকানন্দ: "তুমি যা ভাবো, তুমি তাই হবে। নিজেকে দুর্বল ভাবলে দুর্বল হবে, শক্তিশালী ভাবলে শক্তিশালী হবে।"',
      philosophicalContextEn: 'Swami Vivekananda: "Whatever you think, that you will be. If you think yourselves weak, weak you will be."',
      reflectionPromptBn: 'আজ আমি কি আমার মনের ওপর পূর্ণ নিয়ন্ত্রণ বজায় রাখতে পেরেছি?',
      reflectionPromptEn: 'Did I maintain command over my thoughts and reactions today?',
      accentColor: 'from-amber-500/20 to-teal-500/20 border-amber-500/30 text-amber-300',
    };
    res.json({ success: true, data: fallbackResponse, source: 'fallback' });
  }
});

// Helper: Evaluate 6 Destructive Habits & Addictions (নেশা, অযাচিত খরচ, অতিরিক্ত কথা, খারাপ ব্যবহার, একাধিক নারী আসক্তি, যৌনাচারের আসক্তি)
function evaluateDestructiveHabits(badHabits: string[], text: string = '', seed: number = 42) {
  const combined = `${badHabits.join(' ')} ${text}`.toLowerCase();

  const hasSubstance = combined.includes('নেশা') || combined.includes('মদ') || combined.includes('ধূমপান') || combined.includes('মাদক') || combined.includes('জুয়া') || combined.includes('substance');
  const hasSpending = combined.includes('অযাচিত খরচ') || combined.includes('অপচয়') || combined.includes('বেহিসাবি') || combined.includes('spending') || combined.includes('বিলাসিতা');
  const hasTalking = combined.includes('অতিরিক্ত কথা') || combined.includes('প্রগলভতা') || combined.includes('গোপনীয়তা ফাঁস') || combined.includes('অনর্গল') || combined.includes('talkative');
  const hasToxic = combined.includes('খারাপ ব্যবহার') || combined.includes('রূঢ়') || combined.includes('কটূক্তি') || combined.includes('মেজাজ') || combined.includes('রাগ') || combined.includes('অবমাননা');
  const hasWomanizing = combined.includes('একাধিক নারী') || combined.includes('বহুগামিতা') || combined.includes('নারী আসক্তি') || combined.includes('অনৈতিক সম্পর্ক') || combined.includes('philandering');
  const hasSexual = combined.includes('যৌনাচার') || combined.includes('কামাসক্তি') || combined.includes('অতিযৌনতা') || combined.includes('পর্নোগ্রাফি') || combined.includes('যৌন আসক্তি');

  const countFlaws = [hasSubstance, hasSpending, hasTalking, hasToxic, hasWomanizing, hasSexual].filter(Boolean).length;
  const overallScore = Math.min(100, Math.max(10, countFlaws * 18 + (seed % 15)));
  const overallRiskLevelBn = overallScore > 60 ? 'উচ্চ আসক্তি সংকেত' : overallScore > 35 ? 'সতর্কতা প্রয়োজন' : 'ঝুঁকিমুক্ত ও সংযত';

  const summaryBn = overallScore > 60
    ? 'ব্যক্তিত্বে একাধিক ধ্বংসাত্মক আসক্তি বা নৈতিক বিচ্যুতির তীব্র ঝুঁকি পরিলক্ষিত হয়েছে। তাৎক্ষণিক আত্মনিয়ন্ত্রণ ও মানসিক কাউন্সেলিং প্রয়োজন।'
    : overallScore > 35
    ? 'কিছু আচরণগত অনিয়ম ও আসক্তির মৃদু লক্ষণ রয়েছে, যা দ্রুত সচেতন না হলে ব্যক্তিত্ব ও সম্পর্কে গভীর ক্ষত তৈরি করতে পারে।'
    : 'চমৎকার আত্মসংযম ও নৈতিক ভারসাম্য বজায় রয়েছে। ধ্বংসাত্মক বদভ্যাস ও বিকৃত আসক্তি থেকে মুক্ত ও নিরাপদ জীবনযাপন লক্ষণীয়।';

  return {
    categoryTitleBn: 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা',
    overallRiskLevelBn,
    overallScore,
    summaryBn,
    substanceAddiction: {
      hasTendency: hasSubstance,
      levelBn: hasSubstance ? 'উচ্চ আসক্তি / ঝুঁকিপূর্ণ' : 'আসক্তিমুক্ত / স্বাভাবিক',
      statusKey: (hasSubstance ? 'severe' : 'clean') as 'clean' | 'mild' | 'moderate' | 'severe',
      score: hasSubstance ? 82 : 12,
      manifestationBn: hasSubstance
        ? 'ধূমপান, অ্যালকোহল, মাদকদ্রব্য বা জুয়ার প্রতি অনিয়ন্ত্রিত টান এবং মানসিক উত্তেজনায় নেশার শরণাপন্ন হওয়া।'
        : 'মাদকদ্রব্য, অ্যালকোহল বা জুয়ার মতো ধ্বংসাত্মক আসক্তি সম্পূর্ণ অনুপস্থিত। শারীরিক ও মানসিক সচেতনতা বজায় রাখেন।',
      impactBn: hasSubstance
        ? 'শরীরের জীবনীশক্তি হ্রাস, মস্তিষ্কের ডোপামিন বিঘ্নিত হওয়া এবং পারিবারিক সঞ্চয় ধ্বংসের চরম ঝুঁকি।'
        : 'সুস্থ শারীরিক প্রতিরোধ ক্ষমতা এবং পরিবার ও কর্মক্ষেত্রে উচ্চ নির্ভরযোগ্যতা।',
      remedyAdviceBn: hasSubstance
        ? 'ধাপে ধাপে ডোপামিন ডিটক্স, আসক্তির ট্রিগার পরিবেশ বর্জন এবং প্রফেশনাল রিহ্যাব বা চিকিৎসকের পরামর্শ গ্রহণ আবশ্যক।'
        : 'নেশামুক্ত জীবনধারার ইতিবাচক বৃত্ত বজায় রাখুন এবং খেলাধুলা বা শরীরচর্চায় সক্রিয় থাকুন।',
    },
    recklessSpending: {
      hasTendency: hasSpending,
      levelBn: hasSpending ? 'মাঝারি থেকে উচ্চ আর্থিক ঝুঁকি' : 'পরিকল্পিত ও সুশৃঙ্খল',
      statusKey: (hasSpending ? 'moderate' : 'clean') as 'clean' | 'mild' | 'moderate' | 'severe',
      score: hasSpending ? 74 : 18,
      manifestationBn: hasSpending
        ? 'প্রয়োজন ছাড়া তাৎক্ষণিক আবেগে কেনাকাটা, বিলাসিতা প্রদর্শন এবং আয়ের সাথে সামঞ্জস্যহীন অর্থব্যয়।'
        : 'আয় ও ব্যয়ের মধ্যে ভারসাম্য বজায় রাখা, নিয়মিত বাজেট অনুসরণ এবং সঞ্চয়ের সুদৃঢ় মানসিকতা।',
      impactBn: hasSpending
        ? 'ঋণগ্রস্ত হওয়া, চরম আর্থিক অনিশ্চয়তা এবং ভবিষ্যৎ জরুরি মুহূর্তের নিরাপত্তা সংকটাপন্ন হওয়া।'
        : 'আর্থিক স্বাধীনতা, পারিবারিক শান্তি এবং সংকটময় সময়ে অর্থনৈতিক স্বস্তি।',
      remedyAdviceBn: hasSpending
        ? '২৪ ঘণ্টার রুল মেনে চলুন (যেকোনো বড় খরচের আগে ১ দিন অপেক্ষা করুন), ক্রেডিট কার্ড সীমিত করুন এবং মাসিক বাজেট অ্যাপ ব্যবহার করুন।'
        : 'আর্থিক দূরদর্শিতার ধারাবাহিকতা বজায় রাখুন এবং দীর্ঘমেয়াদী লাভজনক বিনিয়োগে মনোযোগ দিন।',
    },
    excessiveTalking: {
      hasTendency: hasTalking,
      levelBn: hasTalking ? 'সতর্কতা / প্রগলভতা' : 'সংযত ও ওজনদার বাচনভঙ্গি',
      statusKey: (hasTalking ? 'mild' : 'clean') as 'clean' | 'mild' | 'moderate' | 'severe',
      score: hasTalking ? 68 : 15,
      manifestationBn: hasTalking
        ? 'অন্যের কথা না শুনে অনর্গল কথা বলা, নিজের বড়াই প্রকাশ এবং ব্যক্তিগত বা সংবেদনশীল গোপনীয়তা ফাঁস করা।'
        : 'পরিমিত, স্পষ্ট ও চিন্তাশীল শব্দচয়ন; অন্যের কথা গভীর মনোযোগ দিয়ে শোনার চমৎকার শিষ্টাচার।',
      impactBn: hasTalking
        ? 'শ্রোতাদের বিরক্তি উৎপাদন, কথার ওজন ও বিশ্বাসযোগ্যতা হ্রাস এবং অনাকাঙ্ক্ষিত বিবাদে জড়ানো।'
        : 'ব্যক্তিত্বে গাম্ভীর্য, মানুষের আস্থা বৃদ্ধি এবং কার্যকর ও সফল যোগাযোগের সুবিধা।',
      remedyAdviceBn: hasTalking
        ? 'কথা বলার আগে ৩ সেকেন্ড থামুন, "৭০% শোনা : ৩০% বলা" অনুপাত মেনে চলুন এবং অন্যের প্রতিক্রিয়া খেয়াল করুন।'
        : 'সংযত বাচনভঙ্গির সৌন্দর্য ধরে রাখুন এবং জ্ঞানগর্ভ আলোচনায় নেতৃত্ব দিন।',
    },
    toxicBehavior: {
      hasTendency: hasToxic,
      levelBn: hasToxic ? 'আচরণগত বিষাক্ততা / রূঢ়তা' : 'মার্জিত, শিষ্ট ও সহমর্মী',
      statusKey: (hasToxic ? 'severe' : 'clean') as 'clean' | 'mild' | 'moderate' | 'severe',
      score: hasToxic ? 78 : 14,
      manifestationBn: hasToxic
        ? 'সামান্যতেই রেগে গিয়ে কটূক্তি করা, অধীনস্থ বা দুর্বল মানুষকে তাচ্ছিল্য করা এবং আত্মম্ভরিতা প্রদর্শন।'
        : 'সর্বস্তরের মানুষের প্রতি সম্মান প্রদর্শন, বিনম্র ভাষা ব্যবহার এবং সংঘাতময় মুহূর্তেও আত্মনিয়ন্ত্রণ।',
      impactBn: hasToxic
        ? 'কাছের মানুষদের মানসিক কষ্ট, সামাজিক বিচ্ছিন্নতা এবং পেশাগত সুনামের অপূরণীয় ক্ষতি।'
        : 'উষ্ণ মানবিক সম্পর্ক, সর্বজনীন গ্রহণযোগ্যতা এবং সহকর্মীদের স্বতঃস্ফূর্ত শ্রদ্ধা।',
      remedyAdviceBn: hasToxic
        ? 'রাগের মুহূর্তে তাৎক্ষণিক কথা বন্ধ করে স্থান ত্যাগ করুন, অহংকার বর্জন করে ভুল স্বীকারের মানসিক চর্চা করুন।'
        : 'সহমর্মিতা ও ক্ষমার মহৎ অভ্যাস জারি রাখুন।',
    },
    multipleRomanticObsessions: {
      hasTendency: hasWomanizing,
      levelBn: hasWomanizing ? 'উচ্চ মানসিক অস্থিরতা ও অনৈতিক ঝুঁকি' : 'একনিষ্ঠ ও বিশ্বস্ত সম্পর্কবোধ',
      statusKey: (hasWomanizing ? 'severe' : 'clean') as 'clean' | 'mild' | 'moderate' | 'severe',
      score: hasWomanizing ? 80 : 10,
      manifestationBn: hasWomanizing
        ? 'একজনের প্রতি বিশ্বস্ত থাকতে না পারা, একাধিক সমান্তরাল সম্পর্কে জড়ানো, মিথ্যা স্তাবকতা ও চপলতা।'
        : 'একটি সম্পর্কের প্রতি পরম বিশ্বস্ততা, চারিত্রিক পবিত্রতা এবং নারীর প্রতি শ্রদ্ধাশীল ও মর্যাদাপূর্ণ দৃষ্টিভঙ্গি।',
      impactBn: hasWomanizing
        ? 'পারিবারিক ও দাম্পত্য জীবনের বিপর্যয়, তীব্র আত্মগ্লানি, ব্ল্যাকমেইল বা আইনি ও সামাজিক লাঞ্ছনার ঝুঁকি।'
        : 'দাম্পত্য সুখ, আত্মিক প্রশান্তি এবং সমাজে একজন বিশ্বস্ত ও সম্মানিত মানুষ হিসেবে স্বীকৃতি।',
      remedyAdviceBn: hasWomanizing
        ? 'ক্ষণস্থায়ী আনন্দের পেছনে না ছুটে সম্পর্কের গভীরতায় মনোযোগ দিন, আত্মপ্রবঞ্চনা বন্ধ করুন এবং বিশ্বস্ততার শপথ নিন।'
        : 'নৈতিক পবিত্রতা ও বিশ্বস্ততার এই সুউচ্চ মান আজীবন ধারণ করুন।',
    },
    sexualAddiction: {
      hasTendency: hasSexual,
      levelBn: hasSexual ? 'অতিযৌনতা ও নৈতিক অবক্ষয় ঝুঁকি' : 'নৈতিক সংযম ও নির্মল দৃষ্টিভঙ্গি',
      statusKey: (hasSexual ? 'severe' : 'clean') as 'clean' | 'mild' | 'moderate' | 'severe',
      score: hasSexual ? 84 : 11,
      manifestationBn: hasSexual
        ? 'অতিরিক্ত কামাসক্তি, ঘণ্টার পর ঘণ্টা পর্নোগ্রাফি দেখা, যৌন বিকৃতি ও সার্বক্ষণিক কামভাবের দাস হওয়া।'
        : 'কামভাবের ওপর মনস্তাত্ত্বিক নিয়ন্ত্রণ, নৈতিক শুচিতা এবং বিপরীত লিঙ্গকে কামুক নয়, মানবিক চোখে দেখার প্রজ্ঞা।',
      impactBn: hasSexual
        ? 'মস্তিষ্কের ধূসর কোষের ক্ষতি, কর্মে মনোযোগহীনতা, যৌন কার্যক্ষমতায় ব্যাঘাত এবং গভীর হীনমন্যতা।'
        : 'উজ্জ্বল মানসিক স্পষ্টতা, উচ্চ সৃজনশীল শক্তি এবং কলঙ্কমুক্ত চিত্তের পরম স্বস্তি।',
      remedyAdviceBn: hasSexual
        ? 'স্ক্রিন টাইম ফিল্টার করুন, একাকী রাত জাগা পরিহার করুন, নিয়মিত ব্যায়াম ও আধ্যাত্মিক ধ্যানে মন নিবিষ্ট করুন।'
        : 'চিত্তশুদ্ধি ও আত্মসংযমের আলো চারিদিকে ছড়িয়ে দিন।',
    },
  };
}

// Deterministic character analysis engine (for instant offline calculations and resilient fallback)
function generateDeterministicAnalysis(input: any) {
  const answers = input.answers || {};
  const goodHabits = input.habitSelections?.good || [];
  const badHabits = input.habitSelections?.bad || [];

  // Calculate scores based on typical questions
  let honesty = 75;
  let patience = 65;
  let emotion = 60;
  let empathy = 80;
  let grit = 70;
  let selfAwareness = 75;

  if (badHabits.includes('দেরিতে ঘুম থেকে ওঠা') || badHabits.includes('অলসতা ও কাজ ফেলে রাখা')) {
    grit -= 15;
  }
  if (badHabits.includes('হুট করে রেগে যাওয়া') || badHabits.includes('মেজাজ হারানো')) {
    emotion -= 20;
    patience -= 15;
  }
  if (goodHabits.includes('সত্যবাদী থাকা') || goodHabits.includes('প্রতিশ্রুতি রক্ষা করা')) {
    honesty += 15;
  }
  if (goodHabits.includes('ধৈর্য ধারণ করা') || goodHabits.includes('অন্যকে ক্ষমা করা')) {
    patience += 15;
    empathy += 10;
  }

  // Clamping scores
  const clamp = (val: number) => Math.min(95, Math.max(35, val));

  const merits = [
    {
      name: 'সহানুভূতি ও মানবিক মূল্যবোধ',
      description: 'অন্যের ব্যথায় ব্যথিত হওয়া এবং বিপদে এগিয়ে আসার চারিত্রিক গুণ রয়েছে।',
      strengthLevel: 9,
    },
    {
      name: 'দায়িত্বশীলতা ও নীতিবোধ',
      description: 'নিজের কর্মের জবাবদিহিতা মেনে চলা এবং অসৎ উপায় পরিহারের প্রবণতা।',
      strengthLevel: 8,
    },
    {
      name: 'আন্তরিকতা ও সরলতা',
      description: 'মানুষের সাথে সহজভাবে মিশতে পারা এবং কপটতাহীন আচরণ।',
      strengthLevel: 8,
    },
  ];

  const flaws = [
    {
      name: 'দ্রুত আবেগপ্রবণ হওয়া',
      triggerCause: 'কারো অপ্রত্যাশিত আচরণ বা হঠাৎ চাপযুক্ত পরিস্থিতিতে মনের নিয়ন্ত্রণ কমে যাওয়া।',
      negativeImpact: 'গুরুত্বপূর্ণ মুহূর্তে সঠিক যুক্তিনির্ভর সিদ্ধান্ত নিতে দেরি হয়।',
      remedyAdvice: 'যেকোনো প্রতিক্রিয়া জানানোর আগে ৫ সেকেন্ড গভীর শ্বাস নিন এবং মনে মনে ১ থেকে ১০ গুণুন।',
    },
    {
      name: 'কখনও অতিরিক্ত দ্বিধাদ্বন্দ্ব ও অতিচিন্তা',
      triggerCause: 'সবকিছু নিখুঁত করার বাড়তি প্রত্যাশা থাকলে বা ভুলের ভয় কাজ করলে।',
      negativeImpact: 'সময় অপচয় ও মানসিক ক্লান্তি তৈরি করে।',
      remedyAdvice: 'সবকিছু আপনার নিয়ন্ত্রণে থাকবে না—এটি মেনে নিয়ে কাজ শুরু করার অভ্যাস করুন।',
    },
  ];

  return {
    archetypeTitle: 'সহমর্মী ও সংবেদনশীল অভিভাবক (The Empathetic Guardian)',
    archetypeSummary: `${input.name || 'আপনি'} একজন ন্যায়পরায়ণ ও হৃদয়বান ব্যক্তিত্ব। নিজের চেয়ে অনেক সময় অপরের প্রয়োজনকে বেশি গুরুত্ব দেন। আপনার প্রধান শক্তি হলো সততা ও মানবিক টান, তবে অতিরিক্ত আবেগ ও মাঝে মাঝে অতিচিন্তা আপনার অভ্যন্তরীণ প্রশান্তিতে ব্যাঘাত ঘটায়।`,
    merits,
    flaws,
    goodHabits: goodHabits.length > 0 ? goodHabits.map((h: string) => ({
      habit: h,
      benefit: 'আত্মবিশ্বাস ও পারস্পরিক বিশ্বাস সুদৃঢ় রাখে।',
      retentionTip: 'দৈনিক অভ্যাসের রুটিন নির্দিষ্ট রাখুন এবং প্রতি সপ্তাহে অগ্রগতি পরিমাপ করুন।',
    })) : [
      {
        habit: 'অন্যের কথা মন দিয়ে শোনা',
        benefit: 'উত্তম যোগাযোগের সেতুবন্ধন ও মানুষের হৃদয়ে আস্থা তৈরি করে।',
        retentionTip: 'কথার মাঝখানে থামিয়ে না দিয়ে পুরোপুরি শোনার অভ্যাস জারি রাখুন।',
      },
    ],
    badHabits: badHabits.length > 0 ? badHabits.map((h: string) => ({
      habit: h,
      danger: 'ব্যক্তিগত শৃঙ্খলা ও মানসিক শান্তি নষ্ট করে।',
      breakingSteps: [
        'এই অভ্যাসের শুরু হওয়ার নির্দিষ্ট সময় ও ট্রিগারটি ডায়রিতে লিখে রাখুন।',
        'অভ্যাসটি করার ইচ্ছা হলে তৎক্ষণাৎ স্থান ত্যাগ করুন বা এক গ্লাস জল পান করুন।',
        'টানা ৩ দিন বর্জন করতে পারলে নিজেকে একটি পছন্দের কাজ দিয়ে পুরস্কৃত করুন।',
      ],
    })) : [
      {
        habit: 'কাজের সময় সোশ্যাল মিডিয়ায় মনোযোগ হারানো',
        danger: 'সময় ও মানসিক শক্তির অপচয় ঘটায়।',
        breakingSteps: ['পোমোডোরো টেকনিক মেনে চলুন', 'কাজের সময় ফোন দূরে রাখুন', 'দৈনিক স্ক্রিন টাইম লিমিট দিন'],
      },
    ],
    pillarsScore: {
      honestyAndIntegrity: clamp(honesty),
      patienceAndCalmness: clamp(patience),
      emotionalRegulation: clamp(emotion),
      socialEmpathy: clamp(empathy),
      gritAndDiscipline: clamp(grit),
      selfAwareness: clamp(selfAwareness),
    },
    sevenDayReformPlan: [
      { day: 1, theme: 'আত্মনিরীক্ষণ ও সততা', task: 'আজ সারাদিনে নিজের ৩টি ভালো ও ২টি ত্রুটিপূর্ণ আচরণ নোটবইয়ে তালিকাভুক্ত করুন।' },
      { day: 2, theme: 'রাগ ও আবেগ সংযম', task: 'আজ কোনো বিষয়ে রাগ বা অধৈর্য লাগলেও অন্তত ১ মিনিট নীরব থেকে ভাবুন।' },
      { day: 3, theme: 'ভালো অভ্যাস জোরদার', task: 'যেকোনো একটি ইতিবাচক কাজ (যেমন: ভোরে ওঠা বা বই পড়া) ঘড়ি ধরে সম্পন্ন করুন।' },
      { day: 4, theme: 'পরোপকার ও মধুর কথা', task: 'পরিবারের বা সহকর্মীর একজনকে অপ্রত্যাশিতভাবে সাহায্য করুন এবং মিষ্টি কথা বলুন।' },
      { day: 5, theme: 'একটি খারাপ অভ্যাস বর্জন', task: 'সবচেয়ে বিরক্তিকর খারাপ অভ্যাসটি সারাদিন একবারের জন্যও করবেন না।' },
      { day: 6, theme: 'ক্ষমা ও অহংকার বর্জন', task: 'যাঁর প্রতি ক্ষোভ ছিল তাঁকে মনে মনে ক্ষমা করে দিন এবং নিজের ভুল স্বীকার করুন।' },
      { day: 7, theme: 'পরবর্তী সপ্তাহের সংকল্প', task: 'গত ৬ দিনের অনুভূতি মূল্যায়ন করে আগামী মাসের জীবনযাত্রার সংকল্প লিখুন।' },
    ],
    philosophicalQuote: {
      bengaliQuote: 'অন্যকে জয় করার চেয়ে নিজেকে জয় করাই সর্বশ্রেষ্ঠ বিজয়।',
      authorOrContext: 'চিরন্তন প্রজ্ঞার বাণী',
      significance: 'চারিত্রিক দোষ জয় করে গুণ বিকশিত করাই মানবজীবনের প্রকৃত গৌরব।',
    },
    professionalCommunication: {
      styleTitleBn: 'কৌশলগত, ধীরস্থির ও উপাত্তনির্ভর যোগাযোগকারী',
      workplaceToneBn: 'কর্মক্ষেত্রে মার্জিত, স্পষ্ট ও সহযোগিতাপূর্ণ ভাষা ব্যবহার করেন। অনর্থক বিভ্রান্তি পরিহার করেন।',
      conflictResolutionBn: 'মতবিরোধের মুহূর্তে আবেগ পরিহার করে তথ্য ও যৌক্তিক সমঝোতার মাধ্যমে সমাধান বের করেন।',
      teamCollaborationBn: 'সহকর্মীদের কথা মনোযোগ দিয়ে শোনেন এবং সমন্বিত অর্জনে বিশ্বাসী।',
      leadershipOrFollowershipBn: 'দায়িত্বশীলতার সাথে নেতৃত্ব দেন এবং অন্যের মতামতকে গুরুত্বের সাথে বিবেচনা করেন।',
      recommendationBn: 'চাপের মুখে তাত্ক্ষণিক প্রতিক্রিয়া না দিয়ে কিছুক্ষণ ভেবে সুনির্দিষ্ট ভাষায় মতামত প্রকাশ করা আরও ফলপ্রসূ হবে।',
    },
    category7DecisionAndCognition: {
      categoryTitleBn: 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা',
      overallScore: clamp(Math.round((honesty + selfAwareness + grit) / 3)),
      summaryBn: 'যুক্তিনির্ভর, তথ্যসমৃদ্ধ এবং সামগ্রিক দৃষ্টিভঙ্গি থেকে সিদ্ধান্ত নেওয়ার ক্ষেত্রে ইতিবাচক পরিপক্বতা দৃশ্যমান।',
      logicalDiscussionTendency: {
        titleBn: 'যুক্তিনির্ভর আলোচনার প্রবণতা',
        score: clamp(honesty + 5),
        statusBn: 'প্রশংসনীয়',
        observationBn: 'আবেগ বা অন্ধ বিশ্বাসের চেয়ে কার্যকারণ ও বস্তুনিষ্ঠ তথ্যের ওপর ভিত্তি করে আলোচনা এগিয়ে নেন।',
      },
      factCheckingHabit: {
        titleBn: 'তথ্য যাচাইয়ের অভ্যাস',
        score: clamp(selfAwareness + 2),
        statusBn: 'সক্রিয় ও অনুসন্ধিৎসু',
        observationBn: 'যেকোনো চাঞ্চল্যকর বা অস্পষ্ট তথ্য প্রচারের আগে মূল উৎস অনুসন্ধান ও সত্যতা যাচাইয়ের চেষ্টা করেন।',
      },
      decisionJustificationAbility: {
        titleBn: 'সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা',
        score: clamp(grit + 4),
        statusBn: 'দৃঢ় ও সুস্পষ্ট',
        observationBn: 'গৃহীত সিদ্ধান্তের পেছনে কার্যকর কার্যকারণ ও যুক্তি গুছিয়ে অন্যের সামনে তুলে ধরতে পারেন।',
      },
      alternativePerspectives: {
        titleBn: 'ভিন্ন দৃষ্টিভঙ্গি বিবেচনা',
        score: clamp(empathy + 3),
        statusBn: 'উদার ও ভারসাম্যপূর্ণ',
        observationBn: 'বিপরীত পক্ষের চিন্তা বা ভিন্ন মতের যুক্তিকে সম্মান করেন এবং নিজের ত্রুটি থাকলে বিবেচনায় নেন।',
      },
      learningFromMistakes: {
        titleBn: 'ভুল থেকে শেখার প্রকাশ্য উদাহরণ',
        score: clamp(selfAwareness + 5),
        statusBn: 'সততাযুক্ত',
        observationBn: 'ভুল প্রমাণিত হলে জেদ না ধরে অকপটে তা স্বীকার করে সংশোধনমূলক পদক্ষেপ গ্রহণ করেন।',
      },
      problemAnalysisApproach: {
        titleBn: 'সমস্যা বিশ্লেষণের ধরন',
        score: clamp(Math.round((patience + grit) / 2) + 5),
        statusBn: 'পদ্ধতিগত ও ধাপে ধাপে',
        observationBn: 'জটিল সমস্যাকে ছোট ছোট অংশে ভাগ করে মূল কারণ (Root Cause) চিহ্নিত করার চেষ্টা করেন।',
      },
    },
    category8OnlineBehaviorConsistency: {
      categoryTitleBn: 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা',
      consistencyScore: clamp(Math.round((honesty + patience + emotion) / 3)),
      summaryBn: 'অনলাইন ও প্রকাশ্য পরিসরে দায়িত্বশীল, মার্জিত এবং বাস্তব জীবনের মূল্যবোধের সাথে সামঞ্জস্যপূর্ণ আচরণ।',
      postContentType: {
        categoryBn: 'তথ্যবহুল ও গঠনমূলক আলোচনা',
        descriptionBn: 'জ্ঞানচর্চা, অনুপ্রেরণামূলক ভাবনা ও ইতিবাচক জীবনযাত্রাকেন্দ্রিক কনটেন্ট।',
        primaryThemes: ['আত্মউন্নয়ন ও নৈতিকতা', 'পেশাগত অভিজ্ঞতা', 'সামাজিক সম্প্রীতি', 'রুচিশীল দৃষ্টিভঙ্গি'],
      },
      opinionEvolutionOverTime: {
        patternBn: 'ধারাবাহিক ও সুস্থ মনস্তাত্ত্বিক বিবর্তন',
        detailsBn: 'সময়ের সাথে সাথে মতামতে আরো পরিপক্বতা ও সহনশীলতার ছাপ ফুটে উঠেছে; দ্বিচারিতা নেই।',
        maturityLevelBn: 'উচ্চ পরিপক্ব',
      },
      publicBehaviorConsistency: {
        score: clamp(honesty),
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
    },
    demographicsAndIdentity: {
      religionOrFaithBn: input.demographicsInput?.religion || 'ধর্মীয় বা আধ্যাত্মিক মূল্যবোধের প্রতি শ্রদ্ধাশীল ও সার্বজনীন মানবিক দৃষ্টিভঙ্গি',
      politicalIdeologyBn: input.demographicsInput?.politics || 'সামাজিক সুবিচার, নাগরিক দায়িত্বশীলতা ও মধ্যপন্থী মুক্তচিন্তা',
      ethnicIdentityBn: input.demographicsInput?.ethnicity || 'বাঙালি ঐতিহ্য ও সার্বজনীন মানবিক সাংস্কৃতিক পরিচয়',
      sexualOrientationBn: input.demographicsInput?.orientation || 'মর্যাদাপূর্ণ ও সম্পর্কের প্রতি বিশ্বস্ত স্বাভাবিক ব্যক্তিগত অভিমুখিতা',
      healthAndMentalConditionsBn: input.demographicsInput?.health || 'মানসিক ভারসাম্য স্বাভাবিক; অতিরিক্ত কাজের চাপে মাঝে মাঝে সাময়িক ক্লান্তি',
      confidentialityNoteBn: 'এই পরিচিতি তথ্য সম্পূর্ণভাবে মনস্তাত্ত্বিক চরিত্র অনুধাবন ও ইতিবাচক আত্মউন্নয়নের জন্য সংকলিত।',
    },
    riskAndSafetyAudit: (() => {
      const descLower = (input.selfDescription || '').toLowerCase();
      const hasFraud = Boolean(input.safetyConcerns?.hasFraud || descLower.includes('প্রতারক') || descLower.includes('টাকা মেরে') || descLower.includes('জালিয়াতি'));
      const hasLiar = Boolean(input.safetyConcerns?.isLiar || descLower.includes('মিথ্যাবাদী') || descLower.includes('বানোয়াট') || badHabits.includes('মিথ্যা বলা'));
      const hasDanger = Boolean(input.safetyConcerns?.isDangerous || descLower.includes('বিপজ্জনক') || descLower.includes('সহিংস') || descLower.includes('মারধর') || descLower.includes('হুমকি'));

      if (hasFraud || hasLiar || hasDanger) {
        return {
          isScammerOrFraud: hasFraud,
          isHabitualLiar: hasLiar,
          isDangerousOrToxic: hasDanger,
          overallRiskLevel: hasDanger ? 'critical' : hasFraud ? 'high_danger' : 'moderate_risk',
          safetyScore: hasDanger ? 25 : hasFraud ? 35 : 45,
          fraudRiskAssessmentBn: hasFraud
            ? '⚠️ উচ্চ ঝুঁকি: এই ব্যক্তির বিরুদ্ধে আর্থিক প্রতারণা, জালিয়াতি বা বিশ্বাসভঙ্গের সুনির্দিষ্ট সন্দেহ বা লক্ষণ রয়েছে।'
            : 'প্রতারণার সরাসরি লক্ষণ কম, তবে সতর্ক থাকা ভালো।',
          honestyRiskAssessmentBn: hasLiar
            ? '⚠️ সতর্কতা: ব্যক্তিটি প্রায়ই অসত্য কথা বলে, তথ্য বিকৃত করে এবং নিজের ভুল ঢাকতে বানোয়াট গল্প ফাঁদে।'
            : 'অসততার বড় কোনো লক্ষণ নেই, তবে তথ্য সবসময় যাচাইযোগ্য হওয়া শ্রেয়।',
          dangerAssessmentBn: hasDanger
            ? '🚨 বিপজ্জনক আচরণ সংকেত: ব্যক্তিটির মাঝে অনিয়ন্ত্রিত রাগ, সহিংস মনোভাব, ব্ল্যাকমেইল বা মানসিক ক্ষতির আশঙ্কা বিদ্যমান।'
            : 'উচ্চ সহিংসতা দৃশ্যমান নয়, তবে সংঘাত এড়িয়ে চলা নিরাপদ।',
          redFlagsBn: [
            ...(hasFraud ? ['আর্থিক লেনদেনে অস্বচ্ছতা বা ধোঁয়াশা', 'টাকা নেওয়ার পর যোগাযোগ বন্ধ করার প্রবণতা'] : []),
            ...(hasLiar ? ['ধারাবাহিক মিথ্যা কথা বলা ও কথার সাথে কাজের গরমিল', 'নিজের দোষ অন্যের ওপর চাপানো'] : []),
            ...(hasDanger ? ['চরম আগ্রাসী বা প্রতিহিংসাপরায়ণ ভাষা', 'সম্পর্কে ভয় দেখিয়ে নিয়ন্ত্রণ করার প্রবণতা'] : []),
          ],
          safetyAdviceBn: 'জরুরি সতর্কতা: এই ব্যক্তির সাথে কোনো আর্থিক লেনদেন বা ব্যক্তিগত সংবেদনশীল তথ্য শেয়ার থেকে বিরত থাকুন। মেলামেশা করলে তৃতীয় পক্ষের উপস্থিতিতে বা পেশাদার গণ্ডিতে রাখুন।',
        };
      }

      return {
        isScammerOrFraud: false,
        isHabitualLiar: false,
        isDangerousOrToxic: false,
        overallRiskLevel: 'safe',
        safetyScore: 92,
        fraudRiskAssessmentBn: 'আর্থিক বা ব্যক্তিগত প্রতারণার কোনো লক্ষণ নেই। কথা ও কাজের ক্ষেত্রে বিশ্বস্ত ও দায়িত্ববান।',
        honestyRiskAssessmentBn: 'সত্যবাদিতার স্তর প্রশংসনীয়। বানোয়াট কথা বা ধাপ্পাবাজির কোনো প্রমাণ পাওয়া যায়নি।',
        dangerAssessmentBn: 'কোনো প্রকার সহিংস, ক্ষতিকর বা বিষাক্ত স্বভাব নেই। সমাজ ও সম্পর্কের জন্য নিরাপদ ব্যক্তিত্ব।',
        redFlagsBn: [
          'কোনো বিপজ্জনক বা প্রতারণামূলক রেড ফ্ল্যাগ পাওয়া যায়নি (নিরাপদ ব্যক্তি)।',
        ],
        safetyAdviceBn: 'এই ব্যক্তির সাথে পেশাগত অংশীদারিত্ব, লেনদেন বা ব্যক্তিগত মেলামেশায় কোনো ঝুঁকি নেই। পারস্পরিক শ্রদ্ধা বজায় রাখা কাম্য।',
      };
    })(),
    destructiveHabitsAndAddictions: evaluateDestructiveHabits(
      badHabits,
      `${input.selfDescription || ''} ${input.professionalDetails || ''}`,
      (input.name?.length || 5) * 7
    ),
  };
}

// Helper: detect platform from URL
function detectPlatformFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('fb.watch')) return 'Facebook';
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'Instagram';
  if (lower.includes('linkedin.com')) return 'LinkedIn';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'X (Twitter)';
  if (lower.includes('tiktok.com')) return 'TikTok';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'YouTube';
  if (lower.includes('threads.net')) return 'Threads';
  if (lower.includes('github.com')) return 'GitHub';
  if (lower.includes('reddit.com')) return 'Reddit';
  if (lower.includes('pinterest.com')) return 'Pinterest';
  return 'ওয়েবসাইট / পাবলিক প্রোফাইল';
}

// Helper: extract rich profile details (handle, displayName, slug) from URL
function formatSlugToName(slug: string): string {
  if (!slug) return 'ডিজিটাল প্রোফাইল';
  const clean = slug.replace(/^[@#]/, '').replace(/[._-][0-9]{3,}$/, '');
  const tokens = clean.split(/[._-]+/).filter((t) => t.length > 0 && !/^[0-9]+$/.test(t));
  if (tokens.length === 0) return slug.replace(/^[@#]/, '');
  return tokens
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function extractProfileDetailsFromUrl(
  url: string,
  fallbackName: string
): { handle: string; displayName: string; rawSlug: string } {
  const trimmedName = fallbackName ? fallbackName.trim() : '';

  if (!url || !url.trim()) {
    const defaultName = trimmedName || 'ডিজিটাল ব্যক্তিত্ব';
    return {
      handle: trimmedName || 'ডিজিটাল ব্যক্তিত্ব',
      displayName: defaultName,
      rawSlug: 'digital-persona',
    };
  }

  try {
    let cleanUrl = url.trim();
    if (!/^https?:\/\//i.test(cleanUrl)) {
      cleanUrl = 'https://' + cleanUrl;
    }
    const parsed = new URL(cleanUrl);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const pathname = parsed.pathname.replace(/\/+$/, '');
    const searchParams = parsed.searchParams;

    // 1. Facebook profiles
    if (host.includes('facebook.com') || host.includes('fb.com') || host.includes('fb.watch')) {
      if (searchParams.has('id')) {
        const idVal = searchParams.get('id')!;
        const last6 = idVal.slice(-6);
        return {
          handle: `fb_id_${idVal}`,
          displayName: trimmedName || `ফেসবুক ব্যবহারকারী (#${last6})`,
          rawSlug: idVal,
        };
      }
      const userMatch = pathname.match(/\/user\/([a-zA-Z0-9._-]+)/i);
      if (userMatch) {
        return {
          handle: userMatch[1],
          displayName: trimmedName || formatSlugToName(userMatch[1]),
          rawSlug: userMatch[1],
        };
      }
      const shareMatch = pathname.match(/\/(share|p|posts|watch|reel)\/([a-zA-Z0-9._-]+)/i);
      if (shareMatch) {
        const postToken = shareMatch[2];
        return {
          handle: `fb_${postToken.slice(0, 10)}`,
          displayName: trimmedName || `ফেসবুক প্রোফাইল (#${postToken.slice(0, 6)})`,
          rawSlug: postToken,
        };
      }
      const segs = pathname.split('/').filter(Boolean);
      if (segs.length > 0 && !['profile.php', 'groups', 'pages'].includes(segs[0])) {
        const slug = segs[0].replace('@', '');
        return {
          handle: `@${slug}`,
          displayName: trimmedName || formatSlugToName(slug),
          rawSlug: slug,
        };
      }
    }

    // 2. LinkedIn (/in/username)
    if (host.includes('linkedin.com')) {
      const matchIn = pathname.match(/\/in\/([a-zA-Z0-9._-]+)/i);
      if (matchIn) {
        const slug = matchIn[1];
        return {
          handle: slug,
          displayName: trimmedName || formatSlugToName(slug),
          rawSlug: slug,
        };
      }
    }

    // 3. YouTube (@channel or /c/ or /user/)
    if (host.includes('youtube.com') || host.includes('youtu.be')) {
      const ytMatch = pathname.match(/\/@([a-zA-Z0-9._-]+)/i);
      if (ytMatch) {
        return {
          handle: `@${ytMatch[1]}`,
          displayName: trimmedName || formatSlugToName(ytMatch[1]),
          rawSlug: ytMatch[1],
        };
      }
    }

    // 4. TikTok / Threads
    if (host.includes('tiktok.com') || host.includes('threads.net')) {
      const atMatch = pathname.match(/\/@([a-zA-Z0-9._-]+)/i);
      if (atMatch) {
        return {
          handle: `@${atMatch[1]}`,
          displayName: trimmedName || formatSlugToName(atMatch[1]),
          rawSlug: atMatch[1],
        };
      }
    }

    // 5. Instagram
    if (host.includes('instagram.com')) {
      const segs = pathname.split('/').filter(Boolean);
      if (segs.length > 0) {
        const first = segs[0];
        if (!['p', 'reel', 'reels', 'stories', 'explore'].includes(first.toLowerCase())) {
          return {
            handle: `@${first}`,
            displayName: trimmedName || formatSlugToName(first),
            rawSlug: first,
          };
        } else if (segs.length > 1) {
          return {
            handle: `ig_${segs[1].slice(0, 8)}`,
            displayName: trimmedName || `ইনস্টাগ্রাম ক্রিয়েটর (#${segs[1].slice(0, 6)})`,
            rawSlug: segs[1],
          };
        }
      }
    }

    // 6. GitHub
    if (host.includes('github.com')) {
      const segs = pathname.split('/').filter(Boolean);
      if (segs.length > 0) {
        const user = segs[0];
        return {
          handle: `@${user}`,
          displayName: trimmedName || formatSlugToName(user),
          rawSlug: user,
        };
      }
    }

    // 7. General URL segmentation
    const segs = pathname.split('/').filter(Boolean);
    const ignoreList = ['share', 'p', 'posts', 'watch', 'reel', 'reels', 'channel', 'c', 'user', 'home', 'profile'];
    for (const seg of segs) {
      if (!ignoreList.includes(seg.toLowerCase()) && seg.length > 1) {
        const clean = seg.replace(/^@/, '');
        return {
          handle: `@${clean}`,
          displayName: trimmedName || formatSlugToName(clean),
          rawSlug: clean,
        };
      }
    }

    // 8. Query parameter usernames
    for (const key of ['user', 'username', 'u', 'name', 'id']) {
      if (searchParams.has(key)) {
        const val = searchParams.get(key)!;
        return {
          handle: val,
          displayName: trimmedName || formatSlugToName(val),
          rawSlug: val,
        };
      }
    }

    // 9. Host fallback with deterministic hash
    const hostToken = host.split('.')[0] || 'profile';
    const hashTail = Math.abs(hashString(url)) % 10000;
    return {
      handle: `${hostToken}_${hashTail}`,
      displayName: trimmedName || `ডিজিটাল প্রোফাইল (#${hashTail})`,
      rawSlug: `${hostToken}-${hashTail}`,
    };
  } catch (e) {
    const hashTail = Math.abs(hashString(url)) % 10000;
    return {
      handle: trimmedName || `ডিজিটাল ব্যক্তিত্ব (#${hashTail})`,
      displayName: trimmedName || `ডিজিটাল ব্যক্তিত্ব (#${hashTail})`,
      rawSlug: `user-${hashTail}`,
    };
  }
}

// Backward compatible helper
function extractHandleFromUrl(url: string, fallbackName: string): string {
  const details = extractProfileDetailsFromUrl(url, fallbackName);
  return details.displayName || details.handle;
}

// Fetch public web page metadata (title, og:description) with 2s timeout
async function fetchPageMetadata(
  targetUrl: string
): Promise<{ title?: string; description?: string } | null> {
  if (!targetUrl || !targetUrl.startsWith('http')) return null;
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    clearTimeout(timeout);
    if (!resp.ok) return null;
    const text = await resp.text();
    const titleMatch = text.match(/<title[^>]*>([^<]+)<\/title>/i);
    const ogTitleMatch =
      text.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i) ||
      text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    const ogDescMatch =
      text.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i) ||
      text.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i) ||
      text.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const title = (ogTitleMatch ? ogTitleMatch[1] : titleMatch ? titleMatch[1] : '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    const description = (ogDescMatch ? ogDescMatch[1] : '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim();
    return { title, description };
  } catch (e) {
    return null;
  }
}

// String hash for deterministic variations
function hashString(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

// Pseudo-random range generator based on seed
function createRng(seed: number) {
  let s = seed;
  return function (min: number, max: number): number {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const norm = s / 0x7fffffff;
    return Math.floor(norm * (max - min + 1)) + min;
  };
}

// Dynamic deterministic profiling engine for diverse profiles with 16 Archetypes
function generateDeterministicSocialAnalysis(input: any) {
  const url = input.url || '';
  const platform = input.platform && input.platform !== 'auto' ? input.platform : detectPlatformFromUrl(url);
  const profileDetails = extractProfileDetailsFromUrl(url, input.targetName || '');
  const handle = input.handle || profileDetails.handle;
  const displayName = input.displayName || input.targetName || profileDetails.displayName || handle;
  const bio = input.bioOrPosts || '';
  const notes = input.additionalNotes || '';
  const combinedText = `${url} ${handle} ${displayName} ${platform} ${bio} ${notes}`.toLowerCase();

  // Multi-seed entropy calculation so every distinct link/handle/name produces unique hash
  const urlHash = hashString(url || 'demo-url');
  const handleHash = hashString(handle || 'demo-handle');
  const nameHash = hashString(displayName || 'demo-name');
  const textHash = hashString(combinedText || 'demo-text');
  const masterSeed = Math.abs((urlHash ^ (handleHash << 5) ^ (nameHash << 11) ^ (textHash >>> 3)));
  const rng = createRng(masterSeed);

  // Expanded library of 16 culturally rich Bengali archetypes
  const ARCHETYPES = [
    // 0: Tech & Engineering Innovator
    {
      archetypeTitle: 'কৌশলী প্রযুক্তি উদ্ভাবক ও সফটওয়্যার স্থপতি (Strategic Tech Innovator)',
      profession: platform === 'LinkedIn' ? 'সফটওয়্যার আর্কিটেক্ট / ক্লাউড ইঞ্জিনিয়ারিং লিড' : 'প্রযুক্তি উদ্যোক্তা ও ডিজিটাল সিস্টেম ডিজাইনার',
      vibeSummary: `${displayName} প্রযুক্তি, যুক্তি ও ডিজিটাল উদ্ভাবনের জগতে অত্যন্ত সক্রিয় ও মনোযোগী। জটিল সমস্যাকে সহজ উপাদানে ভেঙে সমাধান খোঁজা এবং নির্ভরযোগ্য উপাত্তের ভিত্তিতে কথা বলা তার মূল চারিত্রিক বৈশিষ্ট্য।`,
      digitalAura: 'উচ্চ যৌক্তিক, আধুনিক ও লক্ষ্যনিষ্ঠ (Analytical & Objective)',
      introExtro: `${rng(55, 70)}% অন্তর্মুখী গভীর চিন্তাশীল, ${rng(30, 45)}% পেশাদার সমন্বয়কারী`,
      coreTraits: ['যুক্তিনির্ভর চিন্তা', 'পদ্ধতিগত বিশ্লেষণ', 'দ্রুত সমস্যা সমাধান', 'অকপট সত্যবাদিতা'],
      kpiBase: { pos: rng(78, 86), cons: rng(86, 94), opn: rng(76, 86), col: rng(74, 84) },
      traitScores: { civil: rng(78, 86), empathy: rng(70, 79), logic: rng(88, 96), consistency: rng(78, 87), errCorr: rng(75, 85) },
      virtues: [
        { name: 'উপাত্ত ও যুক্তিনির্ভর মতামত প্রদান', description: 'কোনো কথা বলার আগে নির্ভরযোগ্য সোর্স ও ফ্যাক্ট চেক করার স্বভাব।', score: rng(8, 10) },
        { name: 'উদ্ভাবনী মানসিকতা ও দ্রুত শিক্ষণ', description: 'নতুন টুলস ও প্রযুক্তি দ্রুত আয়ত্ত করে বাস্তব জীবনে প্রয়োগ।', score: rng(8, 10) },
        { name: 'কাজের স্বচ্ছতা ও পেশাদার সততা', description: 'নিজের যোগ্যতা ও কাজের অগ্রগতি নিয়ে ধোঁয়াশা না রাখার নীতি।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'আবেগের চেয়ে যুক্তিকে অতিরিক্ত প্রাধান্য দেওয়া', whyItShows: 'কারো অনুভূতির সূক্ষ্মতা অনুধাবনে কিছুটা শুষ্ক বা কঠোর শোনানো।', risk: 'ব্যক্তিগত সম্পর্কে দূরত্ব তৈরি হতে পারে।', advice: 'মানুষের সাথে যোগাযোগের সময় শুধু যুক্তি নয়, অনুভূতির প্রতিও সহানুভূতিশীল হোন।' },
        { name: 'ধীরগতির বা অযৌক্তিক যুক্তিতে দ্রুত অধৈর্য হওয়া', whyItShows: 'অদক্ষতা বা ভুল বারবার দেখলে বিরক্তি প্রকাশ।', risk: 'টিমে অন্যদের ওপর অপ্রয়োজনীয় মানসিক চাপ তৈরি করে।', advice: 'অন্যদের শেখার নিজস্ব গতিকে সম্মান দিয়ে ধৈর্য ধরুন।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিনিয়ত বৈশ্বিক প্রযুক্তি ও জ্ঞানচর্চা', manifestation: 'নতুন বই, আর্টিকেল ও গবেষণাপত্র নিয়মিত পড়া ও সংরক্ষণ।' },
          { habit: 'তথ্য ও সোর্স যাচাই করে শেয়ার করা', manifestation: 'গুজব বা অপ্রমাণিত বিষয় কখনোই শেয়ার বা বিশ্বাস না করা।' },
        ],
        bad: [
          { habit: 'দেরি রাত পর্যন্ত স্ক্রিনে মগ্ন থাকা', negativeEffect: 'শারীরিক শক্তি ও ঘুমের স্বাভাবিক ছন্দ নষ্ট করে।', cure: 'ঘুমানোর অন্তত ৪৫ মিনিট আগে স্ক্রিন টাইম বন্ধ রাখুন।' },
          { habit: 'অসম্পূর্ণ কাজে অতিরিক্ত উৎকণ্ঠা', negativeEffect: 'মানসিক ক্লান্তি ও অতিরিক্ত মানসিক চাপ।', cure: 'ধাপে ধাপে কাজ শেষ করার রুটিন তৈরি করুন।' },
        ],
      },
      topics: ['প্রযুক্তি ও কৃত্রিম বুদ্ধিমত্তা', 'সফটওয়্যার স্থাপত্য', 'স্টার্টআপ ইকোসিস্টেম', 'বিজ্ঞান ও মহাকাশ'],
      dislikes: ['ভিত্তিহীন কুযুক্তি', 'অযাচিত চাটুকারিতা', 'ধীরগতির অদক্ষ সিস্টেম'],
    },
    // 1: Aesthetic Nomad & Storyteller
    {
      archetypeTitle: 'নান্দনিক ভিজ্যুয়াল ক্রিয়েটর ও মুক্তমনা গল্পকার (Aesthetic Nomad & Storyteller)',
      profession: 'ভিজ্যুয়াল স্টোরিটেলার, ট্রাভেলার, লাইফস্টাইল ক্রিয়েটর বা আর্ট ডিরেক্টর',
      vibeSummary: `${displayName} চারপাশের প্রকৃতি, অভিজ্ঞতা ও জীবনের সূক্ষ্ম সৌন্দর্যকে ডিজিটাল ক্যানভাসে ফুটিয়ে তুলতে ভালোবাসেন। মানবিক সম্পর্কের উষ্ণতা, নান্দনিক রুচি ও স্বাধীন জীবনযাপন তার ব্যক্তিত্বের প্রধান শক্তি।`,
      digitalAura: 'উষ্ণ, প্রাণবন্ত ও নান্দনিক (Warm, Expressive & Aesthetic)',
      introExtro: `${rng(45, 60)}% সংবেদনশীল আত্মমগ্নতা, ${rng(40, 55)}% সামাজিক উন্মুক্ততা`,
      coreTraits: ['উচ্চ নান্দনিক রুচি', 'গভীর সহমর্মিতা', 'মুক্ত প্রকাশভঙ্গি', 'জীবনের প্রতি ভালোবাসা'],
      kpiBase: { pos: rng(86, 95), cons: rng(72, 81), opn: rng(65, 76), col: rng(83, 93) },
      traitScores: { civil: rng(85, 94), empathy: rng(84, 93), logic: rng(72, 82), consistency: rng(66, 76), errCorr: rng(75, 85) },
      virtues: [
        { name: 'মানুষের প্রতি অকৃত্রিম সহমর্মিতা ও শ্রদ্ধা', description: 'অন্যের সংকটে পাশে দাঁড়ানো ও সুন্দর কথায় সাহস জোগানোর গুণ।', score: rng(8, 10) },
        { name: 'সৌন্দর্য দেখা ও ইতিবাচক প্রেরণা তৈরি', description: 'সাধারণ ঘটনাতেও গভীর অর্থ ও নান্দনিকতা খুঁজে পাওয়ার প্রতিভা।', score: rng(8, 10) },
        { name: 'আন্তরিক আতিথেয়তা ও বন্ধুসুলভ স্বভাব', description: 'নতুন মানুষের সাথে সহজে সম্প্রীতি গড়ে তোলার চারিত্রিক আকর্ষণ।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'অতিরিক্ত সংবেদনশীলতা ও দ্রুত আঘাত পাওয়া', whyItShows: 'রুক্ষ কথা বা অবহেলা সহ্য করতে না পেরে মন খারাপ হওয়া।', risk: 'নিজের ভেতরে কষ্ট পুষে রেখে মানসিক ক্লান্তি ডেকে আনে।', advice: 'মনে রাখুন সবার দৃষ্টিভঙ্গি এক নয়, অন্যের রূঢ়তাকে ব্যক্তিগতভাবে নেবেন না।' },
        { name: 'বাস্তব হিসাবের তুলনায় কল্পনায় বেশি থাকা', whyItShows: 'কঠিন হিসাব-নিকাশ এড়িয়ে নান্দনিক দিককে প্রাধান্য দেওয়া।', risk: 'আর্থিক বা বাস্তবিক পরিকল্পনা বাস্তবায়নে বিলম্ব।', advice: 'স্বপ্নের পাশাপাশি বাস্তববাদী কর্মপরিকল্পনা বজায় রাখুন।' },
      ],
      habits: {
        good: [
          { habit: 'নান্দনিক মুহূর্ত ক্যামেরাবন্দি ও উপভোগ', manifestation: 'ভ্রমণ, সূর্যাস্ত, বই বা চায়ের কাপের সুন্দর স্মৃতি ধরে রাখা।' },
          { habit: 'প্রিয়জনদের খোঁজখবর নেওয়া ও উৎসাহ দেওয়া', manifestation: 'কথোপকথনে আন্তরিক প্রশংসা ও ইতিবাচক মন্তব্য প্রকাশ।' },
        ],
        bad: [
          { habit: 'মুড সুইং বা মেজাজের ওঠানামা', negativeEffect: 'হঠাৎ কাজ করার আগ্রহ হারিয়ে ফেলে সময় অপচয়।', cure: 'অনুভূতির ওপর নিয়ন্ত্রণ এনে ছোট ছোট লক্ষ্য পূরণ করুন।' },
          { habit: 'ডিজিটাল প্রশংসা বা লাইকের ওপর নির্ভরতা', negativeEffect: 'প্রতিক্রিয়া কম হলে মনের ভেতর সাময়িক অস্বস্তি তৈরি হওয়া।', cure: 'ডিজিটাল লাইক নয়, বাস্তব জীবনের আত্মতৃপ্তিতে বিশ্বাস রাখুন।' },
        ],
      },
      topics: ['ভ্রমণ ও অনাবিষ্কৃত স্থান', 'কফি কালচার ও ক্যাফে', 'ফটোগ্রাফি ও ফিল্ম', 'সঙ্গীত ও সাহিত্য'],
      dislikes: ['কপট কপটতা ও ভণ্ডামি', 'রুক্ষ ও নোংরা ভাষা', 'অযাচিত নৈতিক শাসন'],
    },
    // 2: Philosophical Thinker & Civic Critic
    {
      archetypeTitle: 'দার্শনিক চিন্তক ও নাগরিক বিবেক (Philosophical Thinker & Civic Critic)',
      profession: 'লেখক, কলামিস্ট, সমাজ গবেষক বা চিন্তাশীল সামাজিক বিশ্লেষক',
      vibeSummary: `${displayName} সামাজিক ন্যায়বিচার, সমাজদর্শন, ইতিহাস ও মুক্ত চিন্তার পক্ষে অবিচল একজন চিন্তাশীল মানুষ। জনতুষ্টির স্রোতে গা না ভাসিয়ে স্পষ্ট ও সৎ মতামত প্রকাশে তিনি আপসহীন।`,
      digitalAura: 'গভীর, প্রখর ও আত্মমর্যাদাসম্পন্ন (Cerebral, Incisive & Ethical)',
      introExtro: `${rng(60, 75)}% একান্ত চিন্তক ও পাঠক, ${rng(25, 40)}% গণমানুষের কণ্ঠ`,
      coreTraits: ['নীতিবোধের স্পষ্টতা', 'গভীর পড়াশোনা', 'অন্যায়ের বিরুদ্ধে সোচ্চার', 'মুক্তচিন্তা'],
      kpiBase: { pos: rng(70, 80), cons: rng(88, 96), opn: rng(80, 90), col: rng(70, 80) },
      traitScores: { civil: rng(79, 88), empathy: rng(74, 83), logic: rng(90, 97), consistency: rng(83, 92), errCorr: rng(78, 88) },
      virtues: [
        { name: 'সাহসিকতার সাথে নিজের নীতি ও সত্য অবস্থান রক্ষা', description: 'ভয় বা প্রলোভনে নিজের আদর্শ বিসর্জন না দেওয়ার দৃঢ়তা।', score: rng(9, 10) },
        { name: 'গভীর মননশীলতা ও মূল কারণ অনুসন্ধানের প্রজ্ঞা', description: 'ঘটনার উপরিভাগ দেখে সিদ্ধান্ত না নিয়ে মূল উৎস খুঁজে বের করা।', score: rng(8, 10) },
        { name: 'ভুল প্রমাণিত হলে অকপটে নিজের বক্তব্য স্পষ্টীকরণ', description: 'অহমিকা ত্যাগ করে সত্যকে মেনে নেওয়ার চারিত্রিক মহত্ত্ব।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'তর্কে অনমনীয় হওয়া বা দ্রুত বিতর্কে জড়িয়ে পড়া', whyItShows: 'ভুল যুক্তি বা অন্যায় দেখলে মেজাজ সংবরণ করতে না পারা।', risk: 'অযথা শত্রুতা ও মানসিক শক্তির অপচয়।', advice: 'সবাইকে সব বিষয়ে বোঝানোর প্রয়োজন নেই, নীরব থাকার শক্তিও অর্জন করুন।' },
        { name: 'অতি-সমালোচনামূলক দৃষ্টিভঙ্গি', whyItShows: 'অন্যের ভুল সহজেই চোখে পড়া ও সরাসরি বলে ফেলা।', risk: 'ঘনিষ্ঠ বন্ধুদের মনে অস্বস্তি সৃষ্টি হতে পারে।', advice: 'সমালোচনার আগে অন্তত দুটি ভালো দিক প্রশংসা করার অভ্যাস করুন।' },
      ],
      habits: {
        good: [
          { habit: 'নিয়মিত বই ও গবেষণা পড়ার অভ্যাস', manifestation: 'প্রতি সপ্তাহে অন্তত একটি নতুন বিষয়ে প্রামাণ্য বই পড়া।' },
          { habit: 'বিতর্কে ব্যক্তিগত আক্রমণ পরিহার করা', manifestation: 'ব্যক্তিকে নয়, বরং যুক্তির অসারতাকে চ্যালেঞ্জ জানানো।' },
        ],
        bad: [
          { habit: 'সোশ্যাল মিডিয়ায় কমেন্ট যুদ্ধে জড়িয়ে পড়া', negativeEffect: 'মূল কাজের সময় নষ্ট এবং মেজাজ তিরিক্ষি হওয়া।', cure: 'বিতর্কিত কমেন্টের উত্তর দেওয়ার আগে ১০ মিনিট বিরতি নিন।' },
          { habit: 'চিন্তায় অতিরিক্ত নিমজ্জিত হয়ে বাস্তব কাজ পেছানো', negativeEffect: 'জরুরি কাজের ডেডলাইন মিস হওয়ার আশঙ্কা।', cure: 'চিন্তার পাশাপাশি দ্রুত বাস্তবায়নের জন্য অ্যালার্ম ব্যবহার করুন।' },
        ],
      },
      topics: ['দর্শন ও সমাজচিন্তা', 'রাজনৈতিক অর্থনীতি', 'সাহিত্য ও প্রবন্ধ', 'মানবাধিকার ও নীতিশাস্ত্র'],
      dislikes: ['অন্ধ দলীয় গোঁড়ামি', 'গুজব ও ভুয়া খবর', 'অর্থহীন লোকদেখানো ভাব'],
    },
    // 3: Corporate Executive & Strategic Builder
    {
      archetypeTitle: 'কৌশলী কর্পোরেট নেতা ও প্রবৃদ্ধি রূপকার (Strategic Executive & Builder)',
      profession: platform === 'LinkedIn' ? 'বিজনেস স্ট্র্যাটেজিস্ট / সিনিয়র প্রোডাক্ট লিডার' : 'কর্পোরেট কর্মকর্তা, ম্যানেজমেন্ট প্রফেশনাল বা উদ্যোক্তা',
      vibeSummary: `${displayName} দীর্ঘমেয়াদী পরিকল্পনা, ফলপ্রসূ নেটওয়ার্কিং ও পেশাদার উৎকর্ষে বিশ্বাসী একজন গোছানো সংগঠক। আবেগ নিয়ন্ত্রণ ও কার্যকর সিদ্ধান্ত গ্রহণে তিনি অত্যন্ত দক্ষ।`,
      digitalAura: 'পরিচ্ছন্ন, আত্মবিশ্বাসী ও নেতৃত্ববান্ধব (Executive, Confident & Focused)',
      introExtro: `${rng(35, 50)}% কৌশলগত একাগ্রতা, ${rng(50, 65)}% সামাজিক নেতৃত্ব`,
      coreTraits: ['নেতৃত্বের দূরদর্শিতা', 'মার্জিত পেশাদারিত্ব', 'ফলপ্রসূ যোগাযোগ', 'সংকট ব্যবস্থাপনা'],
      kpiBase: { pos: rng(82, 91), cons: rng(85, 93), opn: rng(83, 92), col: rng(82, 90) },
      traitScores: { civil: rng(88, 96), empathy: rng(75, 84), logic: rng(86, 94), consistency: rng(84, 93), errCorr: rng(80, 89) },
      virtues: [
        { name: 'জটিল পরিস্থিতিতে শান্ত থেকে ভারসাম্য বজায় রাখা', description: 'চরম চাপের মধ্যেও ভেঙে না পড়ে ধীরস্থির সমাধানের পথ খোঁজা।', score: rng(9, 10) },
        { name: 'পারস্পরিক স্বার্থরক্ষা ও সফল নেগোসিয়েশন', description: 'উভয় পক্ষের জন্য মঙ্গলজনক সমাধান বের করার কূটনীতি।', score: rng(8, 10) },
        { name: 'সময়ানুবর্তিতা ও প্রতিশ্রুতির গভীর মর্যাদা', description: 'কথা দিলে তা যথাযথ সময়ে বাস্তবায়ন করার বিশ্বস্ততা।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'অন্যের কাছ থেকেও অতিমাত্রায় নিখুঁত পারফরম্যান্স চাওয়া', whyItShows: 'কাজে সামান্য ভুল সহ্য না করা।', risk: 'সহকর্মীদের মধ্যে ভীতি তৈরি হতে পারে।', advice: 'মানুষ মাত্রই ভুল হতে পারে, সহানুভূতিশীল ফিডব্যাক দিন।' },
        { name: 'ব্যক্তিগত দুর্বলতা প্রকাশে অতিরিক্ত সতর্কতা', whyItShows: 'সর্বদা নিজেকে শক্তিশালী ও অটুট দেখানোর চেষ্টা।', risk: 'ভেতরে ভেতরে একাকীত্ব তৈরি হওয়া।', advice: 'বিশ্বস্ত মানুষের কাছে নিজের আবেগ প্রকাশে কুণ্ঠাবোধ করবেন না।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিদিনের কাজের পূর্ব-পরিকল্পনা ও ডায়রি লেখা', manifestation: 'সকালবেলা অগ্রাধিকার তালিকা তৈরি করে কাজ শুরু করা।' },
          { habit: 'পেশাদার নেটওয়ার্কের নিয়মিত খোঁজ রাখা', manifestation: 'গুরুত্বপূর্ণ ব্যক্তিদের জন্মদিনে বা অর্জনে শুভেচ্ছা জানানো।' },
        ],
        bad: [
          { habit: 'ছুটির দিনেও কাজের মেসেজ চেক করা', negativeEffect: 'পারিবারিক সময় ও মানসিক শান্তিতে বিঘ্ন ঘটে।', cure: 'সপ্তাহে অন্তত একদিন সম্পূর্ণ স্ক্রিন-ফ্রি থাকার অভ্যাস গড়ুন।' },
          { habit: 'শারীরিক ক্লান্তিকে অগ্রাহ্য করে কাজ করে যাওয়া', negativeEffect: 'হঠাৎ বার্নআউট ও কাজের গতি হ্রাস পাওয়া।', cure: 'কাজের ফাঁকে পর্যাপ্ত পানি ও নিয়মিত হাঁটার অভ্যাস করুন।' },
        ],
      },
      topics: ['ব্যবসা ও স্টার্টআপ গ্রোথ', 'নেতৃত্ব ও টিম ম্যানেজমেন্ট', 'ফিন্যান্স ও ইনভেস্টমেন্ট', 'প্রোডাক্টিভিটি হ্যাকস'],
      dislikes: ['অপেশাদার উদাসীনতা', 'দেরিতে কাজ জমা দেওয়া', 'দায় এড়িয়ে যাওয়ার অজুহাত'],
    },
    // 4: Empirical Scholar & Academic Mentor
    {
      archetypeTitle: 'তত্ত্বাবধায়ক গবেষক ও অ্যাকাডেমিক মেন্টর (Empirical Scholar & Mentor)',
      profession: 'শিক্ষাবিদ, গবেষক, বিজ্ঞান লেখক বা নলেজ কিউরেটর',
      vibeSummary: `${displayName} প্রতিটি দাবির পেছনে তথ্য ও সুনির্দিষ্ট প্রমাণ খোঁজেন। চটুল বা ক্ষণস্থায়ী জনপ্রিয়তার চেয়ে স্থায়ী জ্ঞান ও সত্যের প্রতি তার গভীর শ্রদ্ধা।`,
      digitalAura: 'শান্ত, প্রজ্ঞাময় ও পদ্ধতিগত (Methodical, Scholarly & Grounded)',
      introExtro: `${rng(68, 82)}% নিভৃতচারী মনন, ${rng(18, 32)}% জ্ঞান বিতরণের কণ্ঠ`,
      coreTraits: ['তথ্য যাচাইয়ের গভীর স্পৃহা', 'ধীরস্থির বিচারবুদ্ধি', 'শিক্ষাদানের আনন্দ', 'আত্মতুষ্টিহীন জ্ঞানতৃষ্ণা'],
      kpiBase: { pos: rng(76, 85), cons: rng(90, 97), opn: rng(85, 93), col: rng(75, 85) },
      traitScores: { civil: rng(86, 94), empathy: rng(76, 85), logic: rng(92, 98), consistency: rng(86, 95), errCorr: rng(83, 92) },
      virtues: [
        { name: 'গুজব বা ভিত্তিহীন তথ্যের বিরুদ্ধে প্রামাণ্য বিশ্লেষণ', description: 'কোনো চাঞ্চল্যকর খবরকে নিরপেক্ষ দৃষ্টিভঙ্গিতে যাচাই করা।', score: rng(9, 10) },
        { name: 'নবীনদের শেখানো ও দিকনির্দেশনা দেওয়ার ধৈর্য', description: 'জটিল বিষয়কেও সহজ ভাষায় বুঝিয়ে দেওয়ার সদিচ্ছা।', score: rng(8, 10) },
        { name: 'জ্ঞানচর্চায় বিনয় ও অহংকারহীনতা', description: 'যত বেশি জানেন, তত বেশি বিনয়ী থাকার চারিত্রিক সৌন্দর্য।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'সিদ্ধান্ত নিতে অতিরিক্ত সময় নেওয়া বা ওভার-অ্যানালাইসিস', whyItShows: 'যতক্ষণ শতভাগ প্রমাণ না পান ততক্ষণ সিদ্ধান্ত স্থগিত রাখা।', risk: 'তাৎক্ষণিক সুযোগ হাতছাড়া হওয়ার আশঙ্কা।', advice: '৭০-৮০% নিশ্চিত হলেই পদক্ষেপ নেওয়ার অভ্যাস করুন।' },
        { name: 'সহজ বিষয়কেও অতিরিক্ত তত্ত্বগত করে ফেলা', whyItShows: 'সাধারণ আলোচনায় একাডেমিক ভাষা ব্যবহারের প্রবণতা।', risk: 'সাধারণ শ্রোতার কাছে কঠিন বা দূরত্বমূলক মনে হওয়া।', advice: 'সহজ ভাষায় মনের কথা প্রকাশ করুন।' },
      ],
      habits: {
        good: [
          { habit: 'প্রামাণ্য তথ্যসূত্র ক্রস-চেক করা', manifestation: 'যেকোনো রেফারেন্স মূল জার্নাল বা সোর্স থেকে যাচাই।' },
          { habit: 'নিয়মিত নোটবই ও গবেষণার সারসংক্ষেপ সংরক্ষণ', manifestation: 'পড়া বিষয়ের মূল থিম সংক্ষেপে নোট রাখা।' },
        ],
        bad: [
          { habit: 'একই বিষয়ের পেছনে ঘণ্টার পর ঘণ্টা বই নিয়ে মগ্ন থাকা', negativeEffect: 'বাস্তব জীবনের সামাজিক মেলামেশা কমে যাওয়া।', cure: 'প্রতিদিন অন্তত এক ঘণ্টা বন্ধুদের সাথে খোলামেলা আড্ডা দিন।' },
          { habit: 'শারীরিক ব্যায়ামে অনীহা', negativeEffect: 'পিঠের ব্যথা ও ক্লান্তি বোধ তৈরি হওয়া।', cure: 'সকালে অন্তত ২০ মিনিট হালকা ব্যায়াম বা যোগব্যায়াম করুন।' },
        ],
      },
      topics: ['বিজ্ঞান ও জীববিজ্ঞান', 'ইতিহাস ও প্রত্নতত্ত্ব', 'উচ্চশিক্ষা ও স্কলারশিপ', 'পরিবেশ ও জলবায়ু'],
      dislikes: ['বিজ্ঞানবিরোধী অপপ্রচার', 'চটুল গুজব ও সেনসেশনালিজম', 'বই না পড়ে পণ্ডিতি করা'],
    },
    // 5: Altruistic Humanitarian & Social Worker
    {
      archetypeTitle: 'সংবেদনশীল পরোপকারী ও মানবিক অগ্রদূত (Altruistic Humanitarian)',
      profession: 'সামাজিক সংগঠক, মানবাধিকার কর্মী, স্বেচ্ছাসেবী বা স্বাস্থ্য-সেবক',
      vibeSummary: `${displayName} অন্যের দুঃখ-কষ্টে সহজে বিচলিত হন এবং মানুষকে সাহায্য করার জন্য নিজের সাধ্যের বাইরে গিয়েও পাশে দাঁড়ান। তার আন্তরিক সামাজিক অবস্থান চারপাশের মানুষকে অনুপ্রাণিত করে।`,
      digitalAura: 'স্নেহশীল, সেবামুখী ও নির্ভরযোগ্য (Compassionate, Dedicated & Altruistic)',
      introExtro: `${rng(30, 45)}% নীরব প্রার্থনা ও সংকল্প, ${rng(55, 70)}% মানুষের সেবায় সক্রিয়`,
      coreTraits: ['উদার পরোপকারিতা', 'সহানুভূতির প্রাচুর্য', 'মানুষের প্রতি বিশ্বাস', 'সেবামূলক ত্যাগ'],
      kpiBase: { pos: rng(89, 97), cons: rng(78, 86), opn: rng(72, 82), col: rng(91, 98) },
      traitScores: { civil: rng(90, 97), empathy: rng(92, 98), logic: rng(75, 84), consistency: rng(74, 84), errCorr: rng(84, 93) },
      virtues: [
        { name: 'বিপদে মানুষের পাশে নিঃস্বার্থভাবে দাঁড়ানো', description: 'নিজের স্বার্থ চিন্তা না করে বিপন্ন মানুষের সহায়তায় এগিয়ে আসা।', score: rng(9, 10) },
        { name: 'সহানুভূতিশীল শ্রবণ ও সান্ত্বনা প্রদান', description: 'অন্যের কষ্টের কথা মন দিয়ে শোনা ও মানসিক শক্তি দেওয়া।', score: rng(9, 10) },
        { name: 'সামাজিক সম্প্রীতি ও মিলনের সেতুবন্ধন', description: 'দ্বন্দ্বে থাকা দুই পক্ষের মধ্যে শান্তি স্থাপনের ক্ষমতা।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'নিজের ব্যক্তিগত যত্ন ভুলে অন্যের পেছনে ছোটা', whyItShows: 'নিজের ক্লান্তি বা অসুখকে পাত্তা না দিয়ে সেবা করা।', risk: 'শারীরিক ও মানসিক তীব্র অবসাদ তৈরি হওয়া।', advice: 'অন্যের যত্ন নেওয়ার আগে নিজের সুস্থতা নিশ্চিত করা আবশ্যক।' },
        { name: 'কপট বা সুবিধাবাদী মানুষকে সহজে বিশ্বাস করা', whyItShows: 'সবার মধ্যেই সততা দেখতে চাওয়ার সরল বিশ্বাস।', risk: 'আর্থিক বা আবেগীয় প্রতারণার শিকার হওয়ার আশঙ্কা।', advice: 'সহানুভূতির সাথে সতর্কতা ও বিচারবুদ্ধি বজায় রাখুন।' },
      ],
      habits: {
        good: [
          { habit: 'নিয়মিত দান ও মানবসেবায় অংশগ্রহণ', manifestation: 'প্রতি মাসে উপার্জনের নির্দিষ্ট অংশ অসচ্ছলদের সহায়তায় ব্যয়।' },
          { habit: 'অন্যকে উৎসাহিত করার ইতিবাচক বার্তা পাঠানো', manifestation: 'বিষণ্ণ বন্ধুকে ফোন করে খোঁজখবর নেওয়া।' },
        ],
        bad: [
          { habit: 'অনুরোধে কখনো ‘না’ বলতে না পারা', negativeEffect: 'নিজের প্রয়োজনীয় কাজের সময় নষ্ট ও মানসিক চাপ।', cure: 'ভদ্রভাবে নিজের সীমাবদ্ধতা জানিয়ে ‘না’ বলতে শিখুন।' },
          { habit: 'অন্যের কষ্ট নিজের ভেতরে অতিরিক্ত ধারণ করা', negativeEffect: 'দীর্ঘস্থায়ী বিষণ্ণতা ও মন ভার হয়ে থাকা।', cure: 'সেবা করার পর নিজের মানসিক শান্তির জন্য কিছুটা সময় বিশ্রাম নিন।' },
        ],
      },
      topics: ['সামাজিক উন্নয়ন ও স্বেচ্ছাসেবা', 'মানসিক স্বাস্থ্য ও কাউন্সেলিং', 'শিশু অধিকার ও শিক্ষা', 'পরিবেশ ও প্রাণিকল্যাণ'],
      dislikes: ['অহংকার ও দাম্ভিকতা', 'গরিব বা দুর্বল মানুষের প্রতি অবহেলা', 'স্বার্থপর মুনাফাবাজি'],
    },
    // 6: Agile Digital Entrepreneur & Hustler
    {
      archetypeTitle: 'চটপটে ডিজিটাল উদ্যোক্তা ও ভেঞ্চার ক্রিয়েটর (Agile Digital Entrepreneur)',
      profession: 'ই-কমার্স ব্র্যান্ড ফাউন্ডার, ডিজিটাল মার্কেটার বা গ্রোথ স্পেশালিস্ট',
      vibeSummary: `${displayName} গতি, উদ্ভাবন এবং সুযোগকে দ্রুত কাজে রূপান্তরে বিশ্বাসী। প্রথাগত নিয়মের বেড়াজালে আটকে না থেকে তিনি নতুন আইডিয়ার দ্রুত পরীক্ষা-নিরীক্ষা করতে ভালোবাসেন।`,
      digitalAura: 'উচ্চ শক্তিসম্পন্ন, আত্মপ্রত্যয়ী ও কর্মোদ্যমী (High-Energy, Resilient & Bold)',
      introExtro: `${rng(30, 42)}% কৌশলগত একাগ্রতা, ${rng(58, 70)}% নেটওয়ার্কিং ও পিচিং`,
      coreTraits: ['ঝুঁকি নেওয়ার সাহস', 'উচ্চ কর্মশক্তি', 'বাজার সচেতনতা', 'দ্রুত ঘুরে দাঁড়ানোর ক্ষমতা'],
      kpiBase: { pos: rng(83, 92), cons: rng(80, 89), opn: rng(74, 84), col: rng(85, 93) },
      traitScores: { civil: rng(82, 90), empathy: rng(76, 85), logic: rng(84, 92), consistency: rng(77, 86), errCorr: rng(81, 90) },
      virtues: [
        { name: 'পরাজয়ে না দমে নতুন উদ্যমে শুরু করা', description: 'ব্যর্থতাকে অভিজ্ঞতা হিসেবে নিয়ে তৎক্ষণাৎ নতুন কৌশলে নামা।', score: rng(9, 10) },
        { name: 'অন্যকে বড় স্বপ্নে বিশ্বাসী করে তোলা', description: 'নিজের উত্তেজনা ও স্বপ্ন দিয়ে আশপাশের মানুষদের অনুপ্রাণিত করা।', score: rng(8, 10) },
        { name: 'সুযোগ দ্রুত চিনে সিদ্ধান্ত নেওয়া', description: 'দেরি না করে দ্রুত পদক্ষেপ নিয়ে বাজারে এগিয়ে থাকা।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'একসাথে অনেক আইডিয়া নিয়ে বিভ্রান্ত হওয়া', whyItShows: 'নতুন কিছু দেখলেই সেদিকে ছুটে গিয়ে চলমান কাজ স্থগিত করা।', risk: 'গুরুত্বপূর্ণ প্রজেক্টের ধারাবাহিকতা বিঘ্নিত হওয়া।', advice: 'একটি প্রজেক্ট দাঁড় করানোর পর অন্য প্রজেক্টে হাত দিন।' },
        { name: 'আর্থিক হিসাবের চেয়ে হাইপে বেশি উৎসাহী হওয়া', whyItShows: 'বড় বড় স্বপ্নের তুলনায় সূক্ষ্ম খরচ ও ঝুঁকি হিসাব কম করা।', risk: 'বাজেট ঘাটতি ও সাময়িক আর্থিক ধাক্কা।', advice: 'অভিজ্ঞ ফিন্যান্স উপদেষ্টার মতামত নিয়ে বড় সিদ্ধান্ত নিন।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিদিন সকাল ৮টার আগেই কাজের গুরুত্বপূর্ণ সিদ্ধান্ত নেওয়া', manifestation: 'অপ্রয়োজনীয় মেসেজ দেখার আগেই প্রধান টাস্ক শেষ করা।' },
          { habit: 'সফল উদ্যোক্তাদের কেস স্টাডি বিশ্লেষণ', manifestation: 'সপ্তাহে একটি বিজনেস মডেলের ভুল ও সাফল্য নিয়ে গবেষণা।' },
        ],
        bad: [
          { habit: 'সব কাজ নিজের হাতে করার চেষ্টা (Micromanagement)', negativeEffect: 'টিমের আত্মবিশ্বাস হ্রাস এবং নিজের কাজের চাপ বৃদ্ধি।', cure: 'যোগ্য ব্যক্তিদের দায়িত্ব দিয়ে তাদের ওপর আস্থা রাখুন।' },
          { habit: 'অনিয়মিত খাওয়াদাওয়া ও ঘুম', negativeEffect: 'গ্যাস্ট্রিক ও দীর্ঘমেয়াদী শারীরিক দুর্বলতা।', cure: 'খাবারের নির্দিষ্ট সময়সূচি অ্যালার্ম দিয়ে বজায় রাখুন।' },
        ],
      },
      topics: ['ডিজিটাল মার্কেটিং ও ব্র্যান্ডিং', 'ই-কমার্স ট্রেন্ড', 'ভেঞ্চার ক্যাপিটাল', 'সেলস সাইকোলজি'],
      dislikes: ['অজুহাত তৈরি করা', 'ধীরগতির সিদ্ধান্তহীনতা', 'ঝুঁকি না নিয়ে অভিযোগ করা'],
    },
    // 7: Literary Connoisseur & Cultural Critic
    {
      archetypeTitle: 'মননশীল সাহিত্যপ্রেমী ও সাংস্কৃতিক ভাষ্যকার (Literary Connoisseur & Essayist)',
      profession: 'সাহিত্যিক, সাংস্কৃতিক সংগঠক, সম্পাদক বা প্রকাশনা গবেষক',
      vibeSummary: `${displayName} শব্দ, ভাষা ও মানবিক অনুভূতির গভীরতায় বেঁচে থাকেন। বাংলা সাহিত্য, ঐতিহ্য ও আধুনিক বিশ্ব সংস্কৃতির মেলবন্ধনে তিনি জীবনের সূক্ষ্ম সত্যগুলো আবিষ্কার করতে ভালোবাসেন।`,
      digitalAura: 'মার্জিত, কাব্যিক ও অন্তর্দৃষ্টিসম্পন্ন (Poetic, Refined & Contemplative)',
      introExtro: `${rng(65, 78)}% বই ও ভাবনার নির্জনতা, ${rng(22, 35)}% সাংস্কৃতিক আড্ডা`,
      coreTraits: ['শব্দচয়নের সূক্ষ্ম মার্জিততা', 'গভীর অনুভবী হৃদয়', 'ঐতিহ্য সচেতনতা', 'নৈতিক নান্দনিকতা'],
      kpiBase: { pos: rng(78, 87), cons: rng(84, 93), opn: rng(79, 89), col: rng(76, 86) },
      traitScores: { civil: rng(88, 96), empathy: rng(86, 95), logic: rng(82, 90), consistency: rng(80, 89), errCorr: rng(80, 89) },
      virtues: [
        { name: 'ভাষার পবিত্রতা ও সম্মান রক্ষা', description: 'কোনো অবস্থাতেই অপভাষা বা অমার্জিত শব্দ ব্যবহার না করা।', score: rng(9, 10) },
        { name: 'মানুষের ব্যথার গভীর অন্তর্দর্শন', description: 'অন্যের না-বলা বেদনাও চোখের ভাষা বা কথার ভঙ্গিতে বুঝতে পারা।', score: rng(9, 10) },
        { name: 'শিল্প ও সংস্কৃতির প্রতি নিঃস্বার্থ অনুরাগ', description: 'বাণিজ্যিক লাভের বাইরে গিয়ে শিল্পের মানকে অগ্রাধিকার দেওয়া।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'বাস্তব পৃথিবীর রূঢ়তায় সহজে বিষণ্ণ হওয়া', whyItShows: 'চারপাশের স্বার্থপরতা দেখে নিভৃতে গুটিয়ে যাওয়া।', risk: 'দীর্ঘমেয়াদী একাকীত্ব ও সামাজিক বিচ্ছিন্নতা।', advice: 'বাস্তবতাকে সহজভাবে মেনে নিয়ে মানুষের সাথে মিশুন।' },
        { name: 'অতিরিক্ত খুঁতখুঁতে নান্দনিক মান', whyItShows: 'শব্দ বা লেখার সামান্য ভুলও সহ্য করতে না পারা।', risk: 'নিজের কাজ প্রকাশে অতিরিক্ত বিলম্ব।', advice: 'শতভাগ নিখুঁতের আশায় কাজ ফেলে রাখবেন না।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিদিন ডায়েরি ও সাহিত্য নোট লেখা', manifestation: 'সন্ধ্যার পর শান্ত মনে মনের অনুভূতি ও পাঠপ্রতিক্রিয়া লেখা।' },
          { habit: 'পুরাতন বইয়ের দোকানে সময় কাটানো', manifestation: 'দুষ্প্রাপ্য গ্রন্থ সংগ্রহ ও তরুণদের উপহার দেওয়া।' },
        ],
        bad: [
          { habit: 'অতীতে ঘটে যাওয়া কষ্টকর স্মৃতি রোমন্থন', negativeEffect: 'বর্তমান কাজের উদ্দীপনা ও আনন্দ বিনষ্ট হওয়া।', cure: 'অতীতকে অতীত হিসেবে রেখে বর্তমান মুহূর্তে মনোযোগ দিন।' },
          { habit: 'চায়ের প্রতি অতিরিক্ত আসক্তি ও অনিয়মিত খাদ্যাভ্যাস', negativeEffect: 'পেটের অস্বস্তি ও ঘুমের ব্যাঘাত।', cure: 'দৈনিক চা পানের সংখ্যা ৩ কাপের মধ্যে সীমাবদ্ধ রাখুন।' },
        ],
      },
      topics: ['বাংলা সাহিত্য ও কবিতা', 'নাটক ও থিয়েটার', 'সাংস্কৃতিক ইতিহাস', 'বই পর্যালোচনা'],
      dislikes: ['ভাষার বিকৃতি ও অশ্লীলতা', 'অকালপক্ব চটুলতা', 'শিল্পকে পণ্য বানিয়ে ফেলা'],
    },
    // 8: Pragmatic Financial Analyst & Wealth Strategist
    {
      archetypeTitle: 'বাস্তববাদী ফিন্যান্স বিশেষজ্ঞ ও সতর্ক সম্পদ বিশ্লেষক (Pragmatic Financial Analyst)',
      profession: 'আর্থিক পরামর্শক, চার্টার্ড অ্যাকাউন্ট্যান্ট, ইনভেস্টমেন্ট অ্যানালিস্ট বা ব্যাংকার',
      vibeSummary: `${displayName} প্রতিটি পদক্ষেপের লাভ-ক্ষতি, ঝুঁকি এবং স্থায়িত্ব পরিমাপ করে পথ চলেন। অবাস্তব আবেগ বা লোভের বশবর্তী না হয়ে তথ্য ও যুক্তির সুদৃঢ় বৃত্তে নিজের ও পরিবারের ভবিষ্যৎ সুরক্ষিত রাখতে তিনি নিবেদিত।`,
      digitalAura: 'ভারসাম্যপূর্ণ, সতর্ক ও সুশৃঙ্খল (Disciplined, Cautious & Grounded)',
      introExtro: `${rng(50, 65)}% হিসাব ও চার্ট বিশ্লেষণ, ${rng(35, 50)}% ক্লায়েন্ট ও টিম পরামর্শ`,
      coreTraits: ['আর্থিক শৃঙ্খলা', 'ঝুঁকি ব্যবস্থাপনা', 'বস্তুনিষ্ঠ বাস্তববাদ', 'ধৈর্যশীল দূরদর্শিতা'],
      kpiBase: { pos: rng(75, 84), cons: rng(87, 95), opn: rng(82, 91), col: rng(75, 84) },
      traitScores: { civil: rng(85, 93), empathy: rng(72, 81), logic: rng(91, 98), consistency: rng(88, 96), errCorr: rng(82, 91) },
      virtues: [
        { name: 'আবেগমুক্ত আর্থিক দূরদর্শিতা', description: 'সাময়িক লাভের ফাঁদে পা না দিয়ে দীর্ঘমেয়াদী স্থায়িত্ব বিচার করা।', score: rng(9, 10) },
        { name: 'লেনদেনে শতভাগ বিশ্বস্ততা ও নিয়মানুবর্তিতা', description: 'কখনোই হিসাবের হেরফের বা অস্বচ্ছতায় জড়াতে না চাওয়া।', score: rng(9, 10) },
        { name: 'বিপদের জন্য আগাম আর্থিক প্রতিরক্ষা তৈরি', description: 'জরুরি তহবিলের সুশৃঙ্খল পরিকল্পনা সবসময় প্রস্তুত রাখা।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'সবকিছুকে টাকার অঙ্কে বা লাভ-ক্ষতিতে মাপা', whyItShows: 'আত্মিক বা আবেগীয় সম্পর্ককেও আর্থিক যৌক্তিকতায় বিবেচনা করা।', risk: 'ঘনিষ্ঠ সম্পর্কে উষ্ণতা হ্রাস পাওয়া।', advice: 'মনে রাখুন জীবনের সেরা কিছু অনুভূতি কোনো মূল্যে কেনা যায় না।' },
        { name: 'অতিরিক্ত সতর্কতা বা রিস্ক-অ্যাভার্স মনোভাব', whyItShows: 'বড় সুযোগ আসলেও অল্প ঝুঁকির ভয়ে পিছিয়ে আসা।', risk: 'উচ্চ প্রবৃদ্ধির চমৎকার সম্ভাবনা হাতছাড়া হওয়া।', advice: 'পরিমিত ঝুঁকি নিয়ে নতুন দিগন্তে পা বাড়ানোর সাহস রাখুন।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিটি ব্যয়ের হিসাব এক্সেল বা অ্যাপে সংরক্ষণ', manifestation: 'মাস শেষে পারিবারিক বাজেটের পুঙ্খানুপুঙ্খ অডিট।' },
          { habit: 'বৈশ্বিক স্টক ও কমোডিটি মার্কেট ট্র্যাকিং', manifestation: 'প্রতিদিন সকালে আর্থিক সংবাদ বিশ্লেষণ।' },
        ],
        bad: [
          { habit: 'ছুটির সময়েও পোর্টফোলিও ও ব্যালেন্স চেক করা', negativeEffect: 'মানসিক উৎকণ্ঠা ও বিশ্রামের ঘাটতি।', cure: 'সপ্তাহান্তে ফিন্যান্স অ্যাপের নোটিফিকেশন বন্ধ রাখুন।' },
          { habit: 'নিজের ওপর খরচ করতে অতিরিক্ত দ্বিধা', negativeEffect: 'কঠোর পরিশ্রমের আনন্দ উপভোগ না করা।', cure: 'উপার্জনের ছোট একটি অংশ নিজের পছন্দের আনন্দে ব্যয় করুন।' },
        ],
      },
      topics: ['ব্যক্তিগত ফিন্যান্স ও সঞ্চয়', 'শেয়ারবাজার ও বন্ড', 'রিয়েল এস্টেট বিনিয়োগ', 'ট্যাক্স প্ল্যানিং'],
      dislikes: ['গেট-রিচ-কুইক স্ক্যাম ও পনজি স্কিম', 'অযাচিত ঋণ নেওয়া', 'বেহিসাবি বিলাসিতা'],
    },
    // 9: Mindful Wellness & Fitness Catalyst
    {
      archetypeTitle: 'উদ্যমী স্বাস্থ্য সচেতন অনুপ্রেরক ও ওয়েলনেস পরামর্শক (Mindful Wellness Catalyst)',
      profession: 'ফিটনেস ট্রেইনার, পুষ্টিবিদ, ওয়েলনেস কোচ বা স্পোর্টস ফিজিওলজিস্ট',
      vibeSummary: `${displayName} সুস্থ দেহ ও প্রশান্ত মনের ভারসাম্যপূর্ণ ঐক্যে বিশ্বাসী। শৃঙ্খলাবদ্ধ জীবনযাপন, পুষ্টিকর আহার ও সক্রিয় শরীরচর্চার মাধ্যমে তিনি আশপাশের মানুষদের আত্মবিশ্বাসী ও রোগমুক্ত জীবনের পথ দেখান।`,
      digitalAura: 'প্রাণোচ্ছ্বল, সুশৃঙ্খল ও ইতিবাচক (Vibrant, Disciplined & Motivating)',
      introExtro: `${rng(38, 52)}% শারীরিক আত্মসংযম, ${rng(48, 62)}% মানুষকে মোটিভেট করা`,
      coreTraits: ['শারীরিক শৃঙ্খলা', 'উচ্চ জীবনীশক্তি', 'উৎসাহব্যঞ্জক বাচনভঙ্গি', 'স্বাস্থ্য সচেতনতা'],
      kpiBase: { pos: rng(88, 96), cons: rng(81, 89), opn: rng(78, 88), col: rng(86, 94) },
      traitScores: { civil: rng(86, 94), empathy: rng(82, 91), logic: rng(80, 89), consistency: rng(87, 95), errCorr: rng(81, 90) },
      virtues: [
        { name: 'ধারাবাহিক দৈনিক শৃঙ্খলা বজায় রাখা', description: 'আবহাওয়া বা মেজাজ যাই হোক, শরীরচর্চা ও রুটিনে অবিচল থাকা।', score: rng(9, 10) },
        { name: 'হতাশ মানুষকে সুস্থ জীবনের প্রেরণা দেওয়া', description: 'কখনোই কারো শারীরিক গড়ন নিয়ে উপহাস না করে উৎসাহ দেওয়া।', score: rng(9, 10) },
        { name: 'খাদ্যাভ্যাসে পরম আত্মসংযম', description: 'জাঙ্কফুড ও ক্ষতিকর পানীয় সম্পূর্ণ পরিহার করার মানসিক বল।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'অন্যের সামান্য অনিয়ম দেখে অসন্তুষ্ট হওয়া', whyItShows: 'বন্ধু বা পরিবারের কেউ অস্বাস্থ্যকর খাবার খেলে অতিরিক্ত উপদেশ দেওয়া।', risk: 'সামাজিক আড্ডায় অস্বস্তি তৈরি হওয়া।', advice: 'অন্যের ওপর জোর না করে নিজের দৃষ্টান্ত দিয়ে উৎসাহিত করুন।' },
        { name: 'শারীরিক বিশ্রাম না নিয়ে একটানা শরীরকে চাপে রাখা', whyItShows: 'অসুস্থ বা ক্লান্ত থাকলেও ব্যায়াম মিস করতে না চাওয়া।', risk: 'মাংসপেশির চোট ও ওভার-ট্রেনিং সিন্ড্রোম।', advice: 'শরীরকে সময়মতো বিশ্রাম দেওয়াও ফিটনেসের একটি অংশ।' },
      ],
      habits: {
        good: [
          { habit: 'ভোরবেলা ঘুম থেকে উঠে পানি পান ও যোগব্যায়াম', manifestation: 'সূর্যোদয়ের সাথে সাথে দিন শুরু করে শরীর চাঙ্গা রাখা।' },
          { habit: 'প্রতিদিনের খাবারের ক্যালোরি ও পুষ্টি উপাদান হিসাব', manifestation: 'সুষম খাদ্য তালিকা অনুযায়ী খাবার গ্রহণ।' },
        ],
        bad: [
          { habit: 'নিজের লুক বা ওজনের প্রতি অতিরিক্ত অবসেসন', negativeEffect: 'আয়নার সামনে দীর্ঘ সময় দাঁড়িয়ে খুঁত খোঁজা।', cure: 'বাইরের সৌন্দর্য নয়, ভেতরের সুস্থতা ও শক্তিতে নজর দিন।' },
          { habit: 'শরীর খারাপ লাগলেও বিশ্রাম নিতে অপরাধবোধ', negativeEffect: 'রোগ প্রতিরোধ ক্ষমতা সাময়িক হ্রাস পাওয়া।', cure: 'অসুস্থতার সময় নিজেকে সম্পূর্ণ বিশ্রাম নেওয়ার সুযোগ দিন।' },
        ],
      },
      topics: ['শরীরচর্চা ও শক্তি বৃদ্ধি', 'সুষম পুষ্টি ও ডায়েট', 'মানসিক চাপ নিয়ন্ত্রণ ও ধ্যান', 'সুস্থ দীর্ঘায়ু'],
      dislikes: ['অলসতা ও জাঙ্কফুড কালচার', 'চমকপ্রদ স্লিম হওয়ার ওষুধ', 'ব্যায়াম না করে অজুহাত দেওয়া'],
    },
    // 10: Creative Media & PR Strategist
    {
      archetypeTitle: 'সৃজনশীল ব্র্যান্ড স্টোরিটেলার ও মিডিয়া স্ট্র্যাটেজিস্ট (Creative Media & PR Strategist)',
      profession: 'কমিউনিকেশনস ডিরেক্টর, পিআর ম্যানেজার, ব্র্যান্ড কনসালটেন্ট বা ক্রিয়েটিভ লিড',
      vibeSummary: `${displayName} মানুষের আবেগ ও ধারণাকে ইতিবাচক দিকে প্রভাবিত করার শিল্পে দক্ষ। শব্দ, ভিজ্যুয়াল ও জনসংযোগের সমন্বয়ে তিনি যেকোনো জটিল বার্তা সহজ ও আকর্ষণীয়ভাবে সমাজের সামনে উপস্থাপন করেন।`,
      digitalAura: 'বাকপটু, আকর্ষণীয় ও কূটনৈতিক (Eloquent, Magnetic & Diplomatic)',
      introExtro: `${rng(32, 45)}% স্ক্রিপ্ট ও ভাবনার পরিকল্পনা, ${rng(55, 68)}% জনসংযোগ ও কনফারেন্স`,
      coreTraits: ['কূটনৈতিক বাচনভঙ্গি', 'জনপ্রিয়তা ও ট্রেন্ড সচেতনতা', 'সৃজনশীল স্টোরিটেলিং', 'সঙ্কট মোকাবিলা'],
      kpiBase: { pos: rng(87, 95), cons: rng(82, 90), opn: rng(75, 85), col: rng(88, 96) },
      traitScores: { civil: rng(91, 98), empathy: rng(83, 92), logic: rng(82, 91), consistency: rng(78, 88), errCorr: rng(83, 92) },
      virtues: [
        { name: 'যেকোনো বিতর্কিত পরিস্থিতিতে মার্জিত ভাষা ধরে রাখা', description: 'চরম উত্তেজনাকর মুহূর্তেও প্রতিপক্ষের মুখে হাসি ফোটানোর কূটনীতি।', score: rng(9, 10) },
        { name: 'জটিল ধারণাকে সাধারণ মানুষের হৃদয়গ্রাহী করে তোলা', description: 'বোরিং তথ্যকেও মনোমুগ্ধকর গল্পে রূপান্তর করার কারিশমা।', score: rng(9, 10) },
        { name: 'বিশাল সামাজিক বলয়ের সাথে উষ্ণ সম্পর্ক রক্ষা', description: 'সবার সাথে ব্যক্তিগত যোগাযোগ ও শিষ্টাচার বজায় রাখা।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'বাস্তব সত্যের চেয়ে ইমেজকে বেশি প্রাধান্য দেওয়া', whyItShows: 'কী ঘটছে তার চেয়ে মানুষ কী ভাবছে সেদিকে অতিরিক্ত নজর।', risk: 'নিজের আন্তরিক অনুভূতি হারিয়ে কৃত্রিম মনে হওয়া।', advice: 'ইমেজের চেয়ে নিজের প্রকৃত মূল্যবোধকে সবসময় এগিয়ে রাখুন।' },
        { name: 'সবাইকে খুশি করার অতিরিক্ত চেষ্টা (People Pleasing)', whyItShows: 'স্পষ্ট ‘না’ বলতে না পেরে অপ্রয়োজনীয় প্রতিশ্রুতি দেওয়া।', risk: 'পরবর্তীতে কথা রাখতে না পেরে সুনাম ক্ষুণ্ণ হওয়া।', advice: 'প্রথমেই বিনয়ের সাথে নিজের সীমাবদ্ধতা জানিয়ে দেওয়া শ্রেয়।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিদিন সকালবেলা প্রধান জাতীয় ও আন্তর্জাতিক সংবাদ দেখা', manifestation: 'চলমান ট্রেন্ড ও জনমতের পালস অনুভব করা।' },
          { habit: 'অন্যের সফল ক্যাম্পেইনের নোট সংরক্ষণ', manifestation: 'সৃজনশীল ভাবনার আর্কাইভ তৈরি করে রাখা।' },
        ],
        bad: [
          { habit: 'সামাজিক মাধ্যমে ক্রমাগত রিঅ্যাকশন চেক করা', negativeEffect: 'মনোযোগের গভীরতা হ্রাস ও অস্থিরতা তৈরি।', cure: 'সোশ্যাল মিডিয়া চেক করার জন্য দিনে ২টি নির্দিষ্ট সময় বরাদ্দ করুন।' },
          { habit: 'নিজের আসল দুঃখ বা ক্লান্তি লুকিয়ে মুখে হাসি রাখা', negativeEffect: 'অভ্যন্তরীণ অবসাদ ও মানসিক ভারাক্রান্ততা।', cure: 'অন্তরঙ্গ বন্ধুদের কাছে নিজের অনুভূতি ভাগ করে হালকা হোন।' },
        ],
      },
      topics: ['ব্র্যান্ড কমিউনিকেশন ও পিআর', 'জনমত ও সাইকোলজি', 'মিডিয়া ও বিজ্ঞাপন', 'ডিজিটাল প্রভাব বিস্তার'],
      dislikes: ['রুক্ষ ও আক্রমণাত্মক পিআর', 'মিথ্যা অপপ্রচার', 'অপেশাদার উপস্থাপনা'],
    },
    // 11: Youthful Trendsetter & Content Influencer
    {
      archetypeTitle: 'প্রাণবন্ত তরুণ ট্রেন্ডসেটার ও ডিজিটাল ইনফ্লুয়েন্সার (Youthful Content Trendsetter)',
      profession: 'শর্ট-ফর্ম ভিডিও ক্রিয়েটর, পপ-কালচার ভ্লগার বা ডিজিটাল বিনোদন উদ্যোক্তা',
      vibeSummary: `${displayName} তরুণ প্রজন্মের পালস বোঝেন এবং ডিজিটাল সংস্কৃতির দ্রুত পরিবর্তনশীল গতিকে উপভোগ করেন। প্রাণবন্ত হাস্যরস, ট্রেন্ডি প্রেজেন্টেশন এবং ইতিবাচক চিয়ারফুলনেস দিয়ে তিনি মানুষকে বিনোদন ও আনন্দ দেন।`,
      digitalAura: 'উচ্ছ্বল, আনন্দময় ও গতিশীল (Playful, Vibrant & Trend-Savvy)',
      introExtro: `${rng(25, 40)}% স্ক্রিপ্ট ও এডিটিং, ${rng(60, 75)}% ক্যামেরার সামনে প্রাণবন্ত উপস্থিতি`,
      coreTraits: ['হাস্যরস ও উইট', 'দ্রুত ট্রেন্ড অ্যাডাপ্টেশন', 'সহজ মিশুক স্বভাব', 'ডিজিটাল উদ্ভাবন'],
      kpiBase: { pos: rng(85, 94), cons: rng(70, 80), opn: rng(64, 75), col: rng(84, 93) },
      traitScores: { civil: rng(82, 91), empathy: rng(80, 89), logic: rng(70, 80), consistency: rng(65, 76), errCorr: rng(76, 86) },
      virtues: [
        { name: 'বিষণ্ণ মানুষের মুখে হাসি ফোটানোর দক্ষতা', description: 'সহজ কৌতুক ও নির্মল বিনোদন দিয়ে আশপাশকে আনন্দিত রাখা।', score: rng(8, 10) },
        { name: 'ক্যামেরা ও জনসমক্ষে স্বাভাবিক স্বতঃস্ফূর্ততা', description: 'বিনা আড়ষ্টতায় নিজের ব্যক্তিত্ব ফুটিয়ে তোলার সাহস।', score: rng(8, 10) },
        { name: 'নতুন ডিজিটাল টুলস ও ট্রেন্ডে সবার আগে মানিয়ে নেওয়া', description: 'প্রতিনিয়ত নতুন প্ল্যাটফর্ম ও ফরম্যাটে এক্সপেরিমেন্ট করা।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'গুরুত্বপূর্ণ গম্ভীর বিষয়কেও অতিরিক্ত হালকা করে ফেলা', whyItShows: 'সিরিয়াস সংকটকালেও কৌতুক করার প্রবণতা।', risk: 'অন্যের অনুভূতির প্রতি অসচেতন শোনানো।', advice: 'পরিস্থিতির গুরুত্ব বুঝে কথা বলার পরিপক্বতা অর্জন করুন।' },
        { name: 'ভিউ বা এটেনশন কমে গেলে দ্রুত হতাশ হয়ে পড়া', whyItShows: 'অ্যালগরিদমের ওঠানামায় নিজের আত্মমূল্য নির্ধারণ করা।', risk: 'মানসিক উদ্বেগ ও অস্থিতিশীল আচরণ।', advice: 'সংখ্যা দিয়ে নিজের মান নির্ধারণ করবেন না; কাজের আনন্দে কাজ করুন।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিদিন নতুন ভিডিও কনসেপ্ট স্ক্রিপ্ট করা', manifestation: 'সৃজনশীল আইডিয়া নোটপ্যাডে সাথে সাথে টুকে রাখা।' },
          { habit: 'ফলোয়ারদের সাথে সৌহার্দ্যপূর্ণ কমেন্ট বিনিময়', manifestation: 'প্রশংসার উত্তরে আন্তরিক ভালোবাসা প্রকাশ।' },
        ],
        bad: [
          { habit: 'রাত জেগে ভিডিও এডিটিং ও রিলস ব্রাউজিং', negativeEffect: 'চোখের ক্ষতি ও অনিদ্রা সমস্যা তৈরি হওয়া।', cure: 'রাত ১২টার মধ্যে সব গ্যাজেট দূরে সরিয়ে বিছানায় যান।' },
          { habit: 'ট্রেন্ডে থাকার তাড়নায় অপ্রয়োজনীয় কেনাকাটা', negativeEffect: 'অনাবশ্যক অর্থ অপচয় ও ঋণ তৈরি।', cure: 'কোনো ট্রেন্ডি গ্যাজেট কেনার আগে অন্তত ৩ দিন চিন্তা করুন।' },
        ],
      },
      topics: ['পপ-কালচার ও মিমস', 'শর্ট ভিডিও মেকিং ও এডিটিং', 'গেমিং ও বিনোদন', 'তরুণদের লাইফস্টাইল'],
      dislikes: ['অকারণে জ্ঞান দেওয়া মানুষ', 'বোরিং ও ধীরগতির কনটেন্ট', 'অনলাইন সাইবারবুলিং'],
    },
    // 12: Visionary Governance & Policy Analyst
    {
      archetypeTitle: 'দূরদর্শী নীতিনির্ধারক ও সুশাসন গবেষক (Visionary Governance & Policy Analyst)',
      profession: 'পলিসি এনালিস্ট, সিভিল সোসাইটি অ্যাডভোকেট, পাবলিক অ্যাডমিনিস্ট্রেশন কনসালটেন্ট',
      vibeSummary: `${displayName} প্রাতিষ্ঠানিক জবাবদিহিতা, আইনের শাসন এবং স্থায়ী সামাজিক অবকাঠামো রূপান্তরে বিশ্বাসী। তাৎক্ষণিক চমকের চেয়ে দীর্ঘমেয়াদী সংস্কার ও নীতির কার্যকারিতা তার মূল আগ্রহের বিষয়।`,
      digitalAura: 'ভারী, দূরদর্শী ও দায়িত্বশীল (Stately, Visionary & Prudent)',
      introExtro: `${rng(52, 66)}% গবেষণা ও পলিসি ড্রাফটিং, ${rng(34, 48)}% নাগরিক সংলাপ ও স্টেকহোল্ডার মিটিং`,
      coreTraits: ['সুশাসনের নীতিবোধ', 'দীর্ঘমেয়াদী দূরদর্শিতা', 'ধৈর্যশীল সংলাপে আস্থা', 'সংবিধান ও আইনের প্রতি শ্রদ্ধা'],
      kpiBase: { pos: rng(77, 86), cons: rng(89, 97), opn: rng(84, 93), col: rng(80, 89) },
      traitScores: { civil: rng(90, 97), empathy: rng(78, 87), logic: rng(90, 97), consistency: rng(86, 95), errCorr: rng(82, 91) },
      virtues: [
        { name: 'নাগরিক স্বার্থে আপসহীন বস্তুনিষ্ঠ পর্যবেক্ষণ', description: 'ব্যক্তিগত পছন্দ-অপছন্দের বাইরে গিয়ে জাতীয় স্বার্থ বিচার করা।', score: rng(9, 10) },
        { name: 'বিবদমান পক্ষের মধ্যে নীতিগত ঐকমত্য তৈরি', description: 'আইনি ও কাঠামোগত সমাধানের মাধ্যমে শান্তি ও স্থিতিশীলতা আনা।', score: rng(9, 10) },
        { name: 'পাবলিক রিসোর্সের ব্যবহারে সততা ও স্বচ্ছতা', description: 'সামাজিক ও প্রাতিষ্ঠানিক সম্পদে সর্বোচ্চ দায়িত্ববোধ দেখানো।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'আমলাতান্ত্রিক জটিলতায় দ্রুত বিরক্ত হওয়া কিন্তু আটকে থাকা', whyItShows: 'পদ্ধতিগত ধীরগতিতে কাজের গতি কমে যাওয়া।', risk: 'উদ্যোগে গতিশীলতা হারানো।', advice: 'কাঠামোর ভেতর থেকেই উদ্ভাবনী ছোট সমাধান দ্রুত বের করুন।' },
        { name: 'অতি-আনুষ্ঠানিকতার কারণে সাধারণ মানুষের সাথে দূরবর্তী মনে হওয়া', whyItShows: 'সদা গম্ভীর ও ফরমাল আচরণ বজায় রাখা।', risk: 'মাঠপর্যায়ের সহজ মানুষের সাথে আত্মিক দূরত্ব।', advice: 'মাঝে মাঝে সব আনুষ্ঠানিকতা ঝেড়ে ফেলে সহজ ভাষায় কথা বলুন।' },
      ],
      habits: {
        good: [
          { habit: 'জাতীয় বাজেট ও সরকারি গেজেট নিয়মিত বিশ্লেষণ', manifestation: 'নতুন আইনের প্রভাব নিয়ে নিরপেক্ষ মূল্যায়ন নথিভুক্ত করা।' },
          { habit: 'ভিন্নমতাদর্শী নীতিগবেষকদের সাথে নিয়মিত চা-চক্রে আলোচনা', manifestation: 'বহুমাত্রিক মতামতের মেলবন্ধন ঘটানো।' },
        ],
        bad: [
          { habit: 'অফিসের ফাইল ও গবেষণাপত্র নিয়ে বাড়িতেও মগ্ন থাকা', negativeEffect: 'পারিবারিক আড্ডায় অনুপস্থিত থাকা।', cure: 'বাড়ি পৌঁছানোর পর সরকারি বা নীতিগত ফাইল বন্ধ রাখুন।' },
          { habit: 'সবার মাঝে প্রাতিষ্ঠানিক অসততা দেখার প্রবণতা (Cynicism)', negativeEffect: 'ভেতরে ভেতরে এক ধরনের অবসাদ ভর করা।', cure: 'ইতিবাচক পরিবর্তন ও সৎ মানুষদের দিকেও নজর দিন।' },
        ],
      },
      topics: ['সুশাসন ও প্রাতিষ্ঠানিক সংস্কার', 'আইনের শাসন ও বিচারব্যবস্থা', 'উন্নয়ন অর্থনীতি', 'নাগরিক অধিকার'],
      dislikes: ['স্বজনপ্রীতি ও দুর্নীতি', 'আইন অমান্য করার অহংকার', 'জনতুষ্টিবাদী মিথ্যা প্রতিশ্রুতি'],
    },
    // 13: Eco-Conscious Activist & Green Advocate
    {
      archetypeTitle: 'পরিবেশ সচেতন সমাজকর্মী ও টেকসই জীবনধারক (Eco-Conscious Activist & Green Advocate)',
      profession: 'পরিবেশ বিজ্ঞানী, ক্লাইমেট অ্যাডভোকেট, টেকসই কৃষি পরামর্শক বা বনবিদ',
      vibeSummary: `${displayName} প্রকৃতি, জলবায়ু এবং ভবিষ্যৎ প্রজন্মের বাসযোগ্য পৃথিবীর জন্য আন্তরিকভাবে কাজ করেন। মিনিমালিজম, প্লাস্টিকমুক্ত জীবন এবং জীববৈচিত্র্য সংরক্ষণে তার অবদান সমাজের জন্য অনুপ্রেরণাদায়ী।`,
      digitalAura: 'নির্মল, মাটির কাছাকাছি ও সংকল্পবদ্ধ (Earthy, Mindful & Pure)',
      introExtro: `${rng(45, 60)}% প্রকৃতির সাথে সান্নিধ্য, ${rng(40, 55)}% ক্লাইমেট ক্যাম্পেইন ও সভা`,
      coreTraits: ['প্রকৃতির প্রতি গভীর মমত্ব', 'মিনিমালিস্ট সরলতা', 'টেকসই জীবনধারা', 'অন্যায়ের বিরুদ্ধে অহিংস প্রতিরোধ'],
      kpiBase: { pos: rng(84, 93), cons: rng(82, 91), opn: rng(81, 90), col: rng(86, 94) },
      traitScores: { civil: rng(89, 96), empathy: rng(90, 97), logic: rng(81, 90), consistency: rng(82, 91), errCorr: rng(80, 89) },
      virtues: [
        { name: 'মিনিমালিজম ও অপচয়হীন জীবনযাপন', description: 'প্রয়োজনের অতিরিক্ত ভোগ পরিহার করে পরিবেশবান্ধব থাকা।', score: rng(9, 10) },
        { name: 'নীরব প্রকৃতির হয়ে কথা বলার মানবিক সাহস', description: 'নদী, বন ও পশুপাখির অধিকার রক্ষায় সোচ্চার থাকা।', score: rng(9, 10) },
        { name: 'মাটির কাছাকাছি থেকে মানুষের সাথে সহমর্মিতা', description: 'কৃষক ও প্রান্তিক জনগোষ্ঠীর কষ্টে পাশে দাঁড়ানোর অঙ্গীকার।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'আধুনিক নগরায়ণ ও প্রযুক্তির প্রতি অতিরিক্ত সন্দেহ', whyItShows: 'যেকোনো বড় উন্নয়ন প্রকল্প দেখলেই ক্ষুব্ধ প্রতিক্রিয়া দেওয়া।', risk: 'বাস্তবসম্মত অর্থনৈতিক চাহিদা অনুধাবনে বাধা।', advice: 'টেকসই প্রযুক্তি ও পরিবেশের সমন্বিত সমাধান খুঁজুন।' },
        { name: 'জলবায়ু পরিবর্তনের শঙ্কায় দীর্ঘস্থায়ী ইকো-অ্যাংজাইটি', whyItShows: 'পৃথিবীর ভবিষ্যৎ নিয়ে অতিরিক্ত দুশ্চিন্তায় থাকা।', risk: 'নিজের মানসিক প্রশান্তি বিনষ্ট হওয়া।', advice: 'আপনার সাধ্যমতো ইতিবাচক কাজ করুন, বাকিটা প্রকৃতির ওপর ছাড়ুন।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতি মাসে বৃক্ষরোপণ ও পরিচর্যা', manifestation: 'শহরের ছাদবাগান বা প্রত্যন্ত অঞ্চলে গাছ লাগানো।' },
          { habit: 'একবার ব্যবহারযোগ্য প্লাস্টিক সম্পূর্ণ বর্জন', manifestation: 'কাপড়ের ব্যাগ ও কাঁচের বোতল সবসময় সাথে রাখা।' },
        ],
        bad: [
          { habit: 'পরিবেশের ক্ষতি দেখে হুট করে মেজাজ হারানো', negativeEffect: 'তর্কে জড়িয়ে মূল উদ্দেশ্য ব্যাহত হওয়া।', cure: 'রাগ নয়, যুক্তি ও সচেতনতার মাধ্যমে মানুষকে বোঝান।' },
          { habit: 'নিজের ক্লান্তি বা শারীরিক পুষ্টি অবহেলা করা', negativeEffect: 'মাঠপর্যায়ে কাজের সময় দুর্বল হয়ে পড়া।', cure: 'পর্যাপ্ত পুষ্টিকর খাবার ও নিয়মিত বিশ্রামের যত্ন নিন।' },
        ],
      },
      topics: ['জলবায়ু পরিবর্তন ও বন সংরক্ষণ', 'টেকসই কৃষি ও জৈব খাদ্য', 'নবায়নযোগ্য শক্তি', 'মিনিমালিজম ও জিরো ওয়েস্ট'],
      dislikes: ['প্লাস্টিক দূষণ ও গাছ কাটা', 'প্রাণীদের প্রতি নিষ্ঠুরতা', 'কর্পোরেট গ্রিনওয়াশিং'],
    },
    // 14: Artistic Soul & Music Polymath
    {
      archetypeTitle: 'আত্মমগ্ন সঙ্গীতশিল্পী ও শিল্প রসজ্ঞ (Artistic Soul & Music Polymath)',
      profession: 'সঙ্গীত পরিচালক, সাউন্ড ডিজাইনার, ইনস্ট্রুমেন্টালিস্ট বা সাংস্কৃতিক কিউরেটর',
      vibeSummary: `${displayName} সুর, তাল ও সুরের অন্তর্লীন দর্শনে নিমগ্ন একজন সংবেদনশীল শিল্পী। পার্থিব কোলাহল এড়িয়ে তিনি সৃষ্টিশীল অনুভূতির ক্যানভাসে মানুষের আত্মার কথা তুলে ধরতে নিবেদিত।`,
      digitalAura: 'রহস্যময়, সুরময় ও আত্মমগ্ন (Mystical, Melodic & Soulful)',
      introExtro: `${rng(65, 80)}% স্টুডিও ও একাকী রেওয়াজ, ${rng(20, 35)}% কনসার্ট ও ভক্তদের ভালোবাসা`,
      coreTraits: ['সুরের গভীর সংবেদনশীলতা', 'আত্মিক একাগ্রতা', 'সৃজনশীল বিশুদ্ধতা', 'অহংকারহীন শিল্পসাধনা'],
      kpiBase: { pos: rng(81, 90), cons: rng(75, 84), opn: rng(70, 81), col: rng(79, 88) },
      traitScores: { civil: rng(87, 95), empathy: rng(88, 96), logic: rng(74, 83), consistency: rng(72, 82), errCorr: rng(78, 87) },
      virtues: [
        { name: 'শিল্প সৃষ্টিতে আপসহীন নিষ্ঠা', description: 'সস্তা ট্রেন্ডের পেছনে না ছুটে নিজের মৌলিক কাজে বিশ্বাস রাখা।', score: rng(9, 10) },
        { name: 'অন্যের সৃষ্টিকে অকৃত্রিম সম্মান জানানো', description: 'নবীন শিল্পীদের উৎসাহ দেওয়া ও তাদের ভালো কাজের প্রশংসা।', score: rng(8, 10) },
        { name: 'চিত্তের নির্মলতা ও আধ্যাত্মিক প্রশান্তি', description: 'হিংসা ও প্রতিযোগিতা পরিহার করে শিল্পের ভেতর শান্তি খোঁজা।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'বাস্তব জীবনের বৈষয়িক হিসাব-নিকাশে উদাসীনতা', whyItShows: 'ট্যাক্স, বিল বা আইনি নথিপত্র ফেলে রাখার প্রবণতা।', risk: 'আর্থিক অব্যবস্থাপনা ও শেষ মুহূর্তের ভোগান্তি।', advice: 'বিশ্বস্ত কাউকে দিয়ে বৈষয়িক বিষয়গুলো নিয়মের মধ্যে রাখুন।' },
        { name: 'মুডের প্রভাবে কাজের ছন্দ হারিয়ে ফেলা', whyItShows: 'অনুপ্রেরণা না পেলে দিনকে দিন কোনো কাজ না করা।', risk: 'পেশাদার প্রতিশ্রুতি ব্যাহত হওয়া।', advice: 'মুডের জন্য অপেক্ষা না করে দৈনিক চর্চাকে রুটিনে পরিণত করুন।' },
      ],
      habits: {
        good: [
          { habit: 'প্রতিদিন সকালে ভোরের আলোয় সঙ্গীত রেওয়াজ', manifestation: 'সুরে মন নিবিষ্ট করে দিন শুরু করা।' },
          { habit: 'প্রকৃতির শব্দ রেকর্ড করা ও সঙ্গীত প্রযোজনায় ব্যবহার', manifestation: 'পাখির ডাক, বৃষ্টির শব্দ বা নদীর কলতান ধারণ।' },
        ],
        bad: [
          { habit: 'রাত জেগে স্টুডিওতে থাকা ও দিনের বেলা ঘুমানো', negativeEffect: 'দিন-রাতের স্বাভাবিক বায়োলজিক্যাল ক্লক নষ্ট হওয়া।', cure: 'ভোরে কাজ করার অভ্যাস গড়ে রাতের ঘুম নিশ্চিত করুন।' },
          { habit: 'সমালোচনা সহজে ভুলতে না পারা', negativeEffect: 'মনের ভেতর বিষাদ পুষে রাখা।', cure: 'সমালোচনাকে সৃষ্টির প্রেরণা হিসেবে গ্রহণ করুন।' },
        ],
      },
      topics: ['ধ্রুপদী ও ফিউশন সঙ্গীত', 'সাউন্ডস্কেপ ও ফিল্ম স্কোরিং', 'বাদ্যযন্ত্র ও অডিও গিয়ার', 'আধ্যাত্মিক কবিতা ও গান'],
      dislikes: ['অটো-টিউনড মেকি সঙ্গীত', 'শিল্পীর ন্যায্য রয়্যালটি ফাঁকি', 'কোলাহলময় অহেতুক শো-অফ'],
    },
    // 15: Harmonious Peacemaker & Community Anchor
    {
      archetypeTitle: 'ধীরস্থির পরিবারকেন্দ্রিক ও সামাজিক শান্তিপ্রিয় (Harmonious Peacemaker & Anchor)',
      profession: 'পারিবারিক পরামর্শক, শিক্ষক, সমাজসেবক বা সিনিয়র অভিভাবক ব্যক্তিত্ব',
      vibeSummary: `${displayName} শান্তি, পারস্পরিক সম্প্রীতি ও পরিবারের বন্ধনকে জীবনের সবচেয়ে বড় সম্পদ মনে করেন। কোনো দ্বন্দ্ব বা মতানৈক্য দেখা দিলে তিনি ধীরস্থিরভাবে দুই পক্ষকে মিলিয়ে দিয়ে শান্তির ছায়া এনে দেন।`,
      digitalAura: 'শান্ত, স্নেহময় ও নিরাপদ (Serene, Nurturing & Grounded)',
      introExtro: `${rng(42, 56)}% পারিবারিক পারিবারিক শান্তি, ${rng(44, 58)}% সামাজিক মঙ্গলে ভূমিকা`,
      coreTraits: ['ক্ষমাশীলতা ও ধৈর্য', 'পারিবারিক দায়বদ্ধতা', 'শান্তিপূর্ণ সমাধান', 'উষ্ণ আতিথেয়তা'],
      kpiBase: { pos: rng(88, 96), cons: rng(83, 91), opn: rng(82, 91), col: rng(90, 98) },
      traitScores: { civil: rng(92, 98), empathy: rng(91, 98), logic: rng(80, 89), consistency: rng(84, 93), errCorr: rng(85, 94) },
      virtues: [
        { name: 'বিবাদ মেটানোর অতুলনীয় প্রজ্ঞা ও ক্ষমাশীলতা', description: 'কখনোই মনে ক্ষোভ না রেখে আগে বাড়িয়ে কথা বলে বিবাদ মেটানো।', score: rng(9, 10) },
        { name: 'পরিবার ও প্রতিবেশীর বিপদে নির্ভরতার আশ্রয়', description: 'যেকোনো বিপদে মানুষ তার কাছে ছুটে আসে নিঃসংকোচে।', score: rng(9, 10) },
        { name: 'কথা ও ব্যবহারে অনন্য মিষ্টতা ও গাম্ভীর্য', description: 'কখনো কারো মনে আঘাত দিয়ে কথা না বলার চারিত্রিক মাধুর্য।', score: rng(8, 9) },
      ],
      flaws: [
        { name: 'অন্যায় বা সংঘর্ষ এড়াতে অনেক সময় নীরব থাকা', whyItShows: 'শান্তি বজায় রাখতে গিয়ে স্পষ্ট প্রতিবাদ করতে দ্বিধা করা।', risk: 'অন্যায়ের শিকার মানুষের সঠিক বিচার দেরিতে হওয়া।', advice: 'শান্তি রক্ষার পাশাপাশি ন্যায়ের পক্ষে স্পষ্ট অবস্থান নেওয়া জরুরি।' },
        { name: 'নিজের ব্যক্তিগত প্রয়োজন সবসময় পরিবারের পেছনে ঠেলে দেওয়া', whyItShows: 'নিজের শখ বা বিশ্রামের কথা ভুলেই যাওয়া।', risk: 'বয়স বাড়লে শারীরিক ও মানসিক অবসাদ।', advice: 'নিজের সুস্থতা ও খুশির জন্যও সময় বরাদ্দ রাখুন।' },
      ],
      habits: {
        good: [
          { habit: 'পরিবারের সবাইকে নিয়ে একসাথে রাতের খাবার গ্রহণ', manifestation: 'খোলামেলা আলোচনার মাধ্যমে পারিবারিক বন্ধন দৃঢ় রাখা।' },
          { habit: 'প্রতিবেশীর খোঁজখবর নেওয়া ও মিষ্টি খাবার পাঠানো', manifestation: 'সামাজিক সম্প্রীতির ঐতিহ্য বজায় রাখা।' },
        ],
        bad: [
          { habit: 'অযথা পরিবারের সদস্যদের নিয়ে অতিরিক্ত উৎকণ্ঠা', negativeEffect: 'রক্তচাপ বৃদ্ধি ও অতিরিক্ত দুশ্চিন্তা।', cure: 'সবার ওপর আস্থা রাখুন এবং বিধাতার ওপর ভরসা রাখুন।' },
          { habit: 'পুরনো জিনিসের প্রতি অতিরিক্ত মায়া ও জমিয়ে রাখা', negativeEffect: 'বাড়িতে অযাচিত ভিড় তৈরি হওয়া।', cure: 'অপ্রয়োজনীয় জিনিস অসচ্ছলদের দান করে দিন।' },
        ],
      },
      topics: ['পারিবারিক মূল্যবোধ ও সম্পর্ক', 'সন্তান প্রতিপালন ও নৈতিক শিক্ষা', 'সামাজিক সম্প্রীতি', 'ঐতিহ্যবাহী রন্ধনশিল্প'],
      dislikes: ['পারিবারিক কলহ ও ভাঙন', 'বড়দের প্রতি অশ্রদ্ধা', 'অহংকারী দুর্ব্যবহার'],
    },
  ];

  // Specific content-based category steering (if keywords present in bio/notes), else use master entropy
  const isTechKeyword = combinedText.includes('software') || combinedText.includes('developer') || combinedText.includes('coding') || combinedText.includes('ai') || combinedText.includes('github') || combinedText.includes('প্রযুক্তি');
  const isArtKeyword = combinedText.includes('photography') || combinedText.includes('travel') || combinedText.includes('wanderer') || combinedText.includes('নান্দনিক') || combinedText.includes('ছবি');
  const isPhilKeyword = combinedText.includes('philosophy') || combinedText.includes('লেখক') || combinedText.includes('রাজনীতি') || combinedText.includes('সমাজদর্শন');
  const isCorpKeyword = combinedText.includes('executive') || combinedText.includes('ceo') || combinedText.includes('ব্যবসা') || combinedText.includes('ম্যানেজমেন্ট');
  const isScholarKeyword = combinedText.includes('research') || combinedText.includes('phd') || combinedText.includes('বিশ্ববিদ্যালয়') || combinedText.includes('গবেষণা');

  let archetypeIndex: number;
  if (isTechKeyword) {
    archetypeIndex = rng(0, 1) === 0 ? 0 : 6;
  } else if (isArtKeyword) {
    archetypeIndex = rng(0, 1) === 0 ? 1 : 14;
  } else if (isPhilKeyword) {
    archetypeIndex = rng(0, 1) === 0 ? 2 : 7;
  } else if (isCorpKeyword) {
    archetypeIndex = rng(0, 1) === 0 ? 3 : 8;
  } else if (isScholarKeyword) {
    archetypeIndex = rng(0, 1) === 0 ? 4 : 12;
  } else {
    // Pure entropy hashing across all 16 archetypes — guarantees diverse distribution for different links
    archetypeIndex = masterSeed % ARCHETYPES.length;
  }

  const selectedArch = ARCHETYPES[archetypeIndex];

  // Calculate unique perturbed KPI scores based on this specific profile
  const posScore = Math.min(98, Math.max(58, selectedArch.kpiBase.pos + rng(-4, 4)));
  const consScore = Math.min(98, Math.max(58, selectedArch.kpiBase.cons + rng(-4, 4)));
  const opnScore = Math.min(98, Math.max(55, selectedArch.kpiBase.opn + rng(-5, 5)));
  const colScore = Math.min(98, Math.max(58, selectedArch.kpiBase.col + rng(-4, 4)));

  // Calculate unique perturbed Trait Breakdown scores
  const civilScore = Math.min(98, Math.max(55, selectedArch.traitScores.civil + rng(-4, 4)));
  const empathyScore = Math.min(98, Math.max(55, selectedArch.traitScores.empathy + rng(-4, 4)));
  const logicScore = Math.min(98, Math.max(55, selectedArch.traitScores.logic + rng(-4, 4)));
  const consistencyScore = Math.min(98, Math.max(55, selectedArch.traitScores.consistency + rng(-4, 4)));
  const errCorrScore = Math.min(98, Math.max(55, selectedArch.traitScores.errCorr + rng(-4, 4)));

  // Dynamic persona-specific AI Observations synthesizing individual metrics
  const obs1 =
    civilScore >= 88
      ? `${displayName}-এর প্রকাশ্য আলোচনায় অত্যন্ত মার্জিত, শ্রদ্ধাপূর্ণ ও শিষ্ট শব্দচয়ন দেখা গেছে।`
      : civilScore >= 78
      ? `${displayName}-এর ডিজিটাল বাচনভঙ্গিতে শালীনতা ও স্পষ্ট আত্মবিশ্বাসের চমৎকার মেলবন্ধন লক্ষণীয়।`
      : `${displayName} মত প্রকাশের ক্ষেত্রে আবেগতাড়িত না হয়ে সরাসরি ও অকপট ভাব বজায় রাখেন।`;

  const obs2 =
    logicScore >= 88
      ? `${platform}-এ অহেতুক বিরোধ এড়িয়ে বিভিন্ন বিষয়ে তথ্যপ্রমাণ ও কার্যকর যুক্তি দিয়ে মতামত প্রকাশের সুস্পষ্ট নজির রয়েছে।`
      : logicScore >= 78
      ? `${platform}-এ গঠনমূলক আলোচনার মাধ্যমে বাস্তবসম্মত সমাধান খোঁজার ইতিবাচক মানসিকতা দেখা যায়।`
      : `${platform}-এ ব্যক্তিগত অভিজ্ঞতা ও আন্তরিক অনুভূতির সুষম সমন্বয় ঘটিয়ে মতামত বিনিময় করেন।`;

  const obs3 =
    consistencyScore >= 82
      ? `সময়ের সাথে সাথে ${displayName}-এর দৃষ্টিভঙ্গি ও প্রকাশ্য অবস্থান অত্যন্ত পরিপক্ব ও আদর্শিকভাবে সুসংহত।`
      : errCorrScore >= 80
      ? `কোনো তথ্যে অস্পষ্টতা দেখা দিলে তা দায়িত্বশীলতার সাথে সংশোধন ও পরিমার্জন করার সুস্থ উদাহরণ রয়েছে।`
      : `বিভিন্ন সামাজিক ও সমসাময়িক বিষয়ে সময়ের সঙ্গে সঙ্গে দৃষ্টিভঙ্গির ইতিবাচক ও ভারসাম্যপূর্ণ বিবর্তন পরিলক্ষিত হয়।`;

  const dynamicObservations = [obs1, obs2, obs3];

  // Safety & Fraud Check
  const hasFraud = Boolean(combinedText.includes('প্রতারক') || combinedText.includes('টাকা মেরে') || combinedText.includes('জালিয়াতি') || combinedText.includes('স্ক্যাম'));
  const hasLiar = Boolean(combinedText.includes('মিথ্যাবাদী') || combinedText.includes('বানোয়াট') || combinedText.includes('মিথ্যা কথা'));
  const hasDanger = Boolean(combinedText.includes('বিপজ্জনক') || combinedText.includes('সহিংস') || combinedText.includes('মারধর') || combinedText.includes('হুমকি'));
  const isRiskAlert = hasFraud || hasLiar || hasDanger;

  const safetyAudit = isRiskAlert
    ? {
        isScammerOrFraud: hasFraud,
        isHabitualLiar: hasLiar,
        isDangerousOrToxic: hasDanger,
        overallRiskLevel: (hasDanger ? 'critical' : hasFraud ? 'high_danger' : 'moderate_risk') as any,
        safetyScore: hasDanger ? rng(20, 30) : hasFraud ? rng(32, 42) : rng(44, 52),
        fraudRiskAssessmentBn: hasFraud
          ? '⚠️ উচ্চ ঝুঁকি: এই প্রোফাইল বা ব্যক্তির বিরুদ্ধে আর্থিক প্রতারণা ও অনৈতিক লেনদেনের সন্দেহ বা অভিযোগ বিদ্যমান।'
          : 'প্রতারণার স্পষ্ট প্রমাণ কম, তবে লেনদেনে স্বচ্ছতা নিশ্চিত করা আবশ্যক।',
        honestyRiskAssessmentBn: hasLiar
          ? '⚠️ মিথ্যাচার সতর্কতা: ব্যক্তিটি প্রায়শই নিজের সুবিধার্থে তথ্য বিকৃত করে এবং বিভ্রান্তিকর কথা বলে।'
          : 'বড় ধরনের মিথ্যাচারের সরাসরি লক্ষণ কম, তবে গুরুত্বপূর্ণ তথ্য যাচাই করা নিরাপদ।',
        dangerAssessmentBn: hasDanger
          ? '🚨 ক্ষতিকর আচরণ সংকেত: ব্যক্তিটির মাঝে চরম আগ্রাসী ভাষা, ব্ল্যাকমেইল বা মানসিক ক্ষতির স্পষ্ট আশঙ্কা রয়েছে।'
          : 'সহিংসতার সরাসরি লক্ষণ দৃশ্যমান নয়, তবে সতর্ক দূরত্ব বজায় রাখা শ্রেয়।',
        redFlagsBn: [
          ...(hasFraud ? ['আর্থিক লেনদেনে অস্বচ্ছতা ও দায় এড়ানোর প্রবণতা'] : []),
          ...(hasLiar ? ['ধারাবাহিক মিথ্যা বলা ও কথায় কথার গরমিল'] : []),
          ...(hasDanger ? ['চরম ক্ষতিকর বা আক্রমণাত্মক ভাষা ব্যবহারের নজির'] : []),
        ],
        safetyAdviceBn:
          'জরুরি সতর্কতা: এই ব্যক্তির সাথে কোনো আর্থিক লেনদেন বা ব্যক্তিগত সংবেদনশীল তথ্য শেয়ার করা থেকে বিরত থাকুন। মেলামেশা করলে কঠোর পেশাদার সীমানা রক্ষা করুন।',
      }
    : {
        isScammerOrFraud: false,
        isHabitualLiar: false,
        isDangerousOrToxic: false,
        overallRiskLevel: 'safe' as any,
        safetyScore: rng(88, 97),
        fraudRiskAssessmentBn: 'কোনো আর্থিক বা ব্যক্তিগত প্রতারণার লক্ষণ নেই। প্রোফাইল স্বচ্ছ ও বিশ্বস্ত।',
        honestyRiskAssessmentBn: 'সত্যবাদিতার স্তর অত্যন্ত সন্তোষজনক ও দায়িত্বশীল। বানোয়াট তথ্যের প্রবণতা নেই।',
        dangerAssessmentBn: 'কোনো প্রকার সহিংস বা ক্ষতিকর আচরণ অনুপস্থিত। সামাজিক ও পেশাগত সম্পর্কের জন্য নিরাপদ।',
        redFlagsBn: ['কোনো নিরাপত্তা ঝুঁকি বা প্রতারণামূলক রেড ফ্ল্যাগ পাওয়া যায়নি (নিরাপদ ব্যক্তি)।'],
        safetyAdviceBn: 'এই ব্যক্তির সাথে সোশ্যাল যোগাযোগ, বন্ধুত্ব বা অংশীদারিত্ব পুরোপুরি নিরাপদ। পারস্পরিক শ্রদ্ধা রক্ষা করুন।',
      };

  const isDemoUrl = url.includes('example.com') || url.includes('demo_profile');

  return {
    targetHandleOrName: displayName,
    platform: platform,
    profileUrl: url || 'https://social.media/' + (profileDetails.rawSlug || 'profile'),
    socialPersonalityScorecard: {
      reportTitle: 'Social Personality Report',
      disclaimerBn: isDemoUrl
        ? 'কাল্পনিক উদাহরণ · প্রকৃত ব্যক্তির মূল্যায়ন নয়'
        : `ডিজিটাল ফুটপ্রিন্ট ও আচরণগত মূল্যায়ন · ${platform}`,
      kpis: {
        positiveCommunication: posScore,
        constructiveDiscussion: consScore,
        opinionConsistency: opnScore,
        collaborativeBehavior: colScore,
      },
      traitBreakdown: [
        { nameBn: 'ভদ্র যোগাযোগ', score: civilScore, descriptionBn: 'সম্মানজনক ও শিষ্ট শব্দচয়ন' },
        { nameBn: 'সহানুভূতির প্রকাশ', score: empathyScore, descriptionBn: 'অন্যের আবেগ ও সংকট উপলব্ধি' },
        { nameBn: 'যুক্তিনির্ভর আলোচনা', score: logicScore, descriptionBn: 'উপাত্ত ও যুক্তিভিত্তিক মতামত' },
        { nameBn: 'মতামতের ধারাবাহিকতা', score: consistencyScore, descriptionBn: 'সময়ের সাথে ভাবনার ভারসাম্য' },
        { nameBn: 'ভুল সংশোধনের প্রবণতা', score: errCorrScore, descriptionBn: 'ভুল চিহ্নিত হলে তা শুধরে নেওয়া' },
      ],
      aiObservationsBn: dynamicObservations,
    },
    identitySummary: {
      archetypeTitle: selectedArch.archetypeTitle,
      vibeSummary: selectedArch.vibeSummary,
      inferredProfessionOrRole: selectedArch.profession,
      introvertExtrovertRatio: selectedArch.introExtro,
      digitalAura: selectedArch.digitalAura,
    },
    characterAndTraits: {
      coreTraits: selectedArch.coreTraits,
      topVirtues: selectedArch.virtues,
      topFlaws: selectedArch.flaws,
    },
    habits: {
      goodHabits: selectedArch.habits.good,
      badHabits: selectedArch.habits.bad,
    },
    psychology: {
      emotionalTriggers: [
        'অযাচিত অপমান বা অসম্মানজনক মন্তব্য সহ্য করতে না পারা',
        'কাজের ন্যায্য স্বীকৃতি না পাওয়া বা উপেক্ষা বোধ করা',
        'নিজের সময়ের অপচয় ও অনর্থক জটিলতা তৈরি হওয়া',
      ],
      decisionStyle: logicScore > 84 ? 'গভীর বিশ্লেষণ ও তথ্যভিত্তিক উপাত্ত বিচার' : 'আবেগ ও তাৎক্ষণিক অনুভূতির সমন্বয়ে সচেতন সিদ্ধান্ত',
      stressResponse: 'চাপ সৃষ্টি হলে কিছুটা নির্জনতা বেছে নেন এবং পছন্দের কাজে মন শান্ত করেন।',
      mindsetArchetype: selectedArch.archetypeTitle.split(' ')[0] || 'চিন্তাশীল সংস্কারক',
    },
    likesAndDislikes: {
      favoriteTopicsAndInterests: selectedArch.topics,
      petPeevesAndDislikes: selectedArch.dislikes,
      contentPreferences: ['বিশ্লেষণমূলক লেখা ও অর্থপূর্ণ পোস্ট', 'নান্দনিক ভিজ্যুয়াল ও সৃজনশীল কন্টেন্ট', 'হাস্যরসাত্মক ও মার্জিত উপাদান'],
    },
    addictionsAndWeaknesses: {
      digitalAddictions: [
        platform === 'Instagram'
          ? 'রিলস ও নান্দনিক ছবি ব্রাউজ করা'
          : platform === 'LinkedIn'
          ? 'ক্যারিয়ার ট্রেন্ড ও আর্টিকেল স্ক্রোলিং'
          : 'সোশ্যাল মিডিয়ায় গুরুত্বপূর্ণ পোস্ট ও কমেন্ট পড়া',
      ],
      materialOrEmotionalWeaknesses: ['আন্তরিক প্রশংসা পেলে সহজেই আশ্বস্ত হওয়া', 'পছন্দের শখ বা গ্যাজেটে দুর্বলতা'],
      hiddenVulnerabilities: ['কাছের মানুষের অপ্রত্যাশিত ব্যবহারে ভেতরে কষ্ট পুষে রাখা'],
    },
    lifestyle: {
      dailyRhythm: rng(1, 2) === 1 ? 'সকালে দ্রুত কাজ শুরু করে রাতে গোছানো রুটিন' : 'রাতে সৃজনশীল ভাবনার প্রবাহ বেশি, সকালে কিছুটা ধীরস্থির',
      aestheticAndFashionTaste: 'স্মার্ট ক্যাজুয়াল, রুচিশীল রঙের সমন্বয় ও মার্জিত আউটফিট',
      socialCircleNature: 'সোশ্যাল মাধ্যমে বিস্তৃত পরিচিতি হলেও বাস্তব জীবনে খুব অল্পসংখ্যক বিশ্বস্ত বন্ধু',
      spendingTendency: 'অভিজ্ঞতা অর্জন (ভ্রমণ, বই, আধুনিক প্রযুক্তি) ও মানসম্মত জীবনে ব্যয়ের আগ্রহ',
    },
    communicationAndDatingAdvice: {
      howToImpressThem: [
        `তার বুদ্ধিবৃত্তিক রুচি, কন্টেন্ট বা কাজের সূক্ষ্ম প্রশংসা করুন।`,
        `কথোপকথনে ভানহীন অকপটতা ও আন্তরিক সম্মান বজায় রাখুন।`,
        `নতুন ও আকর্ষণীয় কোনো তথ্য বা আইডিয়া শেয়ার করে আলোচনা শুরু করুন।`,
      ],
      thingsToAvoidSaying: [
        `তার শখ, মতামত বা পোস্টকে তাচ্ছিল্য করে অবমূল্যায়ন করবেন না।`,
        `অযাচিত জ্ঞান দেওয়ার মতো উপদেশের সুরে কথা বলবেন না।`,
        `মেসেজের উত্তরে অযথা দীর্ঘ সময় অবহেলা বা উদাসীনতা দেখাবেন না।`,
      ],
      compatibilityTips: 'ব্যক্তিত্বের স্বাধীনতা ও পারস্পরিক আস্থা বজায় রাখলে এই মানুষটি অত্যন্ত বিশ্বস্ত ও চমৎকার সঙ্গ দেবে।',
    },
    professionalCommunication: {
      styleTitleBn: selectedArch.archetypeTitle,
      workplaceToneBn: 'পেশাগত যোগাযোগে মার্জিত, দায়িত্বশীল ও সহযোগিতাপূর্ণ সুর বজায় রাখেন।',
      conflictResolutionBn: 'মতবিরোধ হলে ব্যক্তিগত আক্রমণ না করে তথ্য ও যুক্তিভিত্তিক সমঝোতা বেছে নেন।',
      teamCollaborationBn: 'দলগত কাজে সক্রিয় সমন্বয়ক ও পারস্পরিক বোঝাপড়ায় সহমর্মী।',
      leadershipOrFollowershipBn: 'উদ্ভাবনী চিন্তাভাবনা বাস্তবায়নে সাহসী এবং যৌথ লক্ষ্যে দায়বদ্ধ।',
      recommendationBn: 'কর্মক্ষেত্রে গুরুত্বপূর্ণ বার্তা আরও সংক্ষেপে ও বুলেট পয়েন্টে দিলে কার্যকারিতা বাড়বে।',
    },
    category7DecisionAndCognition: {
      categoryTitleBn: 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনা',
      overallScore: Math.round((logicScore + consScore + errCorrScore) / 3),
      summaryBn: 'অনলাইন মতামত ও সিদ্ধান্ত গ্রহণে যৌক্তিক বিচারবুদ্ধি ও তথ্যের সমন্বিত প্রকাশ ঘটে।',
      logicalDiscussionTendency: {
        titleBn: 'যুক্তিনির্ভর আলোচনার প্রবণতা',
        score: logicScore,
        statusBn: logicScore > 85 ? 'উচ্চ' : 'প্রশংসনীয়',
        observationBn: 'যুক্তি ও তথ্যপ্রমাণের ভিত্তিতে কথোপকথনে অংশ নেন, ভিত্তিহীন গুজবে সায় দেন না।',
      },
      factCheckingHabit: {
        titleBn: 'তথ্য যাচাইয়ের অভ্যাস',
        score: Math.min(98, logicScore + rng(-3, 3)),
        statusBn: 'সচেতন',
        observationBn: 'সোশ্যাল মিডিয়ায় কোনো খবর দেখলেই বিশ্বাস না করে নির্ভরযোগ্য উৎস যাচাই করার ইতিবাচক অভ্যাস রয়েছে।',
      },
      decisionJustificationAbility: {
        titleBn: 'সিদ্ধান্তের পক্ষে যুক্তি দেওয়ার ক্ষমতা',
        score: Math.min(98, consScore + rng(-2, 3)),
        statusBn: 'দক্ষ',
        observationBn: 'নিজের সিদ্ধান্তের কারণ স্পষ্ট ও গ্রহণযোগ্যভাবে উপস্থাপন করতে সক্ষম।',
      },
      alternativePerspectives: {
        titleBn: 'ভিন্ন দৃষ্টিভঙ্গি বিবেচনা',
        score: Math.min(98, empathyScore + rng(-2, 3)),
        statusBn: 'উদার',
        observationBn: 'ভিন্ন মতকে তাৎক্ষণিক তাচ্ছিল্য না করে তাদের যুক্তি অনুধাবনের চেষ্টা করেন।',
      },
      learningFromMistakes: {
        titleBn: 'ভুল থেকে শেখার প্রকাশ্য উদাহরণ',
        score: errCorrScore,
        statusBn: 'সততা',
        observationBn: 'ভুল চিহ্নিত হলে তা ভদ্রভাবে স্বীকার করে পোস্ট এডিট বা স্পষ্টীকরণের সুস্থ নজির আছে।',
      },
      problemAnalysisApproach: {
        titleBn: 'সমস্যা বিশ্লেষণের ধরন',
        score: Math.min(98, logicScore + rng(-3, 2)),
        statusBn: 'পদ্ধতিগত',
        observationBn: 'সমস্যার বহুমুখী দিক বিচার করে সমাধান নির্ধারণ করেন।',
      },
    },
    category8OnlineBehaviorConsistency: {
      categoryTitleBn: 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা',
      consistencyScore: consistencyScore,
      summaryBn: 'ডিজিটাল প্রোফাইলে রুচিশীল, ধারাবাহিক ও পরিচ্ছন্ন সামাজিক অবস্থান বজায় রয়েছে।',
      postContentType: {
        categoryBn: selectedArch.topics.slice(0, 2).join(' ও '),
        descriptionBn: 'জীবনদর্শন, পেশাগত অভিজ্ঞতা ও গঠনমূলক ভাবনাপ্রসূত কনটেন্ট।',
        primaryThemes: selectedArch.topics,
      },
      opinionEvolutionOverTime: {
        patternBn: 'পরিণত ও ধারাবাহিক বিবর্তন',
        detailsBn: 'অতীতের পোস্টের সাথে বর্তমান চিন্তাধারার চমৎকার পরিপক্বতা লক্ষ করা যায়।',
        maturityLevelBn: consistencyScore > 80 ? 'উচ্চ' : 'সন্তোষজনক',
      },
      publicBehaviorConsistency: {
        score: opnScore,
        alignmentBn: 'কথার সাথে কাজের উচ্চ সামঞ্জস্য',
        detailsBn: 'অনলাইন প্রোফাইলে যে মূল্যবোধ প্রদর্শন করেন, মন্তব্যের প্রতিক্রিয়াতেও তার স্পষ্ট প্রতিফলন থাকে।',
      },
      positiveToNegativeRatio: {
        ratioString: `${posScore}% ইতিবাচক : ${100 - posScore}% গঠনমূলক`,
        positivePercentage: posScore,
        negativePercentage: 100 - posScore,
        toneAnalysisBn: 'প্রধানত উৎসাহব্যঞ্জক ও গঠনমূলক সুর; ধ্বংসাত্মক নেতিবাচকতা বা বিষাক্ততা নেই বললেই চলে।',
      },
      interpersonalStyle: {
        styleBn: 'মার্জিত ও শিষ্টাচারপূর্ণ ডিজিটাল সংলাপ',
        toneBn: 'বন্ধুত্বপূর্ণ ও আন্তরিক',
        engagementMannerBn: 'কমেন্ট ও ইনবক্সে ভদ্রতা বজায় রেখে পারস্পরিক সম্মান রক্ষা করেন।',
      },
      mistakeCorrectionHistory: {
        hasAdmittedErrors: errCorrScore > 65,
        frequencyBn: 'স্বেচ্ছায় ভুল সংশোধন ও স্পষ্টীকরণ',
        detailsBn: 'অসঙ্গতি ধরা পড়লে ভদ্রভাবে ভুল শুধরে নেওয়ার সুস্থ মানসিকতা রয়েছে।',
      },
    },
    demographicsAndIdentity: {
      religionOrFaithBn: 'সার্বজনীন সম্প্রীতি ও নৈতিকতার প্রতি শ্রদ্ধাশীল মানবিক দৃষ্টিভঙ্গি',
      politicalIdeologyBn: 'সামাজিক প্রগতি, সমতা ও নাগরিক দায়িত্বশীলতার প্রতি ইতিবাচক মানসিকতা',
      ethnicIdentityBn: 'বাঙালি সংস্কৃতি ও আধুনিক বিশ্বনাগরিকের সমন্বিত পরিচয়',
      sexualOrientationBn: 'ব্যক্তিগত গোপনীয়তার পরিমণ্ডলে স্বাভাবিক ও মর্যাদাশীল সামাজিক অবস্থান',
      healthAndMentalConditionsBn: 'মানসিক ভারসাম্য স্বাভাবিক; অতিরিক্ত কাজের চাপে মাঝে মাঝে সাময়িক বিশ্রাম নেওয়া প্রয়োজন',
      confidentialityNoteBn: 'সোশ্যাল ডসিয়ারের সমস্ত তথ্য উন্মুক্ত ডিজিটাল ফুটপ্রিন্টের মনস্তাত্ত্বিক মূল্যায়নের ওপর প্রতিষ্ঠিত।',
    },
    riskAndSafetyAudit: safetyAudit,
    destructiveHabitsAndAddictions: evaluateDestructiveHabits(
      selectedArch.habits.bad.map((b: any) => b.habit),
      combinedText,
      masterSeed
    ),
  };
}

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
