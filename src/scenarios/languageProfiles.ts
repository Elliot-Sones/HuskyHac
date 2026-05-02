import type { LearningLanguage, Scenario } from '@/shared/contracts';
import type { SpeechLanguageOptions } from '@/conversation/conversationTypes';

export const LANGUAGE_PROFILES = {
  Arabic: { name: 'Arabic', locale: 'ar-EG', transcriptionLanguage: 'ar' },
  Dutch: { name: 'Dutch', locale: 'nl-NL', transcriptionLanguage: 'nl' },
  English: { name: 'English', locale: 'en-US', transcriptionLanguage: 'en' },
  French: { name: 'French', locale: 'fr-FR', transcriptionLanguage: 'fr' },
  German: { name: 'German', locale: 'de-DE', transcriptionLanguage: 'de' },
  Greek: { name: 'Greek', locale: 'el-GR', transcriptionLanguage: 'el' },
  Hindi: { name: 'Hindi', locale: 'hi-IN', transcriptionLanguage: 'hi' },
  Italian: { name: 'Italian', locale: 'it-IT', transcriptionLanguage: 'it' },
  Japanese: { name: 'Japanese', locale: 'ja-JP', transcriptionLanguage: 'ja' },
  Korean: { name: 'Korean', locale: 'ko-KR', transcriptionLanguage: 'ko' },
  Mandarin: { name: 'Mandarin', locale: 'zh-CN', transcriptionLanguage: 'zh' },
  Portuguese: { name: 'Portuguese', locale: 'pt-BR', transcriptionLanguage: 'pt' },
  Russian: { name: 'Russian', locale: 'ru-RU', transcriptionLanguage: 'ru' },
  Spanish: { name: 'Spanish', locale: 'es-ES', transcriptionLanguage: 'es' },
  Turkish: { name: 'Turkish', locale: 'tr-TR', transcriptionLanguage: 'tr' },
} satisfies Record<string, LearningLanguage>;

export type KnownLanguageName = keyof typeof LANGUAGE_PROFILES;

export const DEFAULT_LANGUAGE = LANGUAGE_PROFILES.English;

export function resolveLanguageProfile(languageName: string | undefined): LearningLanguage {
  const match = Object.values(LANGUAGE_PROFILES).find(
    (language) => language.name.toLowerCase() === languageName?.toLowerCase(),
  );

  return match ?? DEFAULT_LANGUAGE;
}

export function scenarioLanguage(scenario: Scenario): LearningLanguage {
  return scenario.language ?? resolveLanguageProfile(scenario.npc.language);
}

export function scenarioSpeechOptions(scenario: Scenario): Required<SpeechLanguageOptions> {
  const language = scenarioLanguage(scenario);

  return {
    lang: language.locale,
    languageName: language.name,
    transcriptionLanguage: language.transcriptionLanguage,
  };
}
