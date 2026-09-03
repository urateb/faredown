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
      className="mx-auto w-full max-w-5xl"
    >
      <fieldset
        className={cn(
          'mb-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 border-0 p-0',
          isHero && 'text-white',
        )}
      >
        <legend className="sr-only">Trip options</legend>

        <TripTypeToggle
          value={criteria.tripType}
          onChange={(tripType) => onChange({ tripType })}
          onPhoto={isHero}
        />

        <label
          className={cn(
            'flex cursor-pointer items-center gap-2 text-sm font-medium',
            isHero ? 'text-white/90' : 'text-ink-200',
          )}
        >
          <input
            type="checkbox"
            checked={criteria.nonStop}
            onChange={(event) => onChange({ nonStop: event.target.checked })}
            className="border-ink-600 accent-brand-400 h-4 w-4 rounded"
          />
          Direct flights only
        </label>

        <label
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            isHero ? 'text-white/90' : 'text-ink-200',
          )}
        >
          <span className={isHero ? 'text-white/70' : 'text-ink-400'}>Cabin</span>
          <select
            value={criteria.cabin}
            onChange={(event) => onChange({ cabin: event.target.value as CabinClass })}
            aria-label="Cabin class"
            className={cn(
              'cursor-pointer rounded-md border py-0.5 pr-6 pl-1.5 text-sm font-medium',
              isHero
                ? 'on-photo border-white/35 bg-white/15 text-white'
                : 'border-ink-700 bg-ink-900 text-ink-50',
            )}
          >
            {CABIN_CLASSES.map((cabin) => (
              <option key={cabin} value={cabin}>
                {CABIN_LABELS[cabin]}
              </option>
            ))}
          </select>
        </label>

        <label
          className={cn(
            'flex items-center gap-2 text-sm font-medium',
            isHero ? 'text-white/90' : 'text-ink-200',
          )}
        >
          <span className={isHero ? 'text-white/70' : 'text-ink-400'}>Currency</span>
          <select
            value={criteria.currency}
            onChange={(event) => onChange({ currency: event.target.value as CurrencyCode })}
            aria-label="Fare currency"
            className={cn(
              'cursor-pointer rounded-md border py-0.5 pr-6 pl-1.5 text-sm font-medium',
              isHero
                ? 'on-photo border-white/35 bg-white/15 text-white'
                : 'border-ink-700 bg-ink-900 text-ink-50',
            )}
          >
            {CURRENCIES.map((code) => (
              <option key={code} value={code}>
                {code} · {CURRENCY_LABELS[code]}
              </option>
            ))}
          </select>
        </label>
      </fieldset>

      <div
        className={cn(
          'relative z-10 flex w-full flex-col items-stretch border bg-white shadow-xl',
          isHero
            ? 'rounded-3xl border-white/80 xl:h-20 xl:flex-row xl:rounded-full'
            : 'border-ink-800 rounded-3xl lg:h-[4.5rem] lg:flex-row',
        )}
      >
        <div
          className={cn(
            'relative flex min-w-0 flex-col',
            isHero ? 'xl:h-full xl:flex-[2.4] xl:flex-row' : 'lg:h-full lg:flex-[2.4] lg:flex-row',
          )}
        >
          <Segment
            isHero={isHero}
            className={
              isHero ? 'xl:flex-1 xl:rounded-l-full xl:px-8' : 'lg:flex-1 lg:rounded-l-3xl lg:px-6'
            }
          >
            <AirportCombobox
              id={`${ids}-origin`}
              label="From"
              placeholder="City or airport"
              value={criteria.origin}
              onChange={(origin) => onChange({ origin })}
              error={fieldErrors.origin}
            />
          </Segment>

          <button
            type="button"
            onClick={swapEndpoints}
            aria-label="Swap origin and destination"
            className="border-ink-800 text-ink-400 hover:text-brand-400 hover:bg-ink-900 absolute top-1/2 left-1/2 z-20 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border bg-white shadow-md transition-colors"
          >
            <SwapIcon />
          </button>

          <Segment isHero={isHero} className={isHero ? 'xl:flex-1 xl:px-8' : 'lg:flex-1'}>
            <AirportCombobox
              id={`${ids}-destination`}
              label="To"
              placeholder="City or airport"
              value={criteria.destination}
              onChange={(destination) => onChange({ destination })}
              error={fieldErrors.destination}
            />
          </Segment>
        </div>

        <Segment
          isHero={isHero}
          grow={criteria.tripType === 'round-trip' ? 'dates' : 'from'}
          className={isHero ? 'xl:px-8' : undefined}
        >
          <div className="flex w-full gap-4">
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
                className="border-ink-200 border-l pl-4"
              />
            )}
          </div>
        </Segment>

        <Segment isHero={isHero} grow="meta" edge="end" className={isHero ? 'xl:pl-8' : 'lg:pl-6'}>
          <label
            htmlFor={`${ids}-adults`}
            className="text-ink-400 mb-0.5 block text-xs font-bold tracking-wide uppercase"
          >
            Travellers
          </label>
          <select
            id={`${ids}-adults`}
            value={criteria.adults}
            onChange={(event) => onChange({ adults: Number(event.target.value) })}
            className="text-ink-50 w-full cursor-pointer border-none bg-transparent p-0 text-sm font-semibold outline-none"
          >
            {Array.from({ length: MAX_ADULTS }, (_, index) => index + 1).map((count) => (
              <option key={count} value={count}>
                {count} {count === 1 ? 'adult' : 'adults'}
              </option>
            ))}
          </select>
        </Segment>

        <div
          className={cn(
            'border-ink-200 flex shrink-0 items-center border-t p-3',
            isHero ? 'xl:border-t-0 xl:p-2' : 'lg:border-t-0 lg:p-1.5',
          )}
        >
          <button
            type="submit"
            disabled={isLoading}
            className={cn(
              'bg-brand-400 hover:bg-brand-300 flex cursor-pointer items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-white shadow-md transition-colors disabled:cursor-not-allowed disabled:opacity-60',
              isHero
                ? 'h-12 w-full xl:h-16 xl:w-16 xl:rounded-full xl:shadow-lg'
                : 'h-11 w-full lg:h-14 lg:w-14 lg:rounded-full',
            )}
          >
            {isLoading ? (
              <Spinner className="h-5 w-5" />
            ) : (
              <svg
                viewBox="0 0 24 24"
                className={isHero ? 'h-5 w-5 xl:h-7 xl:w-7' : 'h-5 w-5'}
                fill="none"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            )}
            <span className={cn(isHero ? 'xl:sr-only' : 'lg:sr-only')}>
              {isLoading ? 'Searching' : 'Search'}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}

