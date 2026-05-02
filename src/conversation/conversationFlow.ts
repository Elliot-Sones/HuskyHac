import type { Scenario, TranscriptLine } from '@/shared/contracts';
import type {
  LearnerInputSource,
  NpcBrain,
  NpcTurnFlowResult,
  SpeechOutput,
} from '@/conversation/conversationTypes';

interface RunNpcConversationTurnParams {
  scenario: Scenario;
  turnIndex: number;
  transcript: TranscriptLine[];
  learnerText: string;
  inputSource: LearnerInputSource;
  brain: NpcBrain;
  speechOutput: SpeechOutput;
  playerLine?: TranscriptLine;
}

export async function runNpcConversationTurn({
  scenario,
  turnIndex,
  transcript,
  learnerText,
  inputSource,
  brain,
  speechOutput,
  playerLine = createLearnerTranscriptLine(learnerText, inputSource),
}: RunNpcConversationTurnParams): Promise<NpcTurnFlowResult> {
  const turn = scenario.turns[turnIndex] ?? scenario.turns[0];
  const reply = await brain.generateReply({
    scenario,
    turn,
    transcript,
    learnerText,
    inputSource,
  });
  const npcLine: TranscriptLine = {
    id: `npc-${Date.now()}-${turn.id}`,
    speaker: 'npc',
    text: reply.npcReply.text,
    translation: reply.npcReply.translation,
    source: reply.source ?? 'openai',
  };
  let speechError: string | undefined;

  try {
    await speechOutput.speak(npcLine, { lang: 'fr-FR' });
  } catch (error) {
    speechError = error instanceof Error ? error.message : 'Speech output failed.';
  }

  return {
    ...reply,
    playerLine,
    npcLine,
    progress: Math.round(clamp01(reply.scene.score) * 100),
    complete: reply.scene.complete,
    speechError,
  };
}

export function createLearnerTranscriptLine(
  learnerText: string,
  inputSource: LearnerInputSource,
): TranscriptLine {
  return {
    id: `player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    speaker: 'player',
    text: learnerText,
    source: inputSource,
  };
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}
