export function TopNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-30 px-8 sm:px-12 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg grid place-items-center bg-slate-900 text-white">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        </div>
        <span className="font-display font-bold tracking-tight text-[15px] text-slate-900">HuskyHac</span>
      </div>
      <nav className="flex items-center gap-1 text-[13px] text-slate-500">
        <a className="hidden sm:inline-block px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-900/[0.04]" href="#">
          How it works
        </a>
        <a className="hidden sm:inline-block px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-900/[0.04]" href="#">
          Languages
        </a>
        <a className="hidden sm:inline-block px-3 py-1.5 rounded-full hover:text-slate-900 hover:bg-slate-900/[0.04]" href="#">
          Research
        </a>
        <button className="ml-2 rounded-full px-4 py-1.5 ring-soft text-slate-700 hover:text-slate-900 hover:bg-slate-900/[0.03]">
          Sign in
        </button>
      </nav>
    </header>
  );
}
