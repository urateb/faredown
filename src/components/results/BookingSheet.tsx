'use client';

import { Modal } from '@/components/ui/Modal';
import { buildBookingLinks, type BookingContext } from '@/lib/booking/deep-links';
import { formatMoney } from '@/lib/format';
import type { Offer } from '@/lib/flights/types';

interface BookingSheetProps {
  offer: Offer;
  context: BookingContext;
  onClose: () => void;
}

/**
 * The hand-off step.
 *
 * Faredown is a comparison tool, not a travel agent, so this is deliberately
 * explicit about that rather than mimicking a checkout the app cannot honour.
 */
export function BookingSheet({ offer, context, onClose }: BookingSheetProps) {
  const links = buildBookingLinks(context);
  const outbound = offer.legs[0];
  const inbound = offer.legs[1];

  return (
    <Modal title="Book this flight" onClose={onClose}>
      <div className="mx-auto max-w-lg space-y-5">
        <div className="border-ink-800 bg-ink-800/50 rounded-xl border p-4">
          <p className="text-ink-50 text-sm font-semibold">
            {context.origin} → {context.destination}
            {inbound && ` → ${context.origin}`}
          </p>
          <p className="text-ink-400 mt-1 text-sm">
            {outbound && `Departs ${context.departureDate}`}
            {context.returnDate && `, returns ${context.returnDate}`}
            {` · ${offer.validatingCarrier.name}`}
          </p>
          <p className="text-ink-50 mt-3 text-2xl font-semibold">
            {formatMoney(offer.totalPrice.amount, offer.totalPrice.currency)}
            <span className="text-ink-500 ml-2 text-sm font-normal">
              total for {context.adults} {context.adults === 1 ? 'traveller' : 'travellers'}
            </span>
          </p>
        </div>

        <div>
          <h3 className="text-ink-50 text-sm font-semibold">Where to book</h3>
          <p className="text-ink-400 mt-1 text-sm">
            Faredown does not sell tickets. These open a site that does, with your route and dates
            already filled in. Confirm the final price there — fares can move between search and
            checkout.
          </p>

          <ul className="mt-3 space-y-2">
            {links.map((link) => (
              <li key={link.provider}>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="border-ink-800 hover:border-brand-400/50 hover:bg-brand-50 flex items-center justify-between gap-3 rounded-xl border bg-ink-900 p-4 transition-colors"
                >
                  <span className="min-w-0">
                    <span className="text-ink-50 block text-sm font-semibold">{link.label}</span>
                    <span className="text-ink-500 block text-xs">{link.hint}</span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className="text-ink-400 h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M14 5h5v5m0-5L10 14M9 5H5v14h14v-4"
                    />
                  </svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Modal>
  );
}
