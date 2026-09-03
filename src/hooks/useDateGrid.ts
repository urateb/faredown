'use client';

import { useEffect, useState } from 'react';

import { apiGet } from '@/lib/api-client';
import { toApiSearchParams, type FlightSearchQuery } from '@/lib/flights/search-params';
import type { DateGrid } from '@/lib/flights/types';

export interface DateGridState {
  grid: DateGrid | null;
  isLoading: boolean;
  failed: boolean;
}

const IDLE: DateGridState = { grid: null, isLoading: false, failed: false };

/**
 * Loads the price of the days either side of the chosen departure.
 *
 * Runs automatically once a search succeeds, because "is this date the cheap
 * one?" is the question the product exists to answer and burying it behind a
 * button would mean most people never see it. It costs several upstream calls,
 * which is why the server caches each day for half an hour and the endpoint is
 * rate limited more tightly than plain search.
 *
 * A failure is deliberately quiet: the grid is context, not the result, and the
 * flight list stands on its own without it.
 */
export function useDateGrid(query: FlightSearchQuery | null, enabled: boolean): DateGridState {
  // Keyed by the trip itself so an equivalent query object does not refetch,
  // and a response for a superseded trip is ignored rather than reset away.
  const key = query ? toApiSearchParams(query).toString() : null;

  const [result, setResult] = useState<{ key: string; grid: DateGrid | null } | null>(null);

  useEffect(() => {
    if (!enabled || !query || !key) return;

    const controller = new AbortController();

    apiGet<DateGrid>('/api/flights/date-grid', toApiSearchParams(query), controller.signal)
      .then((grid) => {
        if (!controller.signal.aborted) setResult({ key, grid });
      })
      .catch(() => {
        if (!controller.signal.aborted) setResult({ key, grid: null });
      });

    return () => controller.abort();
    // `key` already encodes every field of `query` that affects the request.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled]);

  if (!enabled || !key) return IDLE;

  const isCurrent = result !== null && result.key === key;
  if (!isCurrent) return { grid: null, isLoading: true, failed: false };

  return { grid: result.grid, isLoading: false, failed: result.grid === null };
}
