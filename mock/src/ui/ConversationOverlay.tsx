import { useGameStore } from "../store/gameStore";

export function ConversationOverlay() {
  const setMode = useGameStore((s) => s.setMode);
  const npcState = useGameStore((s) => s.npcState);

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* darkening over the live 3D world */}
      <div className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm pointer-events-auto" />

      {/* Top status bar (carries over from world) */}
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
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 pulse-dot"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/25"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/25"></div>
            <div className="w-2.5 h-2.5 rounded-full bg-white/25"></div>
          </div>
        </div>
      </header>

      {/* NPC card on right */}
      <div className="absolute right-6 top-28 z-20 w-72 pointer-events-auto">
        <div className="glass rounded-2xl ring-1 ring-white/10 shadow-2xl overflow-hidden">
          <div className="h-28 bg-gradient-to-br from-amber-400/30 via-pink-400/20 to-blue-500/30 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-amber-200/90 grid place-items-center text-3xl shadow-lg ring-4 ring-white/20">
              🧑‍💼
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-base font-bold text-white leading-tight">Mme. Laurent</div>
                <div className="text-xs text-slate-300/80">Information Desk · 47 ans</div>
              </div>
              <div className="text-2xl">🇫🇷</div>
            </div>
            <StatePill state={npcState} />
            <div className="mt-3 text-[11px] text-slate-300/80 leading-relaxed">
              Patient, helpful info-desk agent. Speaks French only unless you're really stuck.
            </div>
          </div>
        </div>
      </div>

      {/* Dialogue panel */}
      <div className="absolute bottom-0 inset-x-0 z-20 p-5 pb-6 pointer-events-auto">
        <div className="max-w-5xl mx-auto glass rounded-3xl ring-1 ring-white/10 shadow-2xl overflow-hidden">
          {/* header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-2">
              <div className="text-xs font-bold text-slate-200">Mme. Laurent</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400/80 font-mono">
                Listening · 02:14
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300/80">
              <IconBtn title="Replay">🔊</IconBtn>
              <IconBtn title="Slower">🐌</IconBtn>
              <IconBtn title="Hint">💡</IconBtn>
              <IconBtn title="Translate all">🌐</IconBtn>
            </div>
          </div>

          {/* transcript */}
          <div className="px-5 py-3 text-lg leading-relaxed">
            <span className="text-slate-100">«&nbsp;</span>
            <Tip word="Bonjour" tip="Hello" />
            <span className="text-slate-100">&nbsp;!&nbsp;</span>
            <Tip word="Bienvenue" tip="Welcome" />
            <span className="text-slate-100">&nbsp;à Paris.&nbsp;</span>
            <span className="relative inline-block group">
              <span className="text-amber-200 underline decoration-dotted decoration-amber-300/60 underline-offset-4 cursor-help font-medium">
                Comment puis-je vous aider
              </span>
              <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap glass-light text-slate-900 text-xs px-3 py-2 rounded-lg ring-1 ring-amber-500/30 shadow-2xl invisible group-hover:visible">
                <span className="block font-bold">how can I help you</span>
                <span className="block text-slate-600 text-[11px] mt-0.5">
                  lit. <span className="font-mono">how can-I you to-help</span>
                </span>
              </span>
            </span>
            <span className="text-slate-100">&nbsp;?&nbsp;»</span>

            {/* live user transcription */}
            <div className="mt-3 text-base text-slate-400 italic flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 listen-blink"></span>
              <span>
                You:{" "}
                <span className="text-slate-200">Bonjour, je voudrais aller à Paris…</span>
                <span className="inline-block w-2 h-4 bg-slate-300/60 ml-1 align-middle animate-pulse"></span>
              </span>
            </div>
          </div>

          {/* response options */}
          <div className="border-t border-white/5 px-5 py-4">
            <div className="text-[11px] uppercase tracking-widest text-slate-400/80 font-mono mb-2.5">
              Suggested replies · click to say it for me
            </div>
            <div className="grid sm:grid-cols-3 gap-3">
              <ResponseCard
                difficulty="easy"
                target="Bonjour, je cherche le RER."
                translation="Hi, I'm looking for the train."
              />
              <ResponseCard
                difficulty="natural"
                recommended
                target="Comment puis-je aller au centre-ville ?"
                translation="How can I get to downtown?"
              />
              <ResponseCard
                difficulty="challenge"
                target="Excusez-moi, où prend-on un taxi pour le 11ᵉ ?"
                translation="Excuse me, where do I get a taxi to the 11th?"
              />
            </div>
          </div>

          {/* mic + hint */}
          <div className="border-t border-white/5 px-5 py-4 flex items-center gap-4">
            <button className="flex items-center gap-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 active:scale-[0.98] transition rounded-2xl px-5 py-3 shadow-lg shadow-emerald-500/30">
              <span className="grid place-items-center w-9 h-9 bg-white/20 rounded-full">
                <span className="text-xl">🎤</span>
              </span>
              <span className="text-left">
                <span className="block text-sm font-bold text-emerald-50">Hold to speak</span>
                <span className="block text-[11px] font-mono text-emerald-100/80">
                  spacebar · M · or click
                </span>
              </span>
            </button>

            <div className="flex-1 hidden md:flex items-center gap-3 bg-amber-500/10 ring-1 ring-amber-400/30 rounded-2xl px-4 py-3">
              <div className="text-xl">💡</div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-amber-300/90 font-mono">
                  Hint
                </div>
                <div className="text-xs text-amber-100">
                  Try <span className="font-semibold">«&nbsp;le RER&nbsp;»</span> — the fast train
                  into central Paris.
                </div>
              </div>
            </div>

            <button
              onClick={() => setMode("world")}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 ring-1 ring-white/10 rounded-2xl px-4 py-3 text-xs font-medium text-slate-200 transition"
            >
              <span className="font-mono bg-white/10 px-1.5 py-0.5 rounded text-[10px]">ESC</span>
              <span>Leave</span>
            </button>
          </div>

          {/* objective strip */}
          <div className="border-t border-white/5 px-5 py-2.5 flex items-center gap-3 text-[11px]">
            <span className="font-mono uppercase tracking-widest text-slate-400/80">Objective</span>
            <span className="text-slate-300">Greet the agent</span>
            <span className="text-emerald-400">✓</span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-300">Ask for directions</span>
            <span className="w-3 h-3 rounded-full bg-amber-400 listen-blink"></span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-500">Confirm transport</span>
            <span className="ml-auto text-slate-400 font-mono">scene_complete() pending →</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatePill({ state }: { state: "idle" | "listening" | "thinking" | "speaking" }) {
  const map = {
    speaking: { color: "emerald", label: "Speaking" },
    listening: { color: "rose", label: "Listening" },
    thinking: { color: "violet", label: "Thinking…" },
    idle: { color: "slate", label: "Idle" },
  } as const;
  const { color, label } = map[state];
  return (
    <div
      className={`flex items-center gap-2 bg-${color}-500/15 ring-1 ring-${color}-400/30 rounded-lg px-3 py-2`}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-${color}-400 opacity-75`}
        ></span>
        <span
          className={`relative inline-flex rounded-full h-2.5 w-2.5 bg-${color}-400`}
        ></span>
      </span>
      <span className={`text-xs font-semibold text-${color}-200`}>{label}</span>
      <div className="ml-auto flex items-end gap-0.5 h-3">
        <div className={`w-1 bg-${color}-300 speak-bar`} style={{ height: "60%", animationDelay: "0s" }} />
        <div className={`w-1 bg-${color}-300 speak-bar`} style={{ height: "100%", animationDelay: ".15s" }} />
        <div className={`w-1 bg-${color}-300 speak-bar`} style={{ height: "75%", animationDelay: ".05s" }} />
        <div className={`w-1 bg-${color}-300 speak-bar`} style={{ height: "50%", animationDelay: ".25s" }} />
      </div>
    </div>
  );
}

function Tip({ word, tip }: { word: string; tip: string }) {
  return (
    <span className="relative inline-block group">
      <span className="text-slate-100 font-medium hover:bg-amber-300/20 cursor-help rounded px-0.5 transition">
        {word}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap glass-light text-slate-900 text-xs px-3 py-2 rounded-lg ring-1 ring-amber-500/30 shadow-2xl invisible group-hover:visible z-30">
        <span className="block font-bold">{tip}</span>
      </span>
    </span>
  );
}

function IconBtn({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <button
      title={title}
      className="hover:bg-white/10 rounded-lg w-7 h-7 grid place-items-center text-xs"
    >
      {children}
    </button>
  );
}

function ResponseCard({
  difficulty,
  target,
  translation,
  recommended,
}: {
  difficulty: "easy" | "natural" | "challenge";
  target: string;
  translation: string;
  recommended?: boolean;
}) {
  const difficultyMap = {
    easy: { color: "emerald", label: "Easy" },
    natural: { color: "amber", label: "Natural" },
    challenge: { color: "rose", label: "Challenge" },
  } as const;
  const { color, label } = difficultyMap[difficulty];
  return (
    <button
      className={`text-left glass rounded-xl p-3 ring-1 ${
        recommended
          ? "ring-amber-400/40 hover:ring-amber-400/70"
          : "ring-white/10 hover:ring-" + color + "-400/40"
      } transition relative`}
    >
      {recommended && (
        <div className="absolute -top-2 right-3 bg-amber-400 text-amber-950 text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full">
          Recommended
        </div>
      )}
      <div
        className={`text-[10px] uppercase tracking-widest text-${color}-300/90 font-mono mb-1 flex items-center gap-1.5`}
      >
        <span className={`w-1.5 h-1.5 rounded-full bg-${color}-400`}></span>
        {label}
      </div>
      <div className="text-sm font-medium text-slate-100">{target}</div>
      <div className="text-xs text-slate-400 mt-0.5">"{translation}"</div>
    </button>
  );
}
