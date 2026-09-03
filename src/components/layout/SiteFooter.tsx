import Link from 'next/link';

import { Logo } from '@/components/brand/Logo';
import { GITHUB_REPO_URL, SITE_NAME } from '@/lib/brand';

export function SiteFooter() {
  return (
    <footer className="border-ink-800 mt-auto border-t bg-white/40">
      <div className="mx-auto flex w-full max-w-[88rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <Logo />
          <p className="text-ink-400 mt-3 text-sm leading-relaxed">
            A comparison tool, not a travel agent. Fares come from Google Flights via SerpApi. Tickets are sold by
            airlines and booking sites — confirm the price there before you pay.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 sm:gap-12">
          <FooterGroup title="Product">
            <FooterLink href="/">Search flights</FooterLink>
            <FooterLink href="/about">How it works</FooterLink>
            <FooterLink href={GITHUB_REPO_URL} external>
              Source code
            </FooterLink>
          </FooterGroup>
          <FooterGroup title="Fine print">
            <FooterLink href="/privacy">Privacy</FooterLink>
            <FooterLink href="/about#data">Where fares come from</FooterLink>
          </FooterGroup>
        </div>
      </div>

      <div className="border-ink-800 border-t">
        <p className="text-ink-500 mx-auto max-w-[88rem] px-4 py-4 text-xs sm:px-6">
          © {new Date().getFullYear()} {SITE_NAME}. Not affiliated with SerpApi, Google, Kayak, or
          any airline.
        </p>
      </div>
    </footer>
  );
}

function FooterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-ink-500 text-[11px] font-semibold tracking-widest uppercase">{title}</p>
      <ul className="mt-3 space-y-2">{children}</ul>
    </div>
  );
}

function FooterLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const className = 'text-sm text-ink-300 transition-colors hover:text-ink-50';
  if (external) {
    return (
      <li>
        <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
          {children}
        </a>
      </li>
    );
  }
  return (
    <li>
      <Link href={href} className={className}>
        {children}
      </Link>
    </li>
  );
}
