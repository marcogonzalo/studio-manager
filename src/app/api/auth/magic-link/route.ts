import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rate-limit";
import type { Locale } from "@/i18n/config";
import { resolveEmailLocale } from "@/lib/email/auth-email-lang";
import {
  evaluateEmailRisk,
  resolveMagicLinkAntiSpam,
  type AntiSpamMagicLinkConfig,
} from "@/lib/anti-spam";
import { getMagicLinkAntiSpamConfig } from "@/lib/auth/magic-link-anti-spam-config";
import {
  issueMagicLinkCaptchaBypassValue,
  MAGIC_LINK_CAPTCHA_BYPASS_COOKIE,
  verifyMagicLinkCaptchaBypassValue,
} from "@/lib/auth/magic-link-captcha-bypass";

function shouldIssueCaptchaBypassCookie(
  email: string,
  cfg: AntiSpamMagicLinkConfig
): boolean {
  if (!cfg.enabled || cfg.captchaProvider !== "turnstile") {
    return false;
  }
  return evaluateEmailRisk(email.trim()).score >= cfg.riskThreshold;
}

function jsonSuccessWithCaptchaBypassRefresh(
  email: string,
  cfg: AntiSpamMagicLinkConfig
): NextResponse {
  const res = NextResponse.json({ success: true });
  if (shouldIssueCaptchaBypassCookie(email, cfg)) {
    const val = issueMagicLinkCaptchaBypassValue(email);
    if (val) {
      res.cookies.set(MAGIC_LINK_CAPTCHA_BYPASS_COOKIE, val, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60,
        path: "/",
      });
    }
  }
  return res;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limit in route handler (Node runtime) so state persists; middleware runs in Edge and may not share state
    const ip = getClientIp(request);
    const { allowed, resetAt } = checkRateLimit(ip, "auth");
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, retryAfter)),
          },
        }
      );
    }

    const body = await request.json();
    const { email, emailRedirectTo, data, lang: bodyLang, captchaToken } = body;

    const resolvedLang: Locale = resolveEmailLocale(
      bodyLang,
      request.headers.get("accept-language")
    );

    const mergedData =
      typeof data === "object" && data !== null && !Array.isArray(data)
        ? { ...data, lang: resolvedLang }
        : { lang: resolvedLang };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    const antiSpamConfig = getMagicLinkAntiSpamConfig();
    const captchaTokenStr =
      typeof captchaToken === "string" ? captchaToken : undefined;
    const bypassCookie = request.cookies.get(
      MAGIC_LINK_CAPTCHA_BYPASS_COOKIE
    )?.value;
    const captchaBypassVerified = verifyMagicLinkCaptchaBypassValue(
      bypassCookie,
      email
    );
    const antiSpam = await resolveMagicLinkAntiSpam({
      email,
      captchaToken: captchaTokenStr,
      remoteIp: ip,
      captchaBypassVerified,
      config: antiSpamConfig,
    });

    if (antiSpam.action === "captcha_required") {
      return NextResponse.json(
        { error: "Captcha required", code: "captcha_required" },
        { status: 400 }
      );
    }

    if (antiSpam.action === "reject") {
      return NextResponse.json(
        { error: antiSpam.message, code: antiSpam.code },
        { status: antiSpam.status }
      );
    }

    if (antiSpam.action === "fake_success") {
      return NextResponse.json({ success: true });
    }

    const mergedWithAntiSpam =
      antiSpam.action === "proceed" && antiSpam.metadataPatch
        ? { ...mergedData, ...antiSpam.metadataPatch }
        : mergedData;

    const supabase = await createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo,
        data: mergedWithAntiSpam,
      },
    });

    if (error) {
      // Log full Supabase error server-side for debugging (Dashboard Logs / Vercel logs)
      console.error("[magic-link] Supabase auth error", {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      const isEmailDeliveryError =
        error.message?.toLowerCase().includes("sending confirmation email") ||
        error.message?.toLowerCase().includes("error sending email");
      const message = isEmailDeliveryError
        ? "No pudimos enviar el correo. Inténtalo de nuevo en unos minutos o contacta soporte."
        : error.message;
      const status = isEmailDeliveryError ? 503 : error.status || 400;
      return NextResponse.json({ error: message }, { status });
    }

    return jsonSuccessWithCaptchaBypassRefresh(email, antiSpamConfig);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
