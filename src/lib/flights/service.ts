import 'server-only';

import { serpApiSearch } from '@/lib/serpapi/client';
import type { SerpApiSearchResponse } from '@/lib/serpapi/types';
import { TtlCache } from '@/lib/cache';
import { mapWithConcurrency } from '@/lib/concurrency';
import { AppError } from '@/lib/errors';
import { addDays, daysBetween } from '@/lib/format';

import { normalizeFlightOffers } from './normalize';
import type { FlightSearchQuery } from './search-params';
import type { DateGrid, DatePrice, SearchResponse } from './types';

/** Repeat searches within this window never leave the server. */
const searchCache = new TtlCache<SerpApiSearchResponse>({ ttlMs: 15 * 60_000, maxEntries: 200 });
const dateGridCache = new TtlCache<{ price: number; currency: string } | null>({
  ttlMs: 30 * 60_000,
  maxEntries: 1_000,
});

/** Three neighbouring days — extra cells only run when the search cache misses. */
export const DATE_GRID_RADIUS = 1;
const DATE_GRID_CONCURRENCY = 1;

type SearchKey = {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabin: FlightSearchQuery['cabin'];
  currency: string;
  nonStop: boolean;
};

function cacheKey(params: SearchKey): string {
  return JSON.stringify(params);
}

function toSearchKey(query: FlightSearchQuery): SearchKey {
  return {
    origin: query.origin,
    destination: query.destination,
    departureDate: query.departureDate,
    ...(query.returnDate ? { returnDate: query.returnDate } : {}),
    adults: query.adults,
    cabin: query.cabin,
    currency: query.currency,
    nonStop: query.nonStop,
  };
}

async function rawSearch(params: SearchKey): Promise<SerpApiSearchResponse> {
  return searchCache.fetch(cacheKey(params), () =>
    serpApiSearch({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      returnDate: params.returnDate,
      adults: params.adults,
      cabin: params.cabin,
      currency: params.currency,
      nonStop: params.nonStop,
    }),
  );
}

export async function searchFlights(query: FlightSearchQuery): Promise<SearchResponse> {
  const params = toSearchKey(query);
  const response = await rawSearch(params);
  let offers = normalizeFlightOffers(response, query.adults, query.currency);
  if (query.nonStop) offers = offers.filter((offer) => offer.stopCount === 0);
  offers = offers.slice(0, query.max);

  return {
    offers,
    meta: {
      currency: offers[0]?.totalPrice.currency ?? query.currency,
      resultCount: offers.length,
      searchedAt: new Date().toISOString(),
      isTestData: false,
    },
  };
}

async function cheapestFareOn(
  query: FlightSearchQuery,
  departureDate: string,
  returnDate: string | undefined,
): Promise<{ price: number; currency: string } | null> {
  const params: SearchKey = {
    ...toSearchKey(query),
    departureDate,
    ...(returnDate ? { returnDate } : {}),
  };

  return dateGridCache.fetch(cacheKey(params), async () => {
    try {
      const response = await rawSearch(params);
      const offers = normalizeFlightOffers(response, query.adults, query.currency);
      if (offers.length === 0) return null;
      const cheapest = offers.reduce((best, offer) =>
        offer.totalPrice.amount < best.totalPrice.amount ? offer : best,
      );
      return { price: cheapest.totalPrice.amount, currency: cheapest.totalPrice.currency };
    } catch (error) {
      if (error instanceof AppError && error.code === 'configuration') throw error;
      return null;
    }
  });
}

export async function buildDateGrid(
  query: FlightSearchQuery,
  radius: number = DATE_GRID_RADIUS,
): Promise<DateGrid> {
  const tripLength = query.returnDate ? daysBetween(query.departureDate, query.returnDate) : null;

  const offsets = Array.from({ length: radius * 2 + 1 }, (_, index) => index - radius);
  const candidates = offsets
    .map((offset) => addDays(query.departureDate, offset))
    .filter((date) => date >= todayForGrid());

  const quotes = await mapWithConcurrency(candidates, DATE_GRID_CONCURRENCY, (date) =>
    cheapestFareOn(query, date, tripLength === null ? undefined : addDays(date, tripLength)),
  );

  const days: DatePrice[] = candidates.map((date, index) => ({
    date,
    price: quotes[index]?.price ?? null,
    isSelected: date === query.departureDate,
  }));

  const priced = days.filter((day): day is DatePrice & { price: number } => day.price !== null);
  const cheapest = priced.reduce<(DatePrice & { price: number }) | null>(
    (best, day) => (best === null || day.price < best.price ? day : best),
    null,
  );
  const selected = priced.find((day) => day.isSelected) ?? null;
  const currency = quotes.find((quote) => quote !== null)?.currency ?? query.currency;

  return {
    currency,
    days,
    cheapestDate: cheapest?.date ?? null,
    savingsVsSelected:
      cheapest && selected && cheapest.price < selected.price
        ? Math.round(selected.price - cheapest.price)
        : null,
  };
}

function todayForGrid(): string {
  return new Date().toISOString().slice(0, 10);
}

export function resetFlightCaches(): void {
  searchCache.clear();
  dateGridCache.clear();
}
