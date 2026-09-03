import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE, SITE_URL } from '@/lib/brand';
import { formatDateLabel } from '@/lib/format';
import { displayAirport } from '@/lib/places/display';
import { extractIataCode } from '@/lib/places/parse';
import type { SearchCriteria } from '@/lib/flights/search-params';

export function searchDocumentTitle(criteria: SearchCriteria): string {
  const origin = extractIataCode(criteria.origin) || criteria.origin.toUpperCase();
  const destination = extractIataCode(criteria.destination) || criteria.destination.toUpperCase();
  const dates =
    criteria.tripType === 'round-trip' && criteria.returnDate
      ? `${formatDateLabel(criteria.departureDate)} – ${formatDateLabel(criteria.returnDate)}`
      : formatDateLabel(criteria.departureDate);
  return `${origin} → ${destination} · ${dates}`;
}

export function searchDocumentDescription(criteria: SearchCriteria): string {
  const origin = displayAirport(criteria.origin);
  const destination = displayAirport(criteria.destination);
  return `Live fares from ${origin} to ${destination}. Compare neighbouring dates and see whether this trip is actually a good price.`;
}

export function webAppJsonLd(): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
    },
    slogan: SITE_TAGLINE,
  };
}
