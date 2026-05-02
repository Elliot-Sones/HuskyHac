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
    goal: 'Talk to the taxi driver and ask for a ride into Paris.',
    personality:
      'Friendly Parisian taxi driver. Speaks plainly, confirms destinations, and quotes ride prices in euros.',
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
        id: 'taxi-hotel',
        label: 'easy',
        french: 'Bonjour, je vais a mon hotel.',
        english: 'Hello, I am going to my hotel.',
      },
      {
        id: 'taxi-central-paris',
        label: 'natural',
        french: 'Bonjour, je voudrais aller au centre de Paris.',
        english: 'Hello, I would like to go to central Paris.',
        recommended: true,
      },
      {
        id: 'taxi-price',
        label: 'challenge',
        french: 'Combien coute le trajet jusqu au centre-ville ?',
        english: 'How much is the ride to downtown?',
      },
    ],
  },
  bus: {
    targetId: 'bus',
    goal: 'Talk to the bus agent and ask which bus goes toward Paris.',
    personality:
      'Patient airport bus agent. Repeats route numbers slowly and explains where to buy tickets.',
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
        id: 'bus-paris',
        label: 'easy',
        french: 'Bonjour, je cherche le bus pour Paris.',
        english: 'Hello, I am looking for the bus to Paris.',
      },
      {
        id: 'bus-central-paris',
        label: 'natural',
        french: 'Quel bus va au centre de Paris ?',
        english: 'Which bus goes to central Paris?',
        recommended: true,
      },
      {
        id: 'bus-ticket',
        label: 'challenge',
        french: 'Ou puis-je acheter un billet pour le bus ?',
        english: 'Where can I buy a bus ticket?',
      },
    ],
  },
};

export function getTransitDialogue(targetId: string): TransitDialogue | null {
  return TRANSIT_DIALOGUES[targetId] ?? null;
}
