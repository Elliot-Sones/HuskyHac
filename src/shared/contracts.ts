export type SceneMode = 'world' | 'conversation' | 'complete';

export type ConversationStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
  | 'recording'
  | 'transcribing'
  | 'thinking'
  | 'speaking'
  | 'complete'
  | 'error';

export type SceneEvent =
  | { type: 'npc:near'; npcId: string | null }
  | { type: 'npc:interact'; npcId: string }
  | { type: 'conversation:start'; npcId: string }
  | { type: 'conversation:end' }
  | { type: 'scene:complete'; reason: string; score?: number };

export interface NpcProfile {
  id: string;
  name: string;
  role: string;
  locationLabel: string;
  language: 'French';
  cefrLevel: 'A1' | 'A2' | 'B1';
}

export interface TranscriptToken {
  text: string;
  translation?: string;
}

export interface TranscriptLine {
  id: string;
  speaker: 'npc' | 'player' | 'coach';
  text: string;
  translation?: string;
  tokens?: TranscriptToken[];
  source?: 'scripted' | 'typed' | 'speech' | 'suggestion' | 'backboard' | 'fallback' | 'openai';
}

export interface ResponseOption {
  id: string;
  label: 'easy' | 'natural' | 'challenge';
  french: string;
  english: string;
  recommended?: boolean;
}

export interface ScenarioTurn {
  id: string;
  npcLine: TranscriptLine;
  responses: ResponseOption[];
  acceptedMeanings: string[];
  goalHint: string;
}

export interface Scenario {
  id: string;
  title: string;
  destination: string;
  terminal: string;
  goal: string;
  progress: number;
  npc: NpcProfile;
  turns: ScenarioTurn[];
  personaPrompt?: string;
  completionCriteria?: string[];
  backboard?: {
    assistantId?: string;
    memoryMode?: 'Auto' | 'Readonly' | 'off';
  };
}

export interface WorldNpc {
  id: string;
  profile: NpcProfile;
  position: [number, number, number];
}

export const MULTIPLAYER_MAX_PLAYERS = 4;
export const MULTIPLAYER_ROOM_CODE_LENGTH = 6;
export const MULTIPLAYER_ROOM_CODE_PATTERN = /^[A-Z0-9]{6}$/;

export type PlayerAccessory = 'backpack' | 'nametag' | 'scarf' | 'suitcase';

export interface PlayerProfile {
  id: string;
  roomId: string;
  displayName: string;
  color: string;
  accessory: PlayerAccessory;
  connected: boolean;
}

export interface PlayerProfileInput {
  playerToken: string;
  displayName: string;
  color: string;
  accessory?: PlayerAccessory;
}

export interface PlayerSnapshot {
  playerId: string;
  sequence: number;
  sentAt: number;
  position: { x: number; y: number; z: number };
  rotationY: number;
  walking: boolean;
  running: boolean;
  mode: SceneMode;
}

export interface RoomState {
  id: string;
  code: string;
  createdAt: number;
  maxPlayers: number;
  players: PlayerProfile[];
  snapshots: Record<string, PlayerSnapshot>;
}

export type RoomErrorCode =
  | 'INVALID_PROFILE'
  | 'INVALID_ROOM'
  | 'ROOM_FULL'
  | 'ROOM_NOT_FOUND'
  | 'NOT_IN_ROOM'
  | 'STALE_SNAPSHOT';

export interface RoomError {
  code: RoomErrorCode;
  message: string;
}

export type RoomActionResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: RoomError };

export interface RoomJoinPayload {
  roomCode: string;
  profile: PlayerProfileInput;
}

export interface RoomJoinedPayload {
  room: RoomState;
  self: PlayerProfile;
}
