import React, { useState } from 'react';
import {
  Sparkles,
  User,
  Heart,
  AlertTriangle,
  Brain,
  ShieldAlert,
  Flame,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { HABITS_CATALOG } from '../data/habitsCatalog';
import { ZODIAC_TRAITS } from '../data/zodiacTraits';
import { CharacterAnalysisResult } from '../types/character';

interface DeepAnalyzerFormProps {
  lang: 'bn' | 'en';
  onAnalysisComplete: (result: CharacterAnalysisResult) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
}

export const DeepAnalyzerForm: React.FC<DeepAnalyzerFormProps> = ({
  lang,
  onAnalysisComplete,
  isLoading,
  setIsLoading,
}) => {
  const [name, setName] = useState('');
  const [gender, setGender] = useState('any');
  const [ageGroup, setAgeGroup] = useState('যুবক/যুবতী (১৮-৩৫)');
  const [zodiac, setZodiac] = useState('');
  const [selfDescription, setSelfDescription] = useState('');
  const [selectedGoodHabits, setSelectedGoodHabits] = useState<string[]>([]);
  const [selectedBadHabits, setSelectedBadHabits] = useState<string[]>([]);
  const [customHabitInput, setCustomHabitInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // New dimensions requested: Professional Communication, Category 7 & 8, Demographics, Safety Audit
  const [professionalDetails, setProfessionalDetails] = useState('');
  const [selectedCognitionTraits, setSelectedCognitionTraits] = useState<string[]>([]);
  const [selectedOnlineTraits, setSelectedOnlineTraits] = useState<string[]>([]);
  const [religion, setReligion] = useState('');
  const [politicalIdeology, setPoliticalIdeology] = useState('');
  const [ethnicity, setEthnicity] = useState('');
  const [sexualOrientation, setSexualOrientation] = useState('');
  const [healthNotes, setHealthNotes] = useState('');
  const [hasFraudWarning, setHasFraudWarning] = useState(false);
  const [hasLiarWarning, setHasLiarWarning] = useState(false);
  const [hasDangerWarning, setHasDangerWarning] = useState(false);
  const [showAdvancedProfiling, setShowAdvancedProfiling] = useState(false);

  // Sample quick behavioral traits for one-click selection
  const goodHabitCandidates = HABITS_CATALOG.filter((h) => h.type === 'good');
  const badHabitCandidates = HABITS_CATALOG.filter((h) => h.type === 'bad');

  const toggleGoodHabit = (nameBn: string) => {
    setSelectedGoodHabits((prev) =>
      prev.includes(nameBn) ? prev.filter((i) => i !== nameBn) : [...prev, nameBn]
    );
  };

  const toggleBadHabit = (nameBn: string) => {
    setSelectedBadHabits((prev) =>
      prev.includes(nameBn) ? prev.filter((i) => i !== nameBn) : [...prev, nameBn]
    );
  };

  const toggleCognitionTrait = (trait: string) => {
    setSelectedCognitionTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const toggleOnlineTrait = (trait: string) => {
    setSelectedOnlineTraits((prev) =>
      prev.includes(trait) ? prev.filter((t) => t !== trait) : [...prev, trait]
    );
  };

  const handleAddCustomHabit = (type: 'good' | 'bad') => {
    if (!customHabitInput.trim()) return;
    if (type === 'good') {
      if (!selectedGoodHabits.includes(customHabitInput.trim())) {
        setSelectedGoodHabits([...selectedGoodHabits, customHabitInput.trim()]);
      }
    } else {
      if (!selectedBadHabits.includes(customHabitInput.trim())) {
        setSelectedBadHabits([...selectedBadHabits, customHabitInput.trim()]);
      }
    }
    setCustomHabitInput('');
  };

  const handlePreloadDemo = () => {
    setName('সৌমেন রায়');
    setGender('পুরুষ');
    setAgeGroup('যুবক (২৫-৩৫)');
    setZodiac('বৃশ্চিক (Scorpio)');
    setSelectedGoodHabits([
      'প্রতিশ্রুতি রক্ষা করা ও সত্য কথা বলা',
      'অন্যের কথা ধৈর্য ধরে শোনা (Active Listening)',
      'বই পড়া ও নিয়মিত নতুন জ্ঞান অর্জন',
    ]);
    setSelectedBadHabits([
      'কাজ ফেলে রাখা বা দীর্ঘসূত্রিতা (Procrastination)',
      'হুট করে রেগে যাওয়া ও খারাপ ভাষা ব্যবহার',
      'দেরিতে ঘুমানো ও অপ্রয়োজনে মোবাইল স্ক্রল করা (Doomscrolling)',
    ]);
    setSelfDescription(
      'আমি সাধারণত মানুষের সাথে মিশতে পছন্দ করি এবং বিপদে ঝাঁপিয়ে পড়ি। কিন্তু কেউ অহেতুক অপমান করলে মাথা গরম হয়ে যায় এবং রাগের মাথায় এমন কথা বলি যা পরে কষ্ট দেয়। এছাড়া কোনো বড় কাজ শুরু করার আগে খুব ভাবি এবং দেরিতে শুরু করি।'
    );
    setProfessionalDetails('সফটওয়্যার টিম লিডার ও প্রজেক্ট কনসালট্যান্ট। অফিসে সহকর্মীদের সাহায্য করেন এবং যুক্তিনির্ভর আলোচনার মাধ্যমে কাজের জটিলতা দূর করেন।');
    setSelectedCognitionTraits([
      'যুক্তিনির্ভর আলোচনার সুস্পষ্ট প্রবণতা',
      'যেকোনো সিদ্ধান্তের আগে তথ্য যাচাইয়ের অভ্যাস',
      'ভিন্ন দৃষ্টিভঙ্গি বোঝার চেষ্টা',
      'ভুল হলে তা অকপটে স্বীকার করে শেখার নজির',
    ]);
    setSelectedOnlineTraits([
      'গঠনমূলক ও ইতিবাচক জ্ঞানমূলক পোস্ট করা',
      'অনলাইন ও বাস্তব আচরণের মধ্যে সুস্থ ধারাবাহিকতা',
      'ভুল তথ্য অসাবধানতাবশত শেয়ার হলে প্রকাশ্য সংশোধন',
    ]);
    setReligion('সনাতন ধর্ম ও সার্বজনীন মানবিক মূল্যবোধ');
    setPoliticalIdeology('গণতান্ত্রিক মূল্যবোধ, আইনের শাসন ও মুক্তচিন্তা');
    setEthnicity('বাঙালি');
    setSexualOrientation('মর্যাদাপূর্ণ ব্যক্তিগত ও পারিবারিক জীবন');
    setHealthNotes('শারীরিক স্বাস্থ্য স্বাভাবিক, মাঝে মাঝে কাজের চাপে মাইগ্রেন ও অনিদ্রা');
    setHasFraudWarning(false);
    setHasLiarWarning(false);
    setHasDangerWarning(false);
    setShowAdvancedProfiling(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const payload = {
        name: name.trim() || (lang === 'bn' ? 'অজ্ঞাত পর্যালোচক' : 'Seeker'),
        gender,
        ageGroup,
        zodiacSign: zodiac,
        professionalDetails: professionalDetails.trim(),
        selfDescription: `${selfDescription.trim()} ${
          selectedCognitionTraits.length > 0
            ? `\n[সিদ্ধান্ত ও চিন্তাভাবনা লক্ষণ]: ${selectedCognitionTraits.join(', ')}`
            : ''
        } ${
          selectedOnlineTraits.length > 0
            ? `\n[অনলাইন আচরণের লক্ষণ]: ${selectedOnlineTraits.join(', ')}`
            : ''
        }`.trim(),
        habitSelections: {
          good: selectedGoodHabits,
          bad: selectedBadHabits,
        },
        demographicsInput: {
          religion: religion.trim(),
          politics: politicalIdeology.trim(),
          ethnicity: ethnicity.trim(),
          orientation: sexualOrientation.trim(),
          health: healthNotes.trim(),
        },
        safetyConcerns: {
          hasFraud: hasFraudWarning,
          isLiar: hasLiarWarning,
          isDangerous: hasDangerWarning,
        },
        answers: {
          cognitionSelected: selectedCognitionTraits,
          onlineSelected: selectedOnlineTraits,
        },
      };

      const res = await fetch('/api/analyze-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onAnalysisComplete({
          ...data.data,
          personName: name.trim() || (lang === 'bn' ? 'প্রিয় বন্ধু' : 'Friend'),
          timestamp: Date.now(),
        });
      } else {
        throw new Error(data.error || 'বিশ্লেষণ সম্পন্ন হতে ব্যর্থ হয়েছে।');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        lang === 'bn'
          ? 'সার্ভারে সংযোগ করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Failed to complete analysis. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* Editorial Header */}
      <div className="space-y-3 mb-8 text-center sm:text-left">
        <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
          {lang === 'bn' ? 'মনস্তাত্ত্বিক চরিত্র ও স্বভাব রূপরেখা' : 'Psychological Virtue & Flaw Profiling'}
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {lang === 'bn'
            ? 'নিজের বা কারো চরিত্র, দোষ-গুণ ও স্বভাবের অন্তর্নিহিত সত্য জানুন'
            : 'Discover Deep Character Archetype, Virtues & Flaws'}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
          {lang === 'bn'
            ? 'আপনার স্বভাবের শক্তি, লুক্কায়িত দুর্বলতা, ভালো অভ্যাস এবং ক্ষতিকর দোষগুলো চিহ্নিত করে জীবনকে আরও সুন্দর ও সার্থক করার বৈজ্ঞানিক দিকনির্দেশনা।'
            : 'Uncover personal strengths, hidden blindspots, positive habits and practical methods to overcome destructive behavioral tendencies.'}
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="button"
            onClick={handlePreloadDemo}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-800 hover:border-emerald-500/40 text-xs font-medium transition-all flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{lang === 'bn' ? 'নমুনা তথ্য লোড করে দেখুন' : 'Try with Sample Profile'}</span>
          </button>
          <span className="text-xs text-slate-500">
            {lang === 'bn' ? 'সম্পূর্ণ গোপনীয় ও নিরপেক্ষ মনস্তাত্ত্বিক বিশ্লেষণ' : '100% Private & Objective Assessment'}
          </span>
        </div>
      </div>

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Basic Identity */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              ১
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'প্রাথমিক পরিচয় ও পটভূমি' : 'Basic Identity & Background'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'সঠিক চরিত্র বিশ্লেষণের জন্য প্রাথমিক তথ্য প্রদান করুন'
                  : 'Provide basic information to calibrate character profiling'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'নাম বা পরিচয় (ঐচ্ছিক)' : 'Name / Alias (Optional)'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: রাহুল, সুমনা বা নিজের নাম' : 'e.g. Alex, Sam'}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'বয়সের পর্যায়' : 'Age Bracket'}
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 outline-none transition-all"
              >
                <option value="কিশোর/কিশোরী (১৩-১৭)">{lang === 'bn' ? 'কিশোর / কিশোরী (১৩-১৭ বছর)' : 'Teen (13-17)'}</option>
                <option value="তরুণ/তরুণী (১৮-২৪)">{lang === 'bn' ? 'তরুণ / তরুণী (১৮-২৪ বছর)' : 'Young Adult (18-24)'}</option>
                <option value="যুবক/যুবতী (২৫-৩৫)">{lang === 'bn' ? 'যুবক / যুবতী (২৫-৩৫ বছর)' : 'Adult (25-35)'}</option>
                <option value="মধ্যবয়সী (৩৬-৫০)">{lang === 'bn' ? 'মধ্যবয়সী (৩৬-৫০ বছর)' : 'Mid-age (36-50)'}</option>
                <option value="অভিজ্ঞ প্রবীণ (৫০+)">{lang === 'bn' ? 'অভিজ্ঞ প্রবীণ (৫০+ বছর)' : 'Senior (50+)'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'লিঙ্গ' : 'Gender'}
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 outline-none transition-all"
              >
                <option value="পুরুষ">{lang === 'bn' ? 'পুরুষ' : 'Male'}</option>
                <option value="নারী">{lang === 'bn' ? 'নারী' : 'Female'}</option>
                <option value="অন্যান্য / গোপন">{lang === 'bn' ? 'অন্যান্য / প্রকাশে অনিচ্ছুক' : 'Other / Prefer not to say'}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'রাশি বা জন্মমাস (ঐচ্ছিক)' : 'Zodiac Sign / Birth Period (Optional)'}
              </label>
              <select
                value={zodiac}
                onChange={(e) => setZodiac(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sm text-slate-100 outline-none transition-all"
              >
                <option value="">{lang === 'bn' ? '-- নির্বাচন করুন (ঐচ্ছিক) --' : '-- Select (Optional) --'}</option>
                {ZODIAC_TRAITS.map((z) => (
                  <option key={z.signEn} value={z.signBn}>
                    {z.symbol} {lang === 'bn' ? z.signBn : z.signEn} ({lang === 'bn' ? z.dateRangeBn : z.dateRangeEn})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 2: Good Habits & Strengths Selection */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              ২
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {lang === 'bn' ? 'আপনার ইতিবাচক গুণ ও ভালো অভ্যাসসমূহ' : 'Your Virtues & Positive Habits'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                  {selectedGoodHabits.length} {lang === 'bn' ? 'টি নির্বাচিত' : 'Selected'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'যে গুণ বা অভ্যাসগুলো আপনার মধ্যে সাধারণত দেখা যায় সেগুলোতে ক্লিক করুন:'
                  : 'Click on the virtues or habits that best reflect your current life:'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {goodHabitCandidates.map((habit) => {
              const isSelected = selectedGoodHabits.includes(habit.nameBn);
              return (
                <button
                  type="button"
                  key={habit.id}
                  onClick={() => toggleGoodHabit(habit.nameBn)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500/80 text-white shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'border border-slate-600'
                    }`}
                  >
                    {isSelected ? '✓' : ''}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {lang === 'bn' ? habit.nameBn : habit.nameEn}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'bn' ? habit.descriptionBn : habit.descriptionEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Bad Habits & Character Flaws Selection */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              ৩
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {lang === 'bn' ? 'দোষ, দুর্বলতা ও ক্ষতিকর অভ্যাসসমূহ' : 'Flaws, Weaknesses & Bad Habits'}
                </h3>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800/50">
                  {selectedBadHabits.length} {lang === 'bn' ? 'টি চিহ্নিত' : 'Marked'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'অকপটে নিজের সেই দুর্বলতাগুলো চিহ্নিত করুন যা আপনি শুধরাতে চান (সম্পূর্ণ গোপন):'
                  : 'Honestly check the shortcomings or bad habits you wish to conquer:'}
              </p>
            </div>
          </div>

          {/* Quick Highlight of 6 Destructive Flaws & Addictions */}
          <div className="mb-4 p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/40 text-xs">
            <span className="font-bold text-rose-300 block mb-1.5 flex items-center gap-1.5">
              <span>⚠️</span>
              <span>{lang === 'bn' ? 'ধ্বংসাত্মক বদভ্যাস ও আসক্তি নিরীক্ষা দ্রুত নির্বাচন:' : 'Quick Select Destructive Habits:'}</span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'নেশা করা (ধূমপান, মদ, মাদকদ্রব্য বা জুয়া)',
                'অযাচিত খরচ করা ও আর্থিক বেহিসাবিপনা',
                'অতিরিক্ত কথা বলা ও প্রগলভতা',
                'খারাপ ব্যবহার, অবমাননাকর বা রূঢ় আচরণ',
                'একাধিক নারী আসক্তি ও বহুগামিতা',
                'যৌনাচারের আসক্তি ও অতিযৌনতা',
              ].map((dh) => {
                const isSel = selectedBadHabits.includes(dh);
                return (
                  <button
                    type="button"
                    key={dh}
                    onClick={() => toggleBadHabit(dh)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                      isSel
                        ? 'bg-rose-500 text-white shadow-sm'
                        : 'bg-slate-900 text-rose-200 border border-rose-800/60 hover:bg-rose-950'
                    }`}
                  >
                    {isSel ? '✓ ' : '+ '}
                    {dh.split(' (')[0]}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {badHabitCandidates.map((habit) => {
              const isSelected = selectedBadHabits.includes(habit.nameBn);
              return (
                <button
                  type="button"
                  key={habit.id}
                  onClick={() => toggleBadHabit(habit.nameBn)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'bg-rose-950/40 border-rose-500/80 text-white shadow-sm'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div
                    className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      isSelected
                        ? 'bg-rose-500 text-slate-950 font-bold'
                        : 'border border-slate-600'
                    }`}
                  >
                    {isSelected ? '✕' : ''}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">
                      {lang === 'bn' ? habit.nameBn : habit.nameEn}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {lang === 'bn' ? habit.descriptionBn : habit.descriptionEn}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Habit input */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={customHabitInput}
              onChange={(e) => setCustomHabitInput(e.target.value)}
              placeholder={
                lang === 'bn'
                  ? 'তালিকায় নেই এমন কোনো অভ্যাস লিখুন (যেমন: কথা দিয়ে ভুলে যাওয়া, নখ কামড়ানো)'
                  : 'Add a custom habit not in list...'
              }
              className="flex-1 px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-sm text-slate-200 outline-none focus:border-amber-500 transition-all"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleAddCustomHabit('good')}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-semibold hover:bg-emerald-900 transition-all"
              >
                + {lang === 'bn' ? 'ভালো অভ্যাস' : 'Good Habit'}
              </button>
              <button
                type="button"
                onClick={() => handleAddCustomHabit('bad')}
                className="px-3.5 py-2.5 rounded-xl bg-rose-950 text-rose-300 border border-rose-800 text-xs font-semibold hover:bg-rose-900 transition-all"
              >
                + {lang === 'bn' ? 'খারাপ অভ্যাস' : 'Bad Habit'}
              </button>
            </div>
          </div>
        </div>

        {/* Step 4: Self Description & Personal Temperament */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              ৪
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'নিজের স্বভাব ও আচরণ সম্পর্কে উন্মুক্ত বর্ণনা' : 'Freeform Self-Reflection & Temperament'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'আপনার মেজাজ কেমন? কোন বিষয়ে কষ্ট বা রাগ পান? কীভাবে সিদ্ধান্ত নেন? বিস্তারিত লিখলে বিশ্লেষণ আরও নিখুঁত হবে:'
                  : 'How is your temper? What triggers your pain or joy? Write openly for deep nuanced analysis:'}
              </p>
            </div>
          </div>

          <textarea
            rows={4}
            value={selfDescription}
            onChange={(e) => setSelfDescription(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'উদাহরণ: আমি মনে মনে খুব সাহায্য করতে চাই কিন্তু প্রকাশে দ্বিধা করি। ছোট বিষয়েও অতিরিক্ত চিন্তা হয়। কেউ আমাকে অসম্মান করলে সহজে ভুলতে পারি না...'
                : 'Example: I am emotionally loyal but overthink small details. Under stress, I tend to isolate myself...'
            }
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all resize-y"
          />
        </div>

        {/* Step 5: Professional Communication & Cognitive Decision Style (Category 7 & 8) */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
              ৫
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'পেশাগত যোগাযোগ ও চিন্তাশৈলী (ক্যাটাগরি ৭ ও ৮)' : 'Professional Communication & Cognitive Style'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'কর্মক্ষেত্রে মিথস্ক্রিয়া, সিদ্ধান্ত গ্রহণের ধরন ও অনলাইন আচরণের ধারাবাহিকতা নির্বাচন করুন'
                  : 'Specify workplace dynamics, logical reasoning and online behavior style'}
              </p>
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'পেশা / কর্মক্ষেত্রের প্রেক্ষাপট ও যোগাযোগের ধরন' : 'Profession & Workplace Communication Style'}
              </label>
              <input
                type="text"
                value={professionalDetails}
                onChange={(e) => setProfessionalDetails(e.target.value)}
                placeholder={lang === 'bn' ? 'যেমন: ব্যাংকার / উদ্যোক্তা / শিক্ষার্থী; মিটিংয়ে সংযত কিন্তু দলগত কাজে সহমর্মী' : 'e.g. Lead Engineer; calm in meetings, data-driven'}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
            </div>

            {/* Category 7 Sub-metrics selection */}
            <div>
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'ক্যাটাগরি ৭: সিদ্ধান্ত গ্রহণ ও চিন্তাভাবনার লক্ষণ (ক্লিক করে নির্বাচন করুন)' : 'Category 7: Decision Making & Thinking Style'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'যুক্তিনির্ভর আলোচনার সুস্পষ্ট প্রবণতা',
                  'যেকোনো সিদ্ধান্তের আগে তথ্য যাচাইয়ের অভ্যাস',
                  'সিদ্ধান্তের পক্ষে যুক্তি গুছিয়ে দেওয়ার ক্ষমতা',
                  'ভিন্ন দৃষ্টিভঙ্গি ও বিপরীত মতকে বিবেচনা',
                  'ভুল থেকে শেখার প্রকাশ্য নজির বা মানসিকতা',
                  'সমস্যাকে ধাপে ধাপে বিশ্লেষণ করার পদ্ধতি',
                ].map((trait) => {
                  const isSel = selectedCognitionTraits.includes(trait);
                  return (
                    <button
                      type="button"
                      key={trait}
                      onClick={() => toggleCognitionTrait(trait)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 ${
                        isSel
                          ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isSel ? 'bg-indigo-500 text-slate-950 font-bold' : 'border border-slate-600'}`}>
                        {isSel ? '✓' : ''}
                      </span>
                      <span>{trait}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Category 8 Sub-metrics selection */}
            <div>
              <label className="block text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-2">
                {lang === 'bn' ? 'ক্যাটাগরি ৮: অনলাইন আচরণের ধারাবাহিকতা (ক্লিক করে নির্বাচন করুন)' : 'Category 8: Online Behavior Consistency'}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  'পোস্টে জ্ঞানগর্ভ ও ইতিবাচক বিষয়ের প্রাধান্য',
                  'সময়ের সঙ্গে মতামতে সুস্থ পরিপক্বতার বিবর্তন',
                  'অনলাইন কথা ও বাস্তব আচরণের উচ্চ সামঞ্জস্য',
                  'ইতিবাচক ও গঠনমূলক কনটেন্টের অনুপাত বেশি',
                  'অনলাইনে অন্যের সাথে মার্জিত ও সংযত যোগাযোগ',
                  'ভুল স্বীকার ও নিজের ভুল সংশোধনের সুস্থ ইতিহাস',
                ].map((trait) => {
                  const isSel = selectedOnlineTraits.includes(trait);
                  return (
                    <button
                      type="button"
                      key={trait}
                      onClick={() => toggleOnlineTrait(trait)}
                      className={`p-3 rounded-xl border text-left text-xs font-medium transition-all flex items-center gap-2.5 ${
                        isSel
                          ? 'bg-indigo-950/60 border-indigo-500/80 text-indigo-200'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${isSel ? 'bg-indigo-500 text-slate-950 font-bold' : 'border border-slate-600'}`}>
                        {isSel ? '✓' : ''}
                      </span>
                      <span>{trait}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Step 6: Background, Demographics & Risk/Safety Audit */}
        <div className="bg-slate-900/70 border border-slate-800/90 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                ৬
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {lang === 'bn' ? 'পরিচিতি, স্বাস্থ্য ও সততা/বিপদ অডিট' : 'Identity, Health & Safety/Risk Audit'}
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn'
                    ? 'ধর্ম, রাজনীতি, স্বাস্থ্য ও বিপজ্জনক বা প্রতারণামূলক ঝুঁকি যাচাই (ঐচ্ছিক)'
                    : 'Demographics, health notes and fraud/deception/danger risk verification'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAdvancedProfiling(!showAdvancedProfiling)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 transition-all"
            >
              {showAdvancedProfiling ? (lang === 'bn' ? 'সংকুচিত করুন' : 'Collapse') : (lang === 'bn' ? 'বিস্তারিত ফিল্ড খুলুন' : 'Expand Fields')}
            </button>
          </div>

          {showAdvancedProfiling && (
            <div className="space-y-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {lang === 'bn' ? 'ধর্ম / আধ্যাত্মিক বিশ্বাস' : 'Religion / Faith'}
                  </label>
                  <input
                    type="text"
                    value={religion}
                    onChange={(e) => setReligion(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: ইসলাম / সনাতন / বৌদ্ধ / খ্রিস্টান / মুক্তচিন্তা' : 'e.g. Islam, Sanatan, Humanist'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {lang === 'bn' ? 'রাজনৈতিক মতাদর্শ' : 'Political Ideology'}
                  </label>
                  <input
                    type="text"
                    value={politicalIdeology}
                    onChange={(e) => setPoliticalIdeology(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: সামাজিক সাম্য, মুক্তবাজার, নাগরিক অধিকারবাদী' : 'e.g. Social justice, Liberal democracy'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {lang === 'bn' ? 'জাতিগত ও সাংস্কৃতিক পরিচয়' : 'Ethnic & Cultural Identity'}
                  </label>
                  <input
                    type="text"
                    value={ethnicity}
                    onChange={(e) => setEthnicity(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: বাঙালি, চাকমা, মারমা বা সার্বজনীন' : 'e.g. Bengali, Indigenous'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    {lang === 'bn' ? 'যৌন অভিমুখিতা বা সম্পর্ক দর্শন' : 'Sexual Orientation / Lifestyle'}
                  </label>
                  <input
                    type="text"
                    value={sexualOrientation}
                    onChange={(e) => setSexualOrientation(e.target.value)}
                    placeholder={lang === 'bn' ? 'যেমন: ব্যক্তিগত গোপনীয়তা, স্বাভাবিক পারিবারিক সম্পর্ক' : 'e.g. Family-oriented, private'}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  {lang === 'bn' ? 'শারীরিক স্বাস্থ্য বা মানসিক রোগ/পরিস্থিতি' : 'Physical Health & Mental Well-being'}
                </label>
                <input
                  type="text"
                  value={healthNotes}
                  onChange={(e) => setHealthNotes(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: অতিরিক্ত মানসিক চাপ, উদ্বেগ (Anxiety), মাইগ্রেন বা সুস্থ ও স্বাভাবিক' : 'e.g. Mild anxiety, good physical health'}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-purple-500 transition-all"
                />
              </div>
            </div>
          )}

          {/* Risk, Scammer, Liar, Danger Audit Checkbox */}
          <div className="pt-3 border-t border-slate-800">
            <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <label className="text-xs font-bold text-rose-300 uppercase tracking-wider">
                {lang === 'bn' ? 'সততা ও বিপদ সতর্কতা অডিট (প্রতারক / মিথ্যাবাদী / বিপজ্জনক লক্ষণ)' : 'Risk, Fraud & Danger Detection'}
              </label>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              {lang === 'bn'
                ? 'যদি এই ব্যক্তির কোনো প্রতারণা, অনবরত মিথ্যা কথা বলা বা বিপজ্জনক আচরণের ইতিহাস থাকে তবে টিক দিন:'
                : 'Check if this person has any reported history of fraud, chronic deceit, or dangerous aggression:'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${hasFraudWarning ? 'bg-rose-950/60 border-rose-500 text-rose-200' : 'bg-slate-950/60 border-slate-800 text-slate-300'}`}>
                <input
                  type="checkbox"
                  checked={hasFraudWarning}
                  onChange={(e) => setHasFraudWarning(e.target.checked)}
                  className="mt-0.5 rounded text-rose-500 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold block text-rose-400">
                    {lang === 'bn' ? 'প্রতারক / জালিয়াতি (Fraud)' : 'Scammer / Fraud'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {lang === 'bn' ? 'আর্থিক লেনদেনে ধোঁকাবাজি বা অর্থ আত্মসাতের অভিযোগ' : 'Financial deception or scam history'}
                  </span>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${hasLiarWarning ? 'bg-amber-950/60 border-amber-500 text-amber-200' : 'bg-slate-950/60 border-slate-800 text-slate-300'}`}>
                <input
                  type="checkbox"
                  checked={hasLiarWarning}
                  onChange={(e) => setHasLiarWarning(e.target.checked)}
                  className="mt-0.5 rounded text-amber-500 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold block text-amber-400">
                    {lang === 'bn' ? 'অভ্যাসগত মিথ্যাবাদী (Liar)' : 'Habitual Liar'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {lang === 'bn' ? 'কথা দিয়ে কথা না রাখা ও নিয়মিত বানোয়াট গল্প বলা' : 'Chronic fabrications or broken promises'}
                  </span>
                </div>
              </label>

              <label className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-2.5 ${hasDangerWarning ? 'bg-red-950/60 border-red-500 text-red-200' : 'bg-slate-950/60 border-slate-800 text-slate-300'}`}>
                <input
                  type="checkbox"
                  checked={hasDangerWarning}
                  onChange={(e) => setHasDangerWarning(e.target.checked)}
                  className="mt-0.5 rounded text-red-500 focus:ring-0"
                />
                <div>
                  <span className="text-xs font-bold block text-red-400">
                    {lang === 'bn' ? 'বিপজ্জনক ব্যক্তিত্ব (Dangerous)' : 'Dangerous / Toxic'}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {lang === 'bn' ? 'আগ্রাসী সহিংসতা, ব্ল্যাকমেইল বা মারাত্মক ক্ষতিকর স্বভাব' : 'Violent aggression, toxicity, or harm'}
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="text-center pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full sm:w-auto px-10 py-4 rounded-2xl font-bold text-base sm:text-lg transition-all shadow-xl flex items-center justify-center gap-3 mx-auto ${
              isLoading
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500 hover:from-emerald-400 hover:to-amber-400 text-slate-950 hover:shadow-emerald-500/25 hover:scale-[1.02]'
            }`}
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>
                  {lang === 'bn' ? 'মনস্তাত্ত্বিক বিশ্লেষণ ও চরিত্রদর্পণ তৈরি হচ্ছে...' : 'Synthesizing Character Mirror...'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>
                  {lang === 'bn'
                    ? 'গভীর চরিত্র, দোষ-গুণ ও স্বভাবের দর্পণ দেখুন'
                    : 'Analyze Character, Virtues & Flaws'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
          <p className="text-xs text-slate-500 mt-3">
            {lang === 'bn'
              ? 'উন্নত কৃত্রিম বুদ্ধিমত্তা ও মনস্তাত্ত্বিক ফ্রেমওয়ার্ক দ্বারা বিশ্লেষণ পরিচালিত হয়'
              : 'Powered by advanced ethical psychology and behavioral modeling'}
          </p>
        </div>
      </form>
    </div>
  );
};
