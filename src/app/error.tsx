'use client';

import { useEffect } from 'react';

import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/brand/Logo';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4">
      <Logo />
      <h1 className="text-ink-50 mt-8 text-2xl font-semibold tracking-tight">
        Something broke mid-search
      </h1>
      <p className="text-ink-400 mt-2 max-w-md text-center text-sm">
        The page hit an error it could not recover from. Try again, or go back to a fresh search.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button
          variant="secondary"
          onClick={() => {
            window.location.href = '/';
          }}
        >
          New search
        </Button>
      </div>
    </div>
  );
}
