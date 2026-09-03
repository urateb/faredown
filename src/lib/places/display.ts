import { lookupAirport } from '@/lib/places/fallback-airports';
import { extractIataCode, formatPlaceLabel } from '@/lib/places/parse';

/**
 * Turns a bare IATA code (as stored in the URL) into the labelled form the
 * search field shows, falling back to the code itself when the local index
 * does not know it.
 */
export function displayAirport(value: string): string {
  const code = extractIataCode(value);
  if (!code) return value;
  const place = lookupAirport(code);
  return place ? formatPlaceLabel(place) : code;
}
