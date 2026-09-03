import { minutesIntoDay } from '@/lib/format';

import type { Carrier, Offer } from './types';

export const SORT_KEYS = ['best', 'cheapest', 'fastest', 'earliest'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export const SORT_LABELS: Record<SortKey, string> = {
  best: 'Best',
  cheapest: 'Cheapest',
  fastest: 'Fastest',
  earliest: 'Earliest departure',
};

export interface Filters {
  /** Upper bound on stops in the worst leg. `null` means no limit. */
  maxStops: number | null;
  /** Marketing carrier codes to keep. Empty means every airline. */
  carriers: string[];
  maxPrice: number | null;
  maxDurationMinutes: number | null;
  /** Inclusive outbound departure window, in minutes past local midnight. */
  departureWindow: [number, number] | null;
}

export const NO_FILTERS: Filters = {
  maxStops: null,
  carriers: [],
  maxPrice: null,
  maxDurationMinutes: null,
  departureWindow: null,
};

export function isFilterActive(filters: Filters): boolean {
  return (
    filters.maxStops !== null ||
    filters.carriers.length > 0 ||
    filters.maxPrice !== null ||
    filters.maxDurationMinutes !== null ||
    filters.departureWindow !== null
  );
}

/** Every marketing carrier across every leg of an offer. */
export function offerCarriers(offer: Offer): Carrier[] {
  const seen = new Map<string, Carrier>();
  for (const leg of offer.legs) {
    for (const carrier of leg.carriers) {
      if (!seen.has(carrier.code)) seen.set(carrier.code, carrier);
    }
  }
  return [...seen.values()];
}

export function outboundDepartureMinutes(offer: Offer): number {
  const outbound = offer.legs[0];
  return outbound ? minutesIntoDay(outbound.departure.at) : 0;
}

export function matchesFilters(offer: Offer, filters: Filters): boolean {
  if (filters.maxStops !== null && offer.stopCount > filters.maxStops) return false;
  if (filters.maxPrice !== null && offer.totalPrice.amount > filters.maxPrice) return false;
  if (
    filters.maxDurationMinutes !== null &&
    offer.totalDurationMinutes > filters.maxDurationMinutes
  ) {
    return false;
  }
  if (filters.carriers.length > 0) {
    const codes = offerCarriers(offer).map((carrier) => carrier.code);
    if (!codes.some((code) => filters.carriers.includes(code))) return false;
  }
  if (filters.departureWindow) {
    const [from, to] = filters.departureWindow;
    const departure = outboundDepartureMinutes(offer);
    if (departure < from || departure > to) return false;
  }
  return true;
}

/* ------------------------------------------------------------------ *
 * Ranking
 * ------------------------------------------------------------------ */

const PRICE_WEIGHT = 0.6;
const DURATION_WEIGHT = 0.4;
/** Each connection costs the equivalent of 4% of the score spread. */
const STOP_PENALTY = 0.04;

function normalise(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return (value - min) / (max - min);
}

/**
 * Blends price and total travel time into a single 0–1 score, lower being
 * better, with a small penalty per connection.
 *
 * The point is to avoid the trap of "cheapest" — a €40 saving is rarely worth a
 * 14-hour layover — while staying simple enough to explain to a user.
 */
export function scoreOffers(offers: Offer[]): Map<string, number> {
  const scores = new Map<string, number>();
  if (offers.length === 0) return scores;

  const prices = offers.map((offer) => offer.totalPrice.amount);
  const durations = offers.map((offer) => offer.totalDurationMinutes);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);

  for (const offer of offers) {
    const score =
      normalise(offer.totalPrice.amount, minPrice, maxPrice) * PRICE_WEIGHT +
      normalise(offer.totalDurationMinutes, minDuration, maxDuration) * DURATION_WEIGHT +
      offer.stopCount * STOP_PENALTY;
    scores.set(offer.id, score);
  }
  return scores;
}

