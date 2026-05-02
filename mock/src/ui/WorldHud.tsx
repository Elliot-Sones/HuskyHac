import { useGameStore } from "../store/gameStore";

export function WorldHud() {
  const isNear = useGameStore((s) => s.isNearNPC);

  return (
    <>
      {/* Top status bar */}
      <header className="absolute top-0 inset-x-0 z-10 px-6 pt-5 flex items-start justify-between pointer-events-none">
        <div className="glass rounded-2xl px-4 py-2.5 ring-1 ring-white/10 flex items-center gap-3 pointer-events-auto">
          <div className="text-lg">✈️</div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-300/70 font-mono">
              Charles de Gaulle · Terminal 2E
            </div>
            <div className="text-sm font-semibold text-white">Arrivée — Paris, France</div>
          </div>
        </div>

        <div className="glass rounded-2xl px-4 py-2.5 ring-1 ring-white/10 flex items-center gap-4 pointer-events-auto">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-300/70 font-mono">
              Scene goal
            </div>
            <div className="text-sm font-semibold text-white">
              Get directions to central Paris
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/25"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/25"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/25"></div>
          </div>
        </div>
      </header>

      {/* Bottom HUD: controls + level meta */}
      <footer className="absolute bottom-0 inset-x-0 z-10 px-6 pb-5 flex items-end justify-between pointer-events-none">
        <div className="glass rounded-2xl px-4 py-3 ring-1 ring-white/10 flex items-center gap-5 text-xs pointer-events-auto">
          <Key label="WASD" desc="Move" />
          <Key label="⇧" desc="Run" />
          <Key label="E" desc="Interact" highlight={isNear} />
          <Key label="M" desc="Mic" />
          <Key label="ESC" desc="Menu" />
        </div>

        <div className="glass rounded-2xl px-4 py-3 ring-1 ring-white/10 flex items-center gap-3 pointer-events-auto">
          <div className="text-2xl">🇫🇷</div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-300/70 font-mono">
              Level
            </div>
            <div className="text-sm font-semibold text-white">CEFR A2 · French</div>
          </div>
          <div className="w-px h-9 bg-white/15"></div>
          <div>
            <div className="text-[11px] uppercase tracking-widest text-slate-300/70 font-mono">
              Vocab today
            </div>
            <div className="text-sm font-semibold text-white">
              12 / 30 <span className="text-slate-400 text-xs">words</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Center hint */}
      {!isNear && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
          <div className="glass rounded-full px-4 py-1.5 ring-1 ring-emerald-400/30 text-xs flex items-center gap-2 shadow-xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 listen-blink"></span>
            <span className="text-emerald-200 font-medium">
              Walk over to the Information desk and press{" "}
              <span className="font-mono bg-emerald-500/30 px-1 rounded">E</span> to begin
            </span>
          </div>
        </div>
      )}
    </>
  );
}

function Key({
  label,
  desc,
  highlight = false,
}: {
  label: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          "font-mono px-1.5 py-0.5 rounded text-[10px] " +
          (highlight
            ? "bg-emerald-500/40 ring-1 ring-emerald-300/70 text-white"
            : "bg-white/10 text-slate-200")
        }
      >
        {label}
      </span>
      <span className="text-slate-300">{desc}</span>
    </div>
  );
}
