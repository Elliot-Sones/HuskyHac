import { useEffect } from 'react';
import type { PlayDestination } from '@/play/destinations';

interface ArrivalTransitionProps {
  destination: PlayDestination;
  onComplete: () => void;
}

function countryFromDestination(destination: PlayDestination) {
  const parts = destination.scenario.destination.split(',');
  return parts.at(-1)?.trim() || destination.scenario.destination;
}

export function ArrivalTransition({ destination, onComplete }: ArrivalTransitionProps) {
  const country = countryFromDestination(destination);

  useEffect(() => {
    const timer = window.setTimeout(onComplete, 5600);
    return () => window.clearTimeout(timer);
  }, [onComplete]);

  return (
    <main className="arrival-screen relative grid min-h-screen w-screen place-items-center overflow-hidden text-slate-950">
      <div className="arrival-sun" />
      <div className="arrival-sky-streak arrival-sky-streak-one" />
      <div className="arrival-sky-streak arrival-sky-streak-two" />
      <div className="arrival-cloud arrival-cloud-one" />
      <div className="arrival-cloud arrival-cloud-two" />
      <div className="arrival-cloud arrival-cloud-three" />
      <div className="arrival-cloudbank" />
      <div className="arrival-horizon" aria-hidden="true">
        <div className="arrival-terminal-tower" />
        <div className="arrival-paris-skyline" />
        <div className="arrival-eiffel" />
      </div>

      <div className="arrival-plane" aria-hidden="true">
        <div className="arrival-touchdown-smoke arrival-touchdown-smoke-left" />
        <div className="arrival-touchdown-smoke arrival-touchdown-smoke-right" />
        <div className="arrival-plane-body" />
        <div className="arrival-plane-nose" />
        <div className="arrival-plane-cockpit" />
        <div className="arrival-plane-wing arrival-plane-wing-main" />
        <div className="arrival-plane-wing arrival-plane-wing-far" />
        <div className="arrival-plane-wing arrival-plane-wing-tail" />
        <div className="arrival-plane-tailfin" />
        <div className="arrival-plane-engine arrival-plane-engine-left" />
        <div className="arrival-plane-engine arrival-plane-engine-right" />
        <div className="arrival-plane-gear arrival-plane-gear-left" />
        <div className="arrival-plane-gear arrival-plane-gear-right" />
      </div>

      <div className="arrival-runway" aria-hidden="true">
        <div className="arrival-runway-centerline" />
        <div className="arrival-runway-edge arrival-runway-edge-left" />
        <div className="arrival-runway-edge arrival-runway-edge-right" />
        <div className="arrival-runway-light arrival-light-one" />
        <div className="arrival-runway-light arrival-light-two" />
        <div className="arrival-runway-light arrival-light-three" />
        <div className="arrival-runway-light arrival-light-four" />
      </div>

      <section className="arrival-copy relative z-10 px-6 text-center">
        <div className="arrival-kicker text-[12px] font-black uppercase tracking-[0.42em] text-sky-950/70">
          Touchdown
        </div>
        <div className="arrival-divider" />
        <h1 className="arrival-title mt-7 text-[54px] font-normal leading-none tracking-normal text-slate-950 sm:text-[104px]">
          Welcome to {country}
        </h1>
        <p className="arrival-subtitle mx-auto mt-7 max-w-[620px] text-[18px] font-medium leading-7 text-slate-800 sm:text-[23px]">
          Your arrival is cleared for {destination.scenario.destination}.
        </p>
      </section>
    </main>
  );
}
