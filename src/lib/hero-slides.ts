export interface PopularRoute {
  origin: string;
  destination: string;
  label: string;
}

/** One-tap searches, mostly to give a first-time visitor something to click. */
export const POPULAR_ROUTES: readonly PopularRoute[] = [
  { origin: 'PRN', destination: 'VIE', label: 'Pristina → Vienna' },
  { origin: 'TIA', destination: 'FCO', label: 'Tirana → Rome' },
  { origin: 'LHR', destination: 'JFK', label: 'London → New York' },
  { origin: 'SFO', destination: 'JFK', label: 'San Francisco → New York' },
  { origin: 'CDG', destination: 'BCN', label: 'Paris → Barcelona' },
];

/** First landing slide from the original FlyHigh hero. */
export const HERO_BACKGROUND = {
  src: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3242&auto=format&fit=crop',
  alt: 'Road trip through the canyon',
} as const;
