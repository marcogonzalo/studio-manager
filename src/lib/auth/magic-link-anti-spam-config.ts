import type { AntiSpamMagicLinkConfig } from "@/lib/anti-spam";

/**
 * Env vars (read only here; the `@/lib/anti-spam` package does not read `process.env`):
 * - `SIGNUP_SPAM_STEPUP_ENABLED` — `"true"` to enable heuristics + captcha path when secret is set.
 * - `TURNSTILE_SECRET_KEY` — server-side Turnstile secret (enables `captchaProvider: "turnstile"`).
 * - `NEXT_PUBLIC_TURNSTILE_SITE_KEY` — site key passed to the client `CaptchaGuard` (see sign-in / sign-up forms).
 * - `ANTI_SPAM_RISK_THRESHOLD` — optional, default `45` (0–100).
 * - `ANTI_SPAM_ACTION` — `silent_block` | `hard_block` | `flag_for_review` (default `silent_block`).
 *   With Turnstile: `silent_block` still sends the magic link after a valid captcha; without Turnstile,
 *   suspicious emails get a fake success only (no email).
 * - `MAGIC_LINK_CAPTCHA_BYPASS_SECRET` — optional HMAC secret for the short-lived HttpOnly cookie issued after
 *   Turnstile success (allows magic-link resend without a fresh widget token). If unset, `TURNSTILE_SECRET_KEY`
 *   is used as the signing key.
 */

function parseAction(
  raw: string | undefined
): AntiSpamMagicLinkConfig["actionOnSpam"] {
  if (raw === "hard_block" || raw === "flag_for_review") {
    return raw;
  }
  return "silent_block";
}

/**
 * Host wiring: reads process.env and returns a config object for
 * `@/lib/anti-spam` (the package itself does not read env vars).
 */
export function getMagicLinkAntiSpamConfig(): AntiSpamMagicLinkConfig {
  const enabled = process.env.SIGNUP_SPAM_STEPUP_ENABLED === "true";
  const hasSecret =
    typeof process.env.TURNSTILE_SECRET_KEY === "string" &&
    process.env.TURNSTILE_SECRET_KEY.length > 0;
  const captchaProvider = hasSecret ? "turnstile" : "none";
  const rawThreshold = Number(process.env.ANTI_SPAM_RISK_THRESHOLD ?? "45");
  const riskThreshold =
    Number.isFinite(rawThreshold) && rawThreshold > 0 && rawThreshold <= 100
      ? rawThreshold
      : 45;

  return {
    enabled,
    captchaProvider,
    getTurnstileSecretKey: () => process.env.TURNSTILE_SECRET_KEY,
    riskThreshold,
    actionOnSpam: parseAction(process.env.ANTI_SPAM_ACTION),
  };
}
