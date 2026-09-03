'use client';

import { useId } from 'react';

import { AirportCombobox } from '@/components/search/AirportCombobox';
import { Spinner } from '@/components/ui/Skeleton';
import { cn } from '@/lib/cn';
import { CURRENCIES, CURRENCY_LABELS, type CurrencyCode } from '@/lib/flights/currencies';
import { todayIsoDate } from '@/lib/format';
import {
  CABIN_CLASSES,
  MAX_ADULTS,
  type CabinClass,
  type SearchCriteria,
  type TripType,
} from '@/lib/flights/search-params';

const CABIN_LABELS: Record<CabinClass, string> = {
  ECONOMY: 'Economy',
  PREMIUM_ECONOMY: 'Premium economy',
  BUSINESS: 'Business',
  FIRST: 'First',
};

interface SearchFormProps {
  criteria: SearchCriteria;
  onChange: (patch: Partial<SearchCriteria>) => void;
  onSubmit: () => void;
  fieldErrors: Record<string, string>;
  isLoading: boolean;
  /** `hero` sits on the landing canvas; `compact` sits above the results. */
  variant?: 'hero' | 'compact';
}

export function SearchForm({
  criteria,
  onChange,
  onSubmit,
  fieldErrors,
  isLoading,
  variant = 'hero',
}: SearchFormProps) {
  const ids = useId();
  const isHero = variant === 'hero';
  const today = todayIsoDate();

  function swapEndpoints() {
    onChange({ origin: criteria.destination, destination: criteria.origin });
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      noValidate
      aria-label="Flight search"
      className={cn('w-full', isHero ? 'max-w-5xl' : 'max-w-6xl')}
    >
      <fieldset className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 border-0 p-0">
        <legend className="sr-only">Trip options</legend>

        <TripTypeToggle
          value={criteria.tripType}
          onChange={(tripType) => onChange({ tripType })}
        />

        <label className="text-ink-200 flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={criteria.nonStop}
            onChange={(event) => onChange({ nonStop: event.target.checked })}
            className="border-ink-600 accent-brand-400 h-4 w-4 rounded"
          />
          Direct flights only
        </label>

        <label className="text-ink-200 flex items-center gap-2 text-sm font-medium">
          <span className="text-ink-400">Currency</span>
          <select
            value={criteria.currency}
            onChange={(event) => onChange({ currency: event.target.value as CurrencyCode })}
            aria-label="Fare currency"
            className="border-ink-700 bg-ink-900 text-ink-50 rounded-md border py-0.5 pr-6 pl-1.5 text-sm font-medium"
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code} · {CURRENCY_LABELS[code]}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          onClick={swapEndpoints}
          className="text-ink-300 hover:text-ink-50 inline-flex items-center gap-1.5 text-sm font-medium lg:hidden"
        >
          <SwapIcon />
          Swap airports
        </button>
      </fieldset>

      <div className="border-ink-800 bg-ink-900/90 rounded-2xl border p-3 shadow-[0_24px_80px_-32px_rgb(0_0_0_/_0.85)] backdrop-blur-xl sm:p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_1fr_auto_auto]">
          <Field className="lg:border-ink-800 lg:border-r lg:pr-4">
            <AirportCombobox
              id={`${ids}-origin`}
              label="From"
              placeholder="City or airport"
              value={criteria.origin}
              onChange={(origin) => onChange({ origin })}
              error={fieldErrors.origin}
            />
          </Field>

          <div className="hidden items-center lg:flex">
            <button
              type="button"
              onClick={swapEndpoints}
              aria-label="Swap origin and destination"
              className="border-ink-700 text-ink-400 hover:border-brand-400 hover:text-brand-300 rounded-full border bg-ink-800 p-2 transition-colors"
            >
              <SwapIcon />
            </button>
          </div>

          <Field className="lg:border-ink-800 lg:border-r lg:pr-4">
            <AirportCombobox
              id={`${ids}-destination`}
              label="To"
              placeholder="City or airport"
              value={criteria.destination}
              onChange={(destination) => onChange({ destination })}
              error={fieldErrors.destination}
            />
          </Field>

          <Field className="lg:border-ink-800 lg:border-r lg:pr-4">
            <div className="flex gap-4">
              <DateField
                id={`${ids}-depart`}
                label="Depart"
                value={criteria.departureDate}
                min={today}
                onChange={(departureDate) => {
                  const patch: Partial<SearchCriteria> = { departureDate };
                  if (criteria.returnDate && criteria.returnDate < departureDate) {
                    patch.returnDate = departureDate;
                  }
                  onChange(patch);
                }}
                error={fieldErrors.departureDate}
              />
              {criteria.tripType === 'round-trip' && (
                <DateField
                  id={`${ids}-return`}
                  label="Return"
                  value={criteria.returnDate}
                  min={criteria.departureDate || today}
                  onChange={(returnDate) => onChange({ returnDate })}
                  error={fieldErrors.returnDate}
                />
              )}
            </div>
          </Field>

          <Field>
            <div className="flex items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor={`${ids}-adults`}
                  className="text-ink-400 block text-[11px] font-semibold tracking-wider uppercase"
                >
                  Travellers
                </label>
                <select
                  id={`${ids}-adults`}
                  value={criteria.adults}
                  onChange={(event) => onChange({ adults: Number(event.target.value) })}
                  className="text-ink-50 w-full border-none bg-transparent py-0 pr-6 pl-0 text-base font-medium outline-none"
                >
                  {Array.from({ length: MAX_ADULTS }, (_, index) => index + 1).map((count) => (
                    <option key={count} value={count}>
                      {count} {count === 1 ? 'adult' : 'adults'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex-1">
                <label
                  htmlFor={`${ids}-cabin`}
                  className="text-ink-400 block text-[11px] font-semibold tracking-wider uppercase"
                >
                  Cabin
                </label>
                <select
                  id={`${ids}-cabin`}
                  value={criteria.cabin}
                  onChange={(event) => onChange({ cabin: event.target.value as CabinClass })}
                  className="text-ink-50 w-full border-none bg-transparent py-0 pr-6 pl-0 text-base font-medium outline-none"
                >
                  {CABIN_CLASSES.map((cabin) => (
                    <option key={cabin} value={cabin}>
                      {CABIN_LABELS[cabin]}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="bg-brand-400 text-ink-950 hover:bg-brand-300 flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl px-5 font-semibold transition-colors disabled:opacity-60"
              >
                {isLoading ? (
                  <Spinner className="h-5 w-5" />
                ) : (
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeWidth="2.5"
                      d="M21 21l-4.5-4.5M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                )}
                <span className={isHero ? '' : 'hidden xl:inline'}>
                  {isLoading ? 'Searching' : 'Search'}
                </span>
              </button>
            </div>
          </Field>
        </div>
      </div>
    </form>
  );
}

function SwapIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function Field({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('min-w-0 px-2 py-1', className)}>{children}</div>;
}

function DateField({
  id,
  label,
  value,
  min,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  error?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className="min-w-0 flex-1">
      <label
        htmlFor={id}
        className="text-ink-400 block text-[11px] font-semibold tracking-wider uppercase"
      >
        {label}
      </label>
      <input
        id={id}
        type="date"
        value={value}
        min={min}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className="text-ink-50 w-full border-none bg-transparent p-0 text-base font-medium outline-none"
      />
      {error && (
        <p id={errorId} className="text-up-400 mt-0.5 text-xs font-medium">
          {error}
        </p>
      )}
    </div>
  );
}

function TripTypeToggle({
  value,
  onChange,
}: {
  value: TripType;
  onChange: (value: TripType) => void;
}) {
  const options: { value: TripType; label: string }[] = [
    { value: 'round-trip', label: 'Round trip' },
    { value: 'one-way', label: 'One way' },
  ];

  return (
    <div className="border-ink-800 bg-ink-900 inline-flex rounded-lg border p-0.5">
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              selected ? 'bg-ink-700 text-ink-50' : 'text-ink-400 hover:text-ink-50',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
