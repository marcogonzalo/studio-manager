import { evaluateEmailRisk } from "./evaluate-email-risk";
import { verifyTurnstileToken } from "./verify-turnstile-token";
import type {
  AntiSpamMagicLinkConfig,
  ResolveMagicLinkAntiSpamResult,
} from "./types";

export async function resolveMagicLinkAntiSpam(input: {
  email: string;
  captchaToken?: string | null;
  remoteIp?: string;
  /** Server-verified short-lived cookie after a prior Turnstile success (same email). */
  captchaBypassVerified?: boolean;
  config: AntiSpamMagicLinkConfig;
}): Promise<ResolveMagicLinkAntiSpamResult> {
  const email = input.email.trim();
  if (!input.config.enabled) {
    return { action: "proceed" };
  }

  const { score } = evaluateEmailRisk(email);
  const suspicious = score >= input.config.riskThreshold;

  if (!suspicious) {
    return { action: "proceed" };
  }

  let passedHumanCaptcha = false;

  if (input.config.captchaProvider === "turnstile") {
    const token =
      typeof input.captchaToken === "string" ? input.captchaToken.trim() : "";
    if (!token) {
      if (input.captchaBypassVerified === true) {
        passedHumanCaptcha = true;
      } else {
        return { action: "captcha_required" };
      }
    } else {
      const verify = await verifyTurnstileToken({
        getSecretKey: input.config.getTurnstileSecretKey,
        token,
        remoteIp: input.remoteIp,
      });

      if (!verify.ok) {
        const misconfigured =
          verify.errorCodes?.includes("missing-input-secret") === true;
        if (misconfigured) {
          return {
            action: "reject",
            status: 503,
            code: "captcha_misconfigured",
            message: "Captcha is not configured correctly",
          };
        }
        return {
          action: "reject",
          status: 400,
          code: "captcha_invalid",
          message: "Captcha verification failed",
        };
      }
      passedHumanCaptcha = true;
    }
  }

  if (input.config.actionOnSpam === "silent_block") {
    // Fake success only when we cannot prove a human (no Turnstile path).
    // After Turnstile succeeds, send the magic link like a normal signup/login.
    if (input.config.captchaProvider === "turnstile" && passedHumanCaptcha) {
      return { action: "proceed" };
    }
    return { action: "fake_success" };
  }

  if (input.config.actionOnSpam === "hard_block") {
    return {
      action: "reject",
      status: 400,
      code: "email_not_allowed",
      message: "This email address cannot be used for registration",
    };
  }

  return {
    action: "proceed",
    metadataPatch: {
      signup_spam_review: true,
      signup_spam_score: score,
    },
  };
}
