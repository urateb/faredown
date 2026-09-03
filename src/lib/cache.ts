/**
 * A small in-process TTL cache.
 *
 * Each search is billed by the upstream API, and the flexible-date
 * grid fans a single user action out into several searches, so repeat lookups
 * are worth avoiding.
 *
 * Deliberately in-memory: it needs no infrastructure, and the trade-off is that
 * each serverless instance keeps its own copy and cold starts begin empty. That
 * is fine for a cache whose only job is smoothing bursts. A shared Redis would
 * be the next step if this ever ran at real traffic.
 */
export interface TtlCacheOptions {
  ttlMs: number;
  maxEntries?: number;
}

interface Entry<T> {
  value: T;
  expiresAt: number;
}

export class TtlCache<T> {
  private readonly store = new Map<string, Entry<T>>();
  private readonly ttlMs: number;
  private readonly maxEntries: number;

  constructor({ ttlMs, maxEntries = 500 }: TtlCacheOptions) {
    this.ttlMs = ttlMs;
    this.maxEntries = maxEntries;
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    // Refresh insertion order so the eviction below approximates LRU.
    this.store.delete(key);
    this.store.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.store.size >= this.maxEntries) {
      const oldest = this.store.keys().next();
      if (!oldest.done) this.store.delete(oldest.value);
    }
    this.store.set(key, { value, expiresAt: Date.now() + this.ttlMs });
  }

  /** Runs `factory` only on a miss, and shares one in-flight call between callers. */
  async fetch(key: string, factory: () => Promise<T>): Promise<T> {
    const hit = this.get(key);
    if (hit !== undefined) return hit;

    const existing = this.inFlight.get(key);
    if (existing) return existing;

    const promise = factory()
      .then((value) => {
        this.set(key, value);
        return value;
      })
      .finally(() => {
        this.inFlight.delete(key);
      });

    this.inFlight.set(key, promise);
    return promise;
  }

  clear(): void {
    this.store.clear();
    this.inFlight.clear();
  }

  private readonly inFlight = new Map<string, Promise<T>>();
}
