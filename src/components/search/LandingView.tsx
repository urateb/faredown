'use client';

import { Hero } from '@/components/layout/Hero';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { PopularRoutes } from '@/components/search/PopularRoutes';
import { SearchForm } from '@/components/search/SearchForm';
import type { SearchCriteria } from '@/lib/flights/search-params';

interface LandingViewProps {
  criteria: SearchCriteria;
  fieldErrors: Record<string, string>;
  isPending: boolean;
  onChange: (patch: Partial<SearchCriteria>) => void;
  onSubmit: (next: SearchCriteria) => void;
}

export function LandingView({
  criteria,
  fieldErrors,
  isPending,
  onChange,
  onSubmit,
}: LandingViewProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <Hero>
        <SiteHeader floating />

        <main
          id="main"
          className="flex flex-1 flex-col items-center justify-center px-4 py-10 sm:px-6"
        >
          <div className="mb-10 max-w-2xl text-center">
            <p className="text-brand-400 mb-3 text-[11px] font-semibold tracking-[0.2em] uppercase">
              Live fares · nearby dates
            </p>
            <h1 className="text-ink-50 text-4xl font-semibold tracking-tight sm:text-5xl">
              Know whether the fare is actually good
            </h1>
            <p className="text-ink-300 mt-4 text-base sm:text-lg">
              Search live airline fares, then see them next to the days either side — so you find
              out whether the date you picked is the cheap one before you book, not after.
            </p>
          </div>

          <SearchForm
            criteria={criteria}
            onChange={onChange}
            onSubmit={() => onSubmit(criteria)}
            fieldErrors={fieldErrors}
            isLoading={isPending}
            variant="hero"
          />

          <PopularRoutes criteria={criteria} onSelect={onSubmit} />
        </main>
      </Hero>
      <HowItWorks />
      <SiteFooter />
    </div>
  );
}
