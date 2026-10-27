/**
 * Payments / checkout gate. Until #25 ships, upgrade CTAs use waitlist instead.
 */
type PaymentsFlagEnv =
  NodeJS.ProcessEnv | { NEXT_PUBLIC_PAYMENTS_ENABLED?: string };

export function isPaymentsEnabled(env: PaymentsFlagEnv = process.env): boolean {
  const raw = env.NEXT_PUBLIC_PAYMENTS_ENABLED;
  if (raw == null || raw === "") return false;
  return raw === "1" || raw.toLowerCase() === "true";
}
