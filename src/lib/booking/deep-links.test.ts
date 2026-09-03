import { describe, expect, it } from 'vitest';

import { buildBookingLinks, googleFlightsUrl, kayakUrl, skyscannerUrl } from './deep-links';
import type { BookingContext } from './deep-links';

const context: BookingContext = {
  origin: 'LHR',
  destination: 'JFK',
  departureDate: '2026-10-01',
  returnDate: '2026-10-08',
  adults: 2,
  cabin: 'ECONOMY',
  carrier: { code: 'BA', name: 'British Airways' },
};

describe('booking deep links', () => {
  it('prefills Google Flights with the route and dates', () => {
    expect(googleFlightsUrl(context)).toContain('google.com/travel/flights');
    expect(decodeURIComponent(googleFlightsUrl(context))).toContain('LHR');
    expect(decodeURIComponent(googleFlightsUrl(context))).toContain('2026-10-01');
  });

  it('builds a Kayak itinerary path', () => {
    expect(kayakUrl(context)).toBe(
      'https://www.kayak.com/flights/LHR-JFK/2026-10-01/2026-10-08/2adults?sort=price_a',
    );
  });

  it('builds a Skyscanner itinerary path', () => {
    expect(skyscannerUrl(context)).toContain(
      'https://www.skyscanner.net/transport/flights/lhr/jfk/261001/261008/',
    );
  });

  it('lists the airline first when a booking site is known', () => {
    const links = buildBookingLinks(context);
    expect(links[0]?.provider).toBe('airline');
    expect(links[0]?.url).toContain('britishairways.com');
    expect(links.map((link) => link.provider)).toEqual([
      'airline',
      'google-flights',
      'kayak',
      'skyscanner',
    ]);
  });
});
