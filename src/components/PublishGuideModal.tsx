import React, { useState } from 'react';
import {
  X,
  Rocket,
  Smartphone,
  Globe,
  Copy,
  Check,
  ExternalLink,
  HelpCircle,
  QrCode,
  ShieldAlert,
  ArrowRight,
  Monitor,
} from 'lucide-react';

interface PublishGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const PublishGuideModal: React.FC<PublishGuideModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeTab, setActiveTab] = useState<'mobile' | 'deploy' | 'share'>('mobile');

  if (!isOpen) return null;

  // Real origin and fallback urls
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const currentHref = typeof window !== 'undefined' ? window.location.href : '';
  
  // Public production URL pattern
  const isDevUrl = currentOrigin.includes('ais-dev-');
  const pubUrl = isDevUrl
    ? currentOrigin.replace('ais-dev-', 'ais-pre-')
    : currentOrigin;

  const handleCopyLink = (urlToCopy: string) => {
    navigator.clipboard.writeText(urlToCopy);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
    currentOrigin
  )}&bgcolor=0f172a&color=10b981`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                {lang === 'bn' ? 'মোবাইল ব্যবহার ও পাবলিশ নির্দেশিকা' : 'Mobile Access & Publish Guide'}
              </h3>
              <p className="text-xs text-slate-400">
                {lang === 'bn'
                  ? 'ডিপ্লয় করা, মোবাইল ভিউ এবং সরাসরি লিংক শেয়ার করার নিয়ম'
                  : 'How to deploy, access on mobile and share live link'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 bg-slate-950/30 px-6 pt-2 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('mobile')}
            className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-all ${
              activeTab === 'mobile'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{lang === 'bn' ? '১. মোবাইলে কীভাবে দেখবেন' : '1. On Mobile'}</span>
          </button>

          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-all ${
              activeTab === 'deploy'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Rocket className="w-4 h-4" />
            <span>{lang === 'bn' ? '২. ডিপ্লয় বাটন ও এরোর সমাধান' : '2. Deploy & 404 Fix'}</span>
          </button>

          <button
            onClick={() => setActiveTab('share')}
            className={`flex items-center gap-1.5 pb-2.5 border-b-2 transition-all ${
              activeTab === 'share'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>{lang === 'bn' ? '৩. লিংক কপি ও QR কোড' : '3. Copy Link & QR'}</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5 overflow-y-auto text-sm text-slate-300">
          {/* TAB 1: Mobile Guide */}
          {activeTab === 'mobile' && (
            <div className="space-y-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ১
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {lang === 'bn' ? 'মোবাইলে সরাসরি অ্যাপটি পূর্ণ স্ক্রিনে খুলুন' : 'Open Full Screen on Mobile'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {lang === 'bn'
                        ? 'আপনি যখন AI Studio-র ভেতর থাকেন, মোবাইল স্ক্রিনে চ্যাট ও কোড প্যানেল এক সাথে দেখানোর কারণে অ্যাপ ছোট বা ড্রয়ার আকারে আসে। অ্যাপটি সম্পূর্ণ আলাদা ব্রাউজার ট্যাবে পূর্ণ স্ক্রিনে ব্যবহার করতে নিচের বাটনে চাপ দিন:'
                        : 'To run this app in full browser view without the AI Studio chat wrapper:'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-2.5">
                  <a
                    href={currentHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'নতুন ট্যাবে অ্যাপ খুলুন' : 'Open App in New Tab'}</span>
                  </a>
                  <button
                    onClick={() => handleCopyLink(currentHref)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? (lang === 'bn' ? 'কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'অ্যাপ লিংক কপি' : 'Copy Direct App Link')}</span>
                  </button>
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ২
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">
                      {lang === 'bn' ? 'মোবাইল হোমস্ক্রিনে অ্যাপ ইনস্টল করুন (PWA)' : 'Add to Home Screen (Mobile App)'}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {lang === 'bn'
                        ? 'ক্রোম ব্রাউজারে ডানদিকের ৩-ডট (⋮) মেনু থেকে "Add to Home screen" বা "Install App" চাপলে এটি আপনার ফোনের অন্যান্য অ্যান্ড্রয়েড অ্যাপের মতো আইকন আকারে যুক্ত হয়ে যাবে।'
                        : 'In Chrome / Safari, tap the Share or 3-dots menu and select "Add to Home Screen" to install it like a native mobile app.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Deploy & 404 Guide */}
          {activeTab === 'deploy' && (
            <div className="space-y-4">
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-semibold text-xs">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'কেন ais-pre-... লিংকে ব্রাউজারে এরোর বা 404 আসে?' : 'Why does the ais-pre link show 404 / Error?'}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {lang === 'bn'
                    ? 'Google AI Studio দুটি লিংক প্রদান করে: ais-dev-... (ডেভলপমেন্ট লিংক যা এখন চলছে) এবং ais-pre-... (পাবলিক শেয়ারিং লিংক)। আপনি যতক্ষণ পর্যন্ত AI Studio-র উপরের Deploy বাটনে চাপ দিয়ে একবার পাবলিশ না করবেন, ততক্ষণ ais-pre-... লিংক সক্রিয় হয় না।'
                    : 'The ais-pre URL is created only after you click the Deploy button in the AI Studio top toolbar.'}
                </p>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-semibold text-white flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-emerald-400" />
                  <span>{lang === 'bn' ? 'মোবাইলে "Deploy" বাটন কোথায় পাবেন?' : 'Where is the Deploy button on Mobile?'}</span>
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-300">
                  <li>
                    <span className="font-medium text-slate-200">
                      {lang === 'bn' ? 'কম্পিউটার/ল্যাপটপ স্ক্রিনে:' : 'On Computer:'}
                    </span>{' '}
                    {lang === 'bn'
                      ? 'AI Studio-র একদম উপরের ডানদিকের কোণায় নীল রঙের একটি "Deploy" বা "Publish" বাটন থাকে।'
                      : 'Look at the top-right corner of the AI Studio toolbar for the blue "Deploy" button.'}
                  </li>
                  <li>
                    <span className="font-medium text-slate-200">
                      {lang === 'bn' ? 'মোবাইল ব্রাউজারে:' : 'On Mobile Browser:'}
                    </span>{' '}
                    {lang === 'bn'
                      ? 'মোবাইলে ব্রাউজারের ৩-ডট মেনুতে গিয়ে "Desktop site" (ডেস্কটপ মোড) চালু করুন। তাহলে উপরের ডানপাশে Deploy বাটনটি স্পষ্ট দৃশ্যমান হবে।'
                      : 'Switch Chrome to "Desktop site" mode to see the top AI Studio header with the Deploy button.'}
                  </li>
                  <li>
                    <span className="font-medium text-slate-200">
                      {lang === 'bn' ? 'Deploy করার পর:' : 'After Deploying:'}
                    </span>{' '}
                    {lang === 'bn'
                      ? 'পাবলিশ সম্পন্ন হলে যেকোনো সাধারণ মানুষ পৃথিবীর যেকোনো প্রান্ত থেকে আপনার ais-pre-... লিংকে কোনো লগইন ছাড়াই অ্যাপটি ব্যবহার করতে পারবে!'
                      : 'Once deployed, anyone globally can access the public link without authentication.'}
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* TAB 3: Share Link & QR Code */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-xl shrink-0 shadow-lg">
                  <img
                    src={qrImageUrl}
                    alt="Scan App QR Code"
                    className="w-36 h-36 rounded-lg"
                  />
                  <p className="text-[10px] text-center text-slate-400 mt-1.5 font-mono">
                    {lang === 'bn' ? 'মোবাইল ক্যামেরা দিয়ে স্ক্যান করুন' : 'Scan with Phone Camera'}
                  </p>
                </div>

                <div className="space-y-3 flex-1 text-xs">
                  <div>
                    <label className="text-slate-400 font-semibold block mb-1">
                      {lang === 'bn' ? 'লাইভ অ্যাপের সরাসরি লিংক (সবার জন্য):' : 'Direct Live App Link:'}
                    </label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[11px] text-emerald-400 break-all select-all">
                      <span>{currentOrigin}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={() => handleCopyLink(currentOrigin)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all shadow-sm"
                    >
                      {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedLink ? (lang === 'bn' ? 'লিংক কপি হয়েছে!' : 'Copied!') : (lang === 'bn' ? 'লিংক কপি করুন' : 'Copy Link')}</span>
                    </button>
                    <a
                      href={currentOrigin}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-all"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      <span>{lang === 'bn' ? 'সরাসরি খুলুন' : 'Open Direct'}</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 text-xs text-slate-400">
          <span>{lang === 'bn' ? 'চরিত্র ও ব্যক্তিত্ব দর্পণ v2.0' : 'Charitra Darpan Intelligence v2.0'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-all"
          >
            {lang === 'bn' ? 'ঠিক আছে' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
