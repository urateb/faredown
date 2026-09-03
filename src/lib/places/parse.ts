import type { Place } from '@/lib/flights/types';

const TRAILING_CODE = /\(([A-Za-z]{3})\)\s*$/;
const BARE_CODE = /^[A-Za-z]{3}$/;

/** `London Heathrow (LHR)` -> `LHR`. Returns `''` when no code is present. */
export function extractIataCode(input: string): string {
  const trailing = TRAILING_CODE.exec(input);
  if (trailing?.[1]) return trailing[1].toUpperCase();

  const trimmed = input.trim();
  // Travellers who know the code often just type it.
  if (BARE_CODE.test(trimmed)) return trimmed.toUpperCase();

  return '';
}

/** The text shown in the field once a place is chosen. */
export function formatPlaceLabel(place: Place): string {
  return `${place.cityName} (${place.iataCode})`;
}

/** The secondary line in the suggestion list. */
export function describePlace(place: Place): string {
  const parts = place.kind === 'city' ? ['All airports'] : [place.name];
  if (place.countryName) parts.push(place.countryName);
  return parts.filter(Boolean).join(' · ');
}
