export function HeroTitle() {
  return (
    <section className="fixed inset-x-0 top-24 sm:top-28 z-20 flex flex-col items-center text-center px-6 pointer-events-none">
      <div className="eyebrow mb-5 pointer-events-auto">
        Live AI travel companion · OpenAI Realtime
      </div>
      <h1 className="title-pro text-[44px] sm:text-[68px] md:text-[80px]">
        <span className="title-soft">Travel the world.</span>
        <br />
        <span className="title-hard">Learn the language.</span>
      </h1>
      <p className="mt-6 max-w-[36rem] text-[15px] sm:text-[17px] text-slate-300/75 leading-relaxed">
        An immersive language practice world. Step off the plane, walk the airport,
        and talk your way through it. Pick a country to begin your trip.
      </p>
    </section>
  );
}
