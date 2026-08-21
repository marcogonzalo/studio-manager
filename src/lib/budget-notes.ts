/** Max length for client-facing budget notes (plain text). */
export const BUDGET_NOTES_MAX_LENGTH = 4000;

/**
 * Normalize budget notes for storage / display.
 * Trims; empty or whitespace-only becomes null.
 */
export function normalizeBudgetNotes(
  value: string | null | undefined
): string | null {
  if (value == null) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isBudgetNotesTooLong(
  value: string | null | undefined
): boolean {
  if (value == null) return false;
  return value.length > BUDGET_NOTES_MAX_LENGTH;
}

/** Split notes into lines for PDF (react-pdf does not honor raw \\n in strings). */
export function splitBudgetNotesLines(
  value: string | null | undefined
): string[] {
  const normalized = normalizeBudgetNotes(value);
  if (!normalized) return [];
  return normalized.split(/\r?\n/);
}
