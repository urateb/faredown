import { NextResponse, type NextRequest } from 'next/server';

import { flightSearchQuerySchema } from '@/lib/flights/search-params';
import { searchFlights } from '@/lib/flights/service';
import { validationErrorResponse, withRateLimit } from '@/lib/http/route-helpers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RATE_LIMIT = { limit: 30, windowMs: 60_000 };

export async function GET(request: NextRequest) {
  return withRateLimit(request, 'flights:search', RATE_LIMIT, async () => {
    const parsed = flightSearchQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams),
    );

    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string') fields[key] ??= issue.message;
      }
      return validationErrorResponse(fields);
    }

    const result = await searchFlights(parsed.data);
    return NextResponse.json(result);
  });
}
