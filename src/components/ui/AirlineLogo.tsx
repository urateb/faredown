'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';

interface AirlineLogoProps {
  carrierCode: string;
  carrierName: string;
  size?: number;
  className?: string;
}

/**
 * Airline mark. A missing file degrades to the carrier code.
 */
export function AirlineLogo({ carrierCode, carrierName, size = 32, className }: AirlineLogoProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className={cn(
          'bg-ink-800 text-ink-200 inline-flex shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
          className,
        )}
        style={{ width: size, height: size }}
        title={carrierName}
      >
        {carrierCode}
      </span>
    );
  }

  return (
    // Intentionally a plain <img>: these are tiny third-party icons whose URLs
    // are keyed by carrier code, so routing them through the image optimiser
    // buys nothing and costs a transform per airline.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://pics.avs.io/al_${size * 2}/${size * 2}/${carrierCode}.png`}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      title={carrierName}
      onError={() => setFailed(true)}
      className={cn('shrink-0 object-contain', className)}
      style={{ width: size, height: size }}
    />
  );
}
