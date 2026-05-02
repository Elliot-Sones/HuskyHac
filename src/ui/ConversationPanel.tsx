import type { FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { MicButton } from '@/ui/MicButton';
import { ResponseOptions } from '@/ui/ResponseOptions';
import { TranslationTooltip } from '@/ui/TranslationTooltip';
import { useLessonStore } from '@/state/lessonStore';
import type { TranscriptLine as ScenarioTranscriptLine } from '@/shared/contracts';

const STATUS_COPY = {
  idle: 'Ready',
  connecting: 'Connecting',
  listening: 'Listening',
  recording: 'Recording French',
  transcribing: 'Transcribing',
  thinking: 'AI thinking',
  speaking: 'NPC speaking',
  complete: 'Goal complete',
  error: 'Needs retry',
} as const;

const BUSY_STATUSES = new Set(['recording', 'transcribing', 'thinking', 'speaking']);

export function ConversationPanel() {
  const lesson = useLessonStore();
  const [draft, setDraft] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const openingLineRequestedRef = useRef(false);
  const isBusy = BUSY_STATUSES.has(lesson.status);
  const targetLanguage = lesson.scenario.npc.language;
  const npcInitials = lesson.scenario.npc.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  useEffect(() => {
    if (
      openingLineRequestedRef.current ||
      !lesson.lastNpcLine ||
      !lesson.speechOutputSupported
    ) {
      return;
    }

    openingLineRequestedRef.current = true;
    void lesson.autoPlayLastNpcLine({ immediate: true });
  }, [lesson.autoPlayLastNpcLine, lesson.lastNpcLine, lesson.speechOutputSupported]);

  useEffect(() => {
    if (!lesson.speechInputSupported) {
      setShowTyping(true);
    }
  }, [lesson.speechInputSupported]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    await lesson.submitFreeform(draft);
    setDraft('');
  }

  return (
    <section
      data-testid="conversation-panel"
      className="pointer-events-auto w-full overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/45 backdrop-blur-2xl"
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-2.5">
        <div className="flex items-center gap-3">
          <div className="grid h-7 w-7 place-items-center rounded-lg border border-sky-200/20 bg-sky-200/10 text-[11px] font-black text-sky-100">
            {npcInitials || 'NPC'}
          </div>
          <div className="text-[13px] font-black text-white">{lesson.scenario.npc.name}</div>
          <span className="hidden text-[11px] text-slate-400 sm:inline">·</span>
          <div className="hidden text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-300 sm:block">
            {lesson.scenario.npc.role}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {lesson.lastMatchScore !== null && (
            <div className="rounded-full bg-white/[0.07] px-2.5 py-1 text-[11px] font-bold text-slate-200">
              match {Math.round(lesson.lastMatchScore * 100)}%
            </div>
          )}
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1">
            <span
              className={`h-2 w-2 rounded-full ${
                lesson.status === 'recording' || lesson.status === 'listening'
                  ? 'animate-pulse bg-rose-300'
                  : lesson.status === 'complete'
                    ? 'bg-emerald-300'
                    : lesson.status === 'thinking' || lesson.status === 'speaking'
                      ? 'animate-pulse bg-amber-300'
                      : 'bg-sky-300'
              }`}
            />
            <span className="text-[11px] font-semibold text-slate-200">
              {lesson.status === 'recording'
                ? `Recording ${targetLanguage}`
                : STATUS_COPY[lesson.status]}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 border-b border-white/[0.06] px-5 py-4">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
            {lesson.scenario.npc.name} said
          </div>
          <NpcSaid line={lesson.lastNpcLine} />
        </div>
        <button
          type="button"
          title="Replay"
          aria-label="Replay last line"
          disabled={!lesson.lastNpcLine || !lesson.speechOutputSupported || isBusy}
          onClick={() => void lesson.replayLastNpcLine()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.05] text-slate-200 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:text-slate-500"
        >
          <ReplayIcon />
        </button>
      </div>

      {(lesson.feedback || lesson.errorMessage) && (
        <div className="space-y-2 border-b border-white/[0.06] px-5 py-3">
          {lesson.feedback && (
            <div className="rounded-2xl border border-emerald-200/15 bg-emerald-300/[0.07] px-3 py-2 text-[12px] leading-relaxed text-emerald-50/85">
              {lesson.feedback.summary}
              {lesson.feedback.correction && (
                <span className="ml-2 font-semibold text-emerald-100">
                  Try: {lesson.feedback.correction}
                </span>
              )}
            </div>
          )}
          {lesson.errorMessage && (
            <div className="rounded-2xl border border-rose-200/20 bg-rose-300/[0.08] px-3 py-2 text-[12px] leading-relaxed text-rose-50/90">
              {lesson.errorMessage}
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="px-5 py-3.5">
          <ResponseOptions
            options={lesson.currentResponses}
            selectedId={lesson.selectedResponseId}
            onSelect={(option) => {
              setDraft(option.french);
              void lesson.submitResponseOption(option);
            }}
          />
        </div>
        <div className="flex items-center justify-center gap-3 border-t border-white/[0.06] px-6 py-3.5 lg:border-l lg:border-t-0">
          <MicButton
            status={lesson.status}
            isSupported={lesson.speechInputSupported}
            targetLanguage={targetLanguage}
            onToggle={lesson.toggleListening}
          />
        </div>
      </div>

      <div className="flex items-center justify-end border-t border-white/[0.06] px-5 py-2">
        <button
          type="button"
          onClick={() => setShowTyping((prev) => !prev)}
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 transition hover:text-white"
        >
          {showTyping ? 'Hide typing' : 'Type instead'}
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
              onChange={(event) => setDraft(event.target.value)}
              disabled={isBusy}
              placeholder={
                lesson.speechInputSupported
                  ? `Type a custom ${targetLanguage} answer…`
                  : `Speech unavailable. Type your ${targetLanguage} answer.`
              }
              className="h-11 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-[14px] text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/50 focus:ring-2 focus:ring-emerald-300/20 disabled:cursor-not-allowed disabled:text-slate-400"
            />
          </label>
          <button
            type="submit"
            disabled={isBusy || !draft.trim()}
            className="h-11 rounded-2xl bg-white px-5 text-[12px] font-black text-slate-950 shadow-lg shadow-white/10 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
          >
            Say it
          </button>
        </form>
      )}
    </section>
  );
}

function NpcSaid({ line }: { line: ScenarioTranscriptLine | null }) {
  if (!line) {
    return null;
  }

  return (
    <>
      <p className="mt-1 text-[17px] font-semibold leading-snug text-white sm:text-[18px]">
        {line.tokens?.length
          ? line.tokens.map((token, index) => (
              <TranslationTooltip
                key={`${line.id}-${token.text}-${index}`}
                translation={token.translation}
              >
                {token.text}
              </TranslationTooltip>
            ))
          : line.text}
      </p>
      {line.translation && (
        <p className="mt-1 text-[12px] italic leading-snug text-slate-400">{line.translation}</p>
      )}
    </>
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
