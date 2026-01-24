import Amadeus from 'amadeus';
import { NextRequest, NextResponse } from 'next/server';

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

export async function GET(req: NextRequest) {
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
