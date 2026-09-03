'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from 'recharts';

import { formatDuration, formatMoney } from '@/lib/format';
import type { Offer } from '@/lib/flights/types';

interface PriceVsDurationProps {
  offers: Offer[];
  currency: string;
}

interface Point {
  hours: number;
  price: number;
  label: string;
  stops: number;
  durationMinutes: number;
}

/**
 * Price against total travel time, one dot per offer.
 *
 * The previous version of this chart plotted fares sorted cheapest-to-dearest,
 * which draws a line that only ever goes up and says nothing. Plotting the two
 * axes travellers actually trade off against each other does say something: the
 * dots nearest the bottom-left corner are the good deals, and an expensive slow
 * flight is visibly bad rather than merely a tall bar.
 */
export function PriceVsDuration({ offers, currency }: PriceVsDurationProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const canPlot = offers.length >= 3;

  useEffect(() => {
    if (!canPlot) {
      setReady(false);
      return;
    }
    const node = frameRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      setReady((entries[0]?.contentRect.width ?? 0) > 0);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [canPlot]);

  if (!canPlot) return null;

  const points: Point[] = offers.map((offer) => ({
    hours: Number((offer.totalDurationMinutes / 60).toFixed(1)),
    price: Math.round(offer.totalPrice.amount),
    label: offer.validatingCarrier.name,
    stops: offer.stopCount,
    durationMinutes: offer.totalDurationMinutes,
  }));

  return (
    <section
      aria-labelledby="price-duration-heading"
      className="border-ink-800 rounded-2xl border bg-ink-900 p-4"
    >
      <h2 id="price-duration-heading" className="text-ink-50 text-sm font-semibold">
        Price vs travel time
      </h2>
      <p className="text-ink-500 mt-0.5 text-xs">
        Each dot is one option. Closer to the bottom-left is better value.
      </p>

      <div ref={frameRef} className="mt-4 h-56 w-full">
        {ready && (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart margin={{ top: 8, right: 8, bottom: 4, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#d5e0eb" />
            <XAxis
              type="number"
              dataKey="hours"
              name="Travel time"
              unit="h"
              tick={{ fill: '#7b8ea3', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#d5e0eb' }}
            />
            <YAxis
              type="number"
              dataKey="price"
              name="Price"
              tick={{ fill: '#7b8ea3', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={52}
            />
            <ZAxis range={[45, 45]} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3', stroke: '#b7c5d4' }}
              content={({ active, payload }) => {
                const point = active ? (payload?.[0]?.payload as Point | undefined) : undefined;
                if (!point) return null;
                return (
                  <div className="border-ink-700 rounded-lg border bg-ink-800 px-3 py-2 shadow-xl">
                    <p className="text-ink-50 text-xs font-semibold">{point.label}</p>
                    <p className="text-ink-300 text-xs">
                      {formatMoney(point.price, currency)} · {formatDuration(point.durationMinutes)}
                    </p>
                    <p className="text-ink-500 text-xs">
                      {point.stops === 0
                        ? 'Direct'
                        : `${point.stops} stop${point.stops > 1 ? 's' : ''}`}
                    </p>
                  </div>
                );
              }}
            />
            <Scatter data={points} fill="#0f766e" fillOpacity={0.8} />
          </ScatterChart>
        </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
