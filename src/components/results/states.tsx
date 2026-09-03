import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { AppErrorCode } from '@/lib/errors';

export function ResultsSkeleton() {
  return (
    <div className="space-y-4" role="status" aria-label="Searching for flights">
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} className="border-ink-800 rounded-2xl border bg-ink-900 p-5">
          <div className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-3 flex-1" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      ))}
      <span className="sr-only">Searching for flights</span>
    </div>
  );
}

interface MessageStateProps {
  title: string;
  body: string;
  action?: { label: string; onClick: () => void };
  tone?: 'neutral' | 'error';
}

function MessageState({ title, body, action, tone = 'neutral' }: MessageStateProps) {
  return (
    <div className="border-ink-800 rounded-2xl border bg-ink-900 px-6 py-12 text-center">
      <span
        aria-hidden="true"
        className={
          tone === 'error'
            ? 'bg-up-50 text-up-400 mx-auto flex h-12 w-12 items-center justify-center rounded-full'
            : 'bg-ink-800 text-ink-400 mx-auto flex h-12 w-12 items-center justify-center rounded-full'
        }
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor">
          {tone === 'error' ? (
            <path
              strokeLinecap="round"
              strokeWidth="2"
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          ) : (
            <path
              strokeLinecap="round"
              strokeWidth="2"
              d="M21 21l-4.5-4.5M17 10a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          )}
        </svg>
      </span>
      <h2 className="text-ink-50 mt-4 text-lg font-semibold">{title}</h2>
      <p className="text-ink-400 mx-auto mt-1 max-w-md text-sm">{body}</p>
      {action && (
        <Button variant="secondary" className="mt-5" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}

export function NoResultsState({ onWiden }: { onWiden?: () => void }) {
  return (
    <MessageState
      title="No flights for this search"
      body="Nothing is being sold on this route for the dates you picked. Try shifting the dates by a day or two, or allow connections."
      {...(onWiden ? { action: { label: 'Clear filters', onClick: onWiden } } : {})}
    />
  );
}

export function NoMatchesState({ onClearFilters }: { onClearFilters: () => void }) {
  return (
    <MessageState
      title="No flights match your filters"
      body="There are results for this route, but none that fit every filter you have set."
      action={{ label: 'Clear filters', onClick: onClearFilters }}
    />
  );
}

export function SearchErrorState({
  error,
  onRetry,
}: {
  error: { code: AppErrorCode; message: string; retryable: boolean };
  onRetry: () => void;
}) {
  const body =
    error.code === 'configuration'
      ? 'Flight search needs a SerpApi key. Create a free account at serpapi.com, then set SERPAPI_KEY in .env.local.'
      : error.message;

  const title =
    error.code === 'rate_limited' && /allowance|credit|quota|monthly search/i.test(error.message)
      ? 'Search allowance used up'
      : 'That search did not go through';

  return (
    <MessageState
      tone="error"
      title={title}
      body={body}
      {...(error.retryable ? { action: { label: 'Try again', onClick: onRetry } } : {})}
    />
  );
}
