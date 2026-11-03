export type AffirmationCategory =
  | 'all'
  | 'confidence'
  | 'patience'
  | 'peace'
  | 'integrity'
  | 'empathy'
  | 'discipline';

export interface Affirmation {
  id: string;
  category: 'confidence' | 'patience' | 'peace' | 'integrity' | 'empathy' | 'discipline';
  titleBn: string;
  titleEn: string;
  bengaliAffirmation: string;
  englishAffirmation: string;
  focusVirtueBn: string;
  focusVirtueEn: string;
  microActionBn: string;
  microActionEn: string;
  philosophicalContextBn: string;
  philosophicalContextEn: string;
  reflectionPromptBn: string;
  reflectionPromptEn: string;
  accentColor: string;
}

export interface PersonalizedAffirmationRequest {
  topic: string;
  currentFeeling?: string;
  characterGoal?: string;
  lang?: 'bn' | 'en';
}

export interface PersonalizedAffirmationResponse {
  id: string;
  category: string;
  titleBn: string;
  titleEn: string;
  bengaliAffirmation: string;
  englishAffirmation: string;
  focusVirtueBn: string;
  focusVirtueEn: string;
  microActionBn: string;
  microActionEn: string;
  philosophicalContextBn: string;
  philosophicalContextEn: string;
  reflectionPromptBn: string;
  reflectionPromptEn: string;
  accentColor: string;
}
