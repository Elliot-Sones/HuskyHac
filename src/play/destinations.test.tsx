import { describe, expect, it } from 'vitest';
import { resolvePlayDestination } from '@/play/destinations';

describe('resolvePlayDestination', () => {
  it('builds a playable Spanish airport when Spain is selected from the globe', () => {
    const destination = resolvePlayDestination('airport-spain');

    expect(destination.id).toBe('airport-spain');
    expect(destination.scenario.destination).toBe('Madrid, Spain');
    expect(destination.scenario.npc.language).toBe('Spanish');
    expect((destination.scenario as any).language).toMatchObject({
      name: 'Spanish',
      locale: 'es-ES',
      transcriptionLanguage: 'es',
    });
    expect(destination.scenario.turns[0].responses[1].french).toContain('centro');
  });

  it('builds a playable Japanese airport when Japan is selected from the globe', () => {
    const destination = resolvePlayDestination('airport-japan');

    expect(destination.id).toBe('airport-japan');
    expect(destination.scenario.destination).toBe('Tokyo, Japan');
    expect(destination.scenario.npc.language).toBe('Japanese');
    expect((destination.scenario as any).language).toMatchObject({
      name: 'Japanese',
      locale: 'ja-JP',
      transcriptionLanguage: 'ja',
    });
    expect(destination.scenario.turns[0].responses[0].french).toContain('こんにちは');
  });
});
