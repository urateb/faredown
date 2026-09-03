import 'server-only';

import { type NextRequest, NextResponse } from 'next/server';

import { MissingConfigError } from '@/lib/env';
import { AppError, type ApiErrorBody, toApiErrorBody } from '@/lib/errors';
import { clientKey, rateLimit, type RateLimitOptions } from '@/lib/rate-limit';

/** Turns anything thrown inside a route into the app's single error envelope. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof MissingConfigError) {
    return new AppError('configuration', { detail: error.message, cause: error });
  }
  return new AppError('unknown', {
    detail: error instanceof Error ? error.message : String(error),
    cause: error,
  });
}

export function errorResponse(
  error: unknown,
  fields?: Record<string, string>,
): NextResponse<ApiErrorBody> {
  const appError = toAppError(error);

  // Log the internal detail; the response body deliberately carries none of it.
  if (appError.httpStatus >= 500 || appError.code === 'configuration') {
    console.error(
      `[${appError.code}] ${appError.detail ?? appError.message}`,
      appError.cause ?? '',
    );
  }

  return NextResponse.json(toApiErrorBody(appError, fields), { status: appError.httpStatus });
}

export function validationErrorResponse(
  fields: Record<string, string>,
): NextResponse<ApiErrorBody> {
  return errorResponse(new AppError('invalid_request'), fields);
}

/**
 * Applies per-client rate limiting before running a handler.
 *
 * Every route that reaches the paid upstream API goes through this.
 */
export async function withRateLimit(
  request: NextRequest,
  scope: string,
  options: RateLimitOptions,
  handler: () => Promise<NextResponse>,
): Promise<NextResponse> {
  const result = rateLimit(`${scope}:${clientKey(request)}`, options);

  if (!result.allowed) {
    const response = errorResponse(new AppError('rate_limited'));
    response.headers.set('Retry-After', String(result.retryAfterSeconds));
    return response;
  }

  try {
    const response = await handler();
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    return response;
  } catch (error) {
    return errorResponse(error);
  }
}
