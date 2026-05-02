import { Suspense, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import type { PlayDestination } from '@/play/destinations';
import { ArrivalScene } from '@/play/ArrivalScene';

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
      <div className="absolute inset-0">
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ antialias: true, toneMappingExposure: 1.05 }}
          camera={{ position: [12, 4.6, 15], fov: 42 }}
        >
          <Suspense fallback={null}>
            <ArrivalScene destination={destination} />
          </Suspense>
        </Canvas>
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
