type Props = {
  visible: boolean;
  flag: string;
  label: string;
  subline: string;
  disabled: boolean;
  onClick: () => void;
};

export function StartCTA({ visible, flag, label, subline, disabled, onClick }: Props) {
  return (
    <div
      className={`cta-wrap ${visible ? 'show' : ''} fixed bottom-10 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2.5`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className="cta-pro font-display font-semibold text-[15px] sm:text-[16px] rounded-full pl-3 pr-6 py-3 flex items-center gap-3"
      >
        <span className="w-9 h-9 rounded-full bg-ink-800 grid place-items-center ring-1 ring-black/10">
          <span className="text-[18px] leading-none">{flag}</span>
        </span>
        <span>{label}</span>
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="opacity-70"
        >
          <path d="M5 12h14M13 5l7 7-7 7" />
        </svg>
      </button>
      <span className="text-[12px] text-slate-400">{subline}</span>
    </div>
  );
}
