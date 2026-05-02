import type { ConversationStatus } from '@/shared/contracts';

interface MicButtonProps {
  status: ConversationStatus;
  onToggle: () => void;
}

export function MicButton({ status, onToggle }: MicButtonProps) {
  const isListening = status === 'listening';

  return (
    <button
      type="button"
      aria-pressed={isListening}
      onClick={onToggle}
      className={`flex min-w-[12rem] items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-xl transition active:scale-[0.99] ${
        isListening
          ? 'bg-rose-400 text-rose-950 shadow-rose-500/25'
          : 'bg-emerald-300 text-emerald-950 shadow-emerald-500/20 hover:bg-emerald-200'
      }`}
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-black/15">
        <span className="text-[18px]" aria-hidden="true">
          {isListening ? '●' : '🎙'}
        </span>
        {isListening && (
          <span className="absolute inset-0 animate-ping rounded-full border border-rose-950/40" />
        )}
      </span>
      <span>
        <span className="block text-[13px] font-extrabold">
          {isListening ? 'Listening' : 'Hold to speak'}
        </span>
        <span className="block text-[11px] font-semibold opacity-70">
          {isListening ? 'French detected...' : 'Tap mic or press M'}
        </span>
      </span>
    </button>
  );
}
