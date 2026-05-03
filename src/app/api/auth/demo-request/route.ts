import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIp,
  RATE_LIMIT_MESSAGE,
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
import { appPath } from "@/lib/app-paths";

const DEMO_EMAIL = "demo@veta.pro";

export async function POST(request: NextRequest) {
  try {
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

    const body = await request.json().catch(() => ({}));
    const lang = resolveEmailLocale(
      body.lang,
      request.headers.get("accept-language")
    );
    const email = typeof body.email === "string" ? body.email.trim() : "";
    if (!email) {
      return NextResponse.json(
        { error: "El correo es obligatorio" },
        { status: 400 }
      );
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Formato de correo no válido" },
        { status: 400 }
      );
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

    const { data: linkData, error: linkError } =
      await admin.auth.admin.generateLink({
        type: "magiclink",
        email: DEMO_EMAIL,
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
    await sendTransactionalEmail({
      to: contactTo,
      subject: `[Veta] Demo request / Solicitud demo — ${email} (${lang})`,
      from: from.email,
      fromName: from.name,
      html: `<p>Demo link requested / Se solicitó enlace de demo.</p><p>Visitor / Visitante: ${email}</p><p>Locale / Idioma formulario: ${lang}</p><p>Date / Fecha: ${new Date().toISOString()}</p>`,
      text: `Demo request.\nEmail: ${email}\nForm locale: ${lang}\nDate: ${new Date().toISOString()}`,
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
