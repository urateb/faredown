import { describe, expect, it } from 'vitest';

import {
  addDays,
  daysBetween,
  formatAircraft,
  formatCarrierName,
  formatDateRange,
  formatDuration,
  formatMoney,
  formatTime,
  formatUtcStamp,
  minutesIntoDay,
  parseIsoDuration,
  parseWallClock,
  wallClockDiffMinutes,
} from './format';

describe('parseWallClock', () => {
  it('splits an offsetless timestamp into its parts', () => {
    expect(parseWallClock('2026-10-01T18:35:00')).toEqual({
      date: '2026-10-01',
      time: '18:35',
      minutesIntoDay: 18 * 60 + 35,
    });
  });

  it('returns null for input it cannot read', () => {
    expect(parseWallClock('not a timestamp')).toBeNull();
  });

  it('accepts Google Flights timestamps that use a space instead of T', () => {
    expect(parseWallClock('2026-10-01 18:35')).toEqual({
      date: '2026-10-01',
      time: '18:35',
      minutesIntoDay: 18 * 60 + 35,
    });
  });

  it('reads the airport-local time regardless of the machine timezone', () => {
    // The whole point of string parsing: a Date round-trip would shift this by
    // the runner's UTC offset and quietly report the wrong departure.
    const original = process.env.TZ;
    process.env.TZ = 'Pacific/Auckland';
    expect(formatTime('2026-10-01T18:35:00')).toBe('18:35');
    process.env.TZ = original;
  });
});

describe('formatTime', () => {
  it('falls back to a dash rather than rendering NaN', () => {
    expect(formatTime('')).toBe('—');
  });
});

describe('minutesIntoDay', () => {
  it('measures from local midnight', () => {
    expect(minutesIntoDay('2026-10-01T00:00:00')).toBe(0);
    expect(minutesIntoDay('2026-10-01T23:59:00')).toBe(1439);
  });
});

describe('parseIsoDuration', () => {
  it.each([
    ['PT8H5M', 485],
    ['PT45M', 45],
    ['PT7H', 420],
    ['P1DT2H30M', 1590],
  ])('parses %s as %i minutes', (input, expected) => {
    expect(parseIsoDuration(input)).toBe(expected);
  });

  it('treats missing or malformed durations as zero', () => {
    expect(parseIsoDuration(undefined)).toBe(0);
    expect(parseIsoDuration('8 hours')).toBe(0);
  });
});

describe('formatDuration', () => {
  it.each([
    [485, '8h 5m'],
    [420, '7h'],
    [45, '45m'],
  ])('renders %i minutes as %s', (input, expected) => {
    expect(formatDuration(input)).toBe(expected);
  });

  it('renders a dash for nonsense input', () => {
    expect(formatDuration(0)).toBe('—');
    expect(formatDuration(Number.NaN)).toBe('—');
  });
});

describe('formatMoney', () => {
  it('formats a known currency', () => {
    expect(formatMoney(512.3, 'EUR')).toBe('€512');
  });

  it('degrades gracefully for a currency Intl rejects', () => {
    expect(formatMoney(120, 'XYZ!')).toBe('120 XYZ!');
  });
});

describe('calendar maths', () => {
  it('counts whole days between dates', () => {
    expect(daysBetween('2026-10-01', '2026-10-08')).toBe(7);
    expect(daysBetween('2026-10-08', '2026-10-01')).toBe(-7);
  });

  it('is unaffected by a daylight-saving boundary', () => {
    // European clocks change on 25 October 2026; a naive local-time difference
    // would come back as 6.958 days and round to the wrong answer.
    expect(daysBetween('2026-10-22', '2026-10-29')).toBe(7);
  });

  it('adds days across a month boundary', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
  });
});

describe('wallClockDiffMinutes', () => {
  it('measures a same-day layover', () => {
    expect(wallClockDiffMinutes('2026-10-01T08:20:00', '2026-10-01T10:30:00')).toBe(130);
  });

  it('measures a layover that crosses midnight', () => {
    expect(wallClockDiffMinutes('2026-10-01T23:30:00', '2026-10-02T01:10:00')).toBe(100);
  });
});

describe('formatCarrierName', () => {
  it('title-cases the all-caps names the provider returns', () => {
    expect(formatCarrierName('BRITISH AIRWAYS')).toBe('British Airways');
  });

  it('leaves an already-cased name alone', () => {
    expect(formatCarrierName('easyJet')).toBe('easyJet');
  });
});

describe('formatAircraft', () => {
  it('title-cases the maker and leaves the model number intact', () => {
    expect(formatAircraft('BOEING 777-300ER')).toBe('Boeing 777-300ER');
    expect(formatAircraft('AIRBUS A319')).toBe('Airbus A319');
  });
});

describe('formatDateRange', () => {
  it('renders a one-way as a long date', () => {
    expect(formatDateRange('2026-10-01')).toBe('Thu, 1 Oct 2026');
  });

  it('renders a round trip as two short dates', () => {
    expect(formatDateRange('2026-10-01', '2026-10-08')).toBe('Thu 1 Oct – Thu 8 Oct');
  });
});

describe('formatUtcStamp', () => {
  it('prints a UTC clock without shifting the instant', () => {
    expect(formatUtcStamp('2026-09-03T18:42:00.000Z')).toMatch(/3 Sept? 2026, 18:42 UTC/);
  });
});
