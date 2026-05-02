import { Link, useSearchParams } from 'react-router-dom';
import { SUPPORTED } from '@/landing/countries';

export function PlayStub() {
  const [params] = useSearchParams();
  const slug = params.get('country') ?? 'france';
  const country = Object.values(SUPPORTED).find((c) => c.slug === slug);

  return (
    <div className="no-select min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="vignette" />

      <div className="eyebrow mb-5">Now boarding</div>
      <div className="text-[64px] sm:text-[88px] leading-none mb-6">{country?.flag ?? '✈️'}</div>
      <h1 className="title-pro text-[40px] sm:text-[60px] mb-3">
        <span className="title-hard">{country?.place ?? 'Destination unknown'}</span>
      </h1>
      <p className="max-w-[34rem] text-[15px] sm:text-[16px] text-slate-600 leading-relaxed">
        The airport scene loads here. Walk the terminal, find an information desk,
        and start practicing {country?.language ?? 'the language'} with an AI travel agent.
      </p>
      <div className="mt-10 text-[12px] font-mono text-slate-500">
        airport scene · scaffold pending
      </div>
      <Link
        to="/"
        className="mt-12 rounded-full px-5 py-2 ring-soft text-[13px] text-slate-600 hover:text-ink-900 hover:bg-ink-900/[0.04]"
      >
        ← Back to globe
      </Link>
    </div>
  );
}
