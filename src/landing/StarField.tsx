import { useMemo } from 'react';

const STAR_COUNT = 240;
const SHOOTING_COUNT = 14;

type Star = {
  top: number;
  left: number;
  size: number;
  baseOpacity: number;
  peakOpacity: number;
  delay: number;
  duration: number;
  tint: string;
  glow: boolean;
};

type Shooting = {
  top: number;
  left: number;
  angle: number;
  length: number;
  thickness: number;
  delay: number;
  cycle: number;
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function StarField() {
  const stars = useMemo<Star[]>(() => {
    return Array.from({ length: STAR_COUNT }, () => {
      const r = Math.random();
      const size = r < 0.78 ? rand(0.6, 1.2) : r < 0.95 ? rand(1.2, 1.8) : rand(1.8, 2.6);
      const tintRoll = Math.random();
      const tint =
        tintRoll < 0.06
          ? `hsl(${210 + Math.random() * 30} 80% 82%)` // bluish
          : tintRoll < 0.1
            ? `hsl(${30 + Math.random() * 18} 70% 84%)` // warm
            : 'rgba(255,255,255,0.96)';
      return {
        top: rand(0, 100),
        left: rand(0, 100),
        size,
        baseOpacity: rand(0.18, 0.45),
        peakOpacity: rand(0.7, 1),
        delay: rand(0, 7),
        duration: rand(2.6, 6.5),
        tint,
        glow: size > 1.6,
      };
    });
  }, []);

  const shootings = useMemo<Shooting[]>(() => {
    return Array.from({ length: SHOOTING_COUNT }, () => ({
      top: rand(-5, 60),
      left: rand(-10, 70),
      angle: rand(14, 32),
      length: rand(140, 320),
      thickness: rand(1.2, 2.2),
      delay: rand(0, 22),
      cycle: rand(7, 16),
    }));
  }, []);

  return (
    <div className="starfield" aria-hidden>
      {stars.map((s, i) => (
        <span
          key={i}
          className="sf-star"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: `${s.size}px`,
            height: `${s.size}px`,
            background: s.tint,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
            ['--sf-min' as any]: s.baseOpacity,
            ['--sf-max' as any]: s.peakOpacity,
            boxShadow: s.glow
              ? `0 0 ${(s.size * 2.2).toFixed(1)}px rgba(255,255,255,0.55)`
              : undefined,
          }}
        />
      ))}
      {shootings.map((s, i) => (
        <div
          key={`shoot-${i}`}
          className="sf-shoot-track"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            transform: `rotate(${s.angle}deg)`,
          }}
        >
          <span
            className="sf-shoot-streak"
            style={{
              width: `${s.length}px`,
              height: `${s.thickness}px`,
              animationDuration: `${s.cycle}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
