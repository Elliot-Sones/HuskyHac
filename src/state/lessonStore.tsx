import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import {
  createDefaultSpeechInput,
  createDefaultNpcBrain,
  createDefaultSpeechOutput,
  createLearnerTranscriptLine,
  runNpcConversationTurn,
  type LearnerInputSource,
  type NpcBrain,
  type NpcTurnFlowResult,
  type SpeechInput,
  type SpeechOutput,
  type SpeechTranscript,
} from '@/conversation';
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
  | { type: 'append-player-line'; line: ScenarioTranscriptLine }
  | { type: 'apply-npc-result'; result: NpcTurnFlowResult }
  | { type: 'set-error'; message: string }
  | { type: 'set-capabilities'; speechInputSupported: boolean; speechOutputSupported: boolean }
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
  dynamicResponses: ResponseOption[] | null;
  feedback: NpcTurnFlowResult['feedback'] | null;
  errorMessage: string | null;
  speechInputSupported: boolean;
  speechOutputSupported: boolean;
  lastNpcLine: ScenarioTranscriptLine | null;
}

export interface LessonStore extends LessonState {
  currentTurn: Scenario['turns'][number];
  currentResponses: ResponseOption[];
  selectResponse: (response: ResponseOption) => void;
  submitFreeform: (text: string, source?: LearnerInputSource) => Promise<void>;
  recordSpeech: () => Promise<SpeechTranscript | null>;
  replayLastNpcLine: () => Promise<void>;
  toggleListening: () => void;
  setStatus: (status: ConversationStatus) => void;
  reset: () => void;
}

interface LessonServices {
  brain?: NpcBrain;
  speechInput?: SpeechInput;
  speechOutput?: SpeechOutput;
}

const LessonStoreContext = createContext<LessonStore | null>(null);

