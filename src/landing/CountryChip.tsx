type Props = {
  visible: boolean;
  flag: string;
  name: string;
  meta: string;
  onClear: () => void;
};

export function CountryChip({ visible, flag, name, meta, onClear }: Props) {
  return (
    <div
      className={`chip-anim ${visible ? 'show' : ''} fixed top-32 left-8 sm:left-12 z-30 glass rounded-2xl ring-soft px-4 py-3 flex items-center gap-3`}
    >
      <span className="text-[22px] leading-none">{flag}</span>
      <div>
        <div className="eyebrow text-[10px] mb-0.5">Destination</div>
        <div className="font-display font-bold text-[14px] leading-tight text-slate-900">{name}</div>
        <div className="text-[12px] text-slate-500 mt-0.5">{meta}</div>
      </div>
      <button
        onClick={onClear}
        aria-label="Clear selection"
        className="ml-1 w-7 h-7 rounded-full hover:bg-slate-900/[0.06] grid place-items-center text-slate-400 hover:text-slate-700"
      >
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
    </div>
  );
}
