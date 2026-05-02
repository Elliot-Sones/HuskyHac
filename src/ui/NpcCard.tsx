import type { NpcProfile } from '@/shared/contracts';

interface NpcCardProps {
  npc: NpcProfile;
  personality?: string;
}

export function NpcCard({ npc, personality }: NpcCardProps) {
  const initials = npc.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
  const description = trimPersona(personality, npc.name) ?? npc.locationLabel;

  return (
    <div className="flex max-w-sm items-start gap-3 rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-3 shadow-2xl shadow-black/40 backdrop-blur-2xl">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-sky-200/20 bg-sky-200/10 text-[15px] font-black text-sky-100">
        {initials || 'NPC'}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-slate-400">
          Talking to
        </div>
        <div className="mt-0.5 text-[15px] font-black leading-tight text-white">{npc.name}</div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300/80">
          {npc.role}
        </div>
        <p className="mt-2 text-[12px] leading-snug text-slate-300/80">{description}</p>
      </div>
    </div>
  );
}

function trimPersona(personality: string | undefined, name: string): string | undefined {
  if (!personality) return undefined;
  const prefix = `${name} is `;
  const stripped = personality.startsWith(prefix)
    ? personality.slice(prefix.length).replace(/^./, (c) => c.toUpperCase())
    : personality;
  return stripped;
}
