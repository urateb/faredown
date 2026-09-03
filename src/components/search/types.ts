import type { AppErrorCode } from '@/lib/errors';

export interface SearchPageError {
  code: AppErrorCode;
  message: string;
  retryable: boolean;
}
