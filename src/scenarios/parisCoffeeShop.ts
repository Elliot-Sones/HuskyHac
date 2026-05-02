import type { Scenario } from '@/shared/contracts';

export const parisCoffeeShopScenario = {
  id: 'france-coffee_shop',
  title: 'Au café du coin',
  destination: 'Paris, France',
  terminal: 'Café Bisset · Le Marais',
  goal: 'Order a coffee at a Paris café and pay politely.',
  progress: 0,
  personaPrompt:
    'Léa Martin is a warm, attentive Parisian barista. She greets in French, repeats coffee names slowly, gently corrects polite phrasing, and keeps the learner moving from order to payment.',
  completionCriteria: [
    'Learner orders a coffee or pastry by name in French.',
    'Learner answers whether the order is sur place or à emporter.',
    'Learner closes the exchange politely with a thank-you or payment phrase.',
  ],
  backboard: {
    memoryMode: 'Auto',
  },
  npc: {
    id: 'lea-martin',
    name: 'Léa Martin',
    role: 'Café barista',
    locationLabel: 'Counter · Café Bisset',
    language: 'French',
    cefrLevel: 'A2',
  },
  turns: [
    {
      id: 'greeting',
      npcLine: {
        id: 'cafe-npc-greeting',
        speaker: 'npc',
        text: "Bonjour ! Qu'est-ce que je vous sers ?",
        translation: 'Hello! What can I get for you?',
        source: 'scripted',
        tokens: [
          { text: 'Bonjour', translation: 'Hello' },
          { text: ' ! ' },
          { text: "Qu'est-ce que je vous sers", translation: 'What can I get for you' },
          { text: ' ?' },
        ],
      },
      responses: [
        {
          id: 'order-coffee',
          label: 'easy',
          french: "Un café, s'il vous plaît.",
          english: 'A coffee, please.',
        },
        {
          id: 'order-cafe-au-lait',
          label: 'natural',
          french: 'Bonjour, je voudrais un café au lait.',
          english: 'Hello, I would like a café au lait.',
          recommended: true,
        },
        {
          id: 'order-cappuccino-croissant',
          label: 'challenge',
          french: 'Bonjour, je prendrai un cappuccino et un croissant.',
          english: "Hello, I'll take a cappuccino and a croissant.",
        },
      ],
      acceptedMeanings: [
        'coffee',
        'café',
        'café au lait',
        'cappuccino',
        'croissant',
        'voudrais',
        'prendrai',
      ],
      goalHint: 'Order a coffee or pastry — café, café au lait, cappuccino.',
    },
    {
      id: 'here-or-togo',
      npcLine: {
        id: 'cafe-npc-here-or-togo',
        speaker: 'npc',
        text: 'Très bien. Sur place ou à emporter ?',
        translation: 'Very good. Here or to go?',
        source: 'scripted',
        tokens: [
          { text: 'Très bien', translation: 'Very good' },
          { text: '. ' },
          { text: 'Sur place', translation: 'Here (dine-in)' },
          { text: ' ou ' },
          { text: 'à emporter', translation: 'to go' },
          { text: ' ?' },
        ],
      },
      responses: [
        {
          id: 'togo',
          label: 'easy',
          french: 'À emporter.',
          english: 'To go.',
        },
        {
          id: 'sur-place',
          label: 'natural',
          french: 'Sur place, merci.',
          english: 'Here, thank you.',
          recommended: true,
        },
        {
          id: 'sur-place-water',
          label: 'challenge',
          french: "Sur place, et un verre d'eau aussi, s'il vous plaît.",
          english: 'Here, and a glass of water too, please.',
        },
      ],
      acceptedMeanings: ['sur place', 'à emporter', 'emporter', 'place', "verre d'eau"],
      goalHint: 'Tell Léa if you want it sur place or à emporter.',
    },
    {
      id: 'pay',
      npcLine: {
        id: 'cafe-npc-pay',
        speaker: 'npc',
        text: 'Ça fait trois euros cinquante. Vous payez par carte ?',
        translation: "That's three euros fifty. Are you paying by card?",
        source: 'scripted',
        tokens: [
          { text: 'Ça fait', translation: "That's" },
          { text: ' ' },
          { text: 'trois euros cinquante', translation: 'three euros fifty' },
          { text: '. ' },
          { text: 'Vous payez par carte', translation: 'Are you paying by card' },
          { text: ' ?' },
        ],
      },
      responses: [
        {
          id: 'pay-card-yes',
          label: 'easy',
          french: 'Oui, par carte.',
          english: 'Yes, by card.',
        },
        {
          id: 'pay-card-thanks',
          label: 'natural',
          french: 'Oui, je paie par carte. Merci !',
          english: "Yes, I'll pay by card. Thanks!",
          recommended: true,
        },
        {
          id: 'pay-cash',
          label: 'challenge',
          french: "Je peux payer en espèces ? Voici dix euros.",
          english: "Can I pay in cash? Here's ten euros.",
        },
      ],
      acceptedMeanings: ['carte', 'espèces', 'merci', 'paie', 'payer'],
      goalHint: 'Confirm card or cash, and thank Léa.',
    },
  ],
} satisfies Scenario;

export type ParisCoffeeShopScenario = typeof parisCoffeeShopScenario;
