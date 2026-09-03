import 'server-only';

import { getServerEnv, MissingConfigError } from '@/lib/env';
import { AppError } from '@/lib/errors';

import type { SerpApiSearchResponse } from './types';

const BASE_URL = 'https://serpapi.com/search.json';
const REQUEST_TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 3;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const TRAVEL_CLASS: Record<string, string> = {
  ECONOMY: '1',
  PREMIUM_ECONOMY: '2',
  BUSINESS: '3',
  FIRST: '4',
};

/** Google country used for localisation. Currency is sent separately. */
const GL_FOR_CURRENCY: Record<string, string> = {
  EUR: 'de',
  USD: 'us',
  GBP: 'uk',
  CAD: 'ca',
  AUD: 'au',
  CHF: 'ch',
};

export interface SerpApiFlightQuery {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  adults: number;
  cabin: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  currency: string;
  nonStop?: boolean;
}

function isQuotaExhausted(detail: string): boolean {
  return /run out of search|out of searches|quota|limit.*search/i.test(detail);
}

function describeFailure(status: number, body: { error?: string; message?: string }): AppError {
  const detail = body.error ?? body.message ?? `HTTP ${status}`;

  if (isQuotaExhausted(detail) || status === 429) {
    const quota = isQuotaExhausted(detail);
    return new AppError('rate_limited', {
      detail,
      retryable: !quota,
      userMessage: quota
        ? 'The SerpApi monthly search allowance is used up. Cached searches are still free; new routes need more searches at serpapi.com.'
        : undefined,
    });
  }
  if (status === 400 || status === 404 || status === 422) {
    return new AppError('upstream_rejected', {
      detail,
      userMessage: 'That route or date could not be searched.',
    });
  }
  if (status === 401 || status === 403) {
    return new AppError('configuration', {
      detail,
      userMessage: 'The SerpApi key was rejected. Check SERPAPI_KEY in .env.local.',
    });
  }
  if (status >= 500) return new AppError('upstream_unavailable', { detail });
  return new AppError('unknown', { detail });
}

function buildUrl(query: SerpApiFlightQuery): string {
  const apiKey = getServerEnv().SERPAPI_KEY;
  const params = new URLSearchParams({
    engine: 'google_flights',
    api_key: apiKey,
    departure_id: query.origin,
    arrival_id: query.destination,
    outbound_date: query.departureDate,
    type: query.returnDate ? '1' : '2',
    adults: String(query.adults),
    travel_class: TRAVEL_CLASS[query.cabin] ?? '1',
    currency: query.currency,
    hl: 'en',
    gl: GL_FOR_CURRENCY[query.currency] ?? 'us',
  });
  if (query.returnDate) params.set('return_date', query.returnDate);
  if (query.nonStop) params.set('stops', '1');
  return `${BASE_URL}?${params.toString()}`;
}

/**
 * GET Google Flights results via SerpApi.
 *
 * The key is a query parameter — that is how SerpApi authenticates. This
 * function only runs on the server, so the key never reaches the browser.
 * Identical requests are left cacheable (`no_cache` is not set) so SerpApi
 * does not bill a repeat of the same search within an hour.
 */
export async function serpApiSearch(
  query: SerpApiFlightQuery,
  signal?: AbortSignal,
): Promise<SerpApiSearchResponse> {
  let url: string;
  try {
    url = buildUrl(query);
  } catch (error) {
    if (error instanceof MissingConfigError) {
      throw new AppError('configuration', {
        cause: error,
        userMessage:
          'Flight search needs a SerpApi key. Create a free account at serpapi.com, then set SERPAPI_KEY in .env.local.',
      });
    }
    throw error;
  }

  let lastError: AppError | null = null;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(url, {
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (cause) {
      const aborted = cause instanceof Error && cause.name === 'TimeoutError';
      lastError = new AppError(aborted ? 'timeout' : 'upstream_unavailable', {
        detail: 'SerpApi request failed',
        cause,
      });
      if (attempt < MAX_ATTEMPTS) await sleep(250 * 2 ** (attempt - 1));
      continue;
    }

    const body = (await response.json().catch(() => ({}))) as SerpApiSearchResponse & {
      message?: string;
    };

    if (typeof body.error === 'string' && body.error.length > 0) {
      lastError = describeFailure(response.ok ? 400 : response.status, body);
      if (!lastError.retryable || attempt === MAX_ATTEMPTS) throw lastError;
      await sleep(250 * 2 ** (attempt - 1));
      continue;
    }

    if (response.ok) return body;

    lastError = describeFailure(response.status, body);
    if (!lastError.retryable || attempt === MAX_ATTEMPTS) throw lastError;
    await sleep(250 * 2 ** (attempt - 1));
  }

  throw lastError ?? new AppError('unknown');
}
