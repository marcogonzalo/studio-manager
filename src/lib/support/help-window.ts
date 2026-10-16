/** Days after account confirmation when help CTA stays prominent in app shell. */
export const HELP_PROMINENT_DAYS = 14;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * True when user is within the new-user help window.
 * Clock: `user.confirmed_at` (first confirmation — stable if email changes later).
 */
export function isWithinNewUserHelpWindow(
  confirmedAt: string | null | undefined,
  nowMs: number = Date.now()
): boolean {
  if (!confirmedAt) return false;
  const confirmedMs = Date.parse(confirmedAt);
  if (!Number.isFinite(confirmedMs)) return false;
  return nowMs - confirmedMs < HELP_PROMINENT_DAYS * MS_PER_DAY;
}
