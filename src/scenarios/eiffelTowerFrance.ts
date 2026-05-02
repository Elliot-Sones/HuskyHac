import type { Scenario } from '@/shared/contracts';
import { LANGUAGE_PROFILES } from '@/scenarios/languageProfiles';

export const eiffelTowerFranceScenario = {
  id: 'france-eiffel_tour',
  title: 'Sous la Tour Eiffel',
  destination: 'Paris, France',
  terminal: 'Champ de Mars · Tour Eiffel',
  goal: 'Ask a tower guide how to buy lift tickets and reach the summit.',
  progress: 0,
  language: LANGUAGE_PROFILES.French,
  personaPrompt:
    'M. Moreau is a calm Eiffel Tower visitor guide. He answers in short French, teaches ticket and direction phrases, and keeps the learner oriented around the tower plaza.',
  completionCriteria: [
    'Learner asks about tickets, the lift, the summit, or the entrance queue.',
    'Learner understands billet, ascenseur, sommet, file, or Seine directions.',
    'Learner thanks the guide or asks one practical follow-up.',
  ],
  backboard: {
    memoryMode: 'Auto',
  },
  npc: {
    id: 'm-moreau',
    name: 'M. Moreau',
    role: 'Tower visitor guide',
    locationLabel: 'Ticket kiosk · south pillar',
    language: 'French',
    cefrLevel: 'A2',
  },
  turns: [
    {
      id: 'greeting',
      npcLine: {
        id: 'eiffel-npc-greeting',
        speaker: 'npc',
        text: 'Bonjour ! Bienvenue a la Tour Eiffel. Vous cherchez les billets ?',
        translation: 'Hello! Welcome to the Eiffel Tower. Are you looking for tickets?',
        source: 'scripted',
        tokens: [
          { text: 'Bonjour', translation: 'Hello' },
          { text: ' ! ' },
          { text: 'Bienvenue', translation: 'Welcome' },
          { text: ' a la Tour Eiffel. ' },
          { text: 'Vous cherchez les billets', translation: 'Are you looking for tickets' },
          { text: ' ?' },
        ],
      },
      responses: [
        {
          id: 'ask-ticket',
          label: 'easy',
          french: 'Bonjour, je voudrais un billet.',
          english: 'Hello, I would like a ticket.',
        },
        {
          id: 'ask-summit',
          label: 'natural',
          french: 'Bonjour, comment puis-je monter au sommet ?',
          english: 'Hello, how can I go up to the summit?',
          recommended: true,
        },
        {
          id: 'ask-lift-line',
          label: 'challenge',
          french: 'Excusez-moi, ou est la file pour l ascenseur ?',
          english: 'Excuse me, where is the line for the lift?',
        },
      ],
      acceptedMeanings: ['ticket', 'billet', 'summit', 'sommet', 'lift', 'ascenseur', 'line', 'file'],
      goalHint: 'Ask for tickets, the lift, or the summit.',
    },
    {
      id: 'lift-directions',
      npcLine: {
        id: 'eiffel-npc-lift',
        speaker: 'npc',
        text: 'La file pour l ascenseur est sous le pilier sud, juste a droite.',
        translation: 'The line for the lift is under the south pillar, just on the right.',
        source: 'scripted',
        tokens: [
          { text: 'La file', translation: 'The line' },
          { text: ' pour ' },
          { text: 'l ascenseur', translation: 'the lift' },
          { text: ' est sous ' },
          { text: 'le pilier sud', translation: 'the south pillar' },
          { text: ', juste a droite.', translation: 'just on the right' },
        ],
      },
      responses: [
        {
          id: 'confirm-right',
          label: 'easy',
          french: 'Merci, c est a droite ?',
          english: 'Thanks, it is on the right?',
        },
        {
          id: 'ask-price',
          label: 'natural',
          french: 'Combien coute un billet pour le sommet ?',
          english: 'How much is a ticket for the summit?',
          recommended: true,
        },
        {
          id: 'ask-stairs',
          label: 'challenge',
          french: 'Est-ce que je peux prendre les escaliers au deuxieme etage ?',
          english: 'Can I take the stairs to the second floor?',
        },
      ],
      acceptedMeanings: ['right', 'droite', 'price', 'combien', 'summit', 'sommet', 'stairs', 'escaliers'],
      goalHint: 'Confirm the direction or ask about price/stairs.',
    },
    {
      id: 'visit-close',
      npcLine: {
        id: 'eiffel-npc-close',
        speaker: 'npc',
        text: 'Oui. Gardez votre billet, puis suivez les panneaux vers le sommet.',
        translation: 'Yes. Keep your ticket, then follow the signs toward the summit.',
        source: 'scripted',
        tokens: [
          { text: 'Oui', translation: 'Yes' },
          { text: '. ' },
          { text: 'Gardez votre billet', translation: 'Keep your ticket' },
          { text: ', puis ' },
          { text: 'suivez les panneaux', translation: 'follow the signs' },
          { text: ' vers le sommet.', translation: 'toward the summit' },
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
          id: 'ask-repeat',
          label: 'natural',
          french: 'Pouvez-vous repeter plus lentement ?',
          english: 'Can you repeat more slowly?',
        },
        {
          id: 'polite-close',
          label: 'challenge',
          french: 'Parfait, merci pour votre aide. Bonne visite !',
          english: 'Perfect, thank you for your help. Enjoy your visit!',
        },
      ],
      acceptedMeanings: ['thanks', 'merci', 'repeat', 'repeter', 'slowly', 'lentement', 'bonne visite'],
      goalHint: 'Thank M. Moreau or ask him to repeat.',
    },
  ],
} satisfies Scenario;

export type EiffelTowerFranceScenario = typeof eiffelTowerFranceScenario;
