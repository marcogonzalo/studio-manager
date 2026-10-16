/**
 * Shared support / contact form reason codes.
 * Labels live in i18n (SupportForm.reasons.*); codes are stable for email + analytics.
 */

export const SUPPORT_REASONS = [
  "need_help",
  "report_error",
  "request_feature",
  "other",
] as const;

export type SupportReason = (typeof SUPPORT_REASONS)[number];

export const DEFAULT_SUPPORT_REASON: SupportReason = "other";

export function isSupportReason(value: unknown): value is SupportReason {
  return (
    typeof value === "string" &&
    (SUPPORT_REASONS as readonly string[]).includes(value)
  );
}

/** Parse ?reason= from URL or button; unknown → null (caller picks default). */
export function parseSupportReasonParam(
  value: string | null | undefined
): SupportReason | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return isSupportReason(trimmed) ? trimmed : null;
}
