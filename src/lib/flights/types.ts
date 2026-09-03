/**
 * The app's own flight model. Everything downstream of `normalize.ts` — UI,
 * filters, sorting, tests — speaks this shape rather than the provider's, so a
 * change of data provider stays contained to the adapter layer.
 */

export interface Money {
  amount: number;
  currency: string;
}

export interface Carrier {
  code: string;
  name: string;
}

/**
 * A departure or arrival. `at` is the airport's own wall-clock time with no
 * offset, exactly as airlines publish it — never convert it to the viewer's
 * timezone, or an 18:35 departure from Heathrow starts reading as 13:35.
 */
export interface FlightEndpoint {
  iataCode: string;
  terminal: string | null;
  at: string;
}

export interface Segment {
  id: string;
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  marketingCarrier: Carrier;
  /** Set only when a different airline actually operates the flight. */
  operatingCarrier: Carrier | null;
  flightNumber: string;
  aircraft: string | null;
  durationMinutes: number;
  cabin: string | null;
}

export interface Layover {
  iataCode: string;
  durationMinutes: number;
}

export type LegKind = 'outbound' | 'inbound';

export interface Leg {
  kind: LegKind;
  segments: Segment[];
  departure: FlightEndpoint;
  arrival: FlightEndpoint;
  durationMinutes: number;
  stopCount: number;
  layovers: Layover[];
  /** Calendar days between departure and arrival, for the "+1" arrival badge. */
  dayOffset: number;
  carriers: Carrier[];
}

export interface Offer {
  id: string;
  totalPrice: Money;
  pricePerTraveler: Money;
  legs: Leg[];
  validatingCarrier: Carrier;
  seatsRemaining: number | null;
  cabin: string | null;
  includedCheckedBags: number | null;
  /** Time in the air and on the ground, summed across every leg. */
  totalDurationMinutes: number;
  /** Worst stop count across legs — what travellers actually care about. */
  stopCount: number;
}

export interface SearchMeta {
  currency: string;
  resultCount: number;
  searchedAt: string;
  /** True when results are simulated rather than live inventory. */
  isTestData: boolean;
}

export interface SearchResponse {
  offers: Offer[];
  meta: SearchMeta;
}

/* ------------------------------------------------------------------ *
 * Places
 * ------------------------------------------------------------------ */

export interface Place {
  iataCode: string;
  /** Airport name, or the city name for a metropolitan-area code. */
  name: string;
  cityName: string;
  countryName: string;
  countryCode: string;
  kind: 'airport' | 'city';
}

/* ------------------------------------------------------------------ *
 * Flexible dates
 * ------------------------------------------------------------------ */

export interface DatePrice {
  /** ISO date, `YYYY-MM-DD`. */
  date: string;
  price: number | null;
  /** True for the date the traveller actually searched. */
  isSelected: boolean;
}

export interface DateGrid {
  currency: string;
  days: DatePrice[];
  cheapestDate: string | null;
  /** Money saved by moving to the cheapest day, versus the searched day. */
  savingsVsSelected: number | null;
}
