import type { FormEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createDefaultSpeechInput } from '@/conversation';
import type { ResponseOption } from '@/shared/contracts';
import { useLessonStore } from '@/state/lessonStore';
import { scenarioSpeechOptions } from '@/scenarios/languageProfiles';
import { NpcCard } from '@/ui/NpcCard';
import { ResponseOptions } from '@/ui/ResponseOptions';
import { TranslationTooltip } from '@/ui/TranslationTooltip';
import type { TransitDialogue } from '@/world/transitDialogues';

interface TransitConversationPanelProps {
  dialogue: TransitDialogue;
  onClose: () => void;
  onTravelDestination?: (destinationId: string) => void;
}

const EIFFEL_TOWER_DESTINATION_ID = 'france-eiffel_tour';

export function TransitConversationPanel({
  dialogue,
  onClose,
  onTravelDestination,
}: TransitConversationPanelProps) {
  const lesson = useLessonStore();
  const targetLanguage = lesson.scenario.npc.language;
  const speechInput = useMemo(() => createDefaultSpeechInput(), []);
  const playedOpeningIdRef = useRef<string | null>(null);
  const recommended = useMemo(
    () => dialogue.responses.find((response) => response.recommended) ?? dialogue.responses[0],
    [dialogue.responses],
  );
  const [selected, setSelected] = useState<ResponseOption>(recommended);
  const [draft, setDraft] = useState(recommended.french);
  const [practiced, setPracticed] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const eiffelTowerRequested = practiced && isEiffelTowerRequest(draft);
  const speechInputSupported = Boolean(lesson.speechInputSupported && speechInput.isSupported());

  useEffect(() => {
    if (
      playedOpeningIdRef.current === dialogue.opening.id ||
      !lesson.speechOutputSupported
    ) {
      return;
    }

    playedOpeningIdRef.current = dialogue.opening.id;
    void lesson.autoPlayNpcLine(dialogue.opening, { immediate: true });
  }, [dialogue.opening, lesson.autoPlayNpcLine, lesson.speechOutputSupported]);

  function chooseResponse(response: ResponseOption) {
    setSelected(response);
    setDraft(response.french);
    setPracticed(isEiffelTowerRequest(response.french));
    setSpeechError(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setPracticed(true);
  }

  function handlePractice() {
    if (!draft.trim()) return;
    setPracticed(true);
  }

  async function handleVoiceAnswer() {
    if (isListening) {
      speechInput.stop();
      setIsListening(false);
      return;
    }

    if (!speechInputSupported) {
      setSpeechError('Microphone recording is unavailable here. Use a text option instead.');
      return;
    }

    setIsListening(true);
    setSpeechError(null);

    try {
      const transcript = await speechInput.listen(scenarioSpeechOptions(lesson.scenario));
      setDraft(transcript.text);
      setPracticed(true);
    } catch (error) {
      setSpeechError(error instanceof Error ? error.message : 'Recording failed.');
    } finally {
      setIsListening(false);
    }
  }

  function handleReplay() {
    if (!lesson.speechOutputSupported) return;
    void lesson.autoPlayNpcLine(dialogue.opening, { immediate: true });
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="absolute inset-0 bg-slate-950/15" />

      <div className="pointer-events-auto absolute left-4 right-4 top-4 z-20 flex items-start justify-between gap-4">
        <NpcCard npc={dialogue.npc} personality={dialogue.personality} />
        <button
          type="button"
          onClick={onClose}
          className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-[12px] font-bold text-slate-100 shadow-2xl shadow-black/30 backdrop-blur-2xl transition hover:bg-slate-900"
        >
          ESC Leave
        </button>
      </div>

      <div className="pointer-events-none absolute inset-x-3 bottom-3 z-30">
        <section
          data-testid="transit-conversation-panel"
          className="pointer-events-auto w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/45 backdrop-blur-2xl"
        >
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-2.5">
            <div className="flex items-center gap-3">
              <div className="text-[13px] font-black text-white">{dialogue.npc.name}</div>
              <span className="hidden text-[11px] text-slate-400 sm:inline">·</span>
              <div className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 sm:block">
                {dialogue.goal}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1">
              <span className="h-2 w-2 rounded-full bg-sky-300" />
              <span className="text-[11px] font-semibold text-slate-200">Scripted practice</span>
            </div>
          </div>

          <div className="flex items-start gap-3 border-b border-white/[0.06] px-5 py-4">
            <div className="min-w-0 flex-1">
              <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
                {dialogue.npc.name} said
              </div>
              <p className="mt-1 text-[17px] font-semibold leading-snug text-white sm:text-[18px]">
                {dialogue.opening.tokens?.length
                  ? dialogue.opening.tokens.map((token, index) => (
                      <TranslationTooltip
                        key={`${dialogue.opening.id}-${token.text}-${index}`}
                        translation={token.translation}
                      >
                        {token.text}
                      </TranslationTooltip>
                    ))
                  : dialogue.opening.text}
              </p>
              {dialogue.opening.translation && (
                <p className="mt-1 text-[12px] italic leading-snug text-slate-400">
                  {dialogue.opening.translation}
                </p>
              )}
            </div>
            <button
              type="button"
              title="Replay"
              aria-label="Replay last line"
              disabled={!lesson.speechOutputSupported}
              onClick={handleReplay}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:text-slate-500"
            >
              <ReplayIcon />
            </button>
          </div>

          {practiced && (
            <div className="border-b border-white/[0.06] px-5 py-3">
              <div className="flex flex-col gap-3 rounded-2xl border border-emerald-200/20 bg-emerald-300/[0.08] px-3 py-2 text-[12px] leading-relaxed text-emerald-50/85 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-emerald-200">You practiced:</span>{' '}
                  <span className="font-semibold text-emerald-50">{draft}</span>
                  <span className="ml-2 text-emerald-50/60">{selected.english}</span>
                </div>
                {eiffelTowerRequested && onTravelDestination && (
                  <button
                    type="button"
                    onClick={() => onTravelDestination(EIFFEL_TOWER_DESTINATION_ID)}
                    className="shrink-0 rounded-xl bg-white px-4 py-2 text-[12px] font-black text-slate-950 shadow-lg shadow-white/10 transition hover:bg-emerald-100"
                  >
                    Go to the Eiffel Tower
                  </button>
                )}
              </div>
            </div>
          )}

          {speechError && (
            <div className="border-b border-white/[0.06] px-5 py-3">
              <div className="rounded-2xl border border-rose-200/20 bg-rose-300/[0.08] px-3 py-2 text-[12px] leading-relaxed text-rose-50/90">
                {speechError}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="px-5 py-3.5">
              <ResponseOptions
                options={dialogue.responses}
                selectedId={selected.id}
                onSelect={chooseResponse}
              />
            </div>
            <div className="flex items-center justify-center gap-3 border-t border-white/[0.06] px-6 py-3.5 lg:border-l lg:border-t-0">
              <VoiceButton
                isListening={isListening}
                isSupported={speechInputSupported}
                onClick={() => {
                  void handleVoiceAnswer();
                }}
              />
              <PracticeButton onClick={handlePractice} disabled={!draft.trim()} />
            </div>
          </div>

          <div className="flex items-center justify-end border-t border-white/[0.06] px-5 py-2">
            <button
              type="button"
              onClick={() => setShowTyping((prev) => !prev)}
              className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-white"
            >
              {showTyping ? 'Hide typing' : 'Edit phrase'}
            </button>
          </div>

          {showTyping && (
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-3 border-t border-white/[0.06] px-5 py-3"
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">Custom {targetLanguage} response</span>
                <input
                  value={draft}
                  onChange={(event) => {
                    setDraft(event.target.value);
                    setPracticed(false);
                  }}
                  className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-[14px] text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/50 focus:ring-2 focus:ring-emerald-300/20"
                />
              </label>
              <button
                type="submit"
                disabled={!draft.trim()}
                className="h-11 rounded-2xl bg-white px-5 text-[12px] font-black text-slate-950 shadow-lg shadow-white/10 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
              >
                Practice
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}

function isEiffelTowerRequest(text: string) {
  return /\b(?:eiffel|tour eiffel)\b/i.test(text.normalize('NFD').replace(/[\u0300-\u036f]/g, ''));
}

function VoiceButton({
  isListening,
  isSupported,
  onClick,
}: {
  isListening: boolean;
  isSupported: boolean;
  onClick: () => void;
}) {
  const label = isListening ? 'Stop voice answer' : 'Answer by voice';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={label}
        aria-pressed={isListening}
        disabled={!isSupported}
        onClick={onClick}
        className={`relative grid h-16 w-16 place-items-center rounded-full transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300 disabled:shadow-none ${
          isListening
            ? 'bg-rose-500 text-white shadow-[0_18px_38px_-10px_rgba(244,63,94,0.55)] hover:bg-rose-400'
            : 'bg-sky-300 text-sky-950 shadow-[0_18px_38px_-10px_rgba(56,189,248,0.45)] hover:bg-sky-200'
        }`}
      >
        <MicIcon recording={isListening} />
        {isListening && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full border-2 border-rose-300/60"
          />
        )}
      </button>
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
        Voice
      </span>
    </div>
  );
}

function PracticeButton({ onClick, disabled }: { onClick: () => void; disabled: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label="Practice phrase"
        disabled={disabled}
        onClick={onClick}
        className="grid h-16 w-16 place-items-center rounded-full bg-emerald-300 text-emerald-950 shadow-[0_18px_38px_-10px_rgba(16,185,129,0.45)] transition hover:bg-emerald-200 active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300 disabled:shadow-none"
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
          className="h-6 w-6"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </button>
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
        Practice
      </span>
    </div>
  );
}

function MicIcon({ recording }: { recording: boolean }) {
  if (recording) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}

function ReplayIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-4 w-4"
    >
      <path d="M3 12a9 9 0 1 0 3-6.7" />
      <path d="M3 4v5h5" />
    </svg>
  );
}
