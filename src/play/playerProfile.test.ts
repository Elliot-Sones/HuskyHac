import { describe, expect, it } from 'vitest';
import {
  readLocalPlayerProfile,
  saveLocalPlayerProfile,
  type PlayerProfileStorage,
} from '@/play/playerProfile';

function makeStorage(initial: Record<string, string | undefined> = {}) {
  const values = new Map(Object.entries(initial).filter((entry): entry is [string, string] => Boolean(entry[1])));
  const storage: PlayerProfileStorage = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  return { storage, values };
}

describe('local player profile', () => {
  it('reads saved traveler choices for the in-game character', () => {
    const { storage } = makeStorage({
      'huskyhac.playerName': 'Camille',
      'huskyhac.playerColor': '#9333ea',
      'huskyhac.playerAccessory': 'scarf',
    });

    expect(readLocalPlayerProfile(storage)).toEqual({
      displayName: 'Camille',
      color: '#9333ea',
      accessory: 'scarf',
    });
  });

  it('saves sanitized traveler choices back to local storage', () => {
    const { storage, values } = makeStorage();

    const profile = saveLocalPlayerProfile(
      {
        displayName: '  A very very very very long traveler name  ',
        color: '#ea580c',
        accessory: 'suitcase',
      },
      storage,
    );

    expect(profile).toEqual({
      displayName: 'A very very very very lo',
      color: '#ea580c',
      accessory: 'suitcase',
    });
    expect(values.get('huskyhac.playerName')).toBe('A very very very very lo');
    expect(values.get('huskyhac.playerColor')).toBe('#ea580c');
    expect(values.get('huskyhac.playerAccessory')).toBe('suitcase');
  });
});
