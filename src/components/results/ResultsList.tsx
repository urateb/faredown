'use client';

import { useMemo, useState } from 'react';

import { FlightCard, type OfferBadge } from '@/components/results/FlightCard';
import { Button } from '@/components/ui/Button';
import type { Offer } from '@/lib/flights/types';

const PAGE_SIZE = 8;

interface ResultsListProps {
  offers: Offer[];
  travellers: number;
  onSelect: (offer: Offer) => void;
}

/** Marks the extremes of the visible set so the trade-off is obvious at a glance. */
function computeBadges(offers: Offer[]): Map<string, OfferBadge[]> {
  const badges = new Map<string, OfferBadge[]>();
  if (offers.length < 2) return badges;

  const cheapest = offers.reduce((best, offer) =>
    offer.totalPrice.amount < best.totalPrice.amount ? offer : best,
  );
  const fastest = offers.reduce((best, offer) =>
    offer.totalDurationMinutes < best.totalDurationMinutes ? offer : best,
  );

  badges.set(cheapest.id, ['cheapest']);
  if (fastest.id !== cheapest.id) {
    badges.set(fastest.id, ['fastest']);
  } else {
    // One offer that is both is worth saying so explicitly.
    badges.set(cheapest.id, ['cheapest', 'fastest']);
  }

  return badges;
}

export function ResultsList({ offers, travellers, onSelect }: ResultsListProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [renderedOffers, setRenderedOffers] = useState(offers);

  // Re-collapse whenever the result set changes, so a new search or a changed
  // filter does not open on page four of the previous one. Adjusting during
  // render rather than in an effect avoids painting the stale page first.
  if (renderedOffers !== offers) {
    setRenderedOffers(offers);
    setVisibleCount(PAGE_SIZE);
  }

  const badges = useMemo(() => computeBadges(offers), [offers]);
  const visible = offers.slice(0, visibleCount);
  const remaining = offers.length - visible.length;

  return (
    <div>
      <ul className="space-y-4">
        {visible.map((offer) => (
          <li key={offer.id} className="animate-rise">
            <FlightCard
              offer={offer}
              badges={badges.get(offer.id) ?? []}
              travellers={travellers}
              onSelect={onSelect}
            />
          </li>
        ))}
      </ul>

      {remaining > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            Show {Math.min(remaining, PAGE_SIZE)} more of {offers.length}
          </Button>
        </div>
      )}
    </div>
  );
}
