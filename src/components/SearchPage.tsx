'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useMemo, useState, useTransition } from 'react';

import { FilterPanel } from '@/components/filters/FilterPanel';
import { FlexibleDates } from '@/components/insights/FlexibleDates';
import { PriceVsDuration } from '@/components/insights/PriceVsDuration';
import { Hero } from '@/components/layout/Hero';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { HowItWorks } from '@/components/marketing/HowItWorks';
import { BookingSheet } from '@/components/results/BookingSheet';
import { ResultsList } from '@/components/results/ResultsList';
import { SearchSummary } from '@/components/results/SearchSummary';
import {
  NoMatchesState,
  NoResultsState,
  ResultsSkeleton,
  SearchErrorState,
} from '@/components/results/states';
import { SearchForm } from '@/components/search/SearchForm';
import { Modal } from '@/components/ui/Modal';
import { useDateGrid } from '@/hooks/useDateGrid';
import { cn } from '@/lib/cn';
import type { AppErrorCode } from '@/lib/errors';
import { addDays, daysBetween, todayIsoDate } from '@/lib/format';
import {
  deriveFacets,
  isFilterActive,
  NO_FILTERS,
  refineOffers,
  SORT_KEYS,
  SORT_LABELS,
  type Filters,
  type SortKey,
} from '@/lib/flights/refine';
import {
  toUrlQuery,
  validateCriteria,
  type FlightSearchQuery,
  type SearchCriteria,
} from '@/lib/flights/search-params';
import type { Offer, SearchMeta } from '@/lib/flights/types';
import { POPULAR_ROUTES } from '@/lib/hero-slides';
import { displayAirport } from '@/lib/places/display';
import { extractIataCode } from '@/lib/places/parse';

