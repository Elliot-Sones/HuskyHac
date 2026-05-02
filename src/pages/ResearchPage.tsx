import { MarketingShell } from './MarketingShell';

const pillars = [
  {
    title: 'Immersive context beats drills',
    body:
      'Words you learn inside a real-feeling scene stick longer than words memorized off a page. Our scenarios are built so the language always has a reason — you order, you ask, you recover.',
  },
  {
    title: 'Conversations that respond like people',
    body:
      'The AI characters track what you said, interrupt politely when you stumble, and adapt their pace to your level. The goal is a partner you can practice with, not a quiz you can game.',
  },
  {
    title: 'Feedback at the right moment',
    body:
      'We surface corrections after a thought finishes — not mid-sentence — so you keep your speaking flow. The lesson is in the recap, not the interruption.',
  },
  {
    title: 'A model that keeps learning',
    body:
      'Every conversation feeds anonymized signal back into our scenario design and pedagogy. The product gets sharper the more people use it.',
  },
];

export function ResearchPage() {
  return (
    <MarketingShell
      eyebrow="Research"
      title="Why a simulator beats a flashcard deck."
      intro="HuskyHac sits at the intersection of applied linguistics, conversational AI, and game design. Here's the short version of why the format works — and how we keep tuning it."
    >
      <div className="space-y-5">
        {pillars.map((p) => (
          <article
            key={p.title}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-7"
          >
            <h2 className="title-pro mb-2 text-xl sm:text-2xl">
              <span className="title-hard">{p.title}</span>
            </h2>
            <p className="text-[15px] leading-relaxed text-slate-300/75">{p.body}</p>
          </article>
        ))}
      </div>

      <div className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 sm:p-7">
        <div className="eyebrow mb-2">Working in the open</div>
        <h2 className="title-pro mb-2 text-2xl">
          <span className="title-hard">Notes, write-ups, results.</span>
        </h2>
        <p className="text-[15px] leading-relaxed text-slate-300/75">
          We'll publish the studies, scenario designs, and instrumentation that shape the product
          here as they're ready. Check back, or follow along as we go.
        </p>
      </div>
    </MarketingShell>
  );
}
