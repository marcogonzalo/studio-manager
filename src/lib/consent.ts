/**
 * Cookie consent state and GTM Consent Mode v2 integration.
 * @see https://support.google.com/tagmanager/answer/10718549
 */

export const CONSENT_STORAGE_KEY = "veta_cookie_consent";

/** GTM consent types (Tag Manager consent mode) */
export const CONSENT_TYPES = [
  "ad_storage",
  "ad_user_data",
  "ad_personalization",
  "analytics_storage",
  "functionality_storage",
  "personalization_storage",
  "security_storage",
] as const;

export type ConsentType = (typeof CONSENT_TYPES)[number];

export type ConsentStatus = "granted" | "denied";

export interface ConsentState {
  necessary: boolean; // functionality_storage, security_storage — always true when saved
  analytics: boolean;
  marketing: boolean; // ad_storage, ad_user_data, ad_personalization
  personalization: boolean;
}

export const DEFAULT_STATE: ConsentState = {
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
};

/** EU/EEA region codes for default-deny consent (same as previous Cookiebot setup) */
export const EU_REGIONS = [
  "GB",
  "AT",
  "BE",
  "BG",
  "CH",
  "CY",
  "DE",
  "DK",
  "EE",
  "ES",
  "FI",
  "FR",
  "GG",
  "GR",
  "HR",
  "HU",
  "IE",
  "IM",
  "IT",
  "JE",
  "LT",
  "LU",
  "LV",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SE",
  "SI",
  "SK",
] as const;

/** Map ConsentState to GTM consent update payload */
export function consentStateToGtmPayload(
  state: ConsentState
): Record<ConsentType, ConsentStatus> {
  return {
    ad_storage: state.marketing ? "granted" : "denied",
    ad_user_data: state.marketing ? "granted" : "denied",
    ad_personalization: state.marketing ? "granted" : "denied",
    analytics_storage: state.analytics ? "granted" : "denied",
    functionality_storage: state.necessary ? "granted" : "denied",
    personalization_storage: state.personalization ? "granted" : "denied",
    security_storage: "granted", // always for auth/fraud
  };
}

/** Default consent: all denied (for EU) or all granted (rest). Caller sets region. */
export function getDefaultGtmConsent(
  denyForEu: boolean
): Record<ConsentType, ConsentStatus> {
  const denied = denyForEu ? "denied" : "granted";
  return {
    ad_storage: denied,
    ad_user_data: denied,
    ad_personalization: denied,
    analytics_storage: denied,
    functionality_storage: denyForEu ? "denied" : "granted",
    personalization_storage: denied,
    security_storage: "granted",
  };
}

export function loadStoredConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    return {
      necessary: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
      personalization: Boolean(parsed.personalization),
    };
  } catch {
    return null;
  }
}

type Gtag = (...args: unknown[]) => void;

function ensureGtag(): Gtag | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as { dataLayer: unknown[]; gtag?: Gtag };
  w.dataLayer = w.dataLayer ?? [];
  if (w.gtag) return w.gtag;
  // Stub so banner (and any client code) always sends consent as gtag arguments
  w.gtag = function gtag(...args: unknown[]) {
    w.dataLayer.push(args);
  };
  return w.gtag;
}

/** Push consent update via gtag so GTM receives arguments (works from banner and head). */
export function pushConsentUpdate(
  payload: Record<ConsentType, ConsentStatus>
): void {
  const gtag = ensureGtag();
  if (!gtag) return;
  gtag("consent", "update", payload);
  gtag("event", "consent_update", {
    consent_update: "cookie_consent",
    consent_state: payload,
  });
}

/** Push default consent via gtag (used from head script and from banner when no stored consent). */
export function pushConsentDefault(
  payload: Record<ConsentType, ConsentStatus>
): void {
  const gtag = ensureGtag();
  if (!gtag) return;
  gtag("consent", "default", payload);
}
