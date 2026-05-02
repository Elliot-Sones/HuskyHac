import type { Scenario } from '@/shared/contracts';

export const airportFranceScenario = {
  id: 'airport-france',
  title: 'Arrivee a Paris',
  destination: 'Paris, France',
  terminal: 'Charles de Gaulle · Terminal 2E',
  goal: 'Ask the airport agent how to reach central Paris.',
  progress: 0,
  npc: {
    id: 'mme-laurent',
    name: 'Mme. Laurent',
    role: 'Information desk agent',
    locationLabel: 'Information desk · arrivals hall',
    language: 'French',
    cefrLevel: 'A2',
  },
  turns: [
    {
      id: 'greeting',
      npcLine: {
        id: 'npc-greeting',
        speaker: 'npc',
        text: 'Bonjour ! Bienvenue a Paris. Comment puis-je vous aider ?',
        translation: 'Hello! Welcome to Paris. How can I help you?',
        tokens: [
          { text: 'Bonjour', translation: 'Hello' },
          { text: '! ' },
          { text: 'Bienvenue', translation: 'Welcome' },
          { text: ' a Paris. ' },
          { text: 'Comment puis-je vous aider', translation: 'How can I help you' },
          { text: ' ?' },
        ],
      },
      responses: [
        {
          id: 'find-train',
          label: 'easy',
          french: 'Bonjour, je cherche le RER.',
          english: 'Hi, I am looking for the train.',
        },
        {
          id: 'ask-downtown',
          label: 'natural',
          french: 'Bonjour, comment puis-je aller au centre-ville ?',
          english: 'Hello, how can I get to downtown?',
          recommended: true,
        },
        {
          id: 'ask-taxi',
          label: 'challenge',
          french: 'Excusez-moi, ou prend-on un taxi pour Paris ?',
          english: 'Excuse me, where do I get a taxi to Paris?',
        },
      ],
      acceptedMeanings: ['downtown', 'centre ville', 'central paris', 'rer', 'train', 'taxi'],
      goalHint: 'Ask for central Paris, the RER, or a taxi.',
    },
    {
      id: 'transport-choice',
      npcLine: {
        id: 'npc-transport',
        speaker: 'npc',
        text: 'Le RER B est le plus rapide. Suivez les panneaux vers la gare.',
        translation: 'The RER B is the fastest. Follow the signs toward the station.',
        tokens: [
          { text: 'Le RER B', translation: 'The RER B train' },
          { text: ' est ' },
          { text: 'le plus rapide', translation: 'the fastest' },
          { text: '. ' },
          { text: 'Suivez les panneaux', translation: 'Follow the signs' },
          { text: ' vers la gare.', translation: 'toward the station' },
        ],
      },
      responses: [
        {
          id: 'confirm-platform',
          label: 'easy',
          french: 'Merci. La gare est par la ?',
          english: 'Thanks. Is the station that way?',
        },
        {
          id: 'ask-ticket',
          label: 'natural',
          french: 'Merci, ou puis-je acheter un billet ?',
          english: 'Thanks, where can I buy a ticket?',
          recommended: true,
        },
        {
          id: 'ask-card',
          label: 'challenge',
          french: 'Est-ce que je peux payer par carte au distributeur ?',
          english: 'Can I pay by card at the machine?',
        },
      ],
      acceptedMeanings: ['ticket', 'billet', 'station', 'gare', 'card', 'carte', 'machine'],
      goalHint: 'Confirm the station or ask where to buy a ticket.',
    },
    {
      id: 'ticket-confirmation',
      npcLine: {
        id: 'npc-ticket',
        speaker: 'npc',
        text: 'Oui, les distributeurs sont juste a gauche. Prenez un billet pour Paris.',
        translation: 'Yes, the machines are just on the left. Buy a ticket to Paris.',
        tokens: [
          { text: 'Oui', translation: 'Yes' },
          { text: ', ' },
          { text: 'les distributeurs', translation: 'the ticket machines' },
          { text: ' sont ' },
          { text: 'juste a gauche', translation: 'just on the left' },
          { text: '. ' },
          { text: 'Prenez un billet', translation: 'Buy a ticket' },
          { text: ' pour Paris.', translation: 'to Paris' },
        ],
      },
      responses: [
        {
          id: 'thanks',
          label: 'easy',
          french: 'Merci beaucoup.',
          english: 'Thank you very much.',
          recommended: true,
        },
        {
          id: 'repeat',
          label: 'natural',
          french: 'Pouvez-vous repeter plus lentement ?',
          english: 'Can you repeat more slowly?',
        },
        {
          id: 'polite-close',
          label: 'challenge',
          french: 'Parfait, merci pour votre aide. Bonne journee !',
          english: 'Perfect, thank you for your help. Have a good day!',
        },
      ],
      acceptedMeanings: ['thanks', 'merci', 'repeat', 'slowly', 'lentement', 'bonne journee'],
      goalHint: 'Thank Mme. Laurent or ask her to repeat.',
    },
  ],
} satisfies Scenario;

export type AirportFranceScenario = typeof airportFranceScenario;