export function sortOffers(offers: Offer[], sort: SortKey): Offer[] {
  const sorted = [...offers];

  switch (sort) {
    case 'cheapest':
      sorted.sort(
        (a, b) =>
          a.totalPrice.amount - b.totalPrice.amount ||
          a.totalDurationMinutes - b.totalDurationMinutes,
      );
      break;
    case 'fastest':
      sorted.sort(
        (a, b) =>
          a.totalDurationMinutes - b.totalDurationMinutes ||
          a.totalPrice.amount - b.totalPrice.amount,
      );
      break;
    case 'earliest':
      sorted.sort(
        (a, b) =>
          outboundDepartureMinutes(a) - outboundDepartureMinutes(b) ||
          a.totalPrice.amount - b.totalPrice.amount,
      );
      break;
    case 'best': {
      const scores = scoreOffers(sorted);
      sorted.sort(
        (a, b) =>
          (scores.get(a.id) ?? 0) - (scores.get(b.id) ?? 0) ||
          a.totalPrice.amount - b.totalPrice.amount,
      );
      break;
    }
  }

  return sorted;
}

export function refineOffers(offers: Offer[], filters: Filters, sort: SortKey): Offer[] {
  return sortOffers(
    offers.filter((offer) => matchesFilters(offer, filters)),
    sort,
  );
}

/* ------------------------------------------------------------------ *
 * Facets
 * ------------------------------------------------------------------ */

export interface StopFacet {
  stops: number;
  label: string;
  count: number;
  cheapest: number;
}

export interface CarrierFacet {
  code: string;
  name: string;
  count: number;
  cheapest: number;
}

export interface Facets {
  priceRange: [number, number];
  durationRange: [number, number];
  stops: StopFacet[];
  carriers: CarrierFacet[];
  currency: string;
}

function stopLabel(stops: number): string {
  if (stops === 0) return 'Direct';
  if (stops === 1) return '1 stop';
  return `${stops} stops`;
}

/**
 * Summarises what is available in a result set.
 *
 * Always derived from the unfiltered offers, so options never vanish from the
 * sidebar as the traveller narrows things down — unticking the last airline
 * would otherwise leave nothing to tick again.
 */
export function deriveFacets(offers: Offer[], fallbackCurrency: string): Facets {
  if (offers.length === 0) {
    return {
      priceRange: [0, 0],
      durationRange: [0, 0],
      stops: [],
      carriers: [],
      currency: fallbackCurrency,
    };
  }

  const prices = offers.map((offer) => offer.totalPrice.amount);
  const durations = offers.map((offer) => offer.totalDurationMinutes);

  const stopBuckets = new Map<number, { count: number; cheapest: number }>();
  const carrierBuckets = new Map<string, { name: string; count: number; cheapest: number }>();

  for (const offer of offers) {
    const price = offer.totalPrice.amount;

    const stopBucket = stopBuckets.get(offer.stopCount);
    if (stopBucket) {
      stopBucket.count += 1;
      stopBucket.cheapest = Math.min(stopBucket.cheapest, price);
    } else {
      stopBuckets.set(offer.stopCount, { count: 1, cheapest: price });
    }

    for (const carrier of offerCarriers(offer)) {
      const carrierBucket = carrierBuckets.get(carrier.code);
      if (carrierBucket) {
        carrierBucket.count += 1;
        carrierBucket.cheapest = Math.min(carrierBucket.cheapest, price);
      } else {
        carrierBuckets.set(carrier.code, { name: carrier.name, count: 1, cheapest: price });
      }
    }
  }

  return {
    priceRange: [Math.floor(Math.min(...prices)), Math.ceil(Math.max(...prices))],
    durationRange: [Math.min(...durations), Math.max(...durations)],
    stops: [...stopBuckets.entries()]
      .map(([stops, bucket]) => ({ stops, label: stopLabel(stops), ...bucket }))
      .sort((a, b) => a.stops - b.stops),
    carriers: [...carrierBuckets.entries()]
      .map(([code, bucket]) => ({ code, ...bucket }))
      .sort((a, b) => a.cheapest - b.cheapest || a.name.localeCompare(b.name)),
    currency: offers[0]?.totalPrice.currency ?? fallbackCurrency,
  };
}
