import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIp,
  getRateLimitMessage,
} from "@/lib/rate-limit";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase/keys";
import {
  sendTransactionalEmail,
  getContactFormToEmail,
  getDefaultFrom,
} from "@/lib/email/mailersend";
import {
  getDemoAccessEmailHtml,
  getDemoAccessEmailText,
} from "@/lib/email/templates/demo-access";
import { resolveEmailLocale } from "@/lib/email/auth-email-lang";
import { getAppUiCopy, localeFromRequest } from "@/lib/app-ui-copy";
import { escapeHtml } from "@/lib/escape-html";
import { appPath } from "@/lib/app-paths";
import { resolveMagicLinkAntiSpam } from "@/lib/anti-spam";
import { getMagicLinkAntiSpamConfig } from "@/lib/auth/magic-link-anti-spam-config";
import { reportError } from "@/lib/utils";

/** RFC 5321 max length; caps input before Zod email check (ReDoS / abuse mitigation). */
const DEMO_REQUEST_EMAIL_MAX = 254;
const ATTR_MAX = 200;

const optionalAttr = z
  .string()
  .trim()
  .max(ATTR_MAX)
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const demoRequestBodySchema = z.object({
  email: z
    .string()
    .trim()
    .min(1)
    .max(DEMO_REQUEST_EMAIL_MAX)
    .email()
    .transform((v) => v.toLowerCase()),
  lang: z.string().trim().max(16).optional(),
  captchaToken: z.string().trim().max(2048).optional(),
  name: optionalAttr,
  studio: optionalAttr,
  role: optionalAttr,
  marketingConsent: z.boolean().optional().default(false),
  utm_source: optionalAttr,
  utm_medium: optionalAttr,
  utm_campaign: optionalAttr,
  utm_term: optionalAttr,
  utm_content: optionalAttr,
  referrer: z.string().trim().max(2000).optional(),
  landing_path: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, resetAt } = checkRateLimit(ip, "auth");
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: getRateLimitMessage(localeFromRequest(request)) },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, retryAfter)),
          },
        }
      );
    }

    const body = await request.json().catch(() => ({}));
    const langHint =
      typeof body === "object" &&
      body !== null &&
      "lang" in body &&
      typeof (body as { lang?: unknown }).lang === "string"
        ? (body as { lang: string }).lang
        : undefined;
    const lang = resolveEmailLocale(
      langHint,
      request.headers.get("accept-language")
    );

    const parsed = demoRequestBodySchema.safeParse(body);
    if (!parsed.success) {
      const emailIssue = parsed.error.issues.find((i) => i.path[0] === "email");
      const copy = getAppUiCopy(lang).validation;
      if (emailIssue) {
        const message =
          emailIssue.code === "too_small" || emailIssue.code === "invalid_type"
            ? copy.emailRequired
            : copy.emailInvalid;
        return NextResponse.json({ error: message }, { status: 400 });
      }
      return NextResponse.json({ error: copy.emailInvalid }, { status: 400 });
    }

    const {
      email,
      captchaToken,
      name,
      studio,
      role,
      marketingConsent,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_term: utmTerm,
      utm_content: utmContent,
      referrer,
      landing_path: landingPath,
    } = parsed.data;

    const antiSpam = await resolveMagicLinkAntiSpam({
      email,
      captchaToken,
      remoteIp: ip,
      config: getMagicLinkAntiSpamConfig(),
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

    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Operación no disponible" },
        { status: 503 }
      );
    }

    const admin = createClient(getSupabaseUrl(), serviceRoleKey, {
      auth: { persistSession: false },
    });

    const origin = request.headers.get("origin") || request.nextUrl.origin;
    const dashboardPath = appPath("/dashboard");
    const redirectTo = `${origin}/auth/complete?next=${encodeURIComponent(dashboardPath)}&demo=1`;

    // Narrow lookup via profiles (avoids paginated listUsers)
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    let userId: string;

    if (existingProfile?.id) {
      userId = existingProfile.id;
    } else {
      const { data: newUser, error: createError } =
        await admin.auth.admin.createUser({
          email,
          email_confirm: true,
          user_metadata: {
            full_name: name,
            demo_user: true,
          },
        });

      if (createError || !newUser.user) {
        reportError(createError, "[demo-request] createUser error");
        return NextResponse.json(
          { error: "No se pudo crear la cuenta de demo. Inténtalo más tarde." },
          { status: 503 }
        );
      }

      userId = newUser.user.id;
    }

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email,
        options: { redirectTo },
      });

    const actionLink =
      linkData?.properties?.action_link ??
      (linkData as { action_link?: string })?.action_link;
    if (linkError || !actionLink) {
      reportError(linkError, "[demo-request] generateLink error");
      return NextResponse.json(
        { error: "No se pudo generar el enlace de demo. Inténtalo más tarde." },
        { status: 503 }
      );
    }
    const from = getDefaultFrom();

    const sendResult = await sendTransactionalEmail({
      to: email,
      subject:
        lang === "en"
          ? "Your link to try the Veta demo"
          : "Tu enlace para probar la demo de Veta",
      from: from.email,
      fromName: from.name,
      html: getDemoAccessEmailHtml(actionLink, lang),
      text: getDemoAccessEmailText(actionLink, lang),
    });

    if (!sendResult.success) {
      return NextResponse.json(
        { error: sendResult.error ?? "Error al enviar el correo" },
        { status: 503 }
      );
    }

    const contactTo = getContactFormToEmail();
    const safeEmailHtml = escapeHtml(email);
    const safeLangHtml = escapeHtml(lang);
    const notifiedAt = new Date().toISOString();
    await sendTransactionalEmail({
      to: contactTo,
      subject: `[Veta] Solicitud de demo — ${email} (${lang})`,
      from: from.email,
      fromName: from.name,
      html: `<p>Se solicitó enlace de demo.</p><p>Visitante: ${safeEmailHtml}</p><p>Idioma (locale): ${safeLangHtml}</p><p>Fecha: ${escapeHtml(notifiedAt)}</p>`,
      text: `Solicitud de demo.\nCorreo: ${email}\nIdioma (locale): ${lang}\nFecha: ${notifiedAt}`,
    });

    await admin
      .from("leads")
      .upsert(
        {
          email,
          name,
          studio,
          role,
          locale: lang,
          source: "demo_request",
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_term: utmTerm,
          utm_content: utmContent,
          referrer,
          landing_path: landingPath,
          marketing_consent: marketingConsent,
          consent_at: marketingConsent ? new Date().toISOString() : null,
          user_id: userId,
        },
        { onConflict: "email" }
      )
      .then(({ error: leadError }) => {
        if (leadError) {
          reportError(leadError, "[demo-request] lead insert error");
        }
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    reportError(err, "[demo-request]");
    return NextResponse.json(
      { error: "Error interno. Inténtalo más tarde." },
      { status: 500 }
    );
  }
}
