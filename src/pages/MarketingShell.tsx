import type { ReactNode } from 'react';
import { TopNav } from '@/landing/TopNav';

interface MarketingShellProps {
  eyebrow?: string;
  title: ReactNode;
  intro?: ReactNode;
  children: ReactNode;
}

export function MarketingShell({ eyebrow, title, intro, children }: MarketingShellProps) {
  return (
    <div className="relative h-screen w-screen overflow-y-auto no-select">
      <div className="stars" />
      <div className="grain" />
      <div className="vignette" />

      <TopNav />

      <main className="relative z-10 mx-auto max-w-3xl px-8 pb-24 pt-32 sm:px-12">
        {eyebrow ? <div className="eyebrow mb-5">{eyebrow}</div> : null}
        <h1 className="title-pro mb-6 text-5xl sm:text-6xl">
          <span className="title-hard">{title}</span>
        </h1>
        {intro ? (
          <p className="mb-12 max-w-2xl text-lg leading-relaxed text-slate-300/75">{intro}</p>
        ) : null}
        {children}
      </main>
    </div>
  );
}
