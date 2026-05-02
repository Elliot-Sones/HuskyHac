import { WorldCanvas } from "./world/WorldCanvas";
import { WorldHud } from "./ui/WorldHud";
import { ConversationOverlay } from "./ui/ConversationOverlay";
import { useGameStore } from "./store/gameStore";

export function App() {
  const mode = useGameStore((s) => s.mode);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans text-white">
      {/* The live 3D world is always rendered. */}
      <WorldCanvas />

      {/* HUD layers swap based on mode */}
      {mode === "world" && <WorldHud />}
      {mode === "conversation" && <ConversationOverlay />}
    </div>
  );
}
