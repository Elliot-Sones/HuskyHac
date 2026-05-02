import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createDefaultSpeechOutput } from '@/conversation/defaultSpeechOutput';
import type { SpeechOutput } from '@/conversation/conversationTypes';
import type { TranscriptLine } from '@/shared/contracts';

const mocks = vi.hoisted(() => ({
  openai: null as SpeechOutput | null,
  browser: null as SpeechOutput | null,
}));

vi.mock('@/conversation/openaiSpeechOutput', () => ({
  createOpenAiSpeechOutput: () => mocks.openai as SpeechOutput,
}));

vi.mock('@/conversation/speechOutput', () => ({
  createBrowserSpeechOutput: () => mocks.browser as SpeechOutput,
}));

const line: TranscriptLine = {
  id: 'npc-greeting',
  speaker: 'npc',
  text: 'Bonjour ! Bienvenue a Paris. Comment puis-je vous aider ?',
};

describe('createDefaultSpeechOutput', () => {
  beforeEach(() => {
    mocks.openai = makeSpeechOutput();
    mocks.browser = makeSpeechOutput();
    vi.restoreAllMocks();
  });

  it('uses browser speech first for immediate autoplay', async () => {
    const output = createDefaultSpeechOutput();

    await output.speak(line, { lang: 'fr-FR', preferBrowser: true });

    expect(mocks.browser?.speak).toHaveBeenCalledWith(line, {
      lang: 'fr-FR',
      preferBrowser: true,
    });
    expect(mocks.openai?.speak).not.toHaveBeenCalled();
  });

  it('keeps OpenAI speech first for normal replay and NPC replies', async () => {
    const output = createDefaultSpeechOutput();

    await output.speak(line, { lang: 'fr-FR' });

    expect(mocks.openai?.speak).toHaveBeenCalledWith(line, { lang: 'fr-FR' });
    expect(mocks.browser?.speak).not.toHaveBeenCalled();
  });

  it('falls back to OpenAI when immediate browser speech fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    mocks.browser = makeSpeechOutput({
      speak: vi.fn(async () => {
        throw new Error('blocked');
      }),
    });
    const output = createDefaultSpeechOutput();

    await output.speak(line, { lang: 'fr-FR', preferBrowser: true });

    expect(mocks.browser?.speak).toHaveBeenCalledTimes(1);
    expect(mocks.openai?.speak).toHaveBeenCalledWith(line, {
      lang: 'fr-FR',
      preferBrowser: true,
    });
  });
});

function makeSpeechOutput(overrides: Partial<SpeechOutput> = {}): SpeechOutput {
  return {
    isSupported: vi.fn(() => true),
    cancel: vi.fn(),
    speak: vi.fn(async () => {}),
    ...overrides,
  };
}
