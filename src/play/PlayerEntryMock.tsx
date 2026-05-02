import { useState } from 'react';
import type { PlayerAccessory } from '@/shared/contracts';
import type { PlayDestination } from '@/play/destinations';

const avatarColors = [
  { name: 'blue', value: '#2563eb' },
  { name: 'green', value: '#16a34a' },
  { name: 'orange', value: '#ea580c' },
  { name: 'purple', value: '#9333ea' },
];
const accessories: PlayerAccessory[] = ['backpack', 'nametag', 'scarf', 'suitcase'];

interface PlayerEntryMockProps {
  destination: PlayDestination;
  onLaunch: () => void;
}

export function PlayerEntryMock({ destination, onLaunch }: PlayerEntryMockProps) {
  const [name, setName] = useState(() => {
    return window.localStorage.getItem('huskyhac.playerName') || 'Traveler 22';
  });
  const [color, setColor] = useState(() => {
    return window.localStorage.getItem('huskyhac.playerColor') || avatarColors[0].value;
  });
  const [accessory, setAccessory] = useState<PlayerAccessory>(() => {
    return (window.localStorage.getItem('huskyhac.playerAccessory') as PlayerAccessory | null) || 'backpack';
  });

  function launchGame() {
    window.localStorage.setItem('huskyhac.playerName', name.trim() || 'Traveler');
    window.localStorage.setItem('huskyhac.playerColor', color);
    window.localStorage.setItem('huskyhac.playerAccessory', accessory);
    onLaunch();
  }

  return (
    <main className="relative grid min-h-screen w-screen place-items-center overflow-hidden bg-slate-950 px-5 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(45,212,191,0.23),transparent_30%),radial-gradient(circle_at_78%_10%,rgba(37,99,235,0.32),transparent_34%),linear-gradient(180deg,#111827,#020617)]" />
      <section className="relative z-10 w-[min(760px,100%)] rounded-2xl border border-white/10 bg-slate-950/80 p-5 shadow-2xl shadow-black/45 backdrop-blur-2xl sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
              First stop
            </div>
            <h1 className="mt-2 text-[30px] font-black leading-tight sm:text-[40px]">
              Choose your traveler
            </h1>
            <p className="mt-2 max-w-xl text-[14px] font-semibold leading-6 text-slate-300">
              Boarding for {destination.scenario.destination}. Your mock profile will be ready before the world loads.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3">
            <div
              className="grid h-14 w-14 place-items-center rounded-full border-2 border-white/50 text-[20px] font-black text-white"
              style={{ backgroundColor: color }}
            >
              {(name.trim()[0] || 'T').toUpperCase()}
            </div>
            <div>
              <div className="max-w-[180px] truncate text-[16px] font-black">{name || 'Traveler'}</div>
              <div className="text-[12px] font-semibold text-slate-300">{accessory}</div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-5 md:grid-cols-[1fr_0.75fr]">
          <div className="grid gap-4">
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
          </div>

          <div className="grid content-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] p-4">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                Destination
              </div>
              <div className="mt-1 text-[18px] font-black">{destination.scenario.title}</div>
              <div className="mt-1 text-[12px] font-semibold text-slate-300">
                {destination.scenario.npc.name}
              </div>
            </div>

            <button
              type="button"
              onClick={launchGame}
              className="mt-2 h-14 rounded-xl bg-emerald-300 px-4 text-[15px] font-black text-emerald-950 transition hover:bg-emerald-200"
            >
              Launch game
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
