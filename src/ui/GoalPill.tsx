interface GoalPillProps {
  goal: string;
  progress: number;
}

export function GoalPill({ goal, progress }: GoalPillProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/70 px-4 py-2.5 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Goal
        </span>
        <span className="max-w-[18rem] truncate text-[13px] font-semibold text-white">{goal}</span>
      </div>
      <div className="flex items-center gap-2 border-l border-white/10 pl-3">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-emerald-300 transition-all duration-500"
            style={{ width: `${clamped}%` }}
          />
        </div>
        <span className="text-[11px] font-black tabular-nums text-emerald-200">{clamped}%</span>
      </div>
    </div>
  );
}
