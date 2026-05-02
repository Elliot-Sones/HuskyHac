import {
  createContext,
  type PropsWithChildren,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type {
  ConversationStatus,
  ResponseOption,
  Scenario,
  TranscriptLine as ScenarioTranscriptLine,
} from '@/shared/contracts';
import { airportFranceScenario } from '@/scenarios/airportFrance';
import { matchResponseVariant } from '@/scenarios/responseMatching';

type LessonAction =
  | { type: 'select-response'; response: ResponseOption }
  | { type: 'submit-freeform'; text: string }
  | { type: 'toggle-listening' }
  | { type: 'set-status'; status: ConversationStatus }
  | { type: 'reset' };

export interface LessonState {
  scenario: Scenario;
  turnIndex: number;
  transcript: ScenarioTranscriptLine[];
  status: ConversationStatus;
  selectedResponseId: string | null;
  lastMatchScore: number | null;
  goalProgress: number;
}

export interface LessonStore extends LessonState {
  currentTurn: Scenario['turns'][number];
  selectResponse: (response: ResponseOption) => void;
  submitFreeform: (text: string) => void;
  toggleListening: () => void;
  setStatus: (status: ConversationStatus) => void;
  reset: () => void;
}

const LessonStoreContext = createContext<LessonStore | null>(null);

export function LessonProvider({
  children,
  scenario = airportFranceScenario,
}: PropsWithChildren<{ scenario?: Scenario }>) {
  const [state, dispatch] = useReducer(lessonReducer, scenario, createInitialState);
  const currentTurn = state.scenario.turns[state.turnIndex] ?? state.scenario.turns[0];

  const store = useMemo<LessonStore>(
    () => ({
      ...state,
      currentTurn,
      selectResponse: (response) => dispatch({ type: 'select-response', response }),
      submitFreeform: (text) => dispatch({ type: 'submit-freeform', text }),
      toggleListening: () => dispatch({ type: 'toggle-listening' }),
      setStatus: (status) => dispatch({ type: 'set-status', status }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [currentTurn, state],
  );

  return <LessonStoreContext.Provider value={store}>{children}</LessonStoreContext.Provider>;
}

export function useLessonStore() {
  const context = useContext(LessonStoreContext);

  if (!context) {
    throw new Error('useLessonStore must be used inside LessonProvider');
  }

  return context;
}

function createInitialState(scenario: Scenario): LessonState {
  return {
    scenario,
    turnIndex: 0,
    transcript: [
      {
        id: 'coach-intro',
        speaker: 'coach',
        text: scenario.goal,
        translation: 'Lesson goal',
      },
      scenario.turns[0].npcLine,
    ],
    status: 'speaking',
    selectedResponseId: null,
    lastMatchScore: null,
    goalProgress: scenario.progress,
  };
}

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'select-response':
      return applyPlayerResponse(state, action.response, 1);
    case 'submit-freeform': {
      const match = matchResponseVariant(action.text, state.scenario.turns[state.turnIndex]);
      const fallbackResponse: ResponseOption = {
        id: `freeform-${state.transcript.length}`,
        label: 'natural',
        french: action.text,
        english: match.option?.english ?? 'Custom response',
      };

      return applyPlayerResponse(state, match.option ?? fallbackResponse, match.score);
    }
    case 'toggle-listening':
      return {
        ...state,
        status: state.status === 'listening' ? 'idle' : 'listening',
      };
    case 'set-status':
      return {
        ...state,
        status: action.status,
      };
    case 'reset':
      return createInitialState(state.scenario);
    default:
      return state;
  }
}

function applyPlayerResponse(
  state: LessonState,
  response: ResponseOption,
  matchScore: number,
): LessonState {
  const nextTurnIndex = Math.min(state.turnIndex + 1, state.scenario.turns.length - 1);
  const isComplete = state.turnIndex >= state.scenario.turns.length - 1;
  const progress = Math.round(((state.turnIndex + 1) / state.scenario.turns.length) * 100);
  const playerLine: ScenarioTranscriptLine = {
    id: `player-${response.id}-${state.transcript.length}`,
    speaker: 'player',
    text: response.french,
    translation: response.english,
  };

  const nextTranscript = [...state.transcript, playerLine];

  if (!isComplete) {
    nextTranscript.push(state.scenario.turns[nextTurnIndex].npcLine);
  }

  return {
    ...state,
    turnIndex: nextTurnIndex,
    transcript: nextTranscript,
    status: isComplete ? 'complete' : 'speaking',
    selectedResponseId: response.id,
    lastMatchScore: matchScore,
    goalProgress: progress,
  };
}
