'use client';

import { FilterPanel } from '@/components/filters/FilterPanel';
import { FlexibleDates } from '@/components/insights/FlexibleDates';
import { PriceVsDuration } from '@/components/insights/PriceVsDuration';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { BookingSheet } from '@/components/results/BookingSheet';
import { ResultsList } from '@/components/results/ResultsList';
import { SearchSummary } from '@/components/results/SearchSummary';
import {
  NoMatchesState,
  NoResultsState,
  ResultsSkeleton,
  SearchErrorState,
} from '@/components/results/states';
import type { SearchPageError } from '@/components/search/types';
import { SearchForm } from '@/components/search/SearchForm';
import { Modal } from '@/components/ui/Modal';
import type { DateGridState } from '@/hooks/useDateGrid';
import type { MobileSheet } from '@/hooks/useSearchSession';
import { cn } from '@/lib/cn';
import {
  isFilterActive,
  SORT_KEYS,
  SORT_LABELS,
  type Facets,
  type Filters,
  type SortKey,
} from '@/lib/flights/refine';
import type { FlightSearchQuery, SearchCriteria } from '@/lib/flights/search-params';
import type { Offer, SearchMeta } from '@/lib/flights/types';

interface ResultsWorkspaceProps {
  criteria: SearchCriteria;
  query: FlightSearchQuery | null;
  offers: Offer[];
  visibleOffers: Offer[];
  facets: Facets;
  meta: SearchMeta | null;
  error: SearchPageError | null;
  fieldErrors: Record<string, string>;
  filters: Filters;
  sort: SortKey;
  isPending: boolean;
  dateGrid: DateGridState;
  bookingOffer: Offer | null;
  mobileSheet: MobileSheet;
  onChange: (patch: Partial<SearchCriteria>) => void;
  onSubmit: (next: SearchCriteria) => void;
  onFiltersChange: (patch: Partial<Filters>) => void;
  onFiltersReset: () => void;
  onSortChange: (sort: SortKey) => void;
  onPickDate: (date: string) => void;
  onSelectOffer: (offer: Offer | null) => void;
  onMobileSheet: (sheet: MobileSheet) => void;
  onRetry: () => void;
}

export function ResultsWorkspace({
  criteria,
  query,
  offers,
  visibleOffers,
  facets,
  meta,
  error,
  fieldErrors,
  filters,
  sort,
  isPending,
  dateGrid,
  bookingOffer,
  mobileSheet,
  onChange,
  onSubmit,
  onFiltersChange,
  onFiltersReset,
  onSortChange,
  onPickDate,
  onSelectOffer,
  onMobileSheet,
  onRetry,
}: ResultsWorkspaceProps) {
  const showResults = offers.length > 0 && !isPending;

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <div className="border-ink-800 bg-ink-950/80 sticky top-14 z-30 border-b px-4 pt-3 pb-4 backdrop-blur-xl sm:px-6">
        <SearchForm
          criteria={criteria}
          onChange={onChange}
          onSubmit={() => onSubmit(criteria)}
          fieldErrors={fieldErrors}
          isLoading={isPending}
          variant="compact"
        />
      </div>

      <main id="main" className="mx-auto w-full max-w-[88rem] flex-1 px-4 py-5 sm:px-6">
        {isPending && <ResultsSkeleton />}

        {!isPending && error && <SearchErrorState error={error} onRetry={onRetry} />}

        {!isPending && !error && offers.length === 0 && <NoResultsState />}

        {showResults && (
          <div className="flex gap-6">
            <aside className="hidden w-64 shrink-0 xl:block">
              <div className="border-ink-800 sticky top-20 rounded-2xl border bg-white/80 p-4 shadow-[0_10px_30px_-18px_rgb(40_70_110_/_0.22)]">
                <FilterPanel
                  facets={facets}
                  filters={filters}
                  onChange={onFiltersChange}
                  onReset={onFiltersReset}
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
                  onClick={() => onMobileSheet('filters')}
                />
                <MobileSheetButton
                  label="Price insights"
                  onClick={() => onMobileSheet('insights')}
                />
              </div>

              <div className="mb-4">
                <FlexibleDates
                  grid={dateGrid.grid}
                  isLoading={dateGrid.isLoading}
                  onPickDate={onPickDate}
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
                    onChange={(event) => onSortChange(event.target.value as SortKey)}
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
                <NoMatchesState onClearFilters={onFiltersReset} />
              ) : (
                <ResultsList
                  offers={visibleOffers}
                  travellers={query?.adults ?? 1}
                  onSelect={onSelectOffer}
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
        <Modal title="Filters" onClose={() => onMobileSheet(null)}>
          <FilterPanel
            facets={facets}
            filters={filters}
            onChange={onFiltersChange}
            onReset={onFiltersReset}
            matchCount={visibleOffers.length}
          />
        </Modal>
      )}

      {mobileSheet === 'insights' && (
        <Modal title="Price insights" onClose={() => onMobileSheet(null)}>
          <div className="space-y-4">
            <FlexibleDates
              grid={dateGrid.grid}
              isLoading={dateGrid.isLoading}
              onPickDate={(date) => {
                onMobileSheet(null);
                onPickDate(date);
              }}
            />
            <PriceVsDuration offers={visibleOffers} currency={facets.currency} />
          </div>
        </Modal>
      )}

      {bookingOffer && query && (
        <BookingSheet
          offer={bookingOffer}
          onClose={() => onSelectOffer(null)}
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
