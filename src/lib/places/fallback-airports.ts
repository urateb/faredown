import type { Place } from '@/lib/flights/types';

/**
 * A local index of high-traffic airports.
 *
 * Two jobs: it answers the first keystrokes instantly while the provider lookup
 * is still in flight, and it keeps the destination field usable if that lookup
 * fails. It is not meant to be exhaustive — `/api/places` is the real source,
 * and any valid IATA code can still be typed by hand.
 */
type Row = readonly [iata: string, airport: string, city: string, country: string, cc: string];

const ROWS: readonly Row[] = [
  // Europe
  ['LHR', 'Heathrow', 'London', 'United Kingdom', 'GB'],
  ['LGW', 'Gatwick', 'London', 'United Kingdom', 'GB'],
  ['STN', 'Stansted', 'London', 'United Kingdom', 'GB'],
  ['LCY', 'London City', 'London', 'United Kingdom', 'GB'],
  ['MAN', 'Manchester', 'Manchester', 'United Kingdom', 'GB'],
  ['EDI', 'Edinburgh', 'Edinburgh', 'United Kingdom', 'GB'],
  ['DUB', 'Dublin', 'Dublin', 'Ireland', 'IE'],
  ['CDG', 'Charles de Gaulle', 'Paris', 'France', 'FR'],
  ['ORY', 'Orly', 'Paris', 'France', 'FR'],
  ['NCE', "Côte d'Azur", 'Nice', 'France', 'FR'],
  ['AMS', 'Schiphol', 'Amsterdam', 'Netherlands', 'NL'],
  ['BRU', 'Brussels', 'Brussels', 'Belgium', 'BE'],
  ['FRA', 'Frankfurt', 'Frankfurt', 'Germany', 'DE'],
  ['MUC', 'Munich', 'Munich', 'Germany', 'DE'],
  ['BER', 'Brandenburg', 'Berlin', 'Germany', 'DE'],
  ['DUS', 'Düsseldorf', 'Düsseldorf', 'Germany', 'DE'],
  ['HAM', 'Hamburg', 'Hamburg', 'Germany', 'DE'],
  ['ZRH', 'Zurich', 'Zurich', 'Switzerland', 'CH'],
  ['GVA', 'Geneva', 'Geneva', 'Switzerland', 'CH'],
  ['VIE', 'Vienna', 'Vienna', 'Austria', 'AT'],
  ['MAD', 'Barajas', 'Madrid', 'Spain', 'ES'],
  ['BCN', 'El Prat', 'Barcelona', 'Spain', 'ES'],
  ['AGP', 'Málaga', 'Málaga', 'Spain', 'ES'],
  ['PMI', 'Palma de Mallorca', 'Palma', 'Spain', 'ES'],
  ['LIS', 'Humberto Delgado', 'Lisbon', 'Portugal', 'PT'],
  ['OPO', 'Francisco Sá Carneiro', 'Porto', 'Portugal', 'PT'],
  ['FCO', 'Fiumicino', 'Rome', 'Italy', 'IT'],
  ['MXP', 'Malpensa', 'Milan', 'Italy', 'IT'],
  ['LIN', 'Linate', 'Milan', 'Italy', 'IT'],
  ['VCE', 'Marco Polo', 'Venice', 'Italy', 'IT'],
  ['NAP', 'Naples', 'Naples', 'Italy', 'IT'],
  ['CPH', 'Copenhagen', 'Copenhagen', 'Denmark', 'DK'],
  ['ARN', 'Arlanda', 'Stockholm', 'Sweden', 'SE'],
  ['OSL', 'Gardermoen', 'Oslo', 'Norway', 'NO'],
  ['HEL', 'Helsinki-Vantaa', 'Helsinki', 'Finland', 'FI'],
  ['KEF', 'Keflavík', 'Reykjavík', 'Iceland', 'IS'],
  ['ATH', 'Athens', 'Athens', 'Greece', 'GR'],
  ['IST', 'Istanbul', 'Istanbul', 'Türkiye', 'TR'],
  ['SAW', 'Sabiha Gökçen', 'Istanbul', 'Türkiye', 'TR'],
  ['WAW', 'Chopin', 'Warsaw', 'Poland', 'PL'],
  ['KRK', 'John Paul II', 'Kraków', 'Poland', 'PL'],
  ['PRG', 'Václav Havel', 'Prague', 'Czechia', 'CZ'],
  ['BUD', 'Ferenc Liszt', 'Budapest', 'Hungary', 'HU'],
  ['OTP', 'Henri Coandă', 'Bucharest', 'Romania', 'RO'],
  ['SOF', 'Sofia', 'Sofia', 'Bulgaria', 'BG'],
  ['ZAG', 'Franjo Tuđman', 'Zagreb', 'Croatia', 'HR'],
  ['SPU', 'Split', 'Split', 'Croatia', 'HR'],
  ['BEG', 'Nikola Tesla', 'Belgrade', 'Serbia', 'RS'],
  ['TIA', 'Nënë Tereza', 'Tirana', 'Albania', 'AL'],
  ['PRN', 'Adem Jashari', 'Pristina', 'Kosovo', 'XK'],
  ['SKP', 'Skopje', 'Skopje', 'North Macedonia', 'MK'],
  ['LJU', 'Jože Pučnik', 'Ljubljana', 'Slovenia', 'SI'],
  ['RIX', 'Riga', 'Riga', 'Latvia', 'LV'],
  ['TLL', 'Lennart Meri', 'Tallinn', 'Estonia', 'EE'],
  ['VNO', 'Vilnius', 'Vilnius', 'Lithuania', 'LT'],

  // North America
  ['JFK', 'John F. Kennedy', 'New York', 'United States', 'US'],
  ['EWR', 'Newark Liberty', 'New York', 'United States', 'US'],
  ['LGA', 'LaGuardia', 'New York', 'United States', 'US'],
  ['BOS', 'Logan', 'Boston', 'United States', 'US'],
  ['IAD', 'Dulles', 'Washington', 'United States', 'US'],
  ['ATL', 'Hartsfield-Jackson', 'Atlanta', 'United States', 'US'],
  ['MIA', 'Miami', 'Miami', 'United States', 'US'],
  ['MCO', 'Orlando', 'Orlando', 'United States', 'US'],
  ['ORD', "O'Hare", 'Chicago', 'United States', 'US'],
  ['DFW', 'Dallas/Fort Worth', 'Dallas', 'United States', 'US'],
  ['DEN', 'Denver', 'Denver', 'United States', 'US'],
  ['PHX', 'Sky Harbor', 'Phoenix', 'United States', 'US'],
  ['LAS', 'Harry Reid', 'Las Vegas', 'United States', 'US'],
  ['LAX', 'Los Angeles', 'Los Angeles', 'United States', 'US'],
  ['SFO', 'San Francisco', 'San Francisco', 'United States', 'US'],
  ['SEA', 'Seattle-Tacoma', 'Seattle', 'United States', 'US'],
  ['YYZ', 'Pearson', 'Toronto', 'Canada', 'CA'],
  ['YVR', 'Vancouver', 'Vancouver', 'Canada', 'CA'],
  ['YUL', 'Montréal-Trudeau', 'Montréal', 'Canada', 'CA'],
  ['MEX', 'Benito Juárez', 'Mexico City', 'Mexico', 'MX'],
  ['CUN', 'Cancún', 'Cancún', 'Mexico', 'MX'],

  // South America
  ['GRU', 'Guarulhos', 'São Paulo', 'Brazil', 'BR'],
  ['GIG', 'Galeão', 'Rio de Janeiro', 'Brazil', 'BR'],
  ['EZE', 'Ezeiza', 'Buenos Aires', 'Argentina', 'AR'],
  ['SCL', 'Arturo Merino Benítez', 'Santiago', 'Chile', 'CL'],
  ['BOG', 'El Dorado', 'Bogotá', 'Colombia', 'CO'],
  ['LIM', 'Jorge Chávez', 'Lima', 'Peru', 'PE'],

  // Middle East and Africa
  ['DXB', 'Dubai', 'Dubai', 'United Arab Emirates', 'AE'],
  ['AUH', 'Zayed', 'Abu Dhabi', 'United Arab Emirates', 'AE'],
  ['DOH', 'Hamad', 'Doha', 'Qatar', 'QA'],
  ['RUH', 'King Khalid', 'Riyadh', 'Saudi Arabia', 'SA'],
  ['JED', 'King Abdulaziz', 'Jeddah', 'Saudi Arabia', 'SA'],
  ['TLV', 'Ben Gurion', 'Tel Aviv', 'Israel', 'IL'],
  ['CAI', 'Cairo', 'Cairo', 'Egypt', 'EG'],
  ['CMN', 'Mohammed V', 'Casablanca', 'Morocco', 'MA'],
  ['JNB', 'O. R. Tambo', 'Johannesburg', 'South Africa', 'ZA'],
  ['CPT', 'Cape Town', 'Cape Town', 'South Africa', 'ZA'],
  ['NBO', 'Jomo Kenyatta', 'Nairobi', 'Kenya', 'KE'],
  ['ADD', 'Bole', 'Addis Ababa', 'Ethiopia', 'ET'],
  ['LOS', 'Murtala Muhammed', 'Lagos', 'Nigeria', 'NG'],

  // Asia
  ['HND', 'Haneda', 'Tokyo', 'Japan', 'JP'],
  ['NRT', 'Narita', 'Tokyo', 'Japan', 'JP'],
  ['KIX', 'Kansai', 'Osaka', 'Japan', 'JP'],
  ['ICN', 'Incheon', 'Seoul', 'South Korea', 'KR'],
  ['PEK', 'Capital', 'Beijing', 'China', 'CN'],
  ['PVG', 'Pudong', 'Shanghai', 'China', 'CN'],
  ['CAN', 'Baiyun', 'Guangzhou', 'China', 'CN'],
  ['HKG', 'Hong Kong', 'Hong Kong', 'Hong Kong', 'HK'],
  ['TPE', 'Taoyuan', 'Taipei', 'Taiwan', 'TW'],
  ['SIN', 'Changi', 'Singapore', 'Singapore', 'SG'],
  ['BKK', 'Suvarnabhumi', 'Bangkok', 'Thailand', 'TH'],
  ['HKT', 'Phuket', 'Phuket', 'Thailand', 'TH'],
  ['KUL', 'Kuala Lumpur', 'Kuala Lumpur', 'Malaysia', 'MY'],
  ['CGK', 'Soekarno-Hatta', 'Jakarta', 'Indonesia', 'ID'],
  ['DPS', 'Ngurah Rai', 'Bali', 'Indonesia', 'ID'],
  ['MNL', 'Ninoy Aquino', 'Manila', 'Philippines', 'PH'],
  ['DEL', 'Indira Gandhi', 'Delhi', 'India', 'IN'],
  ['BOM', 'Chhatrapati Shivaji', 'Mumbai', 'India', 'IN'],
  ['BLR', 'Kempegowda', 'Bengaluru', 'India', 'IN'],
  ['MAA', 'Chennai', 'Chennai', 'India', 'IN'],
  ['HYD', 'Rajiv Gandhi', 'Hyderabad', 'India', 'IN'],
  ['CMB', 'Bandaranaike', 'Colombo', 'Sri Lanka', 'LK'],
  ['MLE', 'Velana', 'Malé', 'Maldives', 'MV'],
  ['KTM', 'Tribhuvan', 'Kathmandu', 'Nepal', 'NP'],

  // Oceania
  ['SYD', 'Kingsford Smith', 'Sydney', 'Australia', 'AU'],
  ['MEL', 'Melbourne', 'Melbourne', 'Australia', 'AU'],
  ['BNE', 'Brisbane', 'Brisbane', 'Australia', 'AU'],
  ['PER', 'Perth', 'Perth', 'Australia', 'AU'],
  ['AKL', 'Auckland', 'Auckland', 'New Zealand', 'NZ'],
  ['CHC', 'Christchurch', 'Christchurch', 'New Zealand', 'NZ'],
  ['NAN', 'Nadi', 'Nadi', 'Fiji', 'FJ'],
];

