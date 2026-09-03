import Image from 'next/image';

import { HERO_BACKGROUND } from '@/lib/hero-slides';

/**
 * Landing atmosphere: the original canyon photograph, with a light veil so
 * the search bar and type stay readable.
 */
export function Hero({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <Image
        src={HERO_BACKGROUND.src}
        alt={HERO_BACKGROUND.alt}
        fill
        priority
        quality={90}
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
      <div className="relative z-10 flex min-h-dvh flex-1 flex-col">{children}</div>
    </div>
  );
}
