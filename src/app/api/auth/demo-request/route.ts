import { NextRequest, NextResponse } from "next/server";
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
    const lang = resolveEmailLocale(
      body.lang,
      request.headers.get("accept-language")
    );
    const captchaToken =
      typeof body.captchaToken === "string" ? body.captchaToken : undefined;
    const email = typeof body.email === "string" ? body.email.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const studio = typeof body.studio === "string" ? body.studio.trim() : undefined;
    const role = typeof body.role === "string" ? body.role.trim() : undefined;
    const marketingConsent = typeof body.marketingConsent === "boolean" ? body.marketingConsent : false;
    const utmSource = typeof body.utm_source === "string" ? body.utm_source : undefined;
    const utmMedium = typeof body.utm_medium === "string" ? body.utm_medium : undefined;
    const utmCampaign = typeof body.utm_campaign === "string" ? body.utm_campaign : undefined;
    const utmTerm = typeof body.utm_term === "string" ? body.utm_term : undefined;
    const utmContent = typeof body.utm_content === "string" ? body.utm_content : undefined;
    const referrer = typeof body.referrer === "string" ? body.referrer : undefined;
    const landingPath = typeof body.landing_path === "string" ? body.landing_path : undefined;

    if (!email) {
      return NextResponse.json(
        { error: getAppUiCopy(lang).validation.emailRequired },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: getAppUiCopy(lang).validation.emailInvalid },
        { status: 400 }
      );
    }

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

    // Create or get existing user for this email
    const { data: existingUser } = await admin.auth.admin.listUsers();
    const userExists = existingUser?.users.find((u) => u.email === email);

    let userId: string;

    if (userExists) {
      userId = userExists.id;
    } else {
      // Create new user with Base plan
      const { data: newUser, error: createError } = await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          demo_user: true,
        },
      });

      if (createError || !newUser.user) {
        console.error("[demo-request] createUser error", createError);
        return NextResponse.json(
          { error: "No se pudo crear la cuenta de demo. Inténtalo más tarde." },
          { status: 503 }
        );
      }

      userId = newUser.user.id;
    }

    // Generate magic link for the user's own account
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
      console.error("[demo-request] generateLink error", linkError);
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
        },
        { onConflict: "email" }
      )
      .then(({ error: leadError }) => {
        if (leadError) {
          console.error("[demo-request] lead insert error", leadError);
        }
      });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[demo-request]", err);
    return NextResponse.json(
      { error: "Error interno. Inténtalo más tarde." },
      { status: 500 }
    );
  }
}
