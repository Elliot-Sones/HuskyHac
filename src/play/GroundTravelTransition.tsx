import { useEffect } from 'react';
import type { PlayDestination } from '@/play/destinations';

interface GroundTravelTransitionProps {
  destination: PlayDestination;
  onComplete: () => void;
}

export function GroundTravelTransition({ destination, onComplete }: GroundTravelTransitionProps) {
  const title =
    destination.id === 'france-coffee_shop'
      ? 'Road to Café Bisset'
      : destination.id === 'france-eiffel_tour'
        ? 'Road to the Eiffel Tower'
        : `Road to ${destination.scenario.terminal}`;

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 3200);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="relative grid min-h-screen w-screen place-items-center overflow-hidden bg-[#111827] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(250,204,21,0.22),transparent_36%),linear-gradient(180deg,#0f172a_0%,#111827_48%,#020617_100%)]" />
      <div className="absolute bottom-0 left-1/2 h-[62vh] w-[54vw] min-w-[340px] -translate-x-1/2 overflow-hidden">
        <div className="absolute inset-x-[12%] bottom-0 h-full origin-bottom scale-x-[0.62] bg-slate-950/80" />
        <div className="absolute bottom-0 left-1/2 h-full w-1 -translate-x-1/2 bg-yellow-200/80 shadow-[0_0_28px_rgba(254,240,138,0.55)]" />
        <div className="absolute bottom-[18%] left-1/2 h-16 w-1 -translate-x-1/2 bg-yellow-100/80" />
        <div className="absolute bottom-[42%] left-1/2 h-10 w-1 -translate-x-1/2 bg-yellow-100/60" />
        <div className="absolute bottom-[62%] left-1/2 h-7 w-1 -translate-x-1/2 bg-yellow-100/40" />
      </div>

      <section className="relative z-10 px-6 text-center">
        <div className="text-[12px] font-black uppercase tracking-[0.42em] text-yellow-200/80">
          En route
        </div>
        <h1 className="mt-6 text-[48px] font-black leading-none tracking-normal text-white sm:text-[82px]">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-[560px] text-[17px] font-medium leading-7 text-slate-300 sm:text-[21px]">
          The ride crosses Paris and drops you near {destination.scenario.terminal}.
        </p>
        <button
          type="button"
          data-testid="complete-ground-travel"
          onClick={onComplete}
          className="mt-8 rounded-2xl bg-white px-5 py-3 text-[13px] font-black text-slate-950 shadow-xl shadow-black/25 transition hover:bg-yellow-100"
        >
          Arrive
        </button>
      </section>
    </main>
  );
}
