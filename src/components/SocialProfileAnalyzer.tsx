import React, { useState } from 'react';
import {
  Link2,
  Sparkles,
  Globe,
  User,
  FileText,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { SocialAnalysisResult } from '../types/character';
import { DailyAffirmationBanner } from './DailyAffirmationBanner';
import { DEFAULT_SAMPLE_SCORECARD } from './SocialPersonalityScorecardView';

interface SocialProfileAnalyzerProps {
  lang: 'bn' | 'en';
  onAnalysisComplete: (result: SocialAnalysisResult) => void;
  isLoading: boolean;
  setIsLoading: (val: boolean) => void;
  onOpenAffirmations?: () => void;
}

export const SocialProfileAnalyzer: React.FC<SocialProfileAnalyzerProps> = ({
  lang,
  onAnalysisComplete,
  isLoading,
  setIsLoading,
  onOpenAffirmations,
}) => {
  const [url, setUrl] = useState('');
  const [targetName, setTargetName] = useState('');
  const [platform, setPlatform] = useState('auto');
  const [bioOrPosts, setBioOrPosts] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sampleIdx, setSampleIdx] = useState(0);

  // Sample profiles for quick testing
  const demoProfiles = [
    {
      titleBn: 'ইনস্টাগ্রাম লাইফস্টাইল ক্রিয়েটর',
      titleEn: 'Instagram Lifestyle Creator',
      url: 'https://instagram.com/aesthetic_wanderer_bd',
      platform: 'Instagram',
      bio: 'Traveler | Coffee Enthusiast | Capturing moments in 35mm. Living between Dhaka & mountains. Let your light shine ✨',
      notes: 'নিয়মিত ভ্রমণের রিলস ও নান্দনিক ক্যাফের ছবি পোস্ট করে।',
    },
    {
      titleBn: 'ফেসবুক চিন্তাশীল লেখক / সমাজকর্মী',
      titleEn: 'Facebook Thought Leader',
      url: 'https://facebook.com/tanvir.ahmed.reflections',
      platform: 'Facebook',
      bio: 'লেখক ও সামাজিক উন্নয়ন কর্মী। সত্য প্রকাশে অবিচল। "মানুষের সেবাই ধর্মের মূলকথা"।',
      notes: 'বড় বড় অনুভূতির স্ট্যাটাস লেখে, জনস্বার্থে কথা বলে, তবে মাঝে মাঝে তর্কে জড়ায়।',
    },
    {
      titleBn: 'লিঙ্কডইন কর্পোরেট এক্সিকিউটিভ',
      titleEn: 'LinkedIn Tech Executive',
      url: 'https://linkedin.com/in/sarah-rahman-tech',
      platform: 'LinkedIn',
      bio: 'Senior Product Manager @ FinTech | AI enthusiast | Lifelong learner. Building products that scale with purpose.',
      notes: 'খুব গোছানো, ক্যারিয়ার সচেতন ও উচ্চাকাঙ্ক্ষী।',
    },
    {
      titleBn: 'এক্স / টুইটার স্পষ্টবাদী ব্যক্তিত্ব',
      titleEn: 'X / Twitter Voice',
      url: 'https://x.com/arif_unfiltered',
      platform: 'X (Twitter)',
      bio: 'Tech, Philosophy, Startups & geopolitics. I post what others think but fear to tweet.',
      notes: 'তীক্ষ্ণ কথা বলে, বিতর্ক ভালোবাসে, প্রযুক্তি ও ভবিষ্যৎ ট্রেন্ড নিয়ে আগ্রহী।',
    },
  ];

  const handleApplyDemo = (demo: typeof demoProfiles[0]) => {
    setUrl(demo.url);
    setPlatform(demo.platform);
    setBioOrPosts(demo.bio);
    setAdditionalNotes(demo.notes);
    setTargetName(demo.titleBn.split(' ')[0]);
    setShowAdvanced(true);
  };

  const handleViewSampleReport = async () => {
    setIsLoading(true);
    setErrorMsg('');
    const demo = demoProfiles[sampleIdx % demoProfiles.length];
    setSampleIdx((prev) => prev + 1);

    try {
      const res = await fetch('/api/analyze-social-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: demo.url,
          platform: demo.platform,
          targetName: demo.titleBn.split(' ')[1] || 'কাল্পনিক ব্যক্তিত্ব',
          bioOrPosts: demo.bio,
          additionalNotes: demo.notes,
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        onAnalysisComplete({
          ...data.data,
          timestamp: Date.now(),
        });
        return;
      }
    } catch (e) {
      console.error('Failed to fetch dynamic sample profile:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const detectPlatformIcon = (link: string) => {
    const lower = link.toLowerCase();
    if (lower.includes('facebook') || lower.includes('fb.')) return 'Facebook';
    if (lower.includes('instagram')) return 'Instagram';
    if (lower.includes('linkedin')) return 'LinkedIn';
    if (lower.includes('twitter') || lower.includes('x.com')) return 'X (Twitter)';
    if (lower.includes('youtube')) return 'YouTube';
    if (lower.includes('tiktok')) return 'TikTok';
    if (lower.includes('github')) return 'GitHub';
    return 'Web Profile';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() && !bioOrPosts.trim()) {
      setErrorMsg(
        lang === 'bn'
          ? 'অনুগ্রহ করে একটি সোশ্যাল মিডিয়া লিংক অথবা বায়ো/পোস্টের নমুনা প্রদান করুন।'
          : 'Please enter a social media profile link or paste bio/posts.'
      );
      return;
    }

    setErrorMsg('');
    setIsLoading(true);

    try {
      const payload = {
        url: url.trim(),
        platform: platform !== 'auto' ? platform : undefined,
        targetName: targetName.trim(),
        bioOrPosts: bioOrPosts.trim(),
        additionalNotes: additionalNotes.trim(),
      };

      const res = await fetch('/api/analyze-social-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        onAnalysisComplete({
          ...data.data,
          timestamp: Date.now(),
        });
      } else {
        throw new Error(data.error || 'বিশ্লেষণ তৈরি হতে সমস্যা হয়েছে।');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        lang === 'bn'
          ? 'বিশ্লেষণ সম্পন্ন করতে সাময়িক ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।'
          : 'Failed to analyze social profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-8">
      {/* Daily Affirmation Spark Banner on Dashboard */}
      {onOpenAffirmations && (
        <DailyAffirmationBanner
          lang={lang}
          onOpenFullAffirmations={onOpenAffirmations}
        />
      )}

      {/* Editorial Hero Header */}
      <div className="space-y-3 text-center sm:text-left">
        <div className="text-xs font-semibold text-emerald-400 tracking-wider uppercase">
          {lang === 'bn' ? 'সোশ্যাল ফুটপ্রিন্ট ও ডিজিটাল সাইকোলজি' : 'Social Footprint & Cyber-Psychology'}
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
          {lang === 'bn'
            ? 'সোশ্যাল মিডিয়া লিংক থেকে চরিত্র, অভ্যাস ও মনস্তত্ত্ব বিশ্লেষণ'
            : 'Extract Character, Habits & Psychology from Social Link'}
        </h2>

        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
          {lang === 'bn'
            ? 'ফেসবুক, ইনস্টাগ্রাম, লিঙ্কডইন বা টুইটার লিংক দিন। উন্নত মনস্তাত্ত্বিক কৃত্রিম বুদ্ধিমত্তা তার ডিজিটাল আচরণ থেকে মূল চরিত্র, দোষ-গুণ, আসক্তি, পছন্দ-অপছন্দ, লাইফস্টাইল ও যোগাযোগের গোপন গাইড তৈরি করবে।'
            : 'Provide a Facebook, Instagram, LinkedIn, X or YouTube link. Advanced behavioral modeling reconstructs their core character, virtues, flaws, addictions, lifestyle, and conversation playbook.'}
        </p>
      </div>

      {/* Main Analysis Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* URL Input */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{lang === 'bn' ? 'সোশ্যাল মিডিয়া প্রোফাইল লিংক' : 'Profile URL'}</span>
                <span className="text-rose-400">*</span>
              </label>

              {url && (
                <span className="text-xs font-medium text-emerald-400">
                  {detectPlatformIcon(url)}
                </span>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'https://facebook.com/username অথবা https://instagram.com/username'
                    : 'https://instagram.com/username or https://linkedin.com/in/username'
                }
                className="w-full px-4 py-3.5 pl-11 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
              />
              <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-4 pointer-events-none" />
            </div>
          </div>

          {/* Quick Action: Social Personality Report Showcase (Matching User's Exact Brief) */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-indigo-950/40 border border-emerald-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-white tracking-wide">
                  Social Personality Report
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                  কাল্পনিক উদাহরণ
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ৮২% ইতিবাচক যোগাযোগ · ৭৫% গঠনমূলক আলোচনা · ৬৮% ধারাবাহিকতা · বৈশিষ্ট্যভিত্তিক বিশ্লেষণ ও AI পর্যবেক্ষণ দেখতে ক্লিক করুন।
              </p>
            </div>

            <button
              type="button"
              onClick={handleViewSampleReport}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-md shrink-0 active:scale-95"
            >
              <span>{lang === 'bn' ? 'রিপোর্টটি সরাসরি দেখুন' : 'View Sample Report'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Preset Buttons */}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-2">
              {lang === 'bn' ? 'অথবা দ্রুত পরীক্ষা করতে ডেমো প্রোফাইল নির্বাচন করুন:' : 'Or test with a sample profile:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {demoProfiles.map((demo, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyDemo(demo)}
                  className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-slate-300 hover:text-white text-xs font-medium text-left transition-all truncate"
                >
                  <div className="text-[10px] text-slate-500 uppercase">{demo.platform}</div>
                  <div className="truncate font-semibold mt-0.5">{lang === 'bn' ? demo.titleBn.split(' ')[1] || demo.titleBn : demo.titleEn}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced toggle */}
          <div>
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
            >
              <span>{lang === 'bn' ? 'অতিরিক্ত তথ্য (নাম, বায়ো বা সাম্প্রতিক পোস্ট)' : 'Additional Context (Name, Bio, Posts)'}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showAdvanced && (
            <div className="pt-4 border-t border-slate-800/80 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    {lang === 'bn' ? 'ব্যক্তির নাম বা পরিচয় (ঐচ্ছিক)' : 'Name / Alias'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={targetName}
                      onChange={(e) => setTargetName(e.target.value)}
                      placeholder={lang === 'bn' ? 'যেমন: সাকিব বা রাহুল' : 'e.g. Alex, Sam'}
                      className="w-full px-3.5 py-2.5 pl-9 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 placeholder-slate-500 outline-none"
                    />
                    <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                    {lang === 'bn' ? 'প্ল্যাটফর্ম' : 'Platform'}
                  </label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 outline-none"
                  >
                    <option value="auto">{lang === 'bn' ? 'স্বয়ংক্রিয় সনাক্তকরণ (Auto)' : 'Auto-Detect'}</option>
                    <option value="Facebook">Facebook</option>
                    <option value="Instagram">Instagram</option>
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X (Twitter)">X / Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="TikTok">TikTok</option>
                    <option value="GitHub">GitHub</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  {lang === 'bn'
                    ? 'প্রোফাইল বায়ো (Bio), ক্যাপশন বা সাম্প্রতিক পোস্ট (ঐচ্ছিক)'
                    : 'Bio, Captions or Posts Snippets'}
                </label>
                <textarea
                  rows={3}
                  value={bioOrPosts}
                  onChange={(e) => setBioOrPosts(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'তার প্রোফাইল থেকে বায়ো বা সাম্প্রতিক স্ট্যাটাসের ২-৩ লাইন পেস্ট করলে বিশ্লেষণ ১০০% নিখুঁত হবে...'
                      : 'Paste public bio text or recent captions here for highest precision...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 placeholder-slate-500 outline-none resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-1.5">
                  {lang === 'bn' ? 'বিশেষ জিজ্ঞাসা বা পর্যবেক্ষণ (ঐচ্ছিক)' : 'Specific Question (Optional)'}
                </label>
                <input
                  type="text"
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder={
                    lang === 'bn'
                      ? 'যেমন: সে কি বিশ্বস্ত বন্ধু হবে? তার সাথে কীভাবে কথা বলব?'
                      : 'e.g. How to initiate conversation with them?'
                  }
                  className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-emerald-500 text-xs text-slate-100 placeholder-slate-500 outline-none"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-xl font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2.5 ${
                isLoading
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-emerald-500/20 active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>
                    {lang === 'bn'
                      ? 'ডিজিটাল আচরণ ও মনস্তাত্ত্বিক ডসিয়ার তৈরি হচ্ছে...'
                      : 'Synthesizing Dossier...'}
                  </span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>
                    {lang === 'bn'
                      ? 'সোশ্যাল প্রোফাইলের চরিত্র, দোষ-গুণ, আসক্তি ও সাইকোলজি দেখুন'
                      : 'Generate Comprehensive Profile Dossier'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
