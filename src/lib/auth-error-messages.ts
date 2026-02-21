/**
 * Maps technical auth errors to user-friendly messages with a clear next action.
 * Used by the auth callback route so users see actionable guidance instead of raw error strings.
 */
export function getFriendlyAuthErrorMessage(
  technicalMessage: string | undefined
): string {
  if (!technicalMessage) {
    return "No se pudo completar el acceso. Por favor, intenta iniciar sesión de nuevo.";
  }
  const lower = technicalMessage.toLowerCase();
  // PKCE: code verifier/challenge mismatch — usually when opening magic link in another browser
  if (
    lower.includes("pkce") ||
    lower.includes("code verifier") ||
    lower.includes("code challenge") ||
    lower.includes("code_verifier")
  ) {
    return "Intenta iniciar sesión con el mismo navegador en el que solicitaste tu enlace de ingreso.";
  }
  // Expired or invalid code
  if (
    lower.includes("expired") ||
    (lower.includes("invalid") && lower.includes("code"))
  ) {
    return "El enlace ha caducado o no es válido. Por favor, solicita un nuevo enlace de acceso.";
  }
  return technicalMessage;
}
