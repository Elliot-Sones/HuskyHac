import type { ResponseOption } from '@/shared/contracts';

const OPTION_STYLES = {
  easy: 'border-sky-300/20 bg-sky-300/[0.07] hover:border-sky-200/45',
  natural: 'border-emerald-300/25 bg-emerald-300/[0.08] hover:border-emerald-200/55',
  challenge: 'border-amber-300/25 bg-amber-300/[0.08] hover:border-amber-200/55',
} as const;

interface ResponseOptionsProps {
  options: ResponseOption[];
  selectedId: string | null;
  onSelect: (option: ResponseOption) => void;
}

export function ResponseOptions({ options, selectedId, onSelect }: ResponseOptionsProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {options.map((option) => {
        const isSelected = selectedId === option.id;

        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onSelect(option)}
            className={`group flex min-h-[6.5rem] flex-col rounded-2xl border px-3 py-2.5 text-left shadow-lg shadow-black/15 transition duration-200 hover:-translate-y-0.5 hover:bg-white/[0.09] ${
              OPTION_STYLES[option.label]
            } ${isSelected ? 'ring-2 ring-white/50' : 'ring-1 ring-white/5'}`}
          >
            <div className="mb-1.5 flex items-center justify-between gap-2">
              <span className="rounded-full bg-black/25 px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.18em] text-slate-200/85">
                {option.label}
              </span>
              {option.recommended && (
                <span className="rounded-full bg-emerald-300 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-emerald-950">
                  Best
                </span>
              )}
            </div>
            <div className="text-[14px] font-semibold leading-snug text-white">{option.french}</div>
            <div className="mt-1 text-[11px] leading-snug text-slate-300/70">
              {option.english}
            </div>
          </button>
        );
      })}
    </div>
  );
}
