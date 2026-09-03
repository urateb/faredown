import { describe, expect, it } from 'vitest';

import { SERPAPI_OFFERS_FIXTURE } from './__fixtures__/serpapi-offers';
import { normalizeFlightOffers } from './normalize';

const offers = normalizeFlightOffers(SERPAPI_OFFERS_FIXTURE, 1, 'EUR');
const [direct, connecting, overnight] = offers;

describe('normalizeFlightOffers', () => {
  it('maps every priced option in the response', () => {
    expect(offers).toHaveLength(3);
  });

  it('treats a Google Flights result as an outbound leg', () => {
    expect(direct?.legs.map((leg) => leg.kind)).toEqual(['outbound']);
  });

  it('reads the carrier from the flight number and airline name', () => {
    expect(direct?.validatingCarrier).toEqual({ code: 'BA', name: 'British Airways' });
  });

  it('keeps durations in minutes', () => {
    expect(direct?.legs[0]?.durationMinutes).toBe(485);
    expect(direct?.totalDurationMinutes).toBe(485);
  });

  it('flags an arrival that lands the next day', () => {
    expect(direct?.legs[0]?.dayOffset).toBe(0);
    expect(overnight?.legs[0]?.dayOffset).toBe(1);
  });

  it('reports stop counts from connecting segments', () => {
    expect(direct?.stopCount).toBe(0);
    expect(connecting?.stopCount).toBe(1);
  });

  it('uses Google Flights layover durations when present', () => {
    expect(connecting?.legs[0]?.layovers).toEqual([{ iataCode: 'CDG', durationMinutes: 130 }]);
  });

  it('surfaces the operating carrier when Google lists a different operator', () => {
    expect(connecting?.legs[0]?.segments[0]?.operatingCarrier).toEqual({
      code: 'AF',
      name: 'KLM Royal Dutch Airlines',
    });
    expect(connecting?.legs[0]?.segments[1]?.operatingCarrier).toBeNull();
    expect(direct?.legs[0]?.segments[0]?.operatingCarrier).toBeNull();
  });

  it('keeps prices numeric and carries the requested currency through', () => {
    expect(direct?.totalPrice).toEqual({ amount: 512.3, currency: 'EUR' });
  });

  it('divides the total across travellers', () => {
    const [first] = normalizeFlightOffers(SERPAPI_OFFERS_FIXTURE, 2, 'EUR');
    expect(first?.pricePerTraveler.amount).toBeCloseTo(256.15);
  });

  it('drops an option whose price cannot be read rather than rendering NaN', () => {
    const corrupted = {
      ...SERPAPI_OFFERS_FIXTURE,
      best_flights: [{ ...SERPAPI_OFFERS_FIXTURE.best_flights![0]!, price: undefined }],
      other_flights: SERPAPI_OFFERS_FIXTURE.other_flights,
    };
    expect(normalizeFlightOffers(corrupted, 1, 'EUR')).toHaveLength(2);
  });

  it('returns nothing for an empty response instead of throwing', () => {
    expect(normalizeFlightOffers({}, 1, 'EUR')).toEqual([]);
  });
});
