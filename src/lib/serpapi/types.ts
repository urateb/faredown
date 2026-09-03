/**
 * The slice of SerpApi's Google Flights response this app uses.
 * Extra fields are ignored.
 */

export interface SerpApiAirport {
  name?: string;
  id?: string;
  time?: string;
  terminal?: string | number;
}

export interface SerpApiFlightSegment {
  departure_airport?: SerpApiAirport;
  arrival_airport?: SerpApiAirport;
  duration?: number;
  airplane?: string;
  airline?: string;
  travel_class?: string;
  flight_number?: string;
  extensions?: string[];
}

export interface SerpApiLayover {
  duration?: number;
  name?: string;
  id?: string;
}

export interface SerpApiFlightOption {
  flights?: SerpApiFlightSegment[];
  layovers?: SerpApiLayover[];
  total_duration?: number;
  price?: number;
  type?: string;
  booking_token?: string;
  departure_token?: string;
}

export interface SerpApiSearchResponse {
  best_flights?: SerpApiFlightOption[];
  other_flights?: SerpApiFlightOption[];
  error?: string;
  search_metadata?: { status?: string };
}
