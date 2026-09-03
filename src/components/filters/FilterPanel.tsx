'use client';

import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { formatMoney } from '@/lib/format';
import { isFilterActive, type Facets, type Filters } from '@/lib/flights/refine';
import { cn } from '@/lib/cn';

interface FilterPanelProps {
  facets: Facets;
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  onReset: () => void;
  matchCount: number;
}

export function FilterPanel({ facets, filters, onChange, onReset, matchCount }: FilterPanelProps) {
  function toggleCarrier(code: string) {
    const allCodes = facets.carriers.map((carrier) => carrier.code);
    if (filters.carriers.length === 0) {
      onChange({ carriers: allCodes.filter((existing) => existing !== code) });
      return;
    }
    const next = filters.carriers.includes(code)
      ? filters.carriers.filter((existing) => existing !== code)
      : [...filters.carriers, code];
    onChange({ carriers: next.length === allCodes.length ? [] : next });
  }

  const stopOptions = [
    { stops: null as number | null, label: 'Any' },
    ...facets.stops.map((stop) => ({
      stops: stop.stops,
      label:
        stop.stops === 0 ? 'Direct' : stop.stops === 1 ? 'Up to 1 stop' : `Up to ${stop.stops} stops`,
    })),
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-ink-50 text-sm font-semibold">Filters</h2>
        {isFilterActive(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="text-brand-400 hover:text-brand-300 text-xs font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      <p className="text-ink-400 -mt-3 text-xs" role="status" aria-live="polite">
        {matchCount} shown
      </p>

      <fieldset className="border-0 p-0">
        <legend className="text-ink-500 mb-2.5 text-[11px] font-semibold tracking-widest uppercase">
          Stops
        </legend>
        <div className="flex flex-wrap gap-1.5">
          {stopOptions.map((option) => {
            const selected = filters.maxStops === option.stops;
            return (
              <button
                key={String(option.stops)}
                type="button"
                aria-pressed={selected}
                onClick={() => onChange({ maxStops: option.stops })}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
                  selected
                    ? 'border-brand-400/50 bg-brand-50 text-brand-300'
                    : 'border-ink-700 text-ink-300 hover:border-ink-500 bg-ink-800',
                )}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      {facets.carriers.length > 1 && (
        <fieldset className="border-0 p-0">
          <legend className="text-ink-500 mb-2.5 text-[11px] font-semibold tracking-widest uppercase">
            Airlines
          </legend>
          <ul className="space-y-0.5">
            {facets.carriers.map((carrier) => {
              const checked =
                filters.carriers.length === 0 || filters.carriers.includes(carrier.code);
              return (
                <li key={carrier.code}>
                  <label className="hover:bg-ink-800 flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1.5">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleCarrier(carrier.code)}
                      className="border-ink-600 accent-brand-400 h-4 w-4 rounded"
                    />
                    <AirlineLogo carrierCode={carrier.code} carrierName={carrier.name} size={20} />
                    <span className="text-ink-200 min-w-0 flex-1 truncate text-sm">
                      {carrier.name}
                    </span>
                    <span className="text-ink-500 shrink-0 text-xs">
                      {formatMoney(carrier.cheapest, facets.currency)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>
      )}
    </div>
  );
}
