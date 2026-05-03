import type { NpcProfile, ResponseOption, TranscriptLine } from '@/shared/contracts';

export interface TransitDialogue {
  targetId: string;
  npc: NpcProfile;
  goal: string;
  personality?: string;
  opening: TranscriptLine;
  responses: ResponseOption[];
}

export const TRANSIT_DIALOGUES: Record<string, TransitDialogue> = {
  taxi: {
    targetId: 'taxi',
    goal: 'Ask the taxi driver to take you to Café Bisset in Le Marais.',
    personality:
      'Friendly Parisian taxi driver. Confirms café and Marais addresses, repeats street names, and quotes ride prices in euros.',
    npc: {
      id: 'taxi-driver-karim',
      name: 'Taxi driver Karim',
      role: 'Airport taxi driver',
      locationLabel: 'Curbside taxi pickup',
      language: 'French',
      cefrLevel: 'A2',
    },
    opening: {
      id: 'taxi-opening',
      speaker: 'npc',
      text: 'Bonjour, vous allez ou a Paris ?',
      translation: 'Hello, where are you going in Paris?',
      source: 'scripted',
      tokens: [
        { text: 'Bonjour', translation: 'Hello' },
        { text: ', vous allez ', translation: 'you are going' },
        { text: 'ou', translation: 'where' },
        { text: ' a Paris ?' },
      ],
    },
    responses: [
      {
        id: 'taxi-cafe-easy',
        label: 'easy',
        french: 'Au cafe Bisset, s il vous plait.',
        english: 'To Café Bisset, please.',
      },
      {
        id: 'taxi-cafe-marais',
        label: 'natural',
        french: 'Bonjour, je voudrais aller au cafe Bisset, dans le Marais.',
        english: 'Hello, I would like to go to Café Bisset in Le Marais.',
        recommended: true,
      },
      {
        id: 'taxi-eiffel',
        label: 'challenge',
        french: 'Je voudrais aller a la Tour Eiffel, s il vous plait.',
        english: 'I would like to go to the Eiffel Tower, please.',
      },
    ],
  },
  bus: {
    targetId: 'bus',
    goal: 'Ask the bus agent which bus goes near Café Bisset in Le Marais.',
    personality:
      'Patient airport bus agent. Helps travelers reach Le Marais cafés, repeats route numbers slowly, and explains where to buy a ticket.',
    npc: {
      id: 'bus-agent-camille',
      name: 'Bus agent Camille',
      role: 'Airport bus agent',
      locationLabel: 'Bus stop across the street',
      language: 'French',
      cefrLevel: 'A2',
    },
    opening: {
      id: 'bus-opening',
      speaker: 'npc',
      text: 'Bonjour, vous cherchez quel bus ?',
      translation: 'Hello, which bus are you looking for?',
      source: 'scripted',
      tokens: [
        { text: 'Bonjour', translation: 'Hello' },
        { text: ', vous cherchez ', translation: 'you are looking for' },
        { text: 'quel bus', translation: 'which bus' },
        { text: ' ?' },
      ],
    },
    responses: [
      {
        id: 'bus-cafe-easy',
        label: 'easy',
        french: 'Le bus pour le Marais, s il vous plait.',
        english: 'The bus to Le Marais, please.',
      },
      {
        id: 'bus-cafe-marais',
        label: 'natural',
        french: 'Quel bus va au cafe Bisset, dans le Marais ?',
        english: 'Which bus goes to Café Bisset in Le Marais?',
        recommended: true,
      },
      {
        id: 'bus-eiffel',
        label: 'challenge',
        french: 'Quel bus va pres de la Tour Eiffel ?',
        english: 'Which bus goes near the Eiffel Tower?',
      },
    ],
  },
};

export function getTransitDialogue(targetId: string): TransitDialogue | null {
  return TRANSIT_DIALOGUES[targetId] ?? null;
}
