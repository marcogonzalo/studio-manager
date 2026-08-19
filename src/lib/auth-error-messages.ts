import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { getAppUiCopy } from "@/lib/app-ui-copy";

/**
 * Maps technical auth errors to user-friendly messages with a clear next action.
 * Used by the auth callback route so users see actionable guidance instead of raw error strings.
 */
export function getFriendlyAuthErrorMessage(
  technicalMessage: string | undefined,
  errorCode?: string,
  lang: Locale = defaultLocale
): string {
  const copy = getAppUiCopy(lang).errors;
  const message = technicalMessage ?? "";
  const lower = message.toLowerCase();
  const code = (errorCode ?? "").toLowerCase();

  if (
    code === "invalid_grant" ||
    lower.includes("pkce") ||
    lower.includes("code verifier") ||
    lower.includes("code_verifier") ||
    lower.includes("code challenge") ||
    (lower.includes("verifier") &&
      (lower.includes("non-empty") || lower.includes("match"))) ||
    lower.includes("both auth code")
  ) {
    return copy.authPkce;
  }
  if (
    lower.includes("expired") ||
    (lower.includes("invalid") && lower.includes("code"))
  ) {
    return copy.authExpired;
  }
  if (!message) {
    return copy.authGeneric;
  }
  return technicalMessage as string;
}
