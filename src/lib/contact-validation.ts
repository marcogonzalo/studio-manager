import * as z from "zod";
import { getExampleNumber, type Examples } from "libphonenumber-js";
import examples from "libphonenumber-js/mobile/examples";
import {
  formatPhoneNumberIntl,
  isValidPhoneNumber,
  parsePhoneNumber,
} from "react-phone-number-input";
import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { getAppUiCopy, interpolateAppCopy } from "@/lib/app-ui-copy";

export function getEmailInvalidMessage(lang: Locale = defaultLocale): string {
  return getAppUiCopy(lang).validation.emailInvalid;
}

export function getPhoneInvalidMessage(
  value: string,
  lang: Locale = defaultLocale
): string {
  const copy = getAppUiCopy(lang).validation;
  const trimmed = (value ?? "").trim();
  const country = parsePhoneNumber(trimmed)?.country;
  if (!country) return copy.phoneInvalid;
  const example = getExampleNumber(country, examples as Examples);
  if (!example?.number) return copy.phoneInvalid;
  const formatted = formatPhoneNumberIntl(example.number);
  return interpolateAppCopy(copy.phoneInvalidWithExample, {
    example: formatted,
  });
}

/** @deprecated Use getEmailInvalidMessage(lang). Spanish default for tests. */
export const EMAIL_INVALID_MESSAGE = getEmailInvalidMessage("es");

/** @deprecated Use getPhoneInvalidMessage("", lang). Spanish default for tests. */
export const PHONE_INVALID_MESSAGE = getPhoneInvalidMessage("", "es");

export function createOptionalEmailSchema(lang: Locale = defaultLocale) {
  const message = getEmailInvalidMessage(lang);
  return z.union([
    z.literal(""),
    z.string().refine(
      (v) =>
        (v ?? "").trim() === "" ||
        z
          .string()
          .email()
          .safeParse((v ?? "").trim()).success,
      { message }
    ),
  ]);
}

export function createOptionalPhoneSchema(lang: Locale = defaultLocale) {
  return z.string().superRefine((val, ctx) => {
    const trimmed = (val ?? "").trim();
    if (trimmed === "" || isValidPhoneNumber(trimmed)) return;
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: getPhoneInvalidMessage(val ?? "", lang),
    });
  });
}

export const optionalEmailSchema = createOptionalEmailSchema();
export const optionalPhoneSchema = createOptionalPhoneSchema();
