import type { Metadata } from 'next';
import Link from 'next/link';

import { PageShell } from '@/components/layout/PageShell';
import { SITE_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'How it works',
  description: `How ${SITE_NAME} searches live fares, compares neighbouring dates, and hands you off to a site that actually sells tickets.`,
};

export default function AboutPage() {
  return (
    <PageShell>
      <p className="text-brand-400 text-[11px] font-semibold tracking-widest uppercase">
        How it works
      </p>
      <h1 className="text-ink-50 mt-2 text-4xl font-semibold tracking-tight">
        A fare is only useful if you know it is a good one
      </h1>
      <p className="text-ink-300 mt-4 text-lg leading-relaxed">
        Most flight search shows you what the date you typed costs. That is half the job. The other
        half is whether shifting by a day would have been cheaper — which you only find out after
        you have already committed, or after opening seven extra tabs. Faredown is the missing half.
      </p>

      <h2 className="text-ink-50 mt-12 text-xl font-semibold">What you do</h2>
      <ol className="text-ink-300 mt-4 list-decimal space-y-3 pl-5">
        <li>
          Search a route. Results are live offers from{' '}
          <a
            href="https://serpapi.com/google-flights-api"
            className="text-brand-400 hover:text-brand-300 font-medium"
          >
            Google Flights via SerpApi
          </a>
          .
        </li>
        <li>
          Read the nearby-dates grid. It prices the days either side of your departure and holds
          trip length constant, so a Tuesday–Tuesday is never compared with a Tuesday–Sunday.
        </li>
        <li>
          Pick an itinerary. Faredown does not sell tickets. It opens the airline, Google Flights,
          Kayak, or Skyscanner with the route and dates already filled in. Confirm the price there —
          fares move between search and checkout.
        </li>
      </ol>

      <h2 id="data" className="text-ink-50 mt-12 text-xl font-semibold">
        Where the numbers come from
      </h2>
      <p className="text-ink-300 mt-4 leading-relaxed">
        Every search hits SerpApi on the server. The API key never leaves this process. Repeat
        searches for the same route and dates are served from a short-lived cache so a refresh does
        not spend another monthly search. Signup is a free SerpApi account — no country restriction.
      </p>
      <p className="text-ink-300 mt-4 leading-relaxed">
        A search is encoded entirely in the URL, so a Faredown link is a real result page, not a
        form waiting to be filled in. Filters and sort order stay local: sharing a link should
        reproduce the same flights, not someone else&apos;s narrowed view of them.
      </p>

      <h2 className="text-ink-50 mt-12 text-xl font-semibold">What it is not</h2>
      <ul className="text-ink-300 mt-4 list-disc space-y-2 pl-5">
        <li>Not a travel agency. No checkout, no booking reference, no markup.</li>
        <li>Not a price-guarantee. The fare on the airline site is the one that matters.</li>
        <li>
          Not affiliated with SerpApi, Google, Kayak, Skyscanner, or any carrier whose logo appears
          in results.
        </li>
      </ul>

      <p className="text-ink-500 mt-12 text-sm">
        Built as a real tool, not a mock.{' '}
        <Link href="/" className="text-brand-400 hover:text-brand-300 font-medium">
          Search a route
        </Link>
        .
      </p>
    </PageShell>
  );
}
