export interface ScenarioContent {
  /** Top bar: location subtitle */
  locationLabel: string;
  locationSub: string;
  /** Scene goal text */
  goal: string;
  /** NPC card */
  npcName: string;
  npcRole: string;
  npcAge: string;
  npcAvatarEmoji: string;
  npcDescription: string;
  /** Transcript: NPC line and an inline word with hover translation */
  npcLine: { tokens: Array<{ text: string; tip?: string; emphasis?: boolean }> };
  /** Live user transcript */
  userPartial: string;
  /** Suggested replies */
  replies: Array<{
    difficulty: "easy" | "natural" | "challenge";
    target: string;
    translation: string;
    recommended?: boolean;
  }>;
  hint: { headline: string; body: string };
  /** Objective steps + which is current */
  objective: { steps: Array<{ label: string; done: boolean; current: boolean }>; pendingTool: string };
}

export const AIRPORT_SCENARIO: ScenarioContent = {
  locationLabel: "Charles de Gaulle · Terminal 2E",
  locationSub: "Arrivée — Paris, France",
  goal: "Get directions to central Paris",
  npcName: "Mme. Laurent",
  npcRole: "Information Desk · 47 ans",
  npcAge: "",
  npcAvatarEmoji: "🧑‍💼",
  npcDescription: "Patient, helpful info-desk agent. Speaks French only unless you're really stuck.",
  npcLine: {
    tokens: [
      { text: "« " },
      { text: "Bonjour", tip: "Hello" },
      { text: " ! " },
      { text: "Bienvenue", tip: "Welcome" },
      { text: " à Paris. " },
      {
        text: "Comment puis-je vous aider",
        tip: "how can I help you",
        emphasis: true,
      },
      { text: " ? »" },
    ],
  },
  userPartial: "Bonjour, je voudrais aller à Paris…",
  replies: [
    {
      difficulty: "easy",
      target: "Bonjour, je cherche le RER.",
      translation: "Hi, I'm looking for the train.",
    },
    {
      difficulty: "natural",
      target: "Comment puis-je aller au centre-ville ?",
      translation: "How can I get to downtown?",
      recommended: true,
    },
    {
      difficulty: "challenge",
      target: "Excusez-moi, où prend-on un taxi pour le 11ᵉ ?",
      translation: "Excuse me, where do I get a taxi to the 11th?",
    },
  ],
  hint: {
    headline: "Hint",
    body: "Try « le RER » — the fast train into central Paris.",
  },
  objective: {
    steps: [
      { label: "Greet the agent", done: true, current: false },
      { label: "Ask for directions", done: false, current: true },
      { label: "Confirm transport", done: false, current: false },
    ],
    pendingTool: "scene_complete() pending →",
  },
};

export const TAXI_SCENARIO: ScenarioContent = {
  locationLabel: "Taxi parisien · Stand de taxi T2E",
  locationSub: "Trajet vers le centre — Paris",
  goal: "Tell the driver your destination & confirm the fare",
  npcName: "Karim",
  npcRole: "Chauffeur de taxi · 38 ans",
  npcAge: "",
  npcAvatarEmoji: "🧑‍✈️",
  npcDescription:
    "Friendly Parisian cabbie. Speaks fast everyday French. Will help you out if you're polite.",
  npcLine: {
    tokens: [
      { text: "« " },
      { text: "Bonjour", tip: "Hello" },
      { text: " ! " },
      { text: "On va où", tip: "Where to?", emphasis: true },
      { text: ", " },
      { text: "monsieur", tip: "sir" },
      { text: " ? »" },
    ],
  },
  userPartial: "Au 14 rue Oberkampf, s'il vous…",
  replies: [
    {
      difficulty: "easy",
      target: "Au centre-ville, s'il vous plaît.",
      translation: "Downtown, please.",
    },
    {
      difficulty: "natural",
      target: "Au 14 rue Oberkampf, dans le 11ᵉ.",
      translation: "14 rue Oberkampf, in the 11th.",
      recommended: true,
    },
    {
      difficulty: "challenge",
      target: "C'est combien environ pour le 11ᵉ à cette heure-ci ?",
      translation: "Roughly what's the fare to the 11th at this hour?",
    },
  ],
  hint: {
    headline: "Hint",
    body: "Parisians use « le 11ᵉ » (le onzième) for arrondissement numbers.",
  },
  objective: {
    steps: [
      { label: "Greet the driver", done: true, current: false },
      { label: "Give the address", done: false, current: true },
      { label: "Confirm the fare", done: false, current: false },
    ],
    pendingTool: "scene_complete() pending →",
  },
};
