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
