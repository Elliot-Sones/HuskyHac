import { create } from "zustand";

export type Mode = "world" | "conversation";
export type Scene = "airport" | "taxi";
export type ProximityTarget = "info" | "taxi" | null;

interface GameState {
  mode: Mode;
  setMode: (m: Mode) => void;
  scene: Scene;
  setScene: (s: Scene) => void;
  /** Which interactable the player is currently next to (if any). */
  proximityTarget: ProximityTarget;
  setProximityTarget: (t: ProximityTarget) => void;
  npcState: "idle" | "listening" | "thinking" | "speaking";
  setNpcState: (s: GameState["npcState"]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  mode: "world",
  setMode: (m) => set({ mode: m }),
  scene: "airport",
  setScene: (s) => set({ scene: s }),
  proximityTarget: null,
  setProximityTarget: (t) => set({ proximityTarget: t }),
  npcState: "speaking",
  setNpcState: (s) => set({ npcState: s }),
}));

// Back-compat shim so existing components compile while we migrate.
export const useIsNearNPC = () =>
  useGameStore((s) => s.proximityTarget === "info");