export const FALLBACK_AIRPORTS: readonly Place[] = ROWS.map(
  ([iataCode, name, cityName, countryName, countryCode]) => ({
    iataCode,
    name,
    cityName,
    countryName,
    countryCode,
    kind: 'airport' as const,
  }),
);

const BY_CODE = new Map(FALLBACK_AIRPORTS.map((place) => [place.iataCode, place]));

/** Exact IATA lookup against the bundled index. */
export function lookupAirport(code: string): Place | null {
  return BY_CODE.get(code.trim().toUpperCase()) ?? null;
}

/** Strips diacritics so "Malaga" finds "Málaga" and "Zurich" finds "Zürich". */
function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/**
 * Ranked local search.
 *
 * An exact IATA code always wins, then code and city prefixes, then anything
 * that merely contains the term. Without the tiering, typing "LON" surfaces
 * Londrina before London.
 */
export function searchFallbackAirports(term: string, limit = 6): Place[] {
  const needle = fold(term.trim());
  if (needle.length === 0) return [];

  const scored: { place: Place; rank: number }[] = [];

  for (const place of FALLBACK_AIRPORTS) {
    const code = fold(place.iataCode);
    const city = fold(place.cityName);
    const name = fold(place.name);
    const country = fold(place.countryName);

    let rank: number | null = null;
    if (code === needle) rank = 0;
    else if (city === needle) rank = 1;
    else if (code.startsWith(needle)) rank = 2;
    else if (city.startsWith(needle)) rank = 3;
    else if (name.startsWith(needle)) rank = 4;
    else if (city.includes(needle) || name.includes(needle)) rank = 5;
    else if (country.startsWith(needle)) rank = 6;

    if (rank !== null) scored.push({ place, rank });
  }

  return scored
    .sort((a, b) => a.rank - b.rank || a.place.cityName.localeCompare(b.place.cityName))
    .slice(0, limit)
    .map((entry) => entry.place);
}
