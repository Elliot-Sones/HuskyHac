import { MarketingShell } from './MarketingShell';

type Status = 'live' | 'soon';

interface Language {
  flag: string;
  name: string;
  meta: string;
  status: Status;
}

const languages: Language[] = [
  { flag: '🇫🇷', name: 'French', meta: 'A1 → B2 · Paris, Lyon routes', status: 'live' },
  { flag: '🇪🇸', name: 'Spanish', meta: 'Mexico City, Madrid', status: 'soon' },
  { flag: '🇯🇵', name: 'Japanese', meta: 'Tokyo, Kyoto', status: 'soon' },
  { flag: '🇮🇹', name: 'Italian', meta: 'Rome, Florence', status: 'soon' },
  { flag: '🇩🇪', name: 'German', meta: 'Berlin, Munich', status: 'soon' },
  { flag: '🇧🇷', name: 'Portuguese (BR)', meta: 'São Paulo, Rio', status: 'soon' },
  { flag: '🇨🇳', name: 'Mandarin Chinese', meta: 'Beijing, Shanghai', status: 'soon' },
];

function StatusPill({ status }: { status: Status }) {
  if (status === 'live') {
    return (
      <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
        Live
      </span>
    );
  }
  return (
    <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400 ring-1 ring-inset ring-white/[0.08]">
      In production
    </span>
  );
}

export function LanguagesPage() {
  return (
    <MarketingShell
      eyebrow="Languages"
      title="Where you can travel today."
      intro="One language is fully playable right now and the rest are queued up — each one paired with the country and city it lives in, so the practice always has a place."
    >
      <ul className="space-y-3">
        {languages.map((lang) => (
          <li
            key={lang.name}
            className="flex items-center justify-between gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] px-5 py-4"
          >
            <div className="flex items-center gap-4">
              <span className="text-2xl leading-none">{lang.flag}</span>
              <div>
                <div className="text-[15px] font-semibold text-white">{lang.name}</div>
                <div className="text-[13px] text-slate-400/80">{lang.meta}</div>
              </div>
            </div>
            <StatusPill status={lang.status} />
          </li>
        ))}
      </ul>

      <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-7">
        <div className="eyebrow mb-2">Don't see yours?</div>
        <h2 className="title-pro mb-2 text-2xl">
          <span className="title-hard">Tell us where you want to go.</span>
        </h2>
        <p className="text-[15px] leading-relaxed text-slate-300/75">
          We're prioritizing new languages by the cities people most want to visit. If yours isn't
          on the list yet, drop a note and we'll bump it up the queue.
        </p>
      </div>
    </MarketingShell>
  );
}
