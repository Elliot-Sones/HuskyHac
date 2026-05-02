const navItems = [
  ['How it works', 'Learn about our platform'],
  ['Languages', 'Explore language options'],
  ['Research', 'Dive into our studies'],
];

export function TopNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-30 px-8 sm:px-12 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="logo-mark w-7 h-7 rounded-lg grid place-items-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        </div>
        <span className="font-display font-bold text-[15px] text-white">HuskyHac</span>
      </div>
      <nav className="flex items-center gap-4 text-[13px] text-slate-300/70">
        {navItems.map(([label, tooltip]) => (
          <div key={label} className="relative hidden sm:block group">
            <span
              aria-disabled="true"
              className="inline-block rounded-full px-3 py-1.5 opacity-50 transition group-hover:bg-white/[0.04] group-hover:text-white"
            >
              {label}
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-800 px-3 py-1.5 text-xs text-white opacity-0 shadow-xl shadow-black/25 transition-all duration-300 group-hover:opacity-100"
            >
              {tooltip}
            </span>
          </div>
        ))}
        <button className="ml-2 rounded-full px-4 py-1.5 ring-soft text-white/85 transition hover:bg-white/[0.04] hover:text-white">
          Sign in
        </button>
      </nav>
    </header>
  );
}
