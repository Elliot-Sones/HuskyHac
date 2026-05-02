export type SceneMode = 'world' | 'conversation' | 'complete';

export type ConversationStatus =
  | 'idle'
  | 'connecting'
  | 'listening'
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
}

export interface WorldNpc {
  id: string;
  profile: NpcProfile;
  position: [number, number, number];
}
