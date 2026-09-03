const STEPS = [
  {
    title: 'Search a real route',
    body: 'Live fares from Google Flights via SerpApi, not a screenshot of last week’s prices. City or airport, either way.',
  },
  {
    title: 'See the week around it',
    body: 'The grid prices the days either side of your departure, holding trip length fixed, so you can tell if you picked the cheap one.',
  },
  {
    title: 'Book where you actually fly',
    body: 'Faredown does not sell tickets. Select a fare and we open the airline or a booking site with your route already filled in.',
  },
] as const;

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      className="border-ink-800 border-t bg-white/35"
    >
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-20">
        <p className="text-brand-400 text-[11px] font-semibold tracking-[0.2em] uppercase">
          Why this exists
        </p>
        <h2
          id="how-it-works-heading"
          className="text-ink-50 mt-2 max-w-xl text-3xl font-semibold tracking-tight"
        >
          A list of fares answers the wrong question
        </h2>
        <p className="text-ink-400 mt-3 max-w-2xl text-base leading-relaxed">
          Google Flights will show you what today costs. Faredown shows you whether today is a good
          day — by putting your date next to the ones around it, then handing you off to someone who
          can actually issue the ticket.
        </p>

        <ol className="mt-12 grid gap-4 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <li
              key={step.title}
              className="border-ink-800 bg-ink-900 rounded-2xl border p-5"
            >
              <span className="text-brand-400 font-mono text-xs font-semibold tracking-widest">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-ink-50 mt-3 text-base font-semibold">{step.title}</h3>
              <p className="text-ink-400 mt-2 text-sm leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
