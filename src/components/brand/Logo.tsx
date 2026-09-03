import { cn } from '@/lib/cn';

interface LogoProps {
  className?: string;
}

/**
 * The Faredown mark: a price line falling from left to right.
 *
 * It is the same shape as the flexible-date chart in the results view, which is
 * the point — the product's whole claim is "we show you where the fare drops".
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn('h-8 w-8', className)}
      focusable="false"
    >
      <rect width="32" height="32" rx="9" className="fill-brand-500" />
      <path
        d="M7 11.5l6.2 5.6 4-3.2L25 20.5"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="25" cy="20.5" r="2.8" fill="white" />
    </svg>
  );
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="text-ink-50 text-[1.35rem] font-semibold tracking-tight">
        fare<span className="text-brand-400">down</span>
      </span>
    </span>
  );
}
