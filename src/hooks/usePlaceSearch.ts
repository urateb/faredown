'use client';

import { useEffect, useState } from 'react';

import { apiGet } from '@/lib/api-client';
import type { Place } from '@/lib/flights/types';
import { searchFallbackAirports } from '@/lib/places/fallback-airports';

import { useDebouncedValue } from './useDebouncedValue';

interface PlacesResponse {
  places: Place[];
  degraded: boolean;
}

export interface PlaceSearchState {
  places: Place[];
  isLoading: boolean;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 220;

/**
 * Airport lookup for the search fields.
 *
 * Renders local matches on the first keystroke and swaps in provider results
 * when they land, so the list is never empty while a request is in flight.
 *
 * Results are stored together with the query that produced them. That single
 * decision removes the need to reset anything: a response is simply ignored
 * unless it belongs to the term currently in the box, which covers both stale
 * responses arriving out of order and the field being cleared.
 */
export function usePlaceSearch(query: string): PlaceSearchState {
  const trimmed = query.trim();
  const debounced = useDebouncedValue(trimmed, DEBOUNCE_MS);

  const [result, setResult] = useState<{ query: string; places: Place[] } | null>(null);

  useEffect(() => {
    if (debounced.length < MIN_QUERY_LENGTH) return;

    const controller = new AbortController();

    apiGet<PlacesResponse>('/api/places', new URLSearchParams({ q: debounced }), controller.signal)
      .then((response) => {
        if (!controller.signal.aborted) setResult({ query: debounced, places: response.places });
      })
      // A lookup failure is not worth surfacing: the local index still answers.
      .catch(() => {
        if (!controller.signal.aborted) setResult({ query: debounced, places: [] });
      });

    return () => controller.abort();
  }, [debounced]);

  const local = trimmed.length >= MIN_QUERY_LENGTH ? searchFallbackAirports(trimmed) : [];
  const isCurrent = result !== null && result.query === debounced && debounced === trimmed;

  return {
    places: isCurrent && result.places.length > 0 ? result.places : local,
    isLoading: trimmed.length >= MIN_QUERY_LENGTH && !isCurrent,
  };
}
