'use client';

import { cn } from '@/lib/cn';
import { addDays, todayIsoDate } from '@/lib/format';
import type { SearchCriteria } from '@/lib/flights/search-params';
import { POPULAR_ROUTES } from '@/lib/hero-slides';

interface PopularRoutesProps {
  criteria: SearchCriteria;
  onSelect: (next: SearchCriteria) => void;
  onPhoto?: boolean;
}

export function PopularRoutes({ criteria, onSelect, onPhoto = false }: PopularRoutesProps) {
  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
      <span
        className={cn(
          'text-xs font-medium tracking-widest uppercase',
          onPhoto ? 'text-white/70' : 'text-ink-500',
        )}
      >
        Try
      </span>
      {POPULAR_ROUTES.map((route) => (
        <button
          key={route.label}
          type="button"
          onClick={() => {
            const departureDate = addDays(todayIsoDate(), 30);
            onSelect({
              ...criteria,
              origin: route.origin,
              destination: route.destination,
              departureDate,
              returnDate: addDays(departureDate, 7),
              tripType: 'round-trip',
            });
          }}
          className={cn(
            'cursor-pointer rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
            onPhoto
              ? 'border-white/35 bg-white/15 text-white hover:border-white/60 hover:bg-white/25'
              : 'border-ink-700 text-ink-200 hover:border-ink-500 bg-white/50 hover:bg-white/80',
          )}
        >
          {route.label}
        </button>
      ))}
    </div>
  );
}
