import type { Metadata } from 'next';

import { PageShell } from '@/components/layout/PageShell';
import { SITE_NAME } from '@/lib/brand';

export const metadata: Metadata = {
  title: 'Privacy',
  description: `${SITE_NAME} does not run accounts, ads, or trackers. This page is the whole policy.`,
};

export default function PrivacyPage() {
  return (
    <PageShell>
      <p className="text-brand-400 text-[11px] font-semibold tracking-widest uppercase">
        Fine print
      </p>
      <h1 className="text-ink-50 mt-2 text-4xl font-semibold tracking-tight">Privacy</h1>
      <p className="text-ink-300 mt-4 text-lg leading-relaxed">
        There is no account, no newsletter, and no analytics script. The short version: a search is
        a request, not a profile.
      </p>

      <h2 className="text-ink-50 mt-12 text-xl font-semibold">What is sent where</h2>
      <ul className="text-ink-300 mt-4 list-disc space-y-3 pl-5">
        <li>
          <strong className="text-ink-50 font-semibold">Your search</strong> — origin, destination,
          dates, cabin, traveller count, currency — is sent to this server and then to SerpApi to
          fetch Google Flights results. SerpApi&apos;s own privacy terms apply to that lookup.
        </li>
        <li>
          <strong className="text-ink-50 font-semibold">Your IP address</strong> is used only to
          rate-limit the paid airline API so one visitor cannot exhaust the quota. It is not stored
          beyond the in-memory window of that limiter.
        </li>
      </ul>

      <h2 className="text-ink-50 mt-12 text-xl font-semibold">What is not collected</h2>
      <p className="text-ink-300 mt-4 leading-relaxed">
        Names, emails, payment details, cookies for advertising, and device fingerprints. Booking
        happens on a third-party site; that site has its own policy.
      </p>

      <p className="text-ink-500 mt-12 text-sm">Last updated 3 September 2026.</p>
    </PageShell>
  );
}