export interface SearchPageError {
  code: AppErrorCode;
  message: string;
  retryable: boolean;
}

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
  const router = useRouter();
  // Navigation is wrapped in a transition so the current results stay on screen
  // and the form stays usable while the next search is fetched on the server.
  const [isPending, startTransition] = useTransition();

  const [criteria, setCriteria] = useState<SearchCriteria>(() => labelledCriteria(criteriaFromUrl));
  const [syncedKey, setSyncedKey] = useState(urlKey);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(serverFieldErrors ?? {});
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<SortKey>('best');
  const [bookingOffer, setBookingOffer] = useState<Offer | null>(null);
  const [mobileSheet, setMobileSheet] = useState<'filters' | 'insights' | null>(null);

  // A new server result means a new search: adopt its criteria and drop
  // refinements that were scoped to the previous result set. Adjusting during
  // render rather than in an effect keeps it to a single pass.
  if (syncedKey !== urlKey) {
    setSyncedKey(urlKey);
    setCriteria(labelledCriteria(criteriaFromUrl));
    setFieldErrors(serverFieldErrors ?? {});
    setFilters(NO_FILTERS);
  }

  const hasSearched = urlKey !== '';
  const dateGrid = useDateGrid(query, offers.length > 0);

  const updateCriteria = useCallback((patch: Partial<SearchCriteria>) => {
    setCriteria((current) => ({ ...current, ...patch }));
    // Clear messages for whichever fields were just corrected.
    setFieldErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }, []);

  /** Validates locally, then navigates — the server does the actual search. */
  const submit = useCallback(
    (next: SearchCriteria) => {
      const normalised: SearchCriteria = {
        ...next,
        // Fields hold "London (LHR)" for readability; the URL carries "LHR".
        origin: extractIataCode(next.origin) || next.origin,
        destination: extractIataCode(next.destination) || next.destination,
      };

      const result = validateCriteria(normalised);
      if (!result.ok) {
        setFieldErrors(result.fieldErrors);
        return;
      }

      setFieldErrors({});
      startTransition(() => router.push(`/?${toUrlQuery(normalised)}`));
    },
    [router],
  );

  /** Re-searches a neighbouring date, holding the trip length constant. */
  const pickDate = useCallback(
    (departureDate: string) => {
      const tripLength =
        criteria.tripType === 'round-trip' && criteria.returnDate
          ? daysBetween(criteria.departureDate, criteria.returnDate)
          : null;

      submit({
        ...criteria,
        departureDate,
        returnDate: tripLength === null ? criteria.returnDate : addDays(departureDate, tripLength),
      });
    },
    [criteria, submit],
  );

  const facets = useMemo(
    () => deriveFacets(offers, meta?.currency ?? 'EUR'),
    [offers, meta?.currency],
  );
  const visibleOffers = useMemo(() => refineOffers(offers, filters, sort), [offers, filters, sort]);

  if (!hasSearched) {
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
              onChange={updateCriteria}
              onSubmit={() => submit(criteria)}
              fieldErrors={fieldErrors}
              isLoading={isPending}
              variant="hero"
            />

            <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
              <span className="text-ink-500 text-xs font-medium tracking-widest uppercase">
                Try
              </span>
              {POPULAR_ROUTES.map((route) => (
                <button
                  key={route.label}
                  type="button"
                  onClick={() => {
                    const departureDate = addDays(todayIsoDate(), 30);
                    submit({
                      ...criteria,
                      origin: route.origin,
                      destination: route.destination,
                      departureDate,
                      returnDate: addDays(departureDate, 7),
                      tripType: 'round-trip',
                    });
                  }}
                  className="border-ink-700 text-ink-200 hover:border-ink-500 hover:bg-ink-800/80 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
                >
                  {route.label}
                </button>
              ))}
            </div>
          </main>
        </Hero>
        <HowItWorks />
        <SiteFooter />
      </div>
    );
  }

  const showResults = offers.length > 0 && !isPending;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <div className="border-ink-800 bg-ink-950/90 sticky top-14 z-30 border-b px-4 pt-3 pb-4 backdrop-blur-xl sm:px-6">
        <SearchForm
          criteria={criteria}
          onChange={updateCriteria}
          onSubmit={() => submit(criteria)}
          fieldErrors={fieldErrors}
          isLoading={isPending}
          variant="compact"
        />
      </div>

      <main id="main" className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-5 sm:px-6">
        {isPending && <ResultsSkeleton />}

        {!isPending && error && (
          <SearchErrorState error={error} onRetry={() => startTransition(() => router.refresh())} />
        )}

        {!isPending && !error && offers.length === 0 && <NoResultsState />}

        {showResults && (
          <div className="flex gap-6">
            <aside className="hidden w-64 shrink-0 xl:block">
              <div className="border-ink-800 bg-ink-900 sticky top-20 rounded-2xl border p-4">
                <FilterPanel
                  facets={facets}
                  filters={filters}
                  onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
                  onReset={() => setFilters(NO_FILTERS)}
                  matchCount={visibleOffers.length}
                />
              </div>
            </aside>

            <div className="min-w-0 flex-1">
              <SearchSummary criteria={criteria} searchedAt={meta?.searchedAt} />

              <div className="mb-4 flex gap-2 xl:hidden">
                <MobileSheetButton
                  label="Filters"
                  active={isFilterActive(filters)}
                  onClick={() => setMobileSheet('filters')}
                />
                <MobileSheetButton
                  label="Price insights"
                  onClick={() => setMobileSheet('insights')}
                />
              </div>

              <div className="mb-4">
                <FlexibleDates
                  grid={dateGrid.grid}
                  isLoading={dateGrid.isLoading}
                  onPickDate={pickDate}
                />
              </div>

              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-ink-400 text-sm" role="status" aria-live="polite">
                  <span className="text-ink-50 font-semibold">{visibleOffers.length}</span>{' '}
                  {visibleOffers.length === 1 ? 'flight' : 'flights'}
                  {visibleOffers.length !== offers.length && ` of ${offers.length}`}
                </p>

                <label className="flex items-center gap-2 text-sm">
                  <span className="text-ink-400">Sort by</span>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as SortKey)}
                    className="border-ink-700 bg-ink-900 text-ink-50 rounded-lg border py-1.5 pr-8 pl-2.5 font-medium"
                  >
                    {SORT_KEYS.map((key) => (
                      <option key={key} value={key}>
                        {SORT_LABELS[key]}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {visibleOffers.length === 0 ? (
                <NoMatchesState onClearFilters={() => setFilters(NO_FILTERS)} />
              ) : (
                <ResultsList
                  offers={visibleOffers}
                  travellers={query?.adults ?? 1}
                  onSelect={setBookingOffer}
                />
              )}
            </div>

            <aside className="hidden w-80 shrink-0 2xl:block">
              <div className="sticky top-20">
                <PriceVsDuration offers={visibleOffers} currency={facets.currency} />
              </div>
            </aside>
          </div>
        )}
      </main>

      <SiteFooter />

      {mobileSheet === 'filters' && (
        <Modal title="Filters" onClose={() => setMobileSheet(null)}>
          <FilterPanel
            facets={facets}
            filters={filters}
            onChange={(patch) => setFilters((current) => ({ ...current, ...patch }))}
            onReset={() => setFilters(NO_FILTERS)}
            matchCount={visibleOffers.length}
          />
        </Modal>
      )}

      {mobileSheet === 'insights' && (
        <Modal title="Price insights" onClose={() => setMobileSheet(null)}>
          <div className="space-y-4">
            <FlexibleDates
              grid={dateGrid.grid}
              isLoading={dateGrid.isLoading}
              onPickDate={(date) => {
                setMobileSheet(null);
                pickDate(date);
              }}
            />
            <PriceVsDuration offers={visibleOffers} currency={facets.currency} />
          </div>
        </Modal>
      )}

      {bookingOffer && query && (
        <BookingSheet
          offer={bookingOffer}
          onClose={() => setBookingOffer(null)}
          context={{
            origin: query.origin,
            destination: query.destination,
            departureDate: query.departureDate,
            returnDate: query.returnDate ?? null,
            adults: query.adults,
            cabin: query.cabin,
            carrier: bookingOffer.validatingCarrier,
          }}
        />
      )}
    </div>
  );
}

function labelledCriteria(criteria: SearchCriteria): SearchCriteria {
  return {
    ...criteria,
    origin: displayAirport(criteria.origin),
    destination: displayAirport(criteria.destination),
  };
}

function MobileSheetButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors',
        active
          ? 'border-brand-400/40 bg-brand-50 text-brand-300'
          : 'border-ink-800 text-ink-200 bg-ink-900',
      )}
    >
      {label}
    </button>
  );
}
