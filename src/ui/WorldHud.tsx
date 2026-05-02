import type { Scenario } from '@/shared/contracts';
import type { WorldTransitTarget } from '@/world/worldLayout';

interface WorldHudProps {
  scenario: Scenario;
  isNearNpc?: boolean;
  nearTransit?: WorldTransitTarget | null;
  selectedTransit?: WorldTransitTarget | null;
}

export function WorldHud({
  scenario,
  isNearNpc = true,
  nearTransit = null,
  selectedTransit = null,
}: WorldHudProps) {
  const nearbyName = nearTransit?.label ?? scenario.npc.name;
  const nearbyLocation = nearTransit?.locationLabel ?? scenario.npc.locationLabel;
  const eAction = nearTransit ? nearTransit.actionLabel : 'Talk';
  const centerPrompt = nearTransit
    ? `Press E to ${nearTransit.actionLabel.toLowerCase()}.`
    : `Press E to start: ${scenario.goal}`;

  return (
    <div className="pointer-events-none absolute inset-0 z-10">
      <header className="flex items-start justify-between gap-4 px-5 pt-5">
        <div className="pointer-events-auto rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            {scenario.terminal}
          </div>
          <div className="mt-1 flex items-center gap-2 text-[15px] font-bold text-white">
            <span className="h-2 w-2 rounded-full bg-sky-300" />
            {scenario.destination}
          </div>
        </div>

        <div className="pointer-events-auto hidden rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl sm:block">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Level
          </div>
          <div className="mt-1 text-[15px] font-bold text-white">
            {scenario.npc.cefrLevel} · {scenario.npc.language}
          </div>
        </div>
      </header>

      <footer className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-5 pb-5">
        <div className="pointer-events-auto rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="flex flex-wrap items-center gap-3 text-[12px] text-slate-300">
            <Key label="WASD" value="Move" />
            <Key label="E" value={eAction} active={isNearNpc || Boolean(nearTransit)} />
            <Key label="M" value="Mic" />
            <Key label="ESC" value="Leave" />
          </div>
        </div>

        <div className="pointer-events-auto rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-2xl shadow-black/30 backdrop-blur-2xl">
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Nearby
          </div>
          <div className="mt-1 text-[14px] font-bold text-white">{nearbyName}</div>
          <div className="text-[12px] text-slate-300/70">{nearbyLocation}</div>
        </div>
      </footer>

      {selectedTransit && (
        <div className="absolute right-5 top-28 max-w-[260px] rounded-3xl border border-emerald-300/35 bg-[#111827]/90 px-4 py-3 text-white shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="text-[11px] font-black uppercase tracking-[0.22em] text-emerald-200">
            Transit selected
          </div>
          <div className="mt-1 text-[14px] font-black text-white">{selectedTransit.label}</div>
          <div className="text-[12px] text-slate-300/75">
            Next scene placeholder: continue the Paris journey.
          </div>
        </div>
      )}

      {(isNearNpc || nearTransit) && (
        <div className="absolute bottom-28 left-1/2 -translate-x-1/2">
          <div className="pointer-events-auto rounded-full border border-emerald-300/35 bg-emerald-300/10 px-4 py-2 text-[12px] font-semibold text-emerald-100 shadow-2xl shadow-emerald-950/30 backdrop-blur-2xl">
            {centerPrompt}
          </div>
        </div>
      )}
    </div>
  );
}

function Key({ label, value, active = false }: { label: string; value: string; active?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        className={`rounded-lg px-2 py-1 font-mono text-[11px] font-bold ${
          active ? 'bg-emerald-300 text-emerald-950' : 'bg-white/10 text-white'
        }`}
      >
        {label}
      </span>
      <span>{value}</span>
    </span>
  );
}
