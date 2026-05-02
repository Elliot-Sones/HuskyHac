import { useMemo, useState } from 'react';
import type { PlayerAccessory } from '@/shared/contracts';
import { useMultiplayer } from '@/multiplayer/MultiplayerProvider';

const colors = ['#2563eb', '#16a34a', '#ea580c', '#9333ea'];
const accessories: PlayerAccessory[] = ['backpack', 'nametag', 'scarf', 'suitcase'];

export function MultiplayerLobby() {
  const multiplayer = useMultiplayer();
  const initialRoomCode = useMemo(() => {
    return new URLSearchParams(window.location.search).get('room')?.toUpperCase() ?? '';
  }, []);
  const [roomCode, setRoomCode] = useState(initialRoomCode);

  if (multiplayer.disabled) {
    return (
      <div className="pointer-events-auto absolute left-5 top-24 z-30 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-[12px] font-bold text-slate-200 shadow-2xl shadow-black/25 backdrop-blur-2xl">
        Solo mode
      </div>
    );
  }

  if (multiplayer.status === 'connected' && multiplayer.room) {
    return <RoomHud />;
  }

  const busy = multiplayer.status === 'connecting';
  const draft = multiplayer.profileDraft;

  return (
    <section className="pointer-events-auto absolute left-5 top-24 z-30 w-[min(360px,calc(100vw-40px))] rounded-2xl border border-white/10 bg-slate-950/75 p-4 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Multiplayer
          </div>
          <div className="mt-1 text-[15px] font-black">Airport room</div>
        </div>
        <div className="rounded-full bg-emerald-300/15 px-3 py-1 text-[11px] font-bold text-emerald-100">
          Max 4
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="grid gap-1 text-[12px] font-semibold text-slate-300">
          Name
          <input
            value={draft.displayName}
            onChange={(event) => multiplayer.setProfileDraft({ ...draft, displayName: event.target.value })}
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[14px] font-bold text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/70"
            maxLength={24}
          />
        </label>

        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-2">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                aria-label={`Use color ${color}`}
                onClick={() => multiplayer.setProfileDraft({ ...draft, color })}
                className={`h-8 w-8 rounded-full border transition ${
                  draft.color === color ? 'border-white scale-105' : 'border-white/20'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <select
            value={draft.accessory}
            onChange={(event) => multiplayer.setProfileDraft({ ...draft, accessory: event.target.value as PlayerAccessory })}
            className="rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-[12px] font-bold text-white outline-none"
          >
            {accessories.map((accessory) => (
              <option key={accessory} value={accessory}>
                {accessory}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <input
            value={roomCode}
            onChange={(event) => setRoomCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6))}
            placeholder="ROOM12"
            className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 font-mono text-[14px] font-black tracking-[0.12em] text-white outline-none transition placeholder:text-slate-500 focus:border-sky-300/70"
          />
          <button
            type="button"
            disabled={busy || roomCode.length !== 6}
            onClick={() => multiplayer.joinRoom(roomCode)}
            className="rounded-xl bg-white px-4 py-2 text-[12px] font-black text-slate-950 transition hover:bg-sky-100 disabled:cursor-not-allowed disabled:bg-white/20 disabled:text-white/40"
          >
            Join
          </button>
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={multiplayer.createRoom}
          className="rounded-xl bg-emerald-300 px-4 py-2.5 text-[13px] font-black text-emerald-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:bg-emerald-300/30 disabled:text-emerald-50/50"
        >
          {busy ? 'Connecting...' : 'Create room'}
        </button>

        {multiplayer.error && (
          <div className="rounded-xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-[12px] font-semibold text-rose-100">
            {multiplayer.error}
          </div>
        )}
      </div>
    </section>
  );
}

function RoomHud() {
  const multiplayer = useMultiplayer();
  const room = multiplayer.room;
  if (!room) return null;

  return (
    <section className="pointer-events-auto absolute left-5 top-24 z-30 rounded-2xl border border-white/10 bg-slate-950/75 px-4 py-3 text-white shadow-2xl shadow-black/30 backdrop-blur-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
            Room
          </div>
          <div className="mt-1 font-mono text-[18px] font-black tracking-[0.16em]">{room.code}</div>
          <div className="mt-1 text-[12px] font-semibold text-slate-300">
            {room.players.length}/{room.maxPlayers} travelers
          </div>
        </div>
        <button
          type="button"
          onClick={multiplayer.leaveRoom}
          className="rounded-xl border border-white/10 bg-white/10 px-3 py-2 text-[12px] font-bold text-slate-100 transition hover:bg-white/15"
        >
          Leave
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {room.players.map((player) => (
          <span
            key={player.id}
            className="rounded-full border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-slate-100"
          >
            <span className="mr-1.5 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: player.color }} />
            {player.displayName}
          </span>
        ))}
      </div>
    </section>
  );
}
