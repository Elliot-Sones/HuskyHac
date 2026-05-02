import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, Environment, OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { PlayerAccessory } from '@/shared/contracts';
import type { PlayDestination } from '@/play/destinations';
import {
  accessories,
  avatarColors,
  readLocalPlayerProfile,
  saveLocalPlayerProfile,
  type LocalPlayerProfile,
} from '@/play/playerProfile';
import { Character } from '@/world/Character';

interface PlayerEntryMockProps {
  destination: PlayDestination;
  onLaunch: (profile: LocalPlayerProfile) => void;
}

interface AvatarPreviewProps {
  color: string;
  accessory: PlayerAccessory;
}

function AvatarPreview({ color, accessory }: AvatarPreviewProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 1.55, 3.4], fov: 32 }}
      gl={{ antialias: true, toneMappingExposure: 1.05 }}
    >
      <color attach="background" args={['#0a1426']} />
      <fog attach="fog" args={['#0a1426', 9, 22]} />
      <PerspectiveCamera makeDefault position={[0, 1.55, 3.4]} fov={32} />

      <ambientLight intensity={0.55} />
      <hemisphereLight args={['#dceeff', '#1c2b4a', 0.55]} />
      <directionalLight
        castShadow
        position={[3.4, 6, 4.5]}
        intensity={1.15}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-3}
        shadow-camera-right={3}
        shadow-camera-top={3}
        shadow-camera-bottom={-3}
      />
      <pointLight position={[-2.4, 2.4, 2]} intensity={0.45} color="#7dd3fc" />

      <Suspense fallback={null}>
        <Environment preset="lobby" />
      </Suspense>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <circleGeometry args={[2.4, 64]} />
        <meshStandardMaterial color="#101f3a" roughness={0.85} metalness={0.12} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[2.18, 2.34, 64]} />
        <meshBasicMaterial color="#1d3b6b" transparent opacity={0.55} />
      </mesh>
      <ContactShadows position={[0, 0.01, 0]} opacity={0.5} scale={6} blur={2.4} far={2.5} />

      <Character color={color} accessory={accessory} />

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        target={[0, 0.95, 0]}
        minPolarAngle={Math.PI / 3.2}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate
        autoRotateSpeed={0.7}
      />
    </Canvas>
  );
}

export function PlayerEntryMock({ destination, onLaunch }: PlayerEntryMockProps) {
  const [initialProfile] = useState(() => readLocalPlayerProfile());
  const [name, setName] = useState(initialProfile.displayName);
  const [color, setColor] = useState(initialProfile.color);
  const [accessory, setAccessory] = useState<PlayerAccessory>(initialProfile.accessory);

  function launchGame() {
    const profile = saveLocalPlayerProfile({ displayName: name, color, accessory });
    onLaunch(profile);
  }

  return (
    <main className="relative grid min-h-screen w-screen place-items-center overflow-hidden bg-slate-950 px-5 py-6 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(45,212,191,0.23),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(37,99,235,0.32),transparent_34%),linear-gradient(180deg,#111827,#020617)]" />

      <section className="relative z-10 grid w-[min(1180px,100%)] gap-5 lg:grid-cols-[minmax(0,520px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/45 backdrop-blur-2xl sm:p-6">
          <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
            First stop
          </div>
          <h1 className="mt-2 text-[30px] font-black leading-tight sm:text-[40px]">
            Choose your traveler
          </h1>
          <p className="mt-2 text-[14px] font-semibold leading-6 text-slate-300">
            Boarding for {destination.scenario.destination}. Your mock profile will be ready before the world loads.
          </p>

          <div className="mt-6 grid gap-4">
            <label className="grid gap-2 text-[13px] font-bold text-slate-300">
              Name
              <input
                value={name}
                onChange={(event) => setName(event.target.value.slice(0, 24))}
                className="h-14 rounded-xl border border-white/10 bg-white/10 px-4 text-[18px] font-black text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/70"
                maxLength={24}
              />
            </label>

            <div>
              <div className="text-[13px] font-bold text-slate-300">Avatar color</div>
              <div className="mt-2 flex flex-wrap gap-3">
                {avatarColors.map((avatarColor) => (
                  <button
                    key={avatarColor.value}
                    type="button"
                    aria-label={`Use ${avatarColor.name} avatar`}
                    onClick={() => setColor(avatarColor.value)}
                    className={`h-12 w-12 rounded-full border-2 transition ${
                      color === avatarColor.value ? 'scale-105 border-white' : 'border-white/20'
                    }`}
                    style={{ backgroundColor: avatarColor.value }}
                  />
                ))}
              </div>
            </div>

            <label className="grid gap-2 text-[13px] font-bold text-slate-300">
              Accessory
              <select
                value={accessory}
                onChange={(event) => setAccessory(event.target.value as PlayerAccessory)}
                className="h-12 rounded-xl border border-white/10 bg-slate-900 px-3 text-[14px] font-bold text-white outline-none"
              >
                {accessories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Destination
              </div>
              <div className="mt-1 text-[18px] font-black">{destination.scenario.title}</div>
              <div className="mt-1 text-[12px] font-semibold text-slate-300">
                {destination.scenario.npc.name}
              </div>
              <button
                type="button"
                onClick={launchGame}
                className="mt-4 h-14 w-full rounded-xl bg-emerald-300 px-4 text-[15px] font-black text-emerald-950 transition hover:bg-emerald-200"
              >
                Launch game
              </button>
            </div>
          </div>
        </div>

        <div className="relative h-[440px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60 shadow-2xl shadow-black/45 backdrop-blur-2xl lg:h-auto lg:min-h-[600px]">
          <AvatarPreview color={color} accessory={accessory} />

          <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 backdrop-blur">
            <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
              In-game preview
            </div>
            <div className="mt-1 max-w-[200px] truncate text-[15px] font-black">
              {name || 'Traveler'}
            </div>
            <div className="text-[11px] font-semibold capitalize text-slate-300">{accessory}</div>
          </div>

          <div className="pointer-events-none absolute bottom-3 right-4 rounded-md bg-slate-950/60 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
            Drag to rotate
          </div>
        </div>
      </section>
    </main>
  );
}
