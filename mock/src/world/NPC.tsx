import { Billboard, Html } from "@react-three/drei";
import { useGameStore } from "../store/gameStore";
import { Character } from "./Character";

export function NPC() {
  const isNear = useGameStore((s) => s.proximityTarget === "info");
  const mode = useGameStore((s) => s.mode);
  const npcState = useGameStore((s) => s.npcState);
  const talking = mode === "conversation" && npcState === "speaking";

  return (
    <group position={[5, 0, -3.6]} rotation={[0, Math.PI, 0]}>
      <Character
        color="#1e3a8a"
        skin="#fde0c2"
        hair="#854d0e"
        pants="#0f172a"
        walking={false}
        talking={talking}
        accessory="nametag"
      />

      {/* floating name tag */}
      <Billboard position={[0, 2.05, 0]}>
        <Html center distanceFactor={9} occlude={false} style={{ pointerEvents: "none" }}>
          <div className="glass-light text-slate-900 text-xs font-semibold px-2.5 py-1 rounded-md ring-1 ring-emerald-500/40 shadow-lg whitespace-nowrap">
            Mme. Laurent · Information
          </div>
        </Html>
      </Billboard>

      {/* interaction prompt */}
      {isNear && mode === "world" && (
        <Billboard position={[0, 1.55, 0]}>
          <Html center distanceFactor={9} occlude={false} style={{ pointerEvents: "none" }}>
            <div className="relative">
              <div className="absolute inset-0 -m-2 rounded-full bg-emerald-400/40 pulse-ring"></div>
              <div className="relative bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-md shadow-lg ring-2 ring-emerald-300/40 pulse-dot whitespace-nowrap">
                <span className="font-mono mr-1.5 bg-white/20 rounded px-1 py-0.5 text-[10px]">
                  E
                </span>
                Talk to her
              </div>
            </div>
          </Html>
        </Billboard>
      )}

      {/* floor ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <ringGeometry args={[0.7, 0.85, 48]} />
        <meshBasicMaterial
          color={isNear ? "#34d399" : "#fbbf24"}
          transparent
          opacity={0.65}
        />
      </mesh>
    </group>
  );
}
