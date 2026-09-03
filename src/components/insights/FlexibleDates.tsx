'use client';

import { Skeleton } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { formatDayMonth, formatMoney, formatWeekday } from '@/lib/format';
import type { DateGrid } from '@/lib/flights/types';

interface FlexibleDatesProps {
  grid: DateGrid | null;
  isLoading: boolean;
  onPickDate: (date: string) => void;
}

/**
 * Prices the days either side of the chosen departure.
 *
 * This is the answer to the question the rest of the page cannot address: a
 * list of fares tells you what today costs, not whether today is a good day to
 * fly. Bar heights are relative to the most expensive day in the window, so the
 * shape of the week is readable before any number is.
 */
export function FlexibleDates({ grid, isLoading, onPickDate }: FlexibleDatesProps) {
  if (isLoading) {
    return (
      <section className="border-ink-800 rounded-2xl border bg-ink-900 p-4">
        <Skeleton className="h-4 w-40" />
        <div className="mt-4 flex gap-2">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-24 flex-1" />
          ))}
        </div>
      </section>
    );
  }

  if (!grid) return null;

  const priced = grid.days.filter(
    (day): day is (typeof grid.days)[number] & { price: number } => day.price !== null,
  );
  // With one data point there is nothing to compare against, so the whole
  // section would be noise.
  if (priced.length < 2) return null;

  const highest = Math.max(...priced.map((day) => day.price));
  const lowest = Math.min(...priced.map((day) => day.price));

  return (
    <section
      aria-labelledby="flexible-dates-heading"
      className="border-ink-800 rounded-2xl border bg-ink-900 p-4"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="flexible-dates-heading" className="text-ink-50 text-sm font-semibold">
          Nearby dates
        </h2>
        <Verdict grid={grid} />
      </div>

      {/* Seven columns do not fit a narrow phone without squeezing the prices
          into ellipses, so the strip scrolls instead of shrinking. */}
      <ol className="no-scrollbar mt-4 flex items-end gap-1.5 overflow-x-auto sm:gap-2">
        {grid.days.map((day) => {
          const isCheapest = day.date === grid.cheapestDate && grid.days.length > 1;
          const heightPercent =
            day.price === null ? 12 : Math.max(18, Math.round((day.price / highest) * 100));

          return (
            <li key={day.date} className="min-w-[3.25rem] flex-1">
              <button
                type="button"
                onClick={() => !day.isSelected && day.price !== null && onPickDate(day.date)}
                disabled={day.isSelected || day.price === null}
                aria-current={day.isSelected ? 'date' : undefined}
                aria-label={
                  day.price === null
                    ? `${formatWeekday(day.date)} ${formatDayMonth(day.date)}, no fares found`
                    : `${formatWeekday(day.date)} ${formatDayMonth(day.date)}, from ${formatMoney(
                        day.price,
                        grid.currency,
                      )}${isCheapest ? ', cheapest in this window' : ''}`
                }
                className={cn(
                  'group flex w-full flex-col items-center gap-1.5 rounded-lg px-0.5 py-1.5 transition-colors',
                  day.isSelected
                    ? 'bg-ink-800'
                    : day.price !== null && 'hover:bg-ink-800 cursor-pointer',
                  day.price === null && 'cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'text-[11px] font-semibold tabular-nums',
                    day.price === null
                      ? 'text-ink-500'
                      : isCheapest
                        ? 'text-down-400'
                        : 'text-ink-200',
                  )}
                >
                  {day.price === null ? '—' : formatMoney(day.price, grid.currency)}
                </span>

                <span
                  aria-hidden="true"
                  className={cn(
                    'w-full rounded-t-sm transition-colors',
                    day.price === null
                      ? 'bg-ink-800'
                      : isCheapest
                        ? 'bg-down-400'
                        : day.isSelected
                          ? 'bg-brand-400'
                          : 'bg-ink-600 group-hover:bg-ink-500',
                  )}
                  style={{ height: `${(heightPercent / 100) * 64}px` }}
                />

                <span className="text-ink-400 text-[10px] font-medium uppercase">
                  {formatWeekday(day.date)}
                </span>
                <span
                  className={cn(
                    'text-[11px] leading-none',
                    day.isSelected ? 'text-ink-50 font-bold' : 'text-ink-400',
                  )}
                >
                  {formatDayMonth(day.date)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      <p className="text-ink-400 mt-3 text-[11px]">
        Cheapest fare found per departure date, holding your trip length fixed. Prices from{' '}
        {formatMoney(lowest, grid.currency)} to {formatMoney(highest, grid.currency)}.
      </p>
    </section>
  );
}

function Verdict({ grid }: { grid: DateGrid }) {
  const selected = grid.days.find((day) => day.isSelected);

  if (selected && grid.cheapestDate === selected.date) {
    return (
      <span className="bg-down-50 text-down-400 rounded-full px-2.5 py-1 text-xs font-semibold">
        Your date is the cheapest here
      </span>
    );
  }

  if (grid.savingsVsSelected !== null && grid.cheapestDate) {
    return (
      <span className="bg-down-50 text-down-400 rounded-full px-2.5 py-1 text-xs font-semibold">
        Save {formatMoney(grid.savingsVsSelected, grid.currency)} on{' '}
        {formatDayMonth(grid.cheapestDate)}
      </span>
    );
  }

  return null;
}
