import { z } from 'zod';

const serverEnvSchema = z.object({
  SERPAPI_KEY: z.string().min(1),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export class MissingConfigError extends Error {
  readonly missing: string[];

  constructor(missing: string[]) {
    super(`Missing or invalid server configuration: ${missing.join(', ')}`);
    this.name = 'MissingConfigError';
    this.missing = missing;
  }
}

let cached: ServerEnv | null = null;

export function getServerEnv(): ServerEnv {
  if (cached) return cached;

  const parsed = serverEnvSchema.safeParse({
    SERPAPI_KEY: process.env.SERPAPI_KEY,
  });

  if (!parsed.success) {
    throw new MissingConfigError(parsed.error.issues.map((issue) => issue.path.join('.')));
  }

  cached = parsed.data;
  return cached;
}

export function resetServerEnvCache(): void {
  cached = null;
}

export const DEFAULT_CURRENCY = (process.env.NEXT_PUBLIC_DEFAULT_CURRENCY ?? 'EUR').toUpperCase();