function Segment({
  children,
  className,
  grow,
  isHero,
  edge = 'mid',
}: {
  children: React.ReactNode;
  className?: string;
  grow?: 'from' | 'dates' | 'meta';
  isHero: boolean;
  edge?: 'start' | 'mid' | 'end';
}) {
  return (
    <div
      className={cn(
        'border-ink-200 hover:bg-ink-900/80 flex min-w-0 flex-col justify-center border-b px-6 py-4 transition-colors',
        isHero ? 'xl:h-full xl:border-b-0 xl:py-0' : 'lg:h-full lg:border-b-0 lg:py-0',
        edge !== 'end' && (isHero ? 'xl:border-r' : 'lg:border-r'),
        edge === 'end' && 'border-b-0',
        grow === 'from' && (isHero ? 'xl:flex-[1.2]' : 'lg:flex-[1.2]'),
        grow === 'dates' && (isHero ? 'xl:flex-[1.6]' : 'lg:flex-[1.6]'),
        grow === 'meta' && (isHero ? 'xl:flex-[0.8]' : 'lg:flex-[0.8]'),
        className,
      )}
    >
      {children}
    </div>
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
        strokeWidth="2.5"
        d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
      />
    </svg>
  );
}

function DateField({
  id,
  label,
  value,
  min,
  onChange,
  error,
  className,
}: {
  id: string;
  label: string;
  value: string;
  min: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={cn('min-w-0 flex-1', className)}>
      <label
        htmlFor={id}
        className="text-ink-400 mb-0.5 block text-xs font-bold tracking-wide uppercase"
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
        className="text-ink-50 w-full cursor-pointer border-none bg-transparent p-0 text-sm font-semibold outline-none"
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
  onPhoto = false,
}: {
  value: TripType;
  onChange: (value: TripType) => void;
  onPhoto?: boolean;
}) {
  const options: { value: TripType; label: string }[] = [
    { value: 'round-trip', label: 'Round trip' },
    { value: 'one-way', label: 'One way' },
  ];

  return (
    <div
      className={cn(
        'inline-flex rounded-full border p-0.5',
        onPhoto ? 'border-white/35 bg-white/15' : 'border-ink-800 bg-ink-800/80',
      )}
    >
      {options.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'cursor-pointer rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
              selected
                ? 'text-ink-50 bg-white shadow-sm'
                : onPhoto
                  ? 'text-white/80 hover:text-white'
                  : 'text-ink-400 hover:text-ink-50',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
