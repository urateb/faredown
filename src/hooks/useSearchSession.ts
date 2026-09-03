'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState, useTransition } from 'react';

import { addDays, daysBetween } from '@/lib/format';
import { NO_FILTERS, type Filters, type SortKey } from '@/lib/flights/refine';
import { toUrlQuery, validateCriteria, type SearchCriteria } from '@/lib/flights/search-params';
import type { Offer } from '@/lib/flights/types';
import { displayAirport } from '@/lib/places/display';
import { extractIataCode } from '@/lib/places/parse';

export type MobileSheet = 'filters' | 'insights' | null;

export function labelledCriteria(criteria: SearchCriteria): SearchCriteria {
  return {
    ...criteria,
    origin: displayAirport(criteria.origin),
    destination: displayAirport(criteria.destination),
  };
}

interface UseSearchSessionOptions {
  urlKey: string;
  criteriaFromUrl: SearchCriteria;
  serverFieldErrors?: Record<string, string>;
}

/**
 * Client session for a URL-driven search: form state, refinements, and navigation.
 *
 * The server owns the result set. This hook only validates, pushes a new URL,
 * and keeps filters scoped to the current `urlKey`.
 */
export function useSearchSession({
  urlKey,
  criteriaFromUrl,
  serverFieldErrors,
}: UseSearchSessionOptions) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [criteria, setCriteria] = useState<SearchCriteria>(() => labelledCriteria(criteriaFromUrl));
  const [syncedKey, setSyncedKey] = useState(urlKey);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>(serverFieldErrors ?? {});
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [sort, setSort] = useState<SortKey>('best');
  const [bookingOffer, setBookingOffer] = useState<Offer | null>(null);
  const [mobileSheet, setMobileSheet] = useState<MobileSheet>(null);

  if (syncedKey !== urlKey) {
    setSyncedKey(urlKey);
    setCriteria(labelledCriteria(criteriaFromUrl));
    setFieldErrors(serverFieldErrors ?? {});
    setFilters(NO_FILTERS);
  }

  const updateCriteria = useCallback((patch: Partial<SearchCriteria>) => {
    setCriteria((current) => ({ ...current, ...patch }));
    setFieldErrors((current) => {
      const next = { ...current };
      for (const key of Object.keys(patch)) delete next[key];
      return next;
    });
  }, []);

  const submit = useCallback(
    (next: SearchCriteria) => {
      const normalised: SearchCriteria = {
        ...next,
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

  const retry = useCallback(() => {
    startTransition(() => router.refresh());
  }, [router]);

  return {
    criteria,
    fieldErrors,
    filters,
    setFilters,
    sort,
    setSort,
    bookingOffer,
    setBookingOffer,
    mobileSheet,
    setMobileSheet,
    isPending,
    updateCriteria,
    submit,
    pickDate,
    retry,
  };
}
