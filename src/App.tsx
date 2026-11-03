/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SocialProfileAnalyzer } from './components/SocialProfileAnalyzer';
import { SocialDossierView } from './components/SocialDossierView';
import { DeepAnalyzerForm } from './components/DeepAnalyzerForm';
import { CharacterReportView } from './components/CharacterReportView';
import { QuickQuizView } from './components/QuickQuizView';
import { HabitsTrackerView } from './components/HabitsTrackerView';
import { SituationalTestView } from './components/SituationalTestView';
import { ZodiacExplorerView } from './components/ZodiacExplorerView';
import { AIHabitCoachView } from './components/AIHabitCoachView';
import { HistoryView } from './components/HistoryView';
import { PublishGuideModal } from './components/PublishGuideModal';
import { MobileNavBar } from './components/MobileNavBar';
import { DailyAffirmations } from './components/DailyAffirmations';
import {
  CharacterAnalysisResult,
  SocialAnalysisResult,
  SavedProfile,
} from './types/character';
import confetti from 'canvas-confetti';

export default function App() {
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [activeTab, setActiveTab] = useState<string>('social');
  const [currentSocialData, setCurrentSocialData] = useState<SocialAnalysisResult | null>(null);
  const [currentResult, setCurrentResult] = useState<CharacterAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
  const [coachTarget, setCoachTarget] = useState<{
    habitName: string;
    habitType: 'good' | 'bad';
  } | null>(null);

  // Local storage history
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>(() => {
    const saved = localStorage.getItem('charitra_saved_profiles');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('charitra_saved_profiles', JSON.stringify(savedProfiles));
  }, [savedProfiles]);

  const handleAnalysisComplete = (result: CharacterAnalysisResult) => {
    setCurrentResult(result);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });

    // Save automatically to history
    const newProfile: SavedProfile = {
      id: `profile_${Date.now()}`,
      name: result.personName || (lang === 'bn' ? 'ব্যক্তিত্ব মূল্যায়ন' : 'Personality Profile'),
      date: new Date().toLocaleDateString(lang === 'bn' ? 'bn-BD' : 'en-US'),
      result,
    };
    setSavedProfiles((prev) => [newProfile, ...prev.slice(0, 19)]);
  };

  const handleSocialAnalysisComplete = (socialResult: SocialAnalysisResult) => {
    setCurrentSocialData(socialResult);
    confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 } });
  };

  const handleSelectFromHistory = (result: CharacterAnalysisResult) => {
    setCurrentResult(result);
    setActiveTab('analyzer');
  };

  const handleDeleteProfile = (id: string) => {
    setSavedProfiles((prev) => prev.filter((p) => p.id !== id));
  };

  const handleClearAllHistory = () => {
    if (window.confirm(lang === 'bn' ? 'সব রেকর্ড মুছে ফেলতে চান?' : 'Clear all history?')) {
      setSavedProfiles([]);
    }
  };

  const handleGetHabitAdvice = (habitName: string, habitType: 'good' | 'bad') => {
    setCoachTarget({ habitName, habitType });
    setActiveTab('advisor');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      {/* Background ambient light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 print:hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[750px] h-[550px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-teal-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-0 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-[160px]" />
      </div>

      {/* Main Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
        }}
        lang={lang}
        setLang={setLang}
        savedCount={savedProfiles.length}
        onOpenPublishGuide={() => setIsPublishModalOpen(true)}
      />

      {/* Main Body Content with mobile bottom padding */}
      <main className="flex-1 relative z-10 pb-24 md:pb-8">
        {/* Tab: Daily Affirmations (Dedicated Hub) */}
        {activeTab === 'affirmations' && (
          <DailyAffirmations lang={lang} />
        )}

        {/* Tab 0: Social Media Profile Analyzer */}
        {activeTab === 'social' && (
          <>
            {currentSocialData ? (
              <SocialDossierView
                data={currentSocialData}
                lang={lang}
                onReset={() => setCurrentSocialData(null)}
              />
            ) : (
              <SocialProfileAnalyzer
                lang={lang}
                onAnalysisComplete={handleSocialAnalysisComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onOpenAffirmations={() => setActiveTab('affirmations')}
              />
            )}
          </>
        )}

        {/* Tab 1: Deep Analyzer / Report */}
        {activeTab === 'analyzer' && (
          <>
            {currentResult ? (
              <CharacterReportView
                result={currentResult}
                lang={lang}
                onReset={() => setCurrentResult(null)}
              />
            ) : (
              <DeepAnalyzerForm
                lang={lang}
                onAnalysisComplete={handleAnalysisComplete}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
            )}
          </>
        )}

        {/* Tab 2: Quick Quiz */}
        {activeTab === 'quiz' && (
          <QuickQuizView
            lang={lang}
            onComplete={(res) => {
              handleAnalysisComplete(res);
              setActiveTab('analyzer');
            }}
            onSwitchToDeep={() => {
              setCurrentResult(null);
              setActiveTab('analyzer');
            }}
          />
        )}

        {/* Tab 3: Habits Tracker */}
        {activeTab === 'habits' && (
          <HabitsTrackerView
            lang={lang}
            onGetHabitAdvice={handleGetHabitAdvice}
          />
        )}

        {/* Tab 4: Moral Dilemma Test */}
        {activeTab === 'dilemma' && (
          <SituationalTestView lang={lang} />
        )}

        {/* Tab 5: Zodiac Archetypes */}
        {activeTab === 'zodiac' && (
          <ZodiacExplorerView lang={lang} />
        )}

        {/* Tab 6: AI Habit Coach */}
        {activeTab === 'advisor' && (
          <AIHabitCoachView
            lang={lang}
            initialHabitName={coachTarget?.habitName || ''}
            initialHabitType={coachTarget?.habitType || 'bad'}
          />
        )}

        {/* Tab 7: Saved History */}
        {activeTab === 'history' && (
          <HistoryView
            lang={lang}
            savedProfiles={savedProfiles}
            onSelectProfile={handleSelectFromHistory}
            onDeleteProfile={handleDeleteProfile}
            onClearAll={handleClearAllHistory}
          />
        )}
      </main>

      {/* Cultural Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 backdrop-blur-md py-6 px-4 text-center text-xs text-slate-500 relative z-10 print:hidden mb-14 md:mb-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="italic text-slate-400">
            {lang === 'bn'
              ? '“ডিজিটাল আচরণে ফুটে ওঠে মানুষের মানসিক আভা ও চরিত্র।”'
              : '“Digital footprints illuminate underlying psychology, habits and character.”'}
          </p>
          <div className="flex items-center gap-2 text-slate-400 font-medium">
            <span>চরিত্র দর্পন</span>
            <span>•</span>
            <span>AI Studio</span>
          </div>
        </div>
      </footer>

      {/* Dedicated Mobile Bottom Navigation Bar */}
      <MobileNavBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
        savedCount={savedProfiles.length}
        onOpenPublishGuide={() => setIsPublishModalOpen(true)}
      />

      {/* Publish & Mobile Help Guide Modal */}
      <PublishGuideModal
        isOpen={isPublishModalOpen}
        onClose={() => setIsPublishModalOpen(false)}
        lang={lang}
      />
    </div>
  );
}
