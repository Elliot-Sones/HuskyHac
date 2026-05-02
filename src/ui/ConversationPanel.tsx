import type { FormEvent } from 'react';
import { useState } from 'react';
import { GoalHud } from '@/ui/GoalHud';
import { MicButton } from '@/ui/MicButton';
import { ResponseOptions } from '@/ui/ResponseOptions';
import { TranscriptLine } from '@/ui/TranscriptLine';
import { useLessonStore } from '@/state/lessonStore';

const STATUS_COPY = {
  idle: 'Ready',
  connecting: 'Connecting',
  listening: 'Listening',
  thinking: 'Checking meaning',
  speaking: 'Mme. Laurent speaking',
  complete: 'Goal complete',
  error: 'Needs retry',
} as const;

export function ConversationPanel() {
  const lesson = useLessonStore();
  const [draft, setDraft] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) {
      lesson.toggleListening();
      return;
    }

    lesson.submitFreeform(draft);
    setDraft('');
  }

  return (
    <section className="pointer-events-auto grid max-h-[calc(100vh-2rem)] w-full max-w-6xl grid-cols-1 gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/75 p-4 shadow-2xl shadow-black/45 backdrop-blur-2xl lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="min-h-0 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.045]">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
              Conversation
            </div>
            <h2 className="mt-1 text-[18px] font-black text-white">{lesson.scenario.npc.name}</h2>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2">
            <span
              className={`h-2 w-2 rounded-full ${
                lesson.status === 'listening'
                  ? 'animate-pulse bg-rose-300'
                  : lesson.status === 'complete'
                    ? 'bg-emerald-300'
                    : 'bg-sky-300'
              }`}
            />
            <span className="text-[12px] font-semibold text-slate-200">
              {STATUS_COPY[lesson.status]}
            </span>
          </div>
        </header>

        <div className="max-h-[39vh] space-y-3 overflow-y-auto px-4 py-4">
          {lesson.transcript.map((line) => (
            <TranscriptLine key={line.id} line={line} />
          ))}
        </div>

        <div className="border-t border-white/[0.08] px-4 py-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Suggested replies
              </div>
              <div className="mt-1 text-[12px] text-slate-300/70">
                Choose a phrase or type your own meaning.
              </div>
            </div>
            {lesson.lastMatchScore !== null && (
              <div className="rounded-full bg-white/[0.07] px-3 py-1 text-[11px] font-bold text-slate-200">
                match {Math.round(lesson.lastMatchScore * 100)}%
              </div>
            )}
          </div>

          <ResponseOptions
            options={lesson.currentTurn.responses}
            selectedId={lesson.selectedResponseId}
            onSelect={lesson.selectResponse}
          />
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-3 border-t border-white/[0.08] px-4 py-4 sm:flex-row sm:items-center"
        >
          <MicButton status={lesson.status} onToggle={lesson.toggleListening} />
          <label className="min-w-0 flex-1">
            <span className="sr-only">Custom French response</span>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Essayez: Merci, ou puis-je acheter un billet ?"
              className="h-14 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-[14px] text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/50 focus:ring-2 focus:ring-emerald-300/20"
            />
          </label>
          <button
            type="submit"
            className="h-14 rounded-2xl bg-white px-5 text-[13px] font-black text-slate-950 shadow-lg shadow-white/10 transition hover:bg-emerald-100"
          >
            Say it
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <GoalHud
          goal={lesson.scenario.goal}
          hint={lesson.currentTurn.goalHint}
          progress={lesson.goalProgress}
          steps={lesson.scenario.turns.length}
          currentStep={lesson.turnIndex}
        />

        <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            NPC profile
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-200/20 bg-sky-200/10 text-[20px] font-black text-sky-100">
              ML
            </div>
            <div>
              <div className="text-[15px] font-black text-white">{lesson.scenario.npc.name}</div>
              <div className="text-[12px] text-slate-300/70">{lesson.scenario.npc.role}</div>
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-slate-300/70">
            Helpful airport staff. She keeps replies short, repeats key transport words, and
            rewards polite French.
          </p>
        </aside>
      </div>
    </section>
  );
}
