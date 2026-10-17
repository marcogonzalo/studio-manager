/** Default pause when 429 has no usable Retry-After header. */
export const DEFAULT_UPLOAD_RETRY_AFTER_SEC = 60;

/**
 * Parse Retry-After as delta-seconds. HTTP-date values fall back to default.
 */
export function parseRetryAfterSeconds(
  response: Response,
  fallbackSec: number = DEFAULT_UPLOAD_RETRY_AFTER_SEC
): number {
  const raw = response.headers.get("Retry-After")?.trim();
  if (!raw) return Math.max(1, fallbackSec);

  const asInt = Number.parseInt(raw, 10);
  if (!Number.isNaN(asInt) && String(asInt) === raw) {
    return Math.max(1, asInt);
  }

  return Math.max(1, fallbackSec);
}

export function isRateLimitStatus(status: number): boolean {
  return status === 429;
}
