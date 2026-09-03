import Link from 'next/link';

import { Logo } from '@/components/brand/Logo';
import { GITHUB_REPO_URL } from '@/lib/brand';
import { cn } from '@/lib/cn';

interface SiteHeaderProps {
  /** Transparent over the landing wash; solid on inner pages. */
  floating?: boolean;
}

export function SiteHeader({ floating = false }: SiteHeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex items-center justify-between gap-4 px-4 py-3 sm:px-6',
        floating ? 'bg-transparent' : 'border-ink-800/80 bg-ink-950/85 border-b backdrop-blur-xl',
      )}
    >
      <Link href="/" aria-label="Faredown home" className="rounded-lg">
        <Logo onDark={floating} />
      </Link>

      <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
        <Link
          href="/about"
          className={cn(
            'rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
            floating ? 'text-white/90 hover:text-white' : 'text-ink-300 hover:text-ink-50',
          )}
        >
          How it works
        </Link>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            'inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium transition-colors',
            floating ? 'text-white/90 hover:text-white' : 'text-ink-300 hover:text-ink-50',
          )}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49l-.01-1.72c-2.78.62-3.37-1.37-3.37-1.37-.46-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.57 2.34 1.12 2.91.86.09-.66.35-1.12.63-1.38-2.22-.26-4.55-1.14-4.55-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05a9.3 9.3 0 015 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9l-.01 2.82c0 .27.18.6.69.49A10.26 10.26 0 0022 12.25C22 6.58 17.52 2 12 2z" />
          </svg>
          <span className="hidden sm:inline">Source</span>
        </a>
      </nav>
    </header>
  );
}
