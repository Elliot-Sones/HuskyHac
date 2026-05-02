import { create } from "zustand";

export type Mode = "world" | "conversation";

interface GameState {
  mode: Mode;
  setMode: (m: Mode) => void;
  isNearNPC: boolean;
  setIsNearNPC: (v: boolean) => void;
  npcState: "idle" | "listening" | "thinking" | "speaking";
  setNpcState: (s: GameState["npcState"]) => void;
}

export const useGameStore = create<GameState>((set) => ({
  mode: "world",
  setMode: (m) => set({ mode: m }),
  isNearNPC: false,
  setIsNearNPC: (v) => set({ isNearNPC: v }),
  npcState: "speaking",
  setNpcState: (s) => set({ npcState: s }),
}));
