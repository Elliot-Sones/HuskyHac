import { describe, expect, it } from 'vitest';
import { AIRPORT_TRANSIT_TARGETS } from '@/world/airportLayout';
import { getTransitDialogue } from '@/world/transitDialogues';

describe('transit dialogues', () => {
  it('provides a practice encounter for each airport transit target', () => {
    for (const target of AIRPORT_TRANSIT_TARGETS) {
      const dialogue = getTransitDialogue(target.id);

      expect(dialogue?.targetId).toBe(target.id);
      expect(dialogue?.npc.name).toMatch(/driver|chauffeur|agent/i);
      expect(dialogue?.opening.text).toContain('?');
      expect(dialogue?.responses).toHaveLength(3);
      expect(dialogue?.responses.some((response) => response.recommended)).toBe(true);
    }
  });

  it('keeps taxi and bus practice goals distinct', () => {
    expect(getTransitDialogue('taxi')?.goal).toMatch(/taxi/i);
    expect(getTransitDialogue('bus')?.goal).toMatch(/bus/i);
  });

  it('offers both café and Eiffel Tower onward phrases from airport transit conversations', () => {
    const taxiPhrases = getTransitDialogue('taxi')?.responses.map((response) => response.french).join(' ');
    const busPhrases = getTransitDialogue('bus')?.responses.map((response) => response.french).join(' ');

    expect(taxiPhrases).toMatch(/cafe|marais/i);
    expect(taxiPhrases).toMatch(/tour eiffel/i);
    expect(busPhrases).toMatch(/cafe|marais/i);
    expect(busPhrases).toMatch(/tour eiffel/i);
  });
});
