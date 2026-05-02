import { describe, expect, it } from 'vitest';
import { AIRPORT_TRANSIT_TARGETS } from '@/world/airportLayout';
import { createTransitConversationFocus } from '@/world/transitCamera';

describe('createTransitConversationFocus', () => {
  it('creates a close conversation camera for each transit target', () => {
    for (const target of AIRPORT_TRANSIT_TARGETS) {
      const focus = createTransitConversationFocus(target);

      expect(focus.camera.y).toBeGreaterThan(2);
      expect(focus.camera.z).toBeGreaterThan(target.position.z);
      expect(focus.look.y).toBeGreaterThan(1);
      expect(focus.look.x).toBeCloseTo(target.position.x, 1);
      expect(focus.look.z).toBeCloseTo(target.position.z, 1);
    }
  });
});
