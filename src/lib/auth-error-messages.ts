const PKCE_FRIENDLY_MESSAGE =
  "Intenta iniciar sesión con el mismo navegador en el que solicitaste tu enlace de ingreso.";

const EXPIRED_LINK_MESSAGE =
  "El enlace ha caducado o no es válido. Por favor, solicita un nuevo enlace de acceso.";

/**
 * Maps technical auth errors to user-friendly messages with a clear next action.
 * Used by the auth callback route so users see actionable guidance instead of raw error strings.
 */
export function getFriendlyAuthErrorMessage(
  technicalMessage: string | undefined,
  errorCode?: string
): string {
  const message = technicalMessage ?? "";
  const lower = message.toLowerCase();
  const code = (errorCode ?? "").toLowerCase();

  // PKCE: code verifier/challenge mismatch — usually when opening magic link in another browser
  // Match server messages: "both auth code and code verifier should be non-empty", "code challenge does not match", etc.
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
    return PKCE_FRIENDLY_MESSAGE;
  }
  // Expired or invalid code
  if (
    lower.includes("expired") ||
    (lower.includes("invalid") && lower.includes("code"))
  ) {
    return EXPIRED_LINK_MESSAGE;
  }
  if (!message) {
    return "No se pudo completar el acceso. Por favor, intenta iniciar sesión de nuevo.";
  }
  return technicalMessage as string;
}
