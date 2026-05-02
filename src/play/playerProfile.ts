import type { PlayerAccessory } from '@/shared/contracts';

export interface LocalPlayerProfile {
  displayName: string;
  color: string;
  accessory: PlayerAccessory;
}

export interface PlayerProfileStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export const avatarColors = [
  { name: 'blue', value: '#2563eb' },
  { name: 'green', value: '#16a34a' },
  { name: 'orange', value: '#ea580c' },
  { name: 'purple', value: '#9333ea' },
] as const;

export const accessories: PlayerAccessory[] = ['backpack', 'nametag', 'scarf', 'suitcase'];

const defaultProfile: LocalPlayerProfile = {
  displayName: 'Traveler 22',
  color: avatarColors[0].value,
  accessory: 'backpack',
};

function browserStorage(): PlayerProfileStorage | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function sanitizeLocalPlayerProfile(profile: Partial<LocalPlayerProfile>): LocalPlayerProfile {
  const displayName = profile.displayName?.trim().slice(0, 24) || defaultProfile.displayName;
  const color = avatarColors.some((avatarColor) => avatarColor.value === profile.color)
    ? profile.color
    : defaultProfile.color;
  const accessory = profile.accessory && accessories.includes(profile.accessory)
    ? profile.accessory
    : defaultProfile.accessory;

  return { displayName, color, accessory };
}

export function readLocalPlayerProfile(storage = browserStorage()): LocalPlayerProfile {
  if (!storage) return defaultProfile;

  return sanitizeLocalPlayerProfile({
    displayName: storage.getItem('huskyhac.playerName') ?? undefined,
    color: storage.getItem('huskyhac.playerColor') ?? undefined,
    accessory: storage.getItem('huskyhac.playerAccessory') as PlayerAccessory | null | undefined,
  });
}

export function saveLocalPlayerProfile(
  profile: Partial<LocalPlayerProfile>,
  storage = browserStorage(),
): LocalPlayerProfile {
  const sanitized = sanitizeLocalPlayerProfile(profile);
  storage?.setItem('huskyhac.playerName', sanitized.displayName);
  storage?.setItem('huskyhac.playerColor', sanitized.color);
  storage?.setItem('huskyhac.playerAccessory', sanitized.accessory);
  return sanitized;
}
