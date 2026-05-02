import type { ResponseOption, ScenarioTurn } from '@/shared/contracts';

export interface ResponseMatch {
  option: ResponseOption | null;
  score: number;
  matchedBy: 'option' | 'meaning' | 'none';
}

const FRENCH_MARKS: Record<string, string> = {
  a: '[aàâä]',
  c: '[cç]',
  e: '[eéèêë]',
  i: '[iîï]',
  o: '[oôö]',
  u: '[uùûü]',
};

export function normalizeResponse(input: string) {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, ' ')
    .replace(/[^a-zA-Z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function matchResponseVariant(input: string, turn: ScenarioTurn): ResponseMatch {
  const normalizedInput = normalizeResponse(input);

  if (!normalizedInput) {
    return { option: null, score: 0, matchedBy: 'none' };
  }

  const optionScores = turn.responses.map((option) => {
    const frenchScore = phraseScore(normalizedInput, option.french);
    const englishScore = phraseScore(normalizedInput, option.english);

    return {
      option,
      score: Math.max(frenchScore, englishScore),
    };
  });

  const bestOption = optionScores.sort((a, b) => b.score - a.score)[0];

  if (bestOption && bestOption.score >= 0.42) {
    return { option: bestOption.option, score: bestOption.score, matchedBy: 'option' };
  }

  const meaningScore = turn.acceptedMeanings.reduce((best, meaning) => {
    const normalizedMeaning = normalizeResponse(meaning);
    if (!normalizedMeaning) {
      return best;
    }

    if (normalizedInput.includes(normalizedMeaning)) {
      return Math.max(best, 0.72);
    }

    return Math.max(best, wordOverlapScore(normalizedInput, normalizedMeaning));
  }, 0);

  if (meaningScore >= 0.5) {
    return {
      option: turn.responses.find((response) => response.recommended) ?? turn.responses[0] ?? null,
      score: meaningScore,
      matchedBy: 'meaning',
    };
  }

  return { option: null, score: Math.max(bestOption?.score ?? 0, meaningScore), matchedBy: 'none' };
}

function phraseScore(input: string, phrase: string) {
  const normalizedPhrase = normalizeResponse(phrase);

  if (!normalizedPhrase) {
    return 0;
  }

  if (input === normalizedPhrase) {
    return 1;
  }

  if (input.includes(normalizedPhrase) || normalizedPhrase.includes(input)) {
    return Math.min(0.9, 0.48 + Math.min(input.length, normalizedPhrase.length) / 80);
  }

  return Math.max(wordOverlapScore(input, normalizedPhrase), accentFlexibleScore(input, phrase));
}

function wordOverlapScore(input: string, phrase: string) {
  const inputWords = new Set(input.split(' ').filter(Boolean));
  const phraseWords = phrase.split(' ').filter((word) => word.length > 2);

  if (!phraseWords.length) {
    return 0;
  }

  const matched = phraseWords.filter((word) => inputWords.has(word)).length;
  return matched / phraseWords.length;
}

function accentFlexibleScore(input: string, phrase: string) {
  const pattern = phrase
    .toLowerCase()
    .split('')
    .map((char) => FRENCH_MARKS[char] ?? char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .join('')
    .replace(/\s+/g, '\\s+');

  return new RegExp(pattern, 'i').test(input) ? 0.85 : 0;
}
