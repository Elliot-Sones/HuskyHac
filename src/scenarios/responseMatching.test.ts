import { describe, expect, it } from 'vitest';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { matchResponseVariant, normalizeResponse } from '@/scenarios/responseMatching';

describe('response matching', () => {
  const firstTurn = airportFranceScenario.turns[0];

  it('normalizes accents, punctuation, and casing', () => {
    expect(normalizeResponse("Où sont les taxis, s'il vous plaît ?")).toBe(
      'ou sont les taxis s il vous plait',
    );
  });

  it('accepts a recommended exact French response', () => {
    const match = matchResponseVariant(
      'Bonjour, comment puis-je aller au centre-ville ?',
      firstTurn,
    );

    expect(match.option?.id).toBe('ask-downtown');
    expect(match.score).toBeGreaterThan(0.9);
  });

  it('accepts a non-exact travel intent variant', () => {
    const match = matchResponseVariant('I need a taxi to central Paris', firstTurn);

    expect(match.matchedBy).toBe('meaning');
    expect(match.option?.id).toBe('ask-downtown');
    expect(match.score).toBeGreaterThanOrEqual(0.5);
  });

  it('rejects unrelated text', () => {
    const match = matchResponseVariant('the coffee is purple', firstTurn);

    expect(match.option).toBeNull();
    expect(match.matchedBy).toBe('none');
  });
});
