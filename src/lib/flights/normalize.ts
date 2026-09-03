import type { SerpApiFlightOption, SerpApiFlightSegment, SerpApiSearchResponse } from '@/lib/serpapi/types';
import { daysBetween, formatCarrierName, parseWallClock } from '@/lib/format';

import type { Carrier, FlightEndpoint, Layover, Leg, Offer, Segment } from './types';

function toIsoWallClock(value: string | undefined): string {
  if (!value) return '';
  return value.includes('T') ? value : value.replace(' ', 'T');
}

function carrierFromSegment(raw: SerpApiFlightSegment): Carrier {
  const number = (raw.flight_number ?? '').replace(/\s+/g, '');
  const code = number.slice(0, 2).toUpperCase() || '??';
  const name = raw.airline ? formatCarrierName(raw.airline) : code;
  return { code, name };
}

function operatingFromExtensions(raw: SerpApiFlightSegment, marketing: Carrier): Carrier | null {
  const operated = raw.extensions?.find((line) => /^operated by /i.test(line));
  if (!operated) return null;
  const name = formatCarrierName(operated.replace(/^operated by /i, '').trim());
  if (!name || name.toLowerCase() === marketing.name.toLowerCase()) return null;
  return { code: marketing.code, name };
}

function endpoint(raw: SerpApiFlightSegment['departure_airport'], at: string): FlightEndpoint {
  return {
    iataCode: (raw?.id ?? '').toUpperCase() || '???',
    terminal: raw?.terminal != null ? String(raw.terminal) : null,
    at,
  };
}

function normalizeSegment(raw: SerpApiFlightSegment, index: number): Segment {
  const marketing = carrierFromSegment(raw);
  const operating = operatingFromExtensions(raw, marketing);
  const number = (raw.flight_number ?? '').replace(/\s+/g, '');
  const departureAt = toIsoWallClock(raw.departure_airport?.time);
  const arrivalAt = toIsoWallClock(raw.arrival_airport?.time);

  return {
    id: `${number || 'seg'}-${index}-${departureAt}`,
    departure: endpoint(raw.departure_airport, departureAt),
    arrival: endpoint(raw.arrival_airport, arrivalAt),
    marketingCarrier: marketing,
    operatingCarrier: operating,
    flightNumber: number || marketing.code,
    aircraft: raw.airplane ?? null,
    durationMinutes: raw.duration ?? 0,
    cabin: raw.travel_class ?? null,
  };
}

function normalizeLeg(option: SerpApiFlightOption, kind: 'outbound' | 'inbound'): Leg | null {
  const segments = (option.flights ?? []).map((flight, index) => normalizeSegment(flight, index));
  const first = segments[0];
  const last = segments[segments.length - 1];
  if (!first || !last) return null;

  const layovers: Layover[] = (option.layovers ?? []).map((layover) => ({
    iataCode: (layover.id ?? '').toUpperCase() || '???',
    durationMinutes: layover.duration ?? 0,
  }));

  const departureDate = parseWallClock(first.departure.at)?.date;
  const arrivalDate = parseWallClock(last.arrival.at)?.date;

  const carriers: Carrier[] = [];
  for (const segment of segments) {
    if (!carriers.some((carrier) => carrier.code === segment.marketingCarrier.code)) {
      carriers.push(segment.marketingCarrier);
    }
  }

  return {
    kind,
    segments,
    departure: first.departure,
    arrival: last.arrival,
    durationMinutes: option.total_duration ?? segments.reduce((sum, segment) => sum + segment.durationMinutes, 0),
    stopCount: Math.max(segments.length - 1, 0),
    layovers,
    dayOffset: departureDate && arrivalDate ? daysBetween(departureDate, arrivalDate) : 0,
    carriers,
  };
}

function optionId(option: SerpApiFlightOption, index: number): string {
  const flights = (option.flights ?? [])
    .map((flight) => (flight.flight_number ?? '').replace(/\s+/g, ''))
    .join('-');
  return option.booking_token ?? option.departure_token ?? `${flights || 'flight'}-${index}`;
}

function normalizeOption(option: SerpApiFlightOption, index: number, travelerCount: number, currency: string): Offer | null {
  const price = option.price;
  if (typeof price !== 'number' || !Number.isFinite(price)) return null;

  const outbound = normalizeLeg(option, 'outbound');
  if (!outbound) return null;

  const legs = [outbound];
  const travelers = Math.max(travelerCount, 1);

  return {
    id: optionId(option, index),
    totalPrice: { amount: price, currency },
    pricePerTraveler: { amount: price / travelers, currency },
    legs,
    validatingCarrier: outbound.segments[0]!.marketingCarrier,
    seatsRemaining: null,
    cabin: outbound.segments[0]?.cabin ?? null,
    includedCheckedBags: null,
    totalDurationMinutes: outbound.durationMinutes,
    stopCount: outbound.stopCount,
  };
}

export function normalizeFlightOffers(
  response: SerpApiSearchResponse,
  travelerCount: number,
  currency: string,
): Offer[] {
  const options = [...(response.best_flights ?? []), ...(response.other_flights ?? [])];
  const seen = new Set<string>();
  const offers: Offer[] = [];

  options.forEach((option, index) => {
    const offer = normalizeOption(option, index, travelerCount, currency);
    if (!offer || seen.has(offer.id)) return;
    seen.add(offer.id);
    offers.push(offer);
  });

  return offers;
}
