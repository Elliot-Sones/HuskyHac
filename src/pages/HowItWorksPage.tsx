import { MarketingShell } from './MarketingShell';

const steps = [
  {
    title: 'Choose your destination',
    body:
      'Spin the globe and pick a country. Each one ships with a curated set of scenarios — Parisian cafés, Tokyo train stations, Mexico City markets — built around the language you want to practice.',
  },
  {
    title: 'Step into the scene',
    body:
      'You drop into a 3D environment with AI characters who actually listen. Order a coffee, ask for directions, recover from a mistake. The conversation goes wherever you take it.',
  },
  {
    title: 'Get instant feedback',
    body:
      'After each exchange we surface what worked, what to try next, and the small grammar or pronunciation tweaks that move you up a level. Nothing punishing — just nudges.',
  },
  {
    title: 'Track real progress',
    body:
      'Every scenario contributes to a CEFR-style proficiency picture. Watch your fluency climb across speaking, listening, and culture as you rack up trips.',
  },
];

export function HowItWorksPage() {
  return (
    <MarketingShell
      eyebrow="How it works"
      title="Language learning that feels like travel."
      intro="HuskyHac is a simulator. Pick a country, walk into a real-feeling scene, and have actual conversations with AI locals. You learn the way you would on the trip itself — by doing."
    >
      <ol className="space-y-8">
        {steps.map((step, i) => (
          <li
            key={step.title}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-7"
          >
            <div className="flex items-baseline gap-4">
              <span className="font-mono text-[12px] tracking-wide text-slate-400/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h2 className="title-pro text-xl sm:text-2xl">
                <span className="title-hard">{step.title}</span>
              </h2>
            </div>
            <p className="mt-3 pl-10 text-[15px] leading-relaxed text-slate-300/75">{step.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-16 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-7">
        <div className="eyebrow mb-2">Ready when you are</div>
        <h2 className="title-pro mb-2 text-2xl">
          <span className="title-hard">Pick a country and go.</span>
        </h2>
        <p className="text-[15px] leading-relaxed text-slate-300/75">
          The whole point is to skip the flashcards. Open the globe, click somewhere new, and your
          first scenario starts in seconds.
        </p>
      </div>
    </MarketingShell>
  );
}
