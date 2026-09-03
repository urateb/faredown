import { NextResponse, type NextRequest } from 'next/server';

import { searchPlaces } from '@/lib/places/service';
import { withRateLimit } from '@/lib/http/route-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Autocomplete fires on typing, so this allows far more calls than search does.
const RATE_LIMIT = { limit: 120, windowMs: 60_000 };

export async function GET(request: NextRequest) {
  return withRateLimit(request, 'places', RATE_LIMIT, async () => {
    const keyword = request.nextUrl.searchParams.get('q') ?? '';
    const result = await searchPlaces(keyword);

    const response = NextResponse.json(result);
    // Airport metadata barely changes; let the browser reuse it between keystrokes.
    response.headers.set('Cache-Control', 'private, max-age=300');
    return response;
  });
}
