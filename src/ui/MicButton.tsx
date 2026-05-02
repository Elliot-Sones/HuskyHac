import type { ConversationStatus } from '@/shared/contracts';

interface MicButtonProps {
  status: ConversationStatus;
  isSupported: boolean;
  onToggle: () => void;
}

export function MicButton({ status, isSupported, onToggle }: MicButtonProps) {
  const isRecording = status === 'recording' || status === 'listening';

  return (
    <button
      type="button"
      aria-pressed={isRecording}
      disabled={!isSupported || status === 'thinking' || status === 'speaking'}
      onClick={onToggle}
      className={`flex min-w-[12rem] items-center gap-3 rounded-2xl px-4 py-3 text-left shadow-xl transition active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-slate-400 disabled:text-slate-700 disabled:shadow-none ${
        isRecording
          ? 'bg-rose-400 text-rose-950 shadow-rose-500/25'
          : 'bg-emerald-300 text-emerald-950 shadow-emerald-500/20 hover:bg-emerald-200'
      }`}
    >
      <span className="relative grid h-10 w-10 place-items-center rounded-full bg-black/15">
        <span className="text-[18px]" aria-hidden="true">
          {isRecording ? '●' : '🎙'}
        </span>
        {isRecording && (
          <span className="absolute inset-0 animate-ping rounded-full border border-rose-950/40" />
        )}
      </span>
      <span>
        <span className="block text-[13px] font-extrabold">
          {isRecording ? 'Recording' : 'Record answer'}
        </span>
        <span className="block text-[11px] font-semibold opacity-70">
          {isRecording ? 'Tap again to stop' : isSupported ? 'Tap mic or press M' : 'Type instead'}
        </span>
      </span>
    </button>
  );
}
