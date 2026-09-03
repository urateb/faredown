/**
 * The public name and copy, in one place so metadata, the chrome, and JSON-LD
 * cannot drift apart.
 */
export const SITE_NAME = 'Faredown';
export const SITE_DOMAIN = 'faredown.app';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? `https://${SITE_DOMAIN}`;
export const SITE_TAGLINE = 'Know whether the fare is actually good';
export const SITE_DESCRIPTION =
  'Search live airline fares, compare them against the days either side, and see whether the date you picked is actually the cheap one — then book on the airline or a site that sells tickets.';
export const GITHUB_REPO_URL = 'https://github.com/urateb/flyhigh';
