import type { FormEvent } from 'react';
import { useMemo, useState } from 'react';
import type { ResponseOption } from '@/shared/contracts';
import { ResponseOptions } from '@/ui/ResponseOptions';
import { TranslationTooltip } from '@/ui/TranslationTooltip';
import type { TransitDialogue } from '@/world/transitDialogues';

interface TransitConversationPanelProps {
  dialogue: TransitDialogue;
  onClose: () => void;
}

export function TransitConversationPanel({ dialogue, onClose }: TransitConversationPanelProps) {
  const recommended = useMemo(
    () => dialogue.responses.find((response) => response.recommended) ?? dialogue.responses[0],
    [dialogue.responses],
  );
  const [selected, setSelected] = useState<ResponseOption>(recommended);
  const [draft, setDraft] = useState(recommended.french);
  const [practiced, setPracticed] = useState(false);

  function chooseResponse(response: ResponseOption) {
    setSelected(response);
    setDraft(response.french);
    setPracticed(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!draft.trim()) return;
    setPracticed(true);
  }

  return (
    <div className="pointer-events-none absolute inset-0 z-30">
      <div className="absolute inset-0 bg-slate-950/18 backdrop-blur-[1px]" />

      <section className="pointer-events-auto absolute inset-x-4 bottom-4 mx-auto grid max-h-[70vh] max-w-6xl grid-cols-1 gap-4 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/82 p-4 text-white shadow-2xl shadow-black/45 backdrop-blur-2xl lg:grid-cols-[minmax(0,1fr)_19rem]">
        <div className="min-h-0 rounded-[1.5rem] border border-white/[0.08] bg-white/[0.045]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400">
                Transit roleplay
              </div>
              <h2 className="mt-1 text-[18px] font-black text-white">{dialogue.npc.name}</h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 text-[12px] font-bold text-slate-100 transition hover:bg-white/[0.1]"
            >
              ESC Leave
            </button>
          </header>

          <div className="space-y-3 px-4 py-4">
            <article className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3">
              <div className="mb-2 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-sky-300" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300/70">
                  {dialogue.npc.role}
                </span>
              </div>
              <p className="text-[16px] leading-7 text-slate-50 sm:text-[17px]">
                {dialogue.opening.tokens?.map((token, index) => (
                  <TranslationTooltip
                    key={`${dialogue.opening.id}-${token.text}-${index}`}
                    translation={token.translation}
                  >
                    {token.text}
                  </TranslationTooltip>
                )) ?? dialogue.opening.text}
              </p>
              <p className="mt-2 text-[12px] leading-relaxed text-slate-300/60">
                {dialogue.opening.translation}
              </p>
            </article>

            {practiced && (
              <article className="rounded-2xl border border-emerald-300/20 bg-emerald-400/[0.08] px-4 py-3">
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-300" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/80">
                    You practiced
                  </span>
                </div>
                <p className="text-[16px] leading-7 text-emerald-50">{draft}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-emerald-50/65">
                  {selected.english}
                </p>
              </article>
            )}
          </div>

          <div className="border-t border-white/[0.08] px-4 py-4">
            <div className="mb-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Suggested replies
              </div>
              <div className="mt-1 text-[12px] text-slate-300/70">
                Pick a phrase, read it out loud, then press practice.
              </div>
            </div>

            <ResponseOptions
              options={dialogue.responses}
              selectedId={selected.id}
              onSelect={chooseResponse}
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-3 border-t border-white/[0.08] px-4 py-4 sm:flex-row sm:items-center"
          >
            <label className="min-w-0 flex-1">
              <span className="sr-only">Transit French response</span>
              <input
                value={draft}
                onChange={(event) => {
                  setDraft(event.target.value);
                  setPracticed(false);
                }}
                className="h-14 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-[14px] text-white outline-none transition placeholder:text-slate-500 focus:border-emerald-200/50 focus:ring-2 focus:ring-emerald-300/20"
              />
            </label>
            <button
              type="submit"
              className="h-14 rounded-2xl bg-white px-5 text-[13px] font-black text-slate-950 shadow-lg shadow-white/10 transition hover:bg-emerald-100"
            >
              Practice
            </button>
          </form>
        </div>

        <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Goal
          </div>
          <p className="mt-3 text-[14px] font-bold leading-relaxed text-white">{dialogue.goal}</p>
          <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            NPC profile
          </div>
          <div className="mt-3 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl border border-sky-200/20 bg-sky-200/10 text-[17px] font-black text-sky-100">
              {dialogue.npc.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-[15px] font-black text-white">{dialogue.npc.name}</div>
              <div className="text-[12px] text-slate-300/70">{dialogue.npc.locationLabel}</div>
            </div>
          </div>
          <p className="mt-4 text-[12px] leading-relaxed text-slate-300/70">
            This is a scripted practice stop for now. The same panel can later be wired to the
            live AI voice agent.
          </p>
        </aside>
      </section>
    </div>
  );
}