export function LessonProvider({
  children,
  scenario = airportFranceScenario,
  services,
}: PropsWithChildren<{ scenario?: Scenario; services?: LessonServices }>) {
  const [state, dispatch] = useReducer(lessonReducer, scenario, createInitialState);
  const currentTurn = state.scenario.turns[state.turnIndex] ?? state.scenario.turns[0];
  const stateRef = useRef(state);
  const resolvedServices = useMemo(
    () => ({
      brain: services?.brain ?? createDefaultNpcBrain(),
      speechInput: services?.speechInput ?? createDefaultSpeechInput(),
      speechOutput: services?.speechOutput ?? createDefaultSpeechOutput(),
    }),
    [services],
  );

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    dispatch({
      type: 'set-capabilities',
      speechInputSupported: resolvedServices.speechInput.isSupported(),
      speechOutputSupported: resolvedServices.speechOutput.isSupported(),
    });
  }, [resolvedServices.speechInput, resolvedServices.speechOutput]);

  const submitLearnerText = useMemo(
    () =>
      async (text: string, source: LearnerInputSource = 'typed') => {
        const learnerText = text.trim();

        if (!learnerText) {
          return;
        }

        const snapshot = stateRef.current;
        const playerLine = createLearnerTranscriptLine(learnerText, source);
        dispatch({ type: 'append-player-line', line: playerLine });
        dispatch({ type: 'set-status', status: 'thinking' });

        try {
          const result = await runNpcConversationTurn({
            scenario: snapshot.scenario,
            turnIndex: snapshot.turnIndex,
            transcript: snapshot.transcript,
            learnerText,
            inputSource: source,
            brain: resolvedServices.brain,
            speechOutput: {
              ...resolvedServices.speechOutput,
              async speak(line, options) {
                dispatch({ type: 'set-status', status: 'speaking' });
                await resolvedServices.speechOutput.speak(line, options);
              },
            },
            playerLine,
          });

          dispatch({ type: 'apply-npc-result', result });
        } catch (error) {
          dispatch({
            type: 'set-error',
            message: error instanceof Error ? error.message : 'The NPC reply failed.',
          });
        }
      },
    [resolvedServices],
  );

  const recordSpeech = useMemo(
    () => async () => {
      const snapshot = stateRef.current;

      if (snapshot.status === 'recording') {
        resolvedServices.speechInput.stop();
        dispatch({ type: 'set-status', status: 'idle' });
        return null;
      }

      if (!resolvedServices.speechInput.isSupported()) {
        dispatch({
          type: 'set-error',
          message: 'Microphone recording is unavailable here. Type your French answer instead.',
        });
        return null;
      }

      dispatch({ type: 'set-status', status: 'recording' });

      try {
        const transcript = await resolvedServices.speechInput.listen({ lang: 'fr-FR' });
        dispatch({ type: 'set-status', status: 'transcribing' });
        await submitLearnerText(transcript.text, 'speech');
        return transcript;
      } catch (error) {
        dispatch({
          type: 'set-error',
          message: error instanceof Error ? error.message : 'Recording failed.',
        });
        return null;
      }
    },
    [resolvedServices.speechInput, submitLearnerText],
  );

  const replayLastNpcLine = useMemo(
    () => async () => {
      const line = stateRef.current.lastNpcLine;

      if (!line) {
        return;
      }

      dispatch({ type: 'set-status', status: 'speaking' });
      try {
        await resolvedServices.speechOutput.speak(line, { lang: 'fr-FR' });
        dispatch({
          type: 'set-status',
          status: stateRef.current.status === 'complete' ? 'complete' : 'idle',
        });
      } catch (error) {
        dispatch({
          type: 'set-error',
          message: error instanceof Error ? error.message : 'Replay failed.',
        });
      }
    },
    [resolvedServices.speechOutput],
  );

  const store = useMemo<LessonStore>(
    () => ({
      ...state,
      currentTurn,
      currentResponses: state.dynamicResponses ?? currentTurn.responses,
      selectResponse: (response) => dispatch({ type: 'select-response', response }),
      submitFreeform: submitLearnerText,
      recordSpeech,
      replayLastNpcLine,
      toggleListening: () => {
        void recordSpeech();
      },
      setStatus: (status) => dispatch({ type: 'set-status', status }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [currentTurn, recordSpeech, replayLastNpcLine, state, submitLearnerText],
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
    transcript: [scenario.turns[0].npcLine],
    status: 'idle',
    selectedResponseId: null,
    lastMatchScore: null,
    goalProgress: scenario.progress,
    dynamicResponses: null,
    feedback: null,
    errorMessage: null,
    speechInputSupported: false,
    speechOutputSupported: false,
    lastNpcLine: scenario.turns[0].npcLine,
  };
}

function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'select-response':
      return {
        ...state,
        selectedResponseId: action.response.id,
        errorMessage: null,
      };
    case 'append-player-line': {
      const match = matchResponseVariant(action.line.text, state.scenario.turns[state.turnIndex]);

      return {
        ...state,
        transcript: [...state.transcript, action.line],
        lastMatchScore: match.score,
        status: 'thinking',
        errorMessage: null,
      };
    }
    case 'apply-npc-result': {
      const nextTurnIndex = action.result.complete
        ? state.turnIndex
        : Math.min(state.turnIndex + 1, state.scenario.turns.length - 1);

      return {
        ...state,
        turnIndex: nextTurnIndex,
        transcript: [...state.transcript, action.result.npcLine],
        status: action.result.complete ? 'complete' : 'idle',
        selectedResponseId: null,
        goalProgress: action.result.progress,
        dynamicResponses: action.result.suggestedResponses.length
          ? action.result.suggestedResponses
          : null,
        feedback: action.result.feedback ?? null,
        errorMessage: action.result.speechError ?? null,
        lastNpcLine: action.result.npcLine,
      };
    }
    case 'set-error':
      return {
        ...state,
        status: 'error',
        errorMessage: action.message,
      };
    case 'set-capabilities':
      return {
        ...state,
        speechInputSupported: action.speechInputSupported,
        speechOutputSupported: action.speechOutputSupported,
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
