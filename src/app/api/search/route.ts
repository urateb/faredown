import Amadeus from 'amadeus';
import { NextRequest, NextResponse } from 'next/server';

const amadeus = new Amadeus({
    clientId: process.env.AMADEUS_CLIENT_ID,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET,
});

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const origin = searchParams.get('origin');
    const destination = searchParams.get('destination');
    const departureDate = searchParams.get('date');
    const returnDate = searchParams.get('returnDate');
    const adults = searchParams.get('adults') || '1';
    const nonStop = searchParams.get('nonStop') === 'true';

    if (!origin || !destination || !departureDate) {
        return NextResponse.json(
            { error: 'Missing required parameters' },
            { status: 400 }
        );
    }

    try {
        const query: any = {
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: departureDate,
            adults: adults,
            nonStop: nonStop
        };

        if (returnDate) {
            query.returnDate = returnDate;
        }

        const response = await amadeus.shopping.flightOffersSearch.get(query);

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error('Amadeus API Error:', error);
        return NextResponse.json(
            { error: error.description || 'Failed to fetch flight offers' },
            { status: 500 }
        );
    }
}
