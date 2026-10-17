"use server";

import { headers } from "next/headers";
import { z } from "zod";
import {
  sendTransactionalEmail,
  getContactFormToEmail,
  getDefaultFrom,
} from "@/lib/email/mailersend";
import {
  checkRateLimit,
  getClientIpFromHeaders,
  getRateLimitMessage,
} from "@/lib/rate-limit";
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { isAppLocale } from "@/lib/resolve-locale-from-accept-language";
import { escapeHtml } from "@/lib/escape-html";
import { createClient } from "@/lib/supabase/server";
import { SUPPORT_REASONS } from "@/lib/support/reasons";
import {
  buildSupportEmailHtml,
  buildSupportEmailSubject,
  buildSupportEmailText,
} from "@/lib/support/build-support-email";
import { isDemoAccountEmail } from "@/lib/utils";
import enMarketing from "@/i18n/messages/en/marketing.json";
import esMarketing from "@/i18n/messages/es/marketing.json";

/** Minimum seconds the form must be open before submit (anti-bot). */
const MIN_SUBMIT_SECONDS = 10;
/** Max age of form timestamp in ms (1 hour). */
const MAX_FORM_AGE_MS = 60 * 60 * 1000;

const SUPPORT_COPY = {
  en: enMarketing.SupportForm,
  es: esMarketing.SupportForm,
} as const;

function supportSchemaFor(lang: Locale) {
  const t = SUPPORT_COPY[lang] ?? SUPPORT_COPY.es;
  return z.object({
    reason: z.enum(SUPPORT_REASONS, {
      message: t.reasonInvalid,
    }),
    name: z.string().min(2, t.nameMin).max(50, t.nameMax),
    email: z.string().email(t.emailInvalid).max(254, t.emailMax),
    subject: z
      .string()
      .min(6, t.subjectMin)
      .max(100, t.subjectMax)
      .refine((s) => !/[\r\n]/.test(s), t.subjectNoNewlines),
    message: z.string().min(10, t.messageMin).max(5000, t.messageMax),
    context_path: z.string().max(500).optional(),
    context_plan_code: z.string().max(50).optional(),
  });
}

export type SupportFormState = {
  success?: boolean;
  error?: string;
};

export async function submitSupportForm(
  _prevState: SupportFormState | null,
  formData: FormData
): Promise<SupportFormState> {
  const honeypot = formData.get("website");
  if (honeypot && String(honeypot).trim() !== "") {
    return { success: true };
  }

  const tsRaw = formData.get("_ts");
  const ts = tsRaw ? Number(String(tsRaw)) : NaN;
  if (Number.isFinite(ts)) {
    const now = Date.now();
    const elapsedMs = now - ts;
    if (elapsedMs < MIN_SUBMIT_SECONDS * 1000 || elapsedMs > MAX_FORM_AGE_MS) {
      return { success: true };
    }
  }

  const rawFormLocale = String(formData.get("form_locale") ?? "").trim();
  const formLocale: Locale = isAppLocale(rawFormLocale)
    ? rawFormLocale
    : defaultLocale;
  const copy = SUPPORT_COPY[formLocale] ?? SUPPORT_COPY.es;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (isDemoAccountEmail(user?.email)) {
    return { error: copy.demoBlocked };
  }

  const ip = getClientIpFromHeaders(await headers());
  const rateKey = user?.id ? `user:${user.id}` : ip;
  const { allowed } = checkRateLimit(rateKey, "contact");
  if (!allowed) {
    return { error: getRateLimitMessage(formLocale) };
  }

  const rawReason = String(formData.get("reason") ?? "").trim();
  const parsed = supportSchemaFor(formLocale).safeParse({
    reason: rawReason,
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    context_path:
      String(formData.get("context_path") ?? "").trim() || undefined,
    context_plan_code:
      String(formData.get("context_plan_code") ?? "").trim() || undefined,
  });

  if (!parsed.success) {
    const firstError = parsed.error.flatten().fieldErrors;
    const message =
      Object.values(firstError).flat().join(", ") || copy.invalidData;
    return { error: message };
  }

  const {
    reason,
    name,
    email,
    subject,
    message,
    context_path,
    context_plan_code,
  } = parsed.data;

  const from = getDefaultFrom();
  const toEmail = getContactFormToEmail();

  const bodyInput = {
    reason,
    name,
    email,
    subject,
    message,
    locale: formLocale,
    path: context_path,
    planCode: context_plan_code,
  };

  const result = await sendTransactionalEmail({
    to: toEmail,
    from: from.email,
    fromName: from.name,
    replyTo: { email, name },
    subject: buildSupportEmailSubject(reason, subject),
    text: buildSupportEmailText(bodyInput),
    html: buildSupportEmailHtml(bodyInput, escapeHtml),
  });

  if (!result.success) {
    return {
      error: result.error || copy.sendFailed,
    };
  }

  return { success: true };
}

/** @deprecated Prefer submitSupportForm — alias for contact page migration. */
export async function submitContactForm(
  prev: SupportFormState | null,
  formData: FormData
): Promise<SupportFormState> {
  return submitSupportForm(prev, formData);
}
