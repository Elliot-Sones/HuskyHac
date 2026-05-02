import {
  MULTIPLAYER_ROOM_CODE_PATTERN,
  type PlayerAccessory,
  type PlayerProfileInput,
  type PlayerSnapshot,
} from '../../src/shared/contracts.js';
import { type NormalizedProfileInput, RoomRegistryError } from './roomTypes.js';

const fallbackColors = ['#2563eb', '#16a34a', '#ea580c', '#9333ea'];
const accessories: PlayerAccessory[] = ['backpack', 'nametag', 'scarf', 'suitcase'];

export function normalizeRoomCode(code: string) {
  const normalized = code.trim().toUpperCase();
  if (!MULTIPLAYER_ROOM_CODE_PATTERN.test(normalized)) {
    throw new RoomRegistryError('INVALID_ROOM', 'Room codes must be six letters or numbers.');
  }
  return normalized;
}

export function normalizeProfile(input: PlayerProfileInput, index = 0): NormalizedProfileInput {
  const playerToken = input.playerToken.trim();
  const displayName = input.displayName.trim().replace(/\s+/g, ' ').slice(0, 24);
  const color = /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : fallbackColors[index % fallbackColors.length];
  const accessory = input.accessory && accessories.includes(input.accessory) ? input.accessory : accessories[index % accessories.length];

  if (playerToken.length < 8 || playerToken.length > 80) {
    throw new RoomRegistryError('INVALID_PROFILE', 'Player token is invalid.');
  }
  if (!displayName) {
    throw new RoomRegistryError('INVALID_PROFILE', 'Display name is required.');
  }

  return { playerToken, displayName, color, accessory };
}

export function validateSnapshot(snapshot: PlayerSnapshot) {
  if (!Number.isSafeInteger(snapshot.sequence) || snapshot.sequence < 1) {
    throw new RoomRegistryError('STALE_SNAPSHOT', 'Snapshot sequence is invalid.');
  }
  if (!Number.isFinite(snapshot.position.x) || !Number.isFinite(snapshot.position.y) || !Number.isFinite(snapshot.position.z)) {
    throw new RoomRegistryError('INVALID_ROOM', 'Snapshot position is invalid.');
  }
  if (!Number.isFinite(snapshot.rotationY)) {
    throw new RoomRegistryError('INVALID_ROOM', 'Snapshot rotation is invalid.');
  }
}
