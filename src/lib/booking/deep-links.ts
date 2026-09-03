import type { CabinClass } from '@/lib/flights/search-params';
import type { Carrier } from '@/lib/flights/types';

import { airlineBookingSite } from './airlines';

/**
 * Faredown does not sell tickets. It compares fares and then hands the traveller
 * off to somewhere that does, with the route and dates already filled in.
 *
 * Every builder below is a pure function of the search so the links can be
 * asserted in tests instead of clicked through by hand.
 */
export interface BookingContext {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string | null;
  adults: number;
  cabin: CabinClass;
  carrier?: Carrier | null;
}

export type BookingProvider = 'google-flights' | 'kayak' | 'skyscanner' | 'airline';

export interface BookingLink {
  provider: BookingProvider;
  label: string;
  /** Sets expectations about what the traveller will land on. */
  hint: string;
  url: string;
}

const KAYAK_CABIN: Record<CabinClass, string> = {
  ECONOMY: '',
  PREMIUM_ECONOMY: '/premium',
  BUSINESS: '/business',
  FIRST: '/first',
};

const SKYSCANNER_CABIN: Record<CabinClass, string> = {
  ECONOMY: 'economy',
  PREMIUM_ECONOMY: 'premiumeconomy',
  BUSINESS: 'business',
  FIRST: 'first',
};

const GOOGLE_CABIN: Record<CabinClass, string> = {
  ECONOMY: '',
  PREMIUM_ECONOMY: ' premium economy',
  BUSINESS: ' business class',
  FIRST: ' first class',
};

/** `2026-10-01` -> `261001`, the compact form Skyscanner uses in its paths. */
function toShortDate(isoDate: string): string {
  return isoDate.replace(/-/g, '').slice(2);
}

export function googleFlightsUrl(context: BookingContext): string {
  // Google Flights reliably parses a natural-language query; its structured
  // `tfs` parameter is an undocumented protobuf blob and not worth depending on.
  const parts = [
    `Flights from ${context.origin} to ${context.destination}`,
    `on ${context.departureDate}`,
  ];
  if (context.returnDate) parts.push(`through ${context.returnDate}`);
  if (context.adults > 1) parts.push(`for ${context.adults} adults`);

  const query = `${parts.join(' ')}${GOOGLE_CABIN[context.cabin]}`;
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(query)}`;
}

export function kayakUrl(context: BookingContext): string {
  const dates = context.returnDate
    ? `${context.departureDate}/${context.returnDate}`
    : context.departureDate;
  const route = `${context.origin}-${context.destination}`;
  const travelers = `/${context.adults}adults`;
  return `https://www.kayak.com/flights/${route}/${dates}${travelers}${
    KAYAK_CABIN[context.cabin]
  }?sort=price_a`;
}

export function skyscannerUrl(context: BookingContext): string {
  const origin = context.origin.toLowerCase();
  const destination = context.destination.toLowerCase();
  const dates = context.returnDate
    ? `${toShortDate(context.departureDate)}/${toShortDate(context.returnDate)}`
    : toShortDate(context.departureDate);
  const params = new URLSearchParams({
    adults: String(context.adults),
    cabinclass: SKYSCANNER_CABIN[context.cabin],
  });
  return `https://www.skyscanner.net/transport/flights/${origin}/${destination}/${dates}/?${params}`;
}

/**
 * Builds the hand-off options for an itinerary, cheapest-to-book first.
 *
 * The airline's own site is listed first when known: booking direct is usually
 * the better outcome for the traveller when a change or refund is needed.
 */
export function buildBookingLinks(context: BookingContext): BookingLink[] {
  const links: BookingLink[] = [];

  const carrierCode = context.carrier?.code;
  const airlineSite = carrierCode ? airlineBookingSite(carrierCode) : null;
  if (airlineSite && context.carrier) {
    links.push({
      provider: 'airline',
      label: `Book direct with ${context.carrier.name}`,
      hint: 'Opens the airline’s booking page — you will need to re-enter the route',
      url: airlineSite,
    });
  }

  links.push(
    {
      provider: 'google-flights',
      label: 'Compare on Google Flights',
      hint: 'Route and dates prefilled',
      url: googleFlightsUrl(context),
    },
    {
      provider: 'kayak',
      label: 'Compare on Kayak',
      hint: 'Route and dates prefilled',
      url: kayakUrl(context),
    },
    {
      provider: 'skyscanner',
      label: 'Compare on Skyscanner',
      hint: 'Route and dates prefilled',
      url: skyscannerUrl(context),
    },
  );

  return links;
}
