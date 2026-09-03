'use client';

import { useMemo } from 'react';

import { LandingView } from '@/components/search/LandingView';
import { ResultsWorkspace } from '@/components/search/ResultsWorkspace';
import type { SearchPageError } from '@/components/search/types';
import { useDateGrid } from '@/hooks/useDateGrid';
import { useSearchSession } from '@/hooks/useSearchSession';
import { deriveFacets, NO_FILTERS, refineOffers } from '@/lib/flights/refine';
import type { FlightSearchQuery, SearchCriteria } from '@/lib/flights/search-params';
import type { Offer, SearchMeta } from '@/lib/flights/types';

export type { SearchPageError };

interface SearchPageProps {
  /** The serialised search, and the signal that the server produced new results. */
  urlKey: string;
  criteria: SearchCriteria;
  query: FlightSearchQuery | null;
  offers: Offer[];
  meta: SearchMeta | null;
  error: SearchPageError | null;
  fieldErrors?: Record<string, string>;
}

export function SearchPage({
  urlKey,
  criteria: criteriaFromUrl,
  query,
  offers,
  meta,
  error,
  fieldErrors: serverFieldErrors,
}: SearchPageProps) {
  const session = useSearchSession({ urlKey, criteriaFromUrl, serverFieldErrors });
  const dateGrid = useDateGrid(query, offers.length > 0);

  const facets = useMemo(
    () => deriveFacets(offers, meta?.currency ?? 'EUR'),
    [offers, meta?.currency],
  );
  const visibleOffers = useMemo(
    () => refineOffers(offers, session.filters, session.sort),
    [offers, session.filters, session.sort],
  );

  if (urlKey === '') {
    return (
      <LandingView
        criteria={session.criteria}
        fieldErrors={session.fieldErrors}
        isPending={session.isPending}
        onChange={session.updateCriteria}
        onSubmit={session.submit}
      />
    );
  }

  return (
    <ResultsWorkspace
      criteria={session.criteria}
      query={query}
      offers={offers}
      visibleOffers={visibleOffers}
      facets={facets}
      meta={meta}
      error={error}
      fieldErrors={session.fieldErrors}
      filters={session.filters}
      sort={session.sort}
      isPending={session.isPending}
      dateGrid={dateGrid}
      bookingOffer={session.bookingOffer}
      mobileSheet={session.mobileSheet}
      onChange={session.updateCriteria}
      onSubmit={session.submit}
      onFiltersChange={(patch) => session.setFilters((current) => ({ ...current, ...patch }))}
      onFiltersReset={() => session.setFilters(NO_FILTERS)}
      onSortChange={session.setSort}
      onPickDate={session.pickDate}
      onSelectOffer={session.setBookingOffer}
      onMobileSheet={session.setMobileSheet}
      onRetry={session.retry}
    />
  );
}
