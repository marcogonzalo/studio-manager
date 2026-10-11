/**
 * F2: Attribution tracking - capture UTM parameters, referrer, and landing path on first visit.
 * Uses first-party cookie, respects existing cookie consent.
 */

const ATTRIBUTION_COOKIE_NAME = "veta_attribution";
const ATTRIBUTION_COOKIE_MAX_AGE = 90 * 24 * 60 * 60; // 90 days

export interface AttributionData {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  landing_path?: string;
  captured_at: string;
}

/**
 * Parse attribution data from URL search params and document referrer.
 * Call this on the first visit to capture attribution.
 */
export function captureAttribution(): AttributionData {
  if (typeof window === "undefined") {
    return { captured_at: new Date().toISOString() };
  }

  const params = new URLSearchParams(window.location.search);
  const data: AttributionData = {
    captured_at: new Date().toISOString(),
  };

  const utm_source = params.get("utm_source");
  const utm_medium = params.get("utm_medium");
  const utm_campaign = params.get("utm_campaign");
  const utm_term = params.get("utm_term");
  const utm_content = params.get("utm_content");

  if (utm_source) data.utm_source = utm_source;
  if (utm_medium) data.utm_medium = utm_medium;
  if (utm_campaign) data.utm_campaign = utm_campaign;
  if (utm_term) data.utm_term = utm_term;
  if (utm_content) data.utm_content = utm_content;

  if (document.referrer && !document.referrer.includes(window.location.hostname)) {
    data.referrer = document.referrer;
  }

  data.landing_path = window.location.pathname;

  return data;
}

/**
 * Save attribution data to a first-party cookie.
 * Respects cookie consent: only saves if analytics consent is granted.
 * Returns true if saved, false if consent not granted or unavailable.
 */
export function saveAttributionCookie(data: AttributionData): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const consent = getStoredConsent();
  if (!consent || !consent.analytics) {
    return false;
  }

  const expires = new Date(Date.now() + ATTRIBUTION_COOKIE_MAX_AGE * 1000).toUTCString();
  document.cookie = `${ATTRIBUTION_COOKIE_NAME}=${encodeURIComponent(JSON.stringify(data))}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  return true;
}

/**
 * Read attribution data from the cookie.
 */
export function loadAttributionCookie(): AttributionData | null {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split("; ");
  for (const cookie of cookies) {
    const [name, value] = cookie.split("=");
    if (name === ATTRIBUTION_COOKIE_NAME && value) {
      try {
        return JSON.parse(decodeURIComponent(value)) as AttributionData;
      } catch {
        return null;
      }
    }
  }
  return null;
}

/**
 * Check if attribution has already been captured (cookie exists).
 */
export function hasAttributionCookie(): boolean {
  return loadAttributionCookie() !== null;
}

/**
 * Capture and save attribution on first visit.
 * Safe to call multiple times - only saves once.
 * Returns attribution data (from cookie if exists, or newly captured).
 */
export function captureAndSaveAttribution(): AttributionData | null {
  const existing = loadAttributionCookie();
  if (existing) {
    return existing;
  }

  const data = captureAttribution();
  const saved = saveAttributionCookie(data);
  
  return saved ? data : null;
}

/**
 * Get stored cookie consent from localStorage (same key as cookie-consent-banner).
 * Used to check if analytics consent is granted before saving attribution cookie.
 */
function getStoredConsent(): { analytics: boolean } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("veta_cookie_consent");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { analytics?: boolean };
    return { analytics: Boolean(parsed.analytics) };
  } catch {
    return null;
  }
}
