interface RateLimitInfo {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting.
// Note: In serverless environments (like Netlify), this state is local to each 
// function instance and will reset on cold boots. For a strict global rate limit,
// use Redis (e.g. Upstash). This provides basic abuse protection.
const rateLimitCache = new Map<string, RateLimitInfo>();

/**
 * Checks if the given identifier (IP or User ID) has exceeded the rate limit.
 * 
 * @param identifier Unique string identifying the client
 * @param limit Max number of requests allowed in the window
 * @param windowMs Time window in milliseconds
 * @returns boolean `true` if allowed, `false` if rate limit exceeded
 */
export function checkRateLimit(identifier: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  let record = rateLimitCache.get(identifier);

  // Clear expired records periodically to prevent memory leaks in long-running processes
  if (rateLimitCache.size > 1000) {
    for (const [key, val] of rateLimitCache.entries()) {
      if (val.resetTime < now) {
        rateLimitCache.delete(key);
      }
    }
  }

  if (!record || record.resetTime < now) {
    record = {
      count: 1,
      resetTime: now + windowMs,
    };
    rateLimitCache.set(identifier, record);
    return true; // Allowed
  }

  if (record.count < limit) {
    record.count += 1;
    rateLimitCache.set(identifier, record);
    return true; // Allowed
  }

  return false; // Rate limit exceeded
}
