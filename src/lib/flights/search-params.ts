import { z } from 'zod';

import { DEFAULT_CURRENCY } from '@/lib/env';
import { CURRENCIES, isCurrencyCode, type CurrencyCode } from '@/lib/flights/currencies';
import { addDays, todayIsoDate } from '@/lib/format';

export const CABIN_CLASSES = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'] as const;
export type CabinClass = (typeof CABIN_CLASSES)[number];

export const TRIP_TYPES = ['round-trip', 'one-way'] as const;
export type TripType = (typeof TRIP_TYPES)[number];

export const MAX_ADULTS = 9;

const iataCode = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^[A-Z]{3}$/, 'Use a 3-letter airport or city code');

const isoDate = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use the format YYYY-MM-DD');

function defaultCurrency(): CurrencyCode {
  return isCurrencyCode(DEFAULT_CURRENCY) ? DEFAULT_CURRENCY : 'EUR';
}

/**
 * The contract for `GET /api/flights/search`.
 *
 * Shared by the route handler and the client so a search can only be built one
 * way, and so validation messages are written once.
 */
export const flightSearchQuerySchema = z
  .object({
    origin: iataCode,
    destination: iataCode,
    departureDate: isoDate,
    returnDate: isoDate.optional(),
    adults: z.coerce.number().int().min(1).max(MAX_ADULTS).default(1),
    cabin: z.enum(CABIN_CLASSES).default('ECONOMY'),
    nonStop: z
      .union([z.boolean(), z.enum(['true', 'false'])])
      .transform((value) => value === true || value === 'true')
      .default(false),
    currency: z.enum(CURRENCIES).default(defaultCurrency()),
    max: z.coerce.number().int().min(1).max(250).default(60),
  })
  .refine((value) => value.origin !== value.destination, {
    message: 'Origin and destination must be different',
    path: ['destination'],
  })
  .refine((value) => value.departureDate >= todayIsoDate(), {
    message: 'Choose a departure date that has not already passed',
    path: ['departureDate'],
  })
  .refine((value) => !value.returnDate || value.returnDate >= value.departureDate, {
    message: 'The return date must be on or after the departure date',
    path: ['returnDate'],
  });

export type FlightSearchQuery = z.infer<typeof flightSearchQuerySchema>;

/** What the search form holds. Looser than the validated query: fields can be blank mid-edit. */
export interface SearchCriteria {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  adults: number;
  cabin: CabinClass;
  tripType: TripType;
  nonStop: boolean;
  currency: CurrencyCode;
}

/** A usable blank form: dates sit a few weeks out, which is where fares settle. */
export function defaultCriteria(): SearchCriteria {
  const departureDate = addDays(todayIsoDate(), 21);
  return {
    origin: '',
    destination: '',
    departureDate,
    returnDate: addDays(departureDate, 7),
    adults: 1,
    cabin: 'ECONOMY',
    tripType: 'round-trip',
    nonStop: false,
    currency: defaultCurrency(),
  };
}

/**
 * Validates form state against the API contract.
 *
 * Returns field-keyed messages rather than a thrown error so the form can mark
 * individual inputs.
 */
export function validateCriteria(
  criteria: SearchCriteria,
): { ok: true; query: FlightSearchQuery } | { ok: false; fieldErrors: Record<string, string> } {
  const result = flightSearchQuerySchema.safeParse({
    origin: criteria.origin,
    destination: criteria.destination,
    departureDate: criteria.departureDate,
    // A round trip needs a return date; a one-way must not send one, even if
    // the field still holds a value from before the traveller switched.
    returnDate: criteria.tripType === 'round-trip' ? criteria.returnDate || undefined : undefined,
    adults: criteria.adults,
    cabin: criteria.cabin,
    nonStop: criteria.nonStop,
    currency: criteria.currency,
  });

  if (result.success) {
    if (criteria.tripType === 'round-trip' && !result.data.returnDate) {
      return { ok: false, fieldErrors: { returnDate: 'Pick a return date' } };
    }
    return { ok: true, query: result.data };
  }

  const fieldErrors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    const field = typeof key === 'string' ? key : 'form';
    fieldErrors[field] ??= issue.message;
  }

  if (!criteria.origin) fieldErrors.origin = 'Where are you flying from?';
  if (!criteria.destination) fieldErrors.destination = 'Where are you flying to?';
  if (!criteria.departureDate) fieldErrors.departureDate = 'Pick a departure date';
  if (criteria.tripType === 'round-trip' && !criteria.returnDate) {
    fieldErrors.returnDate = 'Pick a return date';
  }

  return { ok: false, fieldErrors };
}

/** Serialises a validated query for the internal search endpoint. */
export function toApiSearchParams(query: FlightSearchQuery): URLSearchParams {
  const params = new URLSearchParams({
    origin: query.origin,
    destination: query.destination,
    departureDate: query.departureDate,
    adults: String(query.adults),
    cabin: query.cabin,
    nonStop: String(query.nonStop),
    currency: query.currency,
  });
  if (query.returnDate) params.set('returnDate', query.returnDate);
  return params;
}

/**
 * Serialises criteria for the address bar.
 *
 * Only the search itself is encoded — the inputs that define which offers exist.
 * Post-search refinements stay in memory, so a shared link always reproduces the
 * same result set rather than someone else's narrowed view of it.
 */
export function toUrlQuery(criteria: SearchCriteria): URLSearchParams {
  const params = new URLSearchParams({
    from: criteria.origin,
    to: criteria.destination,
    depart: criteria.departureDate,
    adults: String(criteria.adults),
    trip: criteria.tripType,
  });
  if (criteria.tripType === 'round-trip' && criteria.returnDate) {
    params.set('return', criteria.returnDate);
  }
  if (criteria.cabin !== 'ECONOMY') params.set('cabin', criteria.cabin);
  if (criteria.nonStop) params.set('direct', 'true');
  if (criteria.currency !== defaultCurrency()) params.set('currency', criteria.currency);
  return params;
}

function pickEnum<T extends readonly string[]>(
  value: string | null,
  allowed: T,
  fallback: T[number],
): T[number] {
  return value && (allowed as readonly string[]).includes(value) ? (value as T[number]) : fallback;
}

/** Rebuilds criteria from the address bar. Returns null when no search is encoded. */
export function fromUrlQuery(params: URLSearchParams): SearchCriteria | null {
  const origin = params.get('from');
  const destination = params.get('to');
  const departureDate = params.get('depart');
  if (!origin || !destination || !departureDate) return null;

  const adults = Number.parseInt(params.get('adults') ?? '1', 10);

  return {
    origin: origin.toUpperCase(),
    destination: destination.toUpperCase(),
    departureDate,
    returnDate: params.get('return') ?? '',
    adults: Number.isFinite(adults) ? Math.min(Math.max(adults, 1), MAX_ADULTS) : 1,
    cabin: pickEnum(params.get('cabin'), CABIN_CLASSES, 'ECONOMY'),
    tripType: pickEnum(
      params.get('trip'),
      TRIP_TYPES,
      params.get('return') ? 'round-trip' : 'one-way',
    ),
    nonStop: params.get('direct') === 'true',
    currency: pickEnum(params.get('currency'), CURRENCIES, defaultCurrency()),
  };
}
