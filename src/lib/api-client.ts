import type { ApiErrorBody, AppErrorCode } from '@/lib/errors';

/**
 * A failed call to this app's own API, already translated into the shared error
 * vocabulary so components can branch on `code` instead of parsing messages.
 */
export class ApiClientError extends Error {
  readonly code: AppErrorCode;
  readonly retryable: boolean;
  readonly fields: Record<string, string>;

  constructor(code: AppErrorCode, message: string, retryable: boolean, fields = {}) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.retryable = retryable;
    this.fields = fields;
  }
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return (
    typeof value === 'object' &&
    value !== null &&
    'error' in value &&
    typeof (value as ApiErrorBody).error?.code === 'string'
  );
}

export async function apiGet<T>(
  path: string,
  params?: URLSearchParams,
  signal?: AbortSignal,
): Promise<T> {
  const url = params && params.size > 0 ? `${path}?${params}` : path;

  let response: Response;
  try {
    response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  } catch (error) {
    // An aborted request is a deliberate cancellation, not a failure to report.
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new ApiClientError(
      'upstream_unavailable',
      'Could not reach the server. Check your connection and try again.',
      true,
    );
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    if (isApiErrorBody(body)) {
      throw new ApiClientError(
        body.error.code,
        body.error.message,
        body.error.retryable,
        body.error.fields ?? {},
      );
    }
    throw new ApiClientError('unknown', 'Something went wrong. Please try again.', true);
  }

  return body as T;
}
