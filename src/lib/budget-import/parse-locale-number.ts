import { normalizeMoneyString } from "./pricing";

/**
 * Parse a locale-aware number for import/forms.
 * Returns null when empty or invalid (does not coerce junk to 0).
 */
export function parseLocaleNumber(
  raw: string | null | undefined
): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const normalized = normalizeMoneyString(trimmed);
  if (normalized == null) return null;
  const n = Number(normalized);
  return Number.isFinite(n) ? n : null;
}

/** Canonical string with dot decimal for zod money regexes. */
export function toCanonicalNumberString(
  raw: string | null | undefined
): string {
  const n = parseLocaleNumber(raw);
  if (n == null) return "";
  return String(n);
}
