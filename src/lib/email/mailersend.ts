/**
 * MailerSend client and helpers for transactional emails.
 * Used by the contact form and available for future transactional emails
 * (e.g. notifications, magic links if we switch from Supabase).
 */

import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const CONTACT_EMAIL_TO = "veta.pro.pm@gmail.com";

export type SendTransactionalOptions = {
  to: string;
  toName?: string;
  from: string;
  fromName: string;
  replyTo?: { email: string; name?: string };
  subject: string;
  html: string;
  text: string;
};

function getClient(): MailerSend | null {
  const apiKey = process.env.MAILERSEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new MailerSend({ apiKey });
}

/**
 * Send a transactional email via MailerSend.
 * Returns { success: true } or { success: false, error: string }.
 */
export async function sendTransactionalEmail(
  options: SendTransactionalOptions
): Promise<{ success: true } | { success: false; error: string }> {
  const client = getClient();
  if (!client) {
    return {
      success: false,
      error:
        "El envío de correos no está configurado. Contacta por email directamente.",
    };
  }

  const from = new Sender(options.from, options.fromName);
  const recipients = [new Recipient(options.to, options.toName ?? options.to)];

  const emailParams = new EmailParams()
    .setFrom(from)
    .setTo(recipients)
    .setSubject(options.subject)
    .setHtml(options.html)
    .setText(options.text);

  if (options.replyTo) {
    emailParams.setReplyTo(
      new Sender(
        options.replyTo.email,
        options.replyTo.name ?? options.replyTo.email
      )
    );
  }

  try {
    await client.email.send(emailParams);
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error desconocido al enviar el correo";
    return { success: false, error: message };
  }
}

/**
 * Default recipient for the contact form (Veta inbox).
 */
export function getContactFormToEmail(): string {
  return process.env.CONTACT_EMAIL_TO?.trim() ?? CONTACT_EMAIL_TO;
}

/**
 * Default sender for outgoing emails (must be a verified domain in MailerSend).
 * Format: "name <email>" or "email".
 */
export function getDefaultFrom(): { email: string; name: string } {
  const raw =
    process.env.CONTACT_EMAIL_FROM?.trim() ?? "Veta Web <noreply@veta.pro>";
  const match = raw.match(/^(.+?)\s*<([^>]+)>$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim() };
  }
  return { name: "Veta Web", email: raw };
}
