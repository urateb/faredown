import Amadeus from 'amadeus';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    const clientId = process.env.AMADEUS_CLIENT_ID;
    const clientSecret = process.env.AMADEUS_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error('Amadeus API credentials are missing from environment variables');
        return NextResponse.json({ error: 'API configuration error' }, { status: 500 });
    }

    const amadeus = new Amadeus({ clientId, clientSecret });
    const s = req.nextUrl.searchParams;
    const origin = s.get('origin'), destination = s.get('destination'), date = s.get('date');

    if (!origin || !destination || !date) {
        return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    try {
        const { result } = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: date,
            adults: s.get('adults') || '1',
            nonStop: s.get('nonStop') === 'true',
            ...(s.get('returnDate') && { returnDate: s.get('returnDate') })
        });
        return NextResponse.json(result);
    } catch (e: any) {
        return NextResponse.json({ error: e.description || 'Search failed' }, { status: 500 });
    }
}
