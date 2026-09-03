import { describe, expect, it } from 'vitest';

import { addDays, todayIsoDate } from '@/lib/format';
import {
  defaultCriteria,
  fromUrlQuery,
  toUrlQuery,
  validateCriteria,
  type SearchCriteria,
} from './search-params';

function validCriteria(patch: Partial<SearchCriteria> = {}): SearchCriteria {
  const departureDate = addDays(todayIsoDate(), 30);
  return {
    ...defaultCriteria(),
    origin: 'LHR',
    destination: 'JFK',
    departureDate,
    returnDate: addDays(departureDate, 7),
    ...patch,
  };
}

describe('toUrlQuery / fromUrlQuery', () => {
  it('round-trips the fields that define a search', () => {
    const criteria = validCriteria({
      cabin: 'BUSINESS',
      nonStop: true,
      currency: 'USD',
      adults: 2,
    });
    const restored = fromUrlQuery(toUrlQuery(criteria));
    expect(restored).toMatchObject({
      origin: 'LHR',
      destination: 'JFK',
      cabin: 'BUSINESS',
      nonStop: true,
      currency: 'USD',
      adults: 2,
      tripType: 'round-trip',
    });
  });

  it('omits default currency and economy from the URL', () => {
    const params = toUrlQuery(validCriteria());
    expect(params.get('currency')).toBeNull();
    expect(params.get('cabin')).toBeNull();
    expect(params.get('direct')).toBeNull();
  });

  it('returns null when the URL is not a search', () => {
    expect(fromUrlQuery(new URLSearchParams())).toBeNull();
  });
});

describe('validateCriteria', () => {
  it('accepts a complete round trip', () => {
    const result = validateCriteria(validCriteria());
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.query.origin).toBe('LHR');
      expect(result.query.destination).toBe('JFK');
    }
  });

  it('drops the return date on a one-way search', () => {
    const result = validateCriteria(validCriteria({ tripType: 'one-way' }));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.query.returnDate).toBeUndefined();
  });

  it('rejects the same airport twice', () => {
    const result = validateCriteria(validCriteria({ destination: 'LHR' }));
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors.destination).toBeTruthy();
  });

  it('asks for the missing fields instead of a generic failure', () => {
    const result = validateCriteria({ ...defaultCriteria(), origin: '', destination: '' });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors.origin).toMatch(/flying from/i);
      expect(result.fieldErrors.destination).toMatch(/flying to/i);
    }
  });
});
