import 'server-only';

import type { Place } from '@/lib/flights/types';

import { searchFallbackAirports } from './fallback-airports';

export interface PlaceSearchResult {
  places: Place[];
  /** Always false: the bundled index is the source of truth. */
  degraded: boolean;
}

/**
 * Looks up airports and cities by keyword against the local index.
 *
 * The previous GDS self-service APIs either shut down or block signup from
 * Kosovo and Albania. The bundled list covers the airports people actually type,
 * including Pristina and Tirana, and any valid IATA code can still be entered
 * by hand.
 */
export async function searchPlaces(keyword: string, limit = 8): Promise<PlaceSearchResult> {
  const term = keyword.trim();
  if (term.length < 2) return { places: [], degraded: false };
  return { places: searchFallbackAirports(term, limit), degraded: false };
}
