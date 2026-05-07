export { evaluateEmailRisk } from "./evaluate-email-risk";
export { verifyTurnstileToken } from "./verify-turnstile-token";
export { resolveMagicLinkAntiSpam } from "./resolve-magic-link-anti-spam";
export type {
  AntiSpamActionOnSpam,
  AntiSpamCaptchaProvider,
  AntiSpamMagicLinkConfig,
  CaptchaGuardProvider,
  ResolveMagicLinkAntiSpamResult,
} from "./types";
export type { CaptchaGuardProps } from "./react/captcha-guard";
export { CaptchaGuard } from "./react/captcha-guard";
