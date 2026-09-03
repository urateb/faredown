'use client';

import { addDays, todayIsoDate } from '@/lib/format';
import type { SearchCriteria } from '@/lib/flights/search-params';
import { POPULAR_ROUTES } from '@/lib/hero-slides';

interface PopularRoutesProps {
  criteria: SearchCriteria;
  onSelect: (next: SearchCriteria) => void;
}

export function PopularRoutes({ criteria, onSelect }: PopularRoutesProps) {
  return (
    <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
      <span className="text-ink-500 text-xs font-medium tracking-widest uppercase">Try</span>
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
          className="border-ink-700 text-ink-200 hover:border-ink-500 hover:bg-white/80 rounded-full border bg-white/50 px-3 py-1.5 text-xs font-medium transition-colors"
        >
          {route.label}
        </button>
      ))}
    </div>
  );
}
