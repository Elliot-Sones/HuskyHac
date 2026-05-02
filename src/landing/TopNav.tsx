export function TopNav() {
  return (
    <header className="fixed top-0 inset-x-0 z-30 px-8 sm:px-12 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg grid place-items-center bg-white/[0.06] ring-softer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        </div>
        <span className="font-display font-bold tracking-tight text-[15px]">HuskyHac</span>
      </div>
      <nav className="flex items-center gap-1 text-[13px] text-slate-300/70">
        <a className="hidden sm:inline-block px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04]" href="#">
          How it works
        </a>
        <a className="hidden sm:inline-block px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04]" href="#">
          Languages
        </a>
        <a className="hidden sm:inline-block px-3 py-1.5 rounded-full hover:text-white hover:bg-white/[0.04]" href="#">
          Research
        </a>
        <button className="ml-2 rounded-full px-4 py-1.5 ring-soft text-white/85 hover:bg-white/[0.04] hover:text-white">
          Sign in
        </button>
      </nav>
    </header>
  );
}
