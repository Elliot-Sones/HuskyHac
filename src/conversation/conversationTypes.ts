import type { ResponseOption, Scenario, ScenarioTurn, TranscriptLine } from '@/shared/contracts';

export type LearnerInputSource = 'typed' | 'speech' | 'suggestion';

export interface NpcBrainRequest {
  scenario: Scenario;
  turn: ScenarioTurn;
  transcript: TranscriptLine[];
  learnerText: string;
  inputSource: LearnerInputSource;
}

export interface NpcBrainReply {
  source?: 'openai' | 'backboard' | 'fallback';
  npcReply: {
    text: string;
    translation?: string;
  };
  feedback?: {
    summary?: string;
    correction?: string;
  };
  suggestedResponses: ResponseOption[];
  scene: {
    complete: boolean;
    reason: string;
    score: number;
  };
  memoryFacts?: string[];
  retrievedMemories?: Array<{ content: string; score?: number }>;
  threadId?: string;
  assistantId?: string;
}

export interface NpcBrain {
  generateReply(request: NpcBrainRequest): Promise<NpcBrainReply>;
}

export interface SpeechOutput {
  speak(line: TranscriptLine, options?: { lang?: string }): Promise<void>;
  cancel(): void;
  isSupported(): boolean;
}

export interface SpeechTranscript {
  text: string;
  confidence?: number;
  source: LearnerInputSource;
}

export interface SpeechInput {
  listen(options?: { lang?: string }): Promise<SpeechTranscript>;
  stop(): void;
  isSupported(): boolean;
}

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export interface NpcTurnFlowResult extends NpcBrainReply {
  playerLine: TranscriptLine;
  npcLine: TranscriptLine;
  progress: number;
  complete: boolean;
  speechError?: string;
}
