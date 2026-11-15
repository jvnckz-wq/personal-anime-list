/** Shared plumbing for the anime data sources: rate-limit queues, caching, retries and errors. */

export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const LIST_TTL = 5 * MINUTE;
export const DETAIL_TTL = 24 * 60 * MINUTE;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Plain-language message for an error state. */
export function errorMessage(err: unknown) {
  if (err instanceof ApiError) {
    if (err.status === 429) return "Too many requests in the last minute. Wait a few seconds, then try again.";
    if (err.status === 404) return "This anime isn't in the database anymore.";
    if (err.status === 0) return "Couldn't reach the anime database. Check your connection, then try again.";
    return "The anime database had a problem on its side. Try again in a moment.";
  }
  return "Something went wrong while loading. Try again.";
}

/** A queue that hands out request slots in call order, within a per-second and per-minute limit. */
export function createQueue(perSecond: number, perMinute: number) {
  let stamps: number[] = [];
  let ticket: Promise<void> = Promise.resolve();
  async function takeSlot() {
    for (;;) {
      const now = Date.now();
      stamps = stamps.filter((t) => now - t < MINUTE);
      const lastSecond = stamps.filter((t) => now - t < SECOND);
      if (lastSecond.length < perSecond && stamps.length < perMinute) {
        stamps.push(now);
        return;
      }
      const waitSecond = lastSecond.length >= perSecond ? SECOND - (now - lastSecond[0]) : 0;
      const waitMinute = stamps.length >= perMinute ? MINUTE - (now - stamps[0]) : 0;
      await sleep(Math.max(waitSecond, waitMinute, 20) + 10);
    }
  }
  return function queued<T>(fn: () => Promise<T>): Promise<T> {
    const mine = ticket.then(takeSlot);
    ticket = mine.catch(() => undefined);
    return mine.then(fn);
  };
}

type CacheEntry = { t: number; data: unknown };
const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

function readCache(key: string, ttl: number): unknown {
  let hit = memory.get(key);
  if (!hit && typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem("anime:" + key);
      if (raw) {
        hit = JSON.parse(raw) as CacheEntry;
        memory.set(key, hit);
      }
    } catch {
      /* session storage unavailable: memory cache only */
    }
  }
  return hit && Date.now() - hit.t < ttl ? hit.data : undefined;
}

function writeCache(key: string, data: unknown) {
  const entry = { t: Date.now(), data };
  memory.set(key, entry);
  try {
    window.sessionStorage.setItem("anime:" + key, JSON.stringify(entry));
  } catch {
    /* full or unavailable: keep the memory copy */
  }
}

/**
 * Cached, de-duplicated request: one in-flight call per key, a cache hit within ttl,
 * and up to 3 retries with backoff on 429 before the error surfaces.
 */
export async function cachedRequest<T>(key: string, ttl: number, queued: <R>(fn: () => Promise<R>) => Promise<R>, send: () => Promise<Response>): Promise<T> {
  const cached = readCache(key, ttl);
  if (cached !== undefined) return cached as T;
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;
  const run = (async () => {
    for (let attempt = 0; ; attempt++) {
      let res: Response;
      try {
        res = await queued(send);
      } catch {
        throw new ApiError(0, "network");
      }
      if (res.status === 429 && attempt < 3) {
        const retryAfter = Number(res.headers.get("Retry-After"));
        await sleep(retryAfter > 0 ? retryAfter * SECOND : SECOND * 2 ** attempt);
        continue;
      }
      if (!res.ok) throw new ApiError(res.status, res.statusText);
      const json = (await res.json()) as T;
      writeCache(key, json);
      return json;
    }
  })();
  inflight.set(key, run);
  try {
    return await run;
  } finally {
    inflight.delete(key);
  }
}
