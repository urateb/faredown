/**
 * Formatting helpers.
 *
 * Two rules drive the design here:
 *
 * 1. Flight times are airport-local wall clocks with no UTC offset. Passing
 *    them through `new Date()` would re-interpret them in the viewer's zone and
 *    silently shift every departure, so they are handled as strings.
 * 2. Output must be byte-identical on the server and in the browser, otherwise
 *    React hydration warns. That rules out machine-locale formatting, hence the
 *    fixed locale below.
 */

const FIXED_LOCALE = 'en-GB';

const WALL_CLOCK_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/;
const ISO_DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DURATION_PATTERN = /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/;

export interface WallClock {
  date: string;
  time: string;
  minutesIntoDay: number;
}

/** Splits `2026-10-01T18:35:00` into its date and time parts without a timezone round-trip. */
export function parseWallClock(value: string): WallClock | null {
  const match = WALL_CLOCK_PATTERN.exec(value);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match as unknown as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];
  return {
    date: `${year}-${month}-${day}`,
    time: `${hour}:${minute}`,
    minutesIntoDay: Number(hour) * 60 + Number(minute),
  };
}

/** `2026-10-01T18:35:00` -> `18:35`. Returns an em dash for unparseable input. */
export function formatTime(value: string): string {
  return parseWallClock(value)?.time ?? '—';
}

export function minutesIntoDay(value: string): number {
  return parseWallClock(value)?.minutesIntoDay ?? 0;
}

/** ISO 8601 duration (`PT10H30M`, `P1DT2H`) to whole minutes. */
export function parseIsoDuration(value: string | undefined | null): number {
  if (!value) return 0;
  const match = ISO_DURATION_PATTERN.exec(value.trim().toUpperCase());
  if (!match) return 0;
  const [, days, hours, minutes] = match;
  return Number(days ?? 0) * 1440 + Number(hours ?? 0) * 60 + Number(minutes ?? 0);
}

/** 630 -> `10h 30m`. Sub-hour durations drop the hours entirely. */
export function formatDuration(totalMinutes: number): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) return '—';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = Math.round(totalMinutes % 60);
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export function formatMoney(amount: number, currency: string, maximumFractionDigits = 0): string {
  try {
    return new Intl.NumberFormat(FIXED_LOCALE, {
      style: 'currency',
      currency,
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(amount);
  } catch {
    // Intl throws on codes it does not recognise; fall back to a plain suffix.
    return `${Math.round(amount)} ${currency}`;
  }
}

/**
 * Minutes between two wall-clock timestamps.
 *
 * Only meaningful when both readings come from the same airport — a layover, in
 * practice — because wall clocks carry no offset and cannot be compared across
 * timezones.
 */
export function wallClockDiffMinutes(from: string, to: string): number {
  const start = parseWallClock(from);
  const end = parseWallClock(to);
  if (!start || !end) return 0;
  return daysBetween(start.date, end.date) * 1440 + (end.minutesIntoDay - start.minutesIntoDay);
}

/* ------------------------------------------------------------------ *
 * Calendar dates
 * ------------------------------------------------------------------ */

function toUtcTimestamp(isoDate: string): number | null {
  const match = ISO_DATE_PATTERN.exec(isoDate);
  if (!match) return null;
  const [, year, month, day] = match as unknown as [string, string, string, string];
  return Date.UTC(Number(year), Number(month) - 1, Number(day));
}

/** Whole days from `from` to `to`. Computed in UTC so DST never shifts the count. */
export function daysBetween(from: string, to: string): number {
  const start = toUtcTimestamp(from);
  const end = toUtcTimestamp(to);
  if (start === null || end === null) return 0;
  return Math.round((end - start) / 86_400_000);
}

export function addDays(isoDate: string, days: number): string {
  const start = toUtcTimestamp(isoDate);
  if (start === null) return isoDate;
  return new Date(start + days * 86_400_000).toISOString().slice(0, 10);
}

export function todayIsoDate(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate(),
  ).padStart(2, '0')}`;
}

/** `2026-10-01` -> `Thu 1 Oct`. */
export function formatDateLabel(isoDate: string): string {
  const timestamp = toUtcTimestamp(isoDate);
  if (timestamp === null) return isoDate;
  return new Intl.DateTimeFormat(FIXED_LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(timestamp));
}

/** `2026-10-01` -> `Thu`. */
export function formatWeekday(isoDate: string): string {
  const timestamp = toUtcTimestamp(isoDate);
  if (timestamp === null) return '';
  return new Intl.DateTimeFormat(FIXED_LOCALE, { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(timestamp),
  );
}

/** `2026-10-01` -> `Thu 1 Oct 2026`. */
export function formatDateLong(isoDate: string): string {
  const timestamp = toUtcTimestamp(isoDate);
  if (timestamp === null) return isoDate;
  return new Intl.DateTimeFormat(FIXED_LOCALE, {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(timestamp));
}

/** A round-trip as `Thu 1 Oct – Thu 8 Oct`, a one-way as `Thu 1 Oct`. */
export function formatDateRange(departureDate: string, returnDate?: string | null): string {
  if (!returnDate) return formatDateLong(departureDate);
  return `${formatDateLabel(departureDate)} – ${formatDateLabel(returnDate)}`;
}

/** `2026-09-03T18:42:00.000Z` -> `3 Sep 2026, 18:42 UTC`. */
export function formatUtcStamp(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat(FIXED_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    timeZone: 'UTC',
    timeZoneName: 'short',
  }).format(date);
}

/** `2026-10-01` -> `1 Oct`. */
export function formatDayMonth(isoDate: string): string {
  const timestamp = toUtcTimestamp(isoDate);
  if (timestamp === null) return isoDate;
  return new Intl.DateTimeFormat(FIXED_LOCALE, {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(new Date(timestamp));
}

/** Turns `ECONOMY` / `PREMIUM_ECONOMY` into `Economy` / `Premium economy`. */
export function formatEnumLabel(value: string): string {
  const spaced = value.replace(/_/g, ' ').toLowerCase();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Normalises SHOUTED airline names into `Title Case`. */
export function formatCarrierName(value: string): string {
  if (!value) return value;
  if (value !== value.toUpperCase()) return value;
  return value
    .toLowerCase()
    .split(' ')
    .map((word) => (word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word))
    .join(' ');
}

/** `BOEING 777-300ER` -> `Boeing 777-300ER`. Leaves model numbers alone. */
export function formatAircraft(value: string): string {
  if (!value) return value;
  if (value !== value.toUpperCase()) return value;
  return value
    .split(' ')
    .map((word) => (/[0-9]/.test(word) ? word : word.charAt(0) + word.slice(1).toLowerCase()))
    .join(' ');
}
