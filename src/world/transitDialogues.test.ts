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

  it('offers Eiffel Tower requests from airport transit conversations', () => {
    expect(getTransitDialogue('taxi')?.responses.some((response) => /tour eiffel/i.test(response.french))).toBe(
      true,
    );
    expect(getTransitDialogue('bus')?.responses.some((response) => /tour eiffel/i.test(response.french))).toBe(
      true,
    );
  });
});
