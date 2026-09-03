/**
 * A single error vocabulary shared by the API routes and the UI.
 *
 * Every failure the app can produce is mapped to one of these codes so the
 * client can decide how to react (retry, correct the form, or give up) without
 * pattern-matching on prose.
 */
export type AppErrorCode =
  | 'configuration'
  | 'invalid_request'
  | 'no_results'
  | 'rate_limited'
  | 'upstream_rejected'
  | 'upstream_unavailable'
  | 'timeout'
  | 'unknown';

const HTTP_STATUS: Record<AppErrorCode, number> = {
  configuration: 503,
  invalid_request: 400,
  no_results: 200,
  rate_limited: 429,
  upstream_rejected: 422,
  upstream_unavailable: 502,
  timeout: 504,
  unknown: 500,
};

/** Copy shown to the user. Kept free of internal detail. */
const USER_MESSAGE: Record<AppErrorCode, string> = {
  configuration: 'Flight search is not configured on this server yet.',
  invalid_request: 'Some of the search details need fixing.',
  no_results: 'No flights matched this search.',
  rate_limited: 'Too many searches in a short window. Give it a moment and try again.',
  upstream_rejected: 'The airline data provider could not process this search.',
  upstream_unavailable: 'The airline data provider is unavailable right now.',
  timeout: 'The search took too long to come back.',
  unknown: 'Something went wrong while searching.',
};

export interface AppErrorOptions {
  /** Overrides the default user-facing copy for the code. */
  userMessage?: string;
  /** Internal detail for logs. Never returned to the browser. */
  detail?: string;
  /** Whether retrying the identical request could plausibly succeed. */
  retryable?: boolean;
  cause?: unknown;
}

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly httpStatus: number;
  readonly userMessage: string;
  readonly detail?: string;
  readonly retryable: boolean;

  constructor(code: AppErrorCode, options: AppErrorOptions = {}) {
    super(options.detail ?? options.userMessage ?? USER_MESSAGE[code]);
    this.name = 'AppError';
    this.code = code;
    this.httpStatus = HTTP_STATUS[code];
    this.userMessage = options.userMessage ?? USER_MESSAGE[code];
    this.detail = options.detail;
    this.retryable =
      options.retryable ?? ['timeout', 'upstream_unavailable', 'rate_limited'].includes(code);
    if (options.cause !== undefined) this.cause = options.cause;
  }
}

export function isAppError(value: unknown): value is AppError {
  return value instanceof AppError;
}

/** Wire format for every non-2xx API response in this app. */
export interface ApiErrorBody {
  error: {
    code: AppErrorCode;
    message: string;
    retryable: boolean;
    /** Field-level messages, present only for `invalid_request`. */
    fields?: Record<string, string>;
  };
}

export function toApiErrorBody(error: AppError, fields?: Record<string, string>): ApiErrorBody {
  return {
    error: {
      code: error.code,
      message: error.userMessage,
      retryable: error.retryable,
      ...(fields && Object.keys(fields).length > 0 ? { fields } : {}),
    },
  };
}
