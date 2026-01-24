export interface Airport {
    code: string;
    city: string;
    name: string;
    country: string;
}

export const airports: Airport[] = [
    // Europe
    { code: 'LHR', city: 'London', name: 'Heathrow Airport', country: 'United Kingdom' },
    { code: 'LGW', city: 'London', name: 'Gatwick Airport', country: 'United Kingdom' },
    { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle Airport', country: 'France' },
    { code: 'ORY', city: 'Paris', name: 'Orly Airport', country: 'France' },
    { code: 'FRA', city: 'Frankfurt', name: 'Frankfurt Airport', country: 'Germany' },
    { code: 'MUC', city: 'Munich', name: 'Munich Airport', country: 'Germany' },
    { code: 'AMS', city: 'Amsterdam', name: 'Schiphol Airport', country: 'Netherlands' },
    { code: 'MAD', city: 'Madrid', name: 'Adolfo Suárez Madrid–Barajas Airport', country: 'Spain' },
    { code: 'BCN', city: 'Barcelona', name: 'Josep Tarradellas Barcelona-El Prat Airport', country: 'Spain' },
    { code: 'FCO', city: 'Rome', name: 'Leonardo da Vinci–Fiumicino Airport', country: 'Italy' },
    { code: 'ZRH', city: 'Zurich', name: 'Zurich Airport', country: 'Switzerland' },
    { code: 'IST', city: 'Istanbul', name: 'Istanbul Airport', country: 'Turkey' },

    // North America
    { code: 'JFK', city: 'New York', name: 'John F. Kennedy International Airport', country: 'USA' },
    { code: 'EWR', city: 'New York', name: 'Newark Liberty International Airport', country: 'USA' },
    { code: 'LGA', city: 'New York', name: 'LaGuardia Airport', country: 'USA' },
    { code: 'LAX', city: 'Los Angeles', name: 'Los Angeles International Airport', country: 'USA' },
    { code: 'SFO', city: 'San Francisco', name: 'San Francisco International Airport', country: 'USA' },
    { code: 'ORD', city: 'Chicago', name: 'O\'Hare International Airport', country: 'USA' },
    { code: 'ATL', city: 'Atlanta', name: 'Hartsfield–Jackson Atlanta International Airport', country: 'USA' },
    { code: 'MIA', city: 'Miami', name: 'Miami International Airport', country: 'USA' },
    { code: 'YYZ', city: 'Toronto', name: 'Toronto Pearson International Airport', country: 'Canada' },
    { code: 'YVR', city: 'Vancouver', name: 'Vancouver International Airport', country: 'Canada' },

    // Asia
    { code: 'DXB', city: 'Dubai', name: 'Dubai International Airport', country: 'UAE' },
    { code: 'HND', city: 'Tokyo', name: 'Haneda Airport', country: 'Japan' },
    { code: 'NRT', city: 'Tokyo', name: 'Narita International Airport', country: 'Japan' },
    { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore' },
    { code: 'HKG', city: 'Hong Kong', name: 'Hong Kong International Airport', country: 'Hong Kong' },
    { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi Airport', country: 'Thailand' },
    { code: 'ICN', city: 'Seoul', name: 'Incheon International Airport', country: 'South Korea' },

    // Oceania
    { code: 'SYD', city: 'Sydney', name: 'Sydney Kingsford Smith Airport', country: 'Australia' },
    { code: 'MEL', city: 'Melbourne', name: 'Melbourne Airport', country: 'Australia' },
    { code: 'AKL', city: 'Auckland', name: 'Auckland Airport', country: 'New Zealand' },
];
