/**
 * Heuristic spam-risk score for the local part of an email (0–100).
 * Framework-agnostic; no I/O.
 */
export function evaluateEmailRisk(email: string): { score: number } {
  const trimmed = email.trim().toLowerCase();
  const at = trimmed.lastIndexOf("@");
  if (at <= 0 || at === trimmed.length - 1) {
    return { score: 0 };
  }

  const local = trimmed.slice(0, at);
  let score = 0;

  const dotCount = (local.match(/\./g) ?? []).length;
  if (dotCount >= 3) score += 22;
  if (dotCount >= 5) score += 18;
  if (dotCount >= 8) score += 15;

  const digitMatches = local.match(/\d/g);
  const digitCount = digitMatches?.length ?? 0;
  const digitRatio = local.length > 0 ? digitCount / local.length : 0;
  if (digitRatio >= 0.25) score += 18;
  if (digitRatio >= 0.4) score += 12;

  const longDigitRun = /\d{5,}/.test(local);
  if (longDigitRun) score += 14;

  const segments = local.split(".").filter(Boolean);
  if (segments.length >= 4) {
    const shortSegments = segments.filter((s) => s.length <= 2).length;
    const shortRatio = shortSegments / segments.length;
    if (shortRatio >= 0.5) score += 22;
  }

  if (local.length >= 40) score += 8;
  if (local.length >= 55) score += 8;

  const nonLetter = (local.match(/[^a-z]/g) ?? []).length;
  const nonLetterRatio = local.length > 0 ? nonLetter / local.length : 0;
  if (nonLetterRatio >= 0.35) score += 12;

  return { score: Math.min(100, Math.round(score)) };
}
