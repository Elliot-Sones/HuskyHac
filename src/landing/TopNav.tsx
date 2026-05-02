import { Link, useLocation } from 'react-router-dom';

const navItems: Array<{ label: string; to: string }> = [
  { label: 'How it works', to: '/how-it-works' },
  { label: 'Languages', to: '/languages' },
  { label: 'Research', to: '/research' },
];

export function TopNav() {
  const { pathname } = useLocation();

  return (
    <header className="fixed top-0 inset-x-0 z-30 px-8 sm:px-12 py-6 flex items-center justify-between">
      <Link to="/" className="flex items-center gap-2.5">
        <div className="logo-mark w-7 h-7 rounded-lg grid place-items-center">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
          </svg>
        </div>
        <span className="font-display font-bold text-[15px] text-white">HuskyHac</span>
      </Link>
      <nav className="flex items-center gap-2 text-[13px] text-slate-300/70">
        {navItems.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`hidden sm:inline-block px-3 py-1.5 rounded-full transition ${
                active
                  ? 'bg-white/[0.08] text-white font-semibold'
                  : 'hover:bg-white/[0.04] hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
        <button className="ml-2 rounded-full px-4 py-1.5 ring-soft text-white/85 transition hover:bg-white/[0.04] hover:text-white">
          Sign in
        </button>
      </nav>
    </header>
  );
}
