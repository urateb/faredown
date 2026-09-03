'use client';

import { useId, useState } from 'react';

import { AirlineLogo } from '@/components/ui/AirlineLogo';
import { cn } from '@/lib/cn';
import { formatDuration, formatEnumLabel, formatMoney, formatTime } from '@/lib/format';
import type { Leg, Offer } from '@/lib/flights/types';
import { lookupAirport } from '@/lib/places/fallback-airports';

export type OfferBadge = 'cheapest' | 'fastest' | 'best';

const BADGE_STYLES: Record<OfferBadge, string> = {
  cheapest: 'bg-down-50 text-down-400 ring-down-100',
  fastest: 'bg-brand-50 text-brand-300 ring-brand-100',
  best: 'bg-ink-800 text-ink-200 ring-ink-700',
};

const BADGE_LABELS: Record<OfferBadge, string> = {
  cheapest: 'Cheapest',
  fastest: 'Fastest',
  best: 'Best value',
};

interface FlightCardProps {
  offer: Offer;
  badges: OfferBadge[];
  travellers: number;
  onSelect: (offer: Offer) => void;
}

export function FlightCard({ offer, badges, travellers, onSelect }: FlightCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const detailsId = useId();

  return (
    <article className="border-ink-800 hover:border-ink-700 overflow-hidden rounded-2xl border bg-ink-900 transition-colors">
      <div className="flex flex-col lg:flex-row">
        <div className="min-w-0 flex-1 p-5">
          {badges.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {badges.map((badge) => (
                <span
                  key={badge}
                  className={cn(
                    'rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ring-1',
                    BADGE_STYLES[badge],
                  )}
                >
                  {BADGE_LABELS[badge]}
                </span>
              ))}
            </div>
          )}

          <div className="space-y-5">
            {offer.legs.map((leg) => (
              <LegRow key={leg.kind} leg={leg} showLabel={offer.legs.length > 1} />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowDetails((open) => !open)}
            aria-expanded={showDetails}
            aria-controls={detailsId}
            className="text-brand-400 hover:text-brand-300 mt-4 inline-flex items-center gap-1 text-sm font-semibold"
          >
            {showDetails ? 'Hide details' : 'Flight details'}
            <svg
              viewBox="0 0 24 24"
              className={cn('h-4 w-4 transition-transform', showDetails && 'rotate-180')}
              fill="none"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {showDetails && (
            <div id={detailsId} className="animate-fade-in border-ink-800 mt-4 border-t pt-4">
              {offer.legs.map((leg) => (
                <LegDetails key={leg.kind} leg={leg} showLabel={offer.legs.length > 1} />
              ))}
              <OfferMeta offer={offer} />
            </div>
          )}
        </div>

        <div className="border-ink-800 bg-ink-800/40 flex shrink-0 items-center justify-between gap-4 border-t p-5 lg:w-56 lg:flex-col lg:items-stretch lg:justify-center lg:border-t-0 lg:border-l">
          <div className="lg:text-center">
            <p className="text-ink-50 text-2xl font-semibold tracking-tight">
              {formatMoney(offer.totalPrice.amount, offer.totalPrice.currency)}
            </p>
            <p className="text-ink-500 text-xs">
              {travellers > 1
                ? `${formatMoney(offer.pricePerTraveler.amount, offer.pricePerTraveler.currency)} each`
                : 'total'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelect(offer)}
            className="bg-brand-400 text-ink-950 hover:bg-brand-300 h-11 rounded-xl px-6 font-semibold transition-colors lg:w-full"
          >
            Select
          </button>

          {offer.seatsRemaining !== null && offer.seatsRemaining <= 4 && (
            <p className="text-up-400 hidden text-center text-xs font-medium lg:block">
              {offer.seatsRemaining} left at this price
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function LegRow({ leg, showLabel }: { leg: Leg; showLabel: boolean }) {
  const carrier = leg.carriers[0];

  return (
    <div>
      {showLabel && (
        <p className="text-ink-400 mb-2 text-[11px] font-semibold tracking-widest uppercase">
          {leg.kind === 'outbound' ? 'Outbound' : 'Return'}
        </p>
      )}

      <div className="flex items-center gap-4">
        {carrier && (
          <AirlineLogo carrierCode={carrier.code} carrierName={carrier.name} size={36} />
        )}

        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6">
          <Endpoint
            time={formatTime(leg.departure.at)}
            code={leg.departure.iataCode}
            city={lookupAirport(leg.departure.iataCode)?.cityName}
          />

          <div className="min-w-0 flex-1 text-center">
            <p className="text-ink-500 text-xs font-medium">
              {formatDuration(leg.durationMinutes)}
            </p>
            <div className="my-1 flex items-center gap-1.5" aria-hidden="true">
              <span className="bg-ink-600 h-1.5 w-1.5 rounded-full" />
              <span className="bg-ink-700 h-px flex-1" />
              {leg.layovers.map((layover) => (
                <span key={layover.iataCode} className="bg-ink-400 h-1.5 w-1.5 rounded-full" />
              ))}
              {leg.layovers.length > 0 && <span className="bg-ink-700 h-px flex-1" />}
              <span className="bg-ink-600 h-1.5 w-1.5 rounded-full" />
            </div>
            <p
              className={cn(
                'truncate text-xs font-medium',
                leg.stopCount === 0 ? 'text-down-400' : 'text-ink-400',
              )}
            >
              {leg.stopCount === 0
                ? 'Direct'
                : `${leg.stopCount} stop${leg.stopCount > 1 ? 's' : ''} · ${leg.layovers
                    .map((layover) => layover.iataCode)
                    .join(', ')}`}
            </p>
          </div>

          <Endpoint
            time={formatTime(leg.arrival.at)}
            code={leg.arrival.iataCode}
            city={lookupAirport(leg.arrival.iataCode)?.cityName}
            dayOffset={leg.dayOffset}
            align="right"
          />
        </div>
      </div>
    </div>
  );
}

function Endpoint({
  time,
  code,
  city,
  dayOffset = 0,
  align = 'left',
}: {
  time: string;
  code: string;
  city?: string;
  dayOffset?: number;
  align?: 'left' | 'right';
}) {
  return (
    <div className={cn('shrink-0', align === 'right' && 'text-right')}>
      <p className="text-ink-50 text-lg leading-tight font-semibold">
        {time}
        {dayOffset > 0 && (
          <sup className="text-up-400 ml-0.5 text-[11px] font-bold" title="Arrives the next day">
            +{dayOffset}
          </sup>
        )}
      </p>
      <p className="text-ink-400 font-mono text-xs font-medium">{code}</p>
      {city && <p className="text-ink-500 hidden text-[11px] sm:block">{city}</p>}
    </div>
  );
}

function LegDetails({ leg, showLabel }: { leg: Leg; showLabel: boolean }) {
  return (
    <div className="mb-4 last:mb-0">
      {showLabel && (
        <p className="text-ink-400 mb-2 text-[11px] font-semibold tracking-widest uppercase">
          {leg.kind === 'outbound' ? 'Outbound' : 'Return'}
        </p>
      )}

      <ol className="space-y-3">
        {leg.segments.map((segment, index) => {
          const layover = leg.layovers[index];
          return (
            <li key={segment.id}>
              <div className="flex gap-3 text-sm">
                <span className="bg-brand-400 mt-1.5 h-2 w-2 shrink-0 rounded-full" />
                <div className="min-w-0">
                  <p className="text-ink-50 font-medium">
                    {formatTime(segment.departure.at)} {segment.departure.iataCode}
                    {segment.departure.terminal && ` · T${segment.departure.terminal}`}
                    {' → '}
                    {formatTime(segment.arrival.at)} {segment.arrival.iataCode}
                    {segment.arrival.terminal && ` · T${segment.arrival.terminal}`}
                  </p>
                  <p className="text-ink-500 text-xs">
                    {segment.marketingCarrier.name} {segment.flightNumber}
                    {segment.aircraft && ` · ${segment.aircraft}`}
                    {segment.durationMinutes > 0 && ` · ${formatDuration(segment.durationMinutes)}`}
                    {segment.cabin && ` · ${formatEnumLabel(segment.cabin)}`}
                  </p>
                  {segment.operatingCarrier && (
                    <p className="text-ink-500 text-xs italic">
                      Operated by {segment.operatingCarrier.name}
                    </p>
                  )}
                </div>
              </div>

              {layover && (
                <p className="bg-ink-800 text-ink-300 mt-2 ml-5 rounded-lg px-3 py-1.5 text-xs font-medium">
                  {formatDuration(layover.durationMinutes)} layover in {layover.iataCode}
                </p>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function OfferMeta({ offer }: { offer: Offer }) {
  const facts: string[] = [];
  if (offer.cabin) facts.push(formatEnumLabel(offer.cabin));
  if (offer.includedCheckedBags !== null) {
    facts.push(
      offer.includedCheckedBags === 0
        ? 'No checked bag included'
        : `${offer.includedCheckedBags} checked bag${offer.includedCheckedBags > 1 ? 's' : ''} included`,
    );
  }
  if (offer.seatsRemaining !== null) facts.push(`${offer.seatsRemaining} bookable seats`);

  if (facts.length === 0) return null;

  return (
    <p className="border-ink-800 text-ink-400 mt-3 border-t pt-3 text-xs">{facts.join(' · ')}</p>
  );
}
