import Link from 'next/link';

import { PageShell } from '@/components/layout/PageShell';

export default function NotFoundPage() {
  return (
    <PageShell>
      <p className="text-brand-400 text-[11px] font-semibold tracking-[0.2em] uppercase">404</p>
      <h1 className="text-ink-50 mt-2 text-4xl font-semibold tracking-tight">
        That page is not on this itinerary
      </h1>
      <p className="text-ink-300 mt-4 text-lg">
        The URL does not match anything Faredown serves. The search itself lives on the home page.
      </p>
      <p className="mt-8">
        <Link
          href="/"
          className="bg-brand-400 text-ink-950 hover:bg-brand-300 inline-flex h-11 items-center rounded-xl px-5 font-semibold"
        >
          Search flights
        </Link>
      </p>
    </PageShell>
  );
}
