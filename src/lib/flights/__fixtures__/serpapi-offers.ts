import type { SerpApiSearchResponse } from '@/lib/serpapi/types';

export const SERPAPI_OFFERS_FIXTURE: SerpApiSearchResponse = {
  best_flights: [
    {
      flights: [
        {
          departure_airport: { id: 'LHR', name: 'Heathrow', time: '2026-10-01 09:15' },
          arrival_airport: { id: 'JFK', name: 'John F. Kennedy', time: '2026-10-01 12:20' },
          duration: 485,
          airline: 'British Airways',
          flight_number: 'BA 175',
          airplane: 'Boeing 777',
          travel_class: 'Economy',
        },
      ],
      total_duration: 485,
      price: 512.3,
      type: 'One way',
    },
  ],
  other_flights: [
    {
      flights: [
        {
          departure_airport: { id: 'LHR', name: 'Heathrow', time: '2026-10-01 06:00' },
          arrival_airport: { id: 'CDG', name: 'Charles de Gaulle', time: '2026-10-01 08:20' },
          duration: 80,
          airline: 'Air France',
          flight_number: 'AF 1281',
          extensions: ['Operated by KLM Royal Dutch Airlines'],
        },
        {
          departure_airport: { id: 'CDG', name: 'Charles de Gaulle', time: '2026-10-01 10:30' },
          arrival_airport: { id: 'JFK', name: 'John F. Kennedy', time: '2026-10-01 13:00' },
          duration: 510,
          airline: 'Air France',
          flight_number: 'AF 10',
        },
      ],
      layovers: [{ id: 'CDG', name: 'Charles de Gaulle', duration: 130 }],
      total_duration: 720,
      price: 398,
      type: 'One way',
    },
    {
      flights: [
        {
          departure_airport: { id: 'JFK', name: 'John F. Kennedy', time: '2026-10-08 18:30' },
          arrival_airport: { id: 'LHR', name: 'Heathrow', time: '2026-10-09 06:30' },
          duration: 420,
          airline: 'British Airways',
          flight_number: 'BA 176',
        },
      ],
      total_duration: 420,
      price: 480,
      type: 'One way',
    },
  ],
};
