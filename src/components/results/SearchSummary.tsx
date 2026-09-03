'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import { formatDateRange, formatEnumLabel, formatUtcStamp } from '@/lib/format';
import { displayAirport } from '@/lib/places/display';
import type { SearchCriteria } from '@/lib/flights/search-params';

interface SearchSummaryProps {
  criteria: SearchCriteria;
  searchedAt?: string | null;
}

export function SearchSummary({ criteria, searchedAt }: SearchSummaryProps) {
  const [copied, setCopied] = useState(false);

  const origin = displayAirport(criteria.origin);
  const destination = displayAirport(criteria.destination);
  const returnLeg = criteria.tripType === 'round-trip' ? criteria.returnDate : null;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const facts = [
    formatDateRange(criteria.departureDate, returnLeg),
    `${criteria.adults} ${criteria.adults === 1 ? 'adult' : 'adults'}`,
    formatEnumLabel(criteria.cabin),
    criteria.currency,
    criteria.nonStop ? 'Direct only' : null,
  ].filter(Boolean);

  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h1 className="text-ink-50 text-xl font-semibold tracking-tight sm:text-2xl">
          {origin} → {destination}
          {returnLeg ? ` → ${origin}` : ''}
        </h1>
        <p className="text-ink-400 mt-1 text-sm">{facts.join(' · ')}</p>
        {searchedAt && (
          <p className="text-ink-400 mt-1 text-xs">Prices as of {formatUtcStamp(searchedAt)}</p>
        )}
      </div>

      <button
        type="button"
        onClick={copyLink}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors',
          copied
            ? 'border-down-100 bg-down-50 text-down-400'
            : 'border-ink-800 text-ink-200 hover:border-ink-600 bg-ink-900',
        )}
      >
        {copied ? 'Link copied' : 'Copy link'}
      </button>
    </div>
  );
}
