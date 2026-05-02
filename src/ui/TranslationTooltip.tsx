import type { PropsWithChildren } from 'react';

export function TranslationTooltip({
  children,
  translation,
}: PropsWithChildren<{ translation?: string }>) {
  if (!translation) {
    return <>{children}</>;
  }

  return (
    <span className="group relative inline-flex cursor-help items-baseline">
      <span className="rounded-sm text-amber-100 underline decoration-amber-300/50 decoration-dotted underline-offset-4 transition group-hover:text-white">
        {children}
      </span>
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-max max-w-[15rem] -translate-x-1/2 rounded-xl border border-amber-200/25 bg-slate-950/95 px-3 py-2 text-left text-[12px] font-medium leading-snug text-amber-50 opacity-0 shadow-2xl shadow-black/40 backdrop-blur-xl transition duration-150 group-hover:translate-y-[-2px] group-hover:opacity-100">
        {translation}
      </span>
    </span>
  );
}
