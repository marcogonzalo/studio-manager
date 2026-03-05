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
    const redirectTo = `${origin}/auth/complete?next=${encodeURIComponent(dashboardPath)}`;

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
      subject: "Tu enlace para probar la demo de Veta",
      from: from.email,
      fromName: from.name,
      html: `
        <p>Hola,</p>
        <p>Has solicitado acceder a la demo de Veta. Usa el siguiente enlace para entrar (válido durante un tiempo limitado):</p>
        <p><a href="${actionLink}">Acceder a la demo de Veta</a></p>
        <p>Si no has solicitado este enlace, puedes ignorar este correo.</p>
        <p>— Equipo Veta</p>
      `,
      text: `Hola,\n\nHas solicitado acceder a la demo de Veta. Usa este enlace para entrar (válido durante un tiempo limitado):\n\n${actionLink}\n\nSi no has solicitado este enlace, puedes ignorar este correo.\n\n— Equipo Veta`,
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
      subject: `[Veta] Nueva solicitud de demo - ${email}`,
      from: from.email,
      fromName: from.name,
      html: `<p>Se ha solicitado un enlace de demo.</p><p>Correo del visitante: ${email}</p><p>Fecha: ${new Date().toISOString()}</p>`,
      text: `Solicitud de demo.\nCorreo: ${email}\nFecha: ${new Date().toISOString()}`,
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
