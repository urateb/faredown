import { headers } from 'next/headers';
import type { Metadata } from 'next';

import { SearchPage, type SearchPageError } from '@/components/search/SearchPage';
import { AppError } from '@/lib/errors';
import { toAppError } from '@/lib/http/route-helpers';
import { rateLimit } from '@/lib/rate-limit';
import {
  defaultCriteria,
  fromUrlQuery,
  validateCriteria,
  type FlightSearchQuery,
} from '@/lib/flights/search-params';
import { searchFlights } from '@/lib/flights/service';
import type { SearchResponse } from '@/lib/flights/types';
import { searchDocumentDescription, searchDocumentTitle } from '@/lib/seo';

interface HomePageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const SEARCH_RATE_LIMIT = { limit: 30, windowMs: 60_000 };

export async function generateMetadata({ searchParams }: HomePageProps): Promise<Metadata> {
  const params = toUrlSearchParams(await searchParams);
  const criteria = fromUrlQuery(params);
  if (!criteria) return {};

  const title = searchDocumentTitle(criteria);
  const description = searchDocumentDescription(criteria);
  return {
    title,
    description,
    openGraph: { title, description },
    twitter: { title, description },
  };
}

/**
 * The search runs on the server, driven entirely by the URL.
 *
 * That is what makes a Faredown link worth sharing: opening one renders its
 * results directly, with no client-side fetch waterfall and no empty first
 * paint. Refinement after that — filters, sorting, the flexible-date grid — is
 * client-side, because none of it needs another round trip to the airline API.
 */
export default async function HomePage({ searchParams }: HomePageProps) {
  const params = toUrlSearchParams(await searchParams);
  const criteria = fromUrlQuery(params);

  if (!criteria) {
    return (
      <SearchPage
        urlKey=""
        criteria={defaultCriteria()}
        query={null}
        offers={[]}
        meta={null}
        error={null}
      />
    );
  }

  const urlKey = params.toString();
  const validated = validateCriteria(criteria);

  if (!validated.ok) {
    return (
      <SearchPage
        urlKey={urlKey}
        criteria={criteria}
        query={null}
        offers={[]}
        meta={null}
        error={null}
        fieldErrors={validated.fieldErrors}
      />
    );
  }

  const outcome = await runSearch(validated.query);

  return (
    <SearchPage
      urlKey={urlKey}
      criteria={criteria}
      query={validated.query}
      offers={outcome.result?.offers ?? []}
      meta={outcome.result?.meta ?? null}
      error={outcome.error}
    />
  );
}

/** Next hands repeated keys through as arrays; this search only uses scalars. */
function toUrlSearchParams(raw: Record<string, string | string[] | undefined>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === 'string') params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  }
  return params;
}

async function runSearch(
  query: FlightSearchQuery,
): Promise<{ result: SearchResponse | null; error: SearchPageError | null }> {
  try {
    // Server components have no NextRequest, so identify the caller from the
    // forwarded headers instead. The upstream API bills per call.
    const headerList = await headers();
    const client =
      headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      headerList.get('x-real-ip') ??
      'anonymous';

    if (!rateLimit(`page:search:${client}`, SEARCH_RATE_LIMIT).allowed) {
      throw new AppError('rate_limited');
    }

    return { result: await searchFlights(query), error: null };
  } catch (caught) {
    const error = toAppError(caught);
    if (error.httpStatus >= 500 || error.code === 'configuration') {
      console.error(`[${error.code}] ${error.detail ?? error.message}`, error.cause ?? '');
    }
    // Only the traveller-facing shape crosses to the client.
    return {
      result: null,
      error: { code: error.code, message: error.userMessage, retryable: error.retryable },
    };
  }
}
