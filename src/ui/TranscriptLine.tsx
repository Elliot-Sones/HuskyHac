import type { TranscriptLine as ScenarioTranscriptLine } from '@/shared/contracts';
import { TranslationTooltip } from '@/ui/TranslationTooltip';

const SPEAKER_STYLES = {
  npc: {
    accent: 'bg-sky-300',
    panel: 'border-white/10 bg-white/[0.055]',
    text: 'text-slate-50',
  },
  player: {
    label: 'You',
    accent: 'bg-emerald-300',
    panel: 'border-emerald-300/20 bg-emerald-400/[0.08]',
    text: 'text-emerald-50',
  },
  coach: {
    label: 'Coach',
    accent: 'bg-amber-300',
    panel: 'border-amber-300/20 bg-amber-300/[0.08]',
    text: 'text-amber-50',
  },
} as const;

interface TranscriptLineProps {
  line: ScenarioTranscriptLine;
  npcName?: string;
}

export function TranscriptLine({ line, npcName = 'NPC' }: TranscriptLineProps) {
  const style = SPEAKER_STYLES[line.speaker];
  const speakerLabel = line.speaker === 'npc' ? npcName : SPEAKER_STYLES[line.speaker].label;

  return (
    <article className={`rounded-2xl border px-4 py-3 ${style.panel}`}>
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${style.accent}`} />
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300/70">
          {speakerLabel}
        </span>
      </div>

      <p className={`text-[16px] leading-7 sm:text-[17px] ${style.text}`}>
        {line.tokens?.length
          ? line.tokens.map((token, index) => (
              <TranslationTooltip
                key={`${line.id}-${token.text}-${index}`}
                translation={token.translation}
              >
                {token.text}
              </TranslationTooltip>
            ))
          : line.text}
      </p>

      {line.translation && (
        <p className="mt-2 text-[12px] leading-relaxed text-slate-300/60">{line.translation}</p>
      )}
    </article>
  );
}
