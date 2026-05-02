import type { ConversationStatus } from '@/shared/contracts';

interface MicButtonProps {
  status: ConversationStatus;
  isSupported: boolean;
  onToggle: () => void;
}

export function MicButton({ status, isSupported, onToggle }: MicButtonProps) {
  const isRecording = status === 'recording' || status === 'listening';
  const isDisabled = !isSupported || status === 'thinking' || status === 'speaking';

  const stateClass = isRecording
    ? 'bg-rose-500 text-white shadow-[0_18px_38px_-10px_rgba(244,63,94,0.55)] hover:bg-rose-400'
    : 'bg-emerald-300 text-emerald-950 shadow-[0_18px_38px_-10px_rgba(16,185,129,0.45)] hover:bg-emerald-200';

  const label = isRecording
    ? 'Stop recording'
    : isSupported
      ? 'Record French answer'
      : 'Microphone unavailable';

  const helper = isRecording
    ? 'Tap to stop'
    : isSupported
      ? 'Tap or press M'
      : 'Type instead';

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        aria-label={label}
        aria-pressed={isRecording}
        disabled={isDisabled}
        onClick={onToggle}
        className={`relative grid h-16 w-16 place-items-center rounded-full transition active:scale-95 disabled:cursor-not-allowed disabled:bg-slate-500 disabled:text-slate-300 disabled:shadow-none ${stateClass}`}
      >
        <MicIcon recording={isRecording} />
        {isRecording && (
          <span
            aria-hidden="true"
            className="absolute inset-0 animate-ping rounded-full border-2 border-rose-300/60"
          />
        )}
      </button>
      <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
        {helper}
      </span>
    </div>
  );
}

function MicIcon({ recording }: { recording: boolean }) {
  if (recording) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-5"
      >
        <rect x="6" y="6" width="12" height="12" rx="2" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-6 w-6"
    >
      <rect x="9" y="3" width="6" height="12" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
    </svg>
  );
}
