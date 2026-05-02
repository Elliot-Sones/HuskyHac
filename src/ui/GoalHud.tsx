interface GoalHudProps {
  goal: string;
  hint: string;
  progress: number;
  steps: number;
  currentStep: number;
}

export function GoalHud({ goal, hint, progress, steps, currentStep }: GoalHudProps) {
  return (
    <aside className="rounded-3xl border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/35 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Scene goal
          </div>
          <div className="mt-1 max-w-[24rem] text-[14px] font-semibold leading-snug text-white">
            {goal}
          </div>
        </div>
        <div className="rounded-2xl bg-white/[0.07] px-3 py-2 text-right">
          <div className="text-[18px] font-black leading-none text-emerald-200">{progress}%</div>
          <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            fluent
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {Array.from({ length: steps }, (_, index) => (
          <span
            key={index}
            className={`h-2 flex-1 rounded-full ${
              index <= currentStep ? 'bg-emerald-300' : 'bg-white/12'
            }`}
          />
        ))}
      </div>

      <div className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/[0.08] px-3 py-2.5">
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-amber-200/75">
          Prompt
        </div>
        <div className="mt-1 text-[12px] leading-relaxed text-amber-50/85">{hint}</div>
      </div>
    </aside>
  );
}
