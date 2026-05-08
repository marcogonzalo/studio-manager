import { createHmac, timingSafeEqual } from "node:crypto";

/** HttpOnly cookie used after Turnstile success so resend works (Turnstile tokens are single-use). */
export const MAGIC_LINK_CAPTCHA_BYPASS_COOKIE = "veta_ml_cap";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function bypassSigningSecret(): string | undefined {
  const explicit = process.env.MAGIC_LINK_CAPTCHA_BYPASS_SECRET;
  if (typeof explicit === "string" && explicit.length > 0) {
    return explicit;
  }
  const turnstile = process.env.TURNSTILE_SECRET_KEY;
  if (typeof turnstile === "string" && turnstile.length > 0) {
    return turnstile;
  }
  return undefined;
}

/** Canonical string signed with HMAC (stable delimiter — email cannot contain \n usefully). */
function signingPayload(emailNorm: string, expMs: number): string {
  return `${emailNorm}\n${expMs}`;
}

/**
 * Value for Set-Cookie. Returns null if no signing secret is configured (bypass disabled).
 */
export function issueMagicLinkCaptchaBypassValue(email: string): string | null {
  const secret = bypassSigningSecret();
  if (!secret) {
    return null;
  }
  const expMs = Date.now() + 15 * 60 * 1000;
  const e = normalizeEmail(email);
  const body = signingPayload(e, expMs);
  const sig = createHmac("sha256", secret).update(body).digest("base64url");
  const envelope = JSON.stringify({ e, exp: expMs, sig });
  return Buffer.from(envelope, "utf8").toString("base64url");
}

export function verifyMagicLinkCaptchaBypassValue(
  rawCookie: string | undefined,
  email: string
): boolean {
  const secret = bypassSigningSecret();
  if (!secret || !rawCookie?.trim()) {
    return false;
  }
  try {
    const json = Buffer.from(rawCookie, "base64url").toString("utf8");
    const parsed = JSON.parse(json) as {
      e?: string;
      exp?: number;
      sig?: string;
    };
    const { e, exp, sig } = parsed;
    if (
      typeof e !== "string" ||
      typeof exp !== "number" ||
      typeof sig !== "string"
    ) {
      return false;
    }
    if (e !== normalizeEmail(email)) {
      return false;
    }
    if (Date.now() > exp) {
      return false;
    }
    const body = signingPayload(e, exp);
    const expected = createHmac("sha256", secret)
      .update(body)
      .digest("base64url");
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length) {
      return false;
    }
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
