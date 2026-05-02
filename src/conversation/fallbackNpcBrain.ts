import { matchResponseVariant } from '@/scenarios/responseMatching';
import type { NpcBrain } from '@/conversation/conversationTypes';

export function createDemoNpcBrain(): NpcBrain {
  return {
    async generateReply(request) {
      const match = matchResponseVariant(request.learnerText, request.turn);
      const currentIndex = request.scenario.turns.findIndex((turn) => turn.id === request.turn.id);
      const nextIndex = Math.min(currentIndex + 1, request.scenario.turns.length - 1);
      const nextTurn = request.scenario.turns[nextIndex] ?? request.turn;
      const isLastTurn = currentIndex >= request.scenario.turns.length - 1;
      const score = isLastTurn
        ? 1
        : Math.max(0.35, (currentIndex + 1) / request.scenario.turns.length);
      const fallbackText =
        match.score >= 0.45
          ? nextTurn.npcLine.text
          : 'Je comprends. Pouvez-vous demander plus simplement, s’il vous plait ?';

      return {
        source: 'fallback',
        npcReply: {
          text: fallbackText,
          translation:
            match.score >= 0.45
              ? nextTurn.npcLine.translation
              : 'I understand. Can you ask more simply, please?',
        },
        feedback: {
          summary:
            match.score >= 0.45
              ? 'Good travel intent. Keep the request short and polite.'
              : 'Try one clear transport word: RER, taxi, billet, or gare.',
          correction: match.option?.french,
        },
        suggestedResponses: nextTurn.responses,
        scene: {
          complete: isLastTurn && match.score >= 0.35,
          reason: isLastTurn ? 'Airport transport exchange completed.' : nextTurn.goalHint,
          score,
        },
        memoryFacts: [`Learner said: ${request.learnerText}`],
      };
    },
  };
}
