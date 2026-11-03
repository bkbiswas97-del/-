import React, { useState } from 'react';
import {
  ClipboardCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { CharacterAnalysisResult } from '../types/character';

interface QuickQuizViewProps {
  lang: 'bn' | 'en';
  onComplete: (result: CharacterAnalysisResult) => void;
  onSwitchToDeep: () => void;
}

export const QuickQuizView: React.FC<QuickQuizViewProps> = ({
  lang,
  onComplete,
  onSwitchToDeep,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [personName, setPersonName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQuestions = QUIZ_QUESTIONS.length;
  const currentQ = QUIZ_QUESTIONS[currentIdx];
  const progressPercent = Math.round(((currentIdx + 1) / totalQuestions) * 100);

  const handleSelectOption = (questionId: string, optionScore: number) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionScore,
    }));
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((prev) => prev - 1);
    }
  };

  const calculateQuickScoreAndSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Calculate scores
      let integrityTotal = 0;
      let emotionTotal = 0;
      let patienceTotal = 0;
      let empathyTotal = 0;
      let gritTotal = 0;
      let humilityTotal = 0;

      QUIZ_QUESTIONS.forEach((q) => {
        const score = selectedAnswers[q.id] || 3;
        if (q.category === 'integrity') integrityTotal += score;
        if (q.category === 'emotion') emotionTotal += score;
        if (q.category === 'patience') patienceTotal += score;
        if (q.category === 'empathy') empathyTotal += score;
        if (q.category === 'grit') gritTotal += score;
        if (q.category === 'humility') humilityTotal += score;
      });

      const normalize = (score: number, max: number) =>
        Math.min(98, Math.max(30, Math.round((score / max) * 100)));

      // Trigger full assessment via backend using the answers
      const payload = {
        name: personName.trim() || (lang === 'bn' ? 'কুইজ উত্তরদাতা' : 'Quiz Participant'),
        answers: selectedAnswers,
        selfDescription: 'Completed quick 8-dimension character quiz.',
      };

      const res = await fetch('/api/analyze-character', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
        onComplete({
          ...data.data,
          personName: personName.trim() || (lang === 'bn' ? 'কুইজ উত্তরদাতা' : 'Seeker'),
          timestamp: Date.now(),
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCurrentAnswered = selectedAnswers[currentQ.id] !== undefined;
  const isAllAnswered = Object.keys(selectedAnswers).length === totalQuestions;

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6">
      {/* Quiz Header Banner */}
      <div className="text-center mb-8 space-y-2">
        <div className="text-xs font-semibold text-teal-400 tracking-wider uppercase">
          {lang === 'bn' ? 'মনস্তাত্ত্বিক কুইজ' : 'Quick Character Quiz'}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          {lang === 'bn'
            ? '৮টি সুনির্দিষ্ট প্রশ্নে জানুন আপনার স্বভাব ও দোষ-গুণ'
            : 'Uncover Virtues & Flaws in 8 Questions'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
          {lang === 'bn'
            ? 'মন খুলে নিজের স্বাভাবিক প্রতিক্রিয়া নির্বাচন করুন। কোনো উত্তর ভুল নয়—উদ্দেশ্য আত্মদর্শন।'
            : 'Answer intuitively. There are no right or wrong answers—only honest reflection.'}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
          <span>
            {lang === 'bn'
              ? `প্রশ্ন ${currentIdx + 1} / ${totalQuestions}`
              : `Question ${currentIdx + 1} of ${totalQuestions}`}
          </span>
          <span className="font-mono tabular-nums font-semibold text-teal-400">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
          <div
            className="h-full bg-gradient-to-r from-teal-500 to-emerald-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-md mb-6">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-teal-950 text-teal-400 border border-teal-800/60 text-xs font-bold uppercase tracking-wider mb-4">
          {lang === 'bn' ? currentQ.categoryTitleBn : currentQ.categoryTitleEn}
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-snug mb-6">
          {lang === 'bn' ? currentQ.questionBn : currentQ.questionEn}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedAnswers[currentQ.id] === opt.score;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectOption(currentQ.id, opt.score)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 group ${
                  isSelected
                    ? 'bg-teal-950/40 border-teal-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
                }`}
              >
                <div
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center text-xs shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-teal-400 text-slate-950 font-bold'
                      : 'border border-slate-600 group-hover:border-slate-500'
                  }`}
                >
                  {isSelected ? '✓' : ''}
                </div>
                <div>
                  <p className="text-sm font-medium leading-relaxed">
                    {lang === 'bn' ? opt.textBn : opt.textEn}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {lang === 'bn' ? `প্রকাশক বৈশিষ্ট্য: ${opt.traitRefBn}` : `Trait: ${opt.traitRefEn}`}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIdx === 0}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
            currentIdx === 0
              ? 'opacity-40 border-slate-800 text-slate-600 cursor-not-allowed'
              : 'border-slate-700 bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{lang === 'bn' ? 'আগের প্রশ্ন' : 'Previous'}</span>
        </button>

        {currentIdx < totalQuestions - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isCurrentAnswered}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              !isCurrentAnswered
                ? 'opacity-50 bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-teal-500 hover:bg-teal-400 text-slate-950'
            }`}
          >
            <span>{lang === 'bn' ? 'পরবর্তী প্রশ্ন' : 'Next Question'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={calculateQuickScoreAndSubmit}
            disabled={!isAllAnswered || isSubmitting}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xl ${
              !isAllAnswered || isSubmitting
                ? 'opacity-50 bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-300 hover:to-emerald-300 text-slate-950 hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>{lang === 'bn' ? 'ফলাফল তৈরি হচ্ছে...' : 'Generating Report...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{lang === 'bn' ? 'সম্পূর্ণ চরিত্র রিপোর্ট দেখুন' : 'View Full Character Report'}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Switch to deep profiler prompt */}
      <div className="text-center mt-10 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
        <p className="text-xs text-slate-400 mb-2">
          {lang === 'bn'
            ? 'আরো বিস্তারিতভাবে নিজের কথা লিখে বা অভ্যাস বেছে চরিত্র বিশ্লেষণ চান?'
            : 'Want more comprehensive analysis by typing your own words and habits?'}
        </p>
        <button
          onClick={onSwitchToDeep}
          className="text-xs text-emerald-400 hover:underline font-semibold"
        >
          {lang === 'bn' ? '→ গভীর চরিত্র বিশ্লেষকে যান' : '→ Go to Deep Character Profiler'}
        </button>
      </div>
    </div>
  );
};
