import React, { useState } from 'react';
import { Scale, CheckCircle, ShieldCheck, Heart, Sparkles, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { SITUATIONAL_DILEMMAS } from '../data/situationalDilemmas';

interface SituationalTestViewProps {
  lang: 'bn' | 'en';
  onProceedToDeepWithDecisions?: (decisions: any[]) => void;
}

export const SituationalTestView: React.FC<SituationalTestViewProps> = ({
  lang,
  onProceedToDeepWithDecisions,
}) => {
  const [selectedChoices, setSelectedChoices] = useState<Record<string, number>>({});
  const [isCalculated, setIsCalculated] = useState(false);

  const dilemmas = SITUATIONAL_DILEMMAS;

  const handleSelectChoice = (dilemmaId: string, choiceIdx: number) => {
    setSelectedChoices((prev) => ({
      ...prev,
      [dilemmaId]: choiceIdx,
    }));
  };

  const handleCalculateScore = () => {
    setIsCalculated(true);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  };

  const handleReset = () => {
    setSelectedChoices({});
    setIsCalculated(false);
  };

  // Compute character weight score
  let totalIntegrity = 0;
  let totalEmpathy = 0;
  let totalPatience = 0;
  let totalCourage = 0;

  dilemmas.forEach((d) => {
    const choiceIdx = selectedChoices[d.id];
    if (choiceIdx !== undefined && d.choices[choiceIdx]) {
      const weight = d.choices[choiceIdx].characterWeight;
      totalIntegrity += weight.integrity;
      totalEmpathy += weight.empathy;
      totalPatience += weight.patience;
      totalCourage += weight.courage;
    }
  });

  const maxPerCategory = dilemmas.length * 5;
  const integrityPct = Math.round((totalIntegrity / maxPerCategory) * 100);
  const empathyPct = Math.round((totalEmpathy / maxPerCategory) * 100);
  const patiencePct = Math.round((totalPatience / maxPerCategory) * 100);
  const couragePct = Math.round((totalCourage / maxPerCategory) * 100);

  const isAllAnswered = Object.keys(selectedChoices).length === dilemmas.length;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-amber-950/40 border border-indigo-500/30 p-6 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold mb-2">
          <Scale className="w-3.5 h-3.5" />
          {lang === 'bn' ? 'বাস্তব জীবনের নৈতিক দ্বন্দ্ব পরীক্ষা' : 'Situational Moral Dilemma Test'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {lang === 'bn'
            ? 'কঠিন পরিস্থিতিতে আপনার আসল চরিত্র কেমন?'
            : 'How Do You Respond Under Moral Pressure?'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          {lang === 'bn'
            ? 'মানুষের প্রকৃত সততা ও চরিত্রের প্রমাণ মেলে যখন সুবিধা নেওয়ার শত সুযোগ থাকা সত্ত্বেও সঠিক পথ বেছে নেওয়া হয়।'
            : 'True character is revealed not when it is convenient, but when self-interest clashes with ethics.'}
        </p>
      </div>

      {/* Dilemmas list */}
      <div className="space-y-6">
        {dilemmas.map((dilemma, dIdx) => (
          <div
            key={dilemma.id}
            className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-sm shadow-xl"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm">
                {dIdx + 1}
              </span>
              <h3 className="text-lg font-bold text-white">
                {lang === 'bn' ? dilemma.titleBn : dilemma.titleEn}
              </h3>
            </div>

            <p className="text-sm text-slate-300 mb-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 leading-relaxed">
              {lang === 'bn' ? dilemma.scenarioBn : dilemma.scenarioEn}
            </p>

            <div className="space-y-3">
              {dilemma.choices.map((choice, cIdx) => {
                const isSelected = selectedChoices[dilemma.id] === cIdx;
                return (
                  <button
                    key={cIdx}
                    type="button"
                    onClick={() => handleSelectChoice(dilemma.id, cIdx)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3.5 ${
                      isSelected
                        ? 'bg-indigo-950/50 border-indigo-400 text-white shadow-md'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 ${
                        isSelected
                          ? 'bg-indigo-400 text-slate-950 font-bold'
                          : 'border border-slate-600'
                      }`}
                    >
                      {isSelected ? '✓' : ''}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-relaxed">
                        {lang === 'bn' ? choice.textBn : choice.textEn}
                      </p>
                      {isSelected && isCalculated && (
                        <p className="text-xs text-indigo-300 mt-1.5 font-semibold">
                          {lang === 'bn' ? `চারিত্রিক প্রকাশ: ${choice.moralQualityBn}` : `Trait: ${choice.moralQualityEn}`}
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action / Results */}
      <div className="text-center">
        {!isCalculated ? (
          <button
            type="button"
            onClick={handleCalculateScore}
            disabled={!isAllAnswered}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm sm:text-base transition-all shadow-xl flex items-center gap-2 mx-auto ${
              !isAllAnswered
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-500 to-teal-400 text-slate-950 hover:scale-105'
            }`}
          >
            <Sparkles className="w-5 h-5" />
            <span>{lang === 'bn' ? 'নৈতিক চারিত্রিক সূচক গণনা করুন' : 'Calculate Character Index'}</span>
          </button>
        ) : (
          <div className="space-y-6">
            {/* Computed Scores */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-left shadow-2xl">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span>{lang === 'bn' ? 'আপনার নৈতিক ও চারিত্রিক ফলাফল' : 'Your Ethical Profile Score'}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'সততা সূচক' : 'Integrity'}
                  </span>
                  <span className="text-2xl font-black text-emerald-400">{integrityPct}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'সহমর্মিতা' : 'Empathy'}
                  </span>
                  <span className="text-2xl font-black text-blue-400">{empathyPct}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'ধৈর্য ও সংযম' : 'Patience'}
                  </span>
                  <span className="text-2xl font-black text-amber-400">{patiencePct}%</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                  <span className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'নৈতিক সাহস' : 'Courage'}
                  </span>
                  <span className="text-2xl font-black text-indigo-400">{couragePct}%</span>
                </div>
              </div>

              <div className="flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{lang === 'bn' ? 'পুনরায় পরীক্ষা' : 'Retake'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
