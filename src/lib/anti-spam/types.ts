export type AntiSpamCaptchaProvider = "turnstile" | "none";

/** Alias for React `CaptchaGuard` props (same values as server captcha provider). */
export type CaptchaGuardProvider = AntiSpamCaptchaProvider;

export type AntiSpamActionOnSpam =
  | "silent_block"
  | "hard_block"
  | "flag_for_review";

/** Host-injected config. Do not store secrets in plain fields; use getters. */
export interface AntiSpamMagicLinkConfig {
  enabled: boolean;
  captchaProvider: AntiSpamCaptchaProvider;
  getTurnstileSecretKey: () => string | undefined;
  riskThreshold: number;
  actionOnSpam: AntiSpamActionOnSpam;
}

export type ResolveMagicLinkAntiSpamResult =
  | { action: "proceed"; metadataPatch?: Record<string, unknown> }
  | { action: "fake_success" }
  | { action: "captcha_required" }
  | {
      action: "reject";
      status: number;
      code: string;
      message: string;
    };
