/**
 * Client-facing account branding (PDF header + public view).
 * Logo and public_name apply only when pdf_export_mode is plus or full.
 * Downgrade to Base must not expose stored logo / public_name.
 */

import type { PlanConfig } from "@/types";
import { isAccountLogoBrandingAvailable } from "@/lib/plan-capability";

export type PdfBrandingMode = "veta" | "account";

export type PdfBranding = {
  mode: PdfBrandingMode;
  /** When mode is veta, show Veta logo/name header and "generated with" footer. */
  showVetaBranding: boolean;
  /** Data URL or absolute URL for header logo (Veta or account). */
  logoUrl?: string;
  /** Wordmark next to logo (e.g. "Veta" or public_name). */
  brandName?: string;
};

/** True when plan may expose account logo + public_name on client surfaces. */
export function isClientAccountBrandingAllowed(
  planConfig: PlanConfig | null | undefined
): boolean {
  return isAccountLogoBrandingAvailable(planConfig);
}

/**
 * Gate stored account fields for client-facing use (PDF architect block, etc.).
 * When plan is basic, public_name / public_logo / public_email are omitted even if stored.
 */
export function resolveClientFacingPublicProfile(params: {
  planConfig: PlanConfig | null | undefined;
  publicName?: string | null;
  publicEmail?: string | null;
  publicLogoUrl?: string | null;
  /** Login / profile email fallback when account branding is not allowed. */
  fallbackEmail?: string | null;
}): {
  brandingAllowed: boolean;
  publicName?: string;
  publicEmail?: string;
  publicLogoUrl?: string;
} {
  const brandingAllowed = isClientAccountBrandingAllowed(params.planConfig);
  if (!brandingAllowed) {
    const fallback = params.fallbackEmail?.trim() || undefined;
    return {
      brandingAllowed: false,
      publicEmail: fallback,
    };
  }

  return {
    brandingAllowed: true,
    publicName: params.publicName?.trim() || undefined,
    publicEmail:
      params.publicEmail?.trim() || params.fallbackEmail?.trim() || undefined,
    publicLogoUrl: params.publicLogoUrl?.trim() || undefined,
  };
}

export function resolvePdfBranding(params: {
  planConfig: PlanConfig | null | undefined;
  /** Already embedded data URL preferred for react-pdf. */
  accountLogoDataUrl?: string | null;
  publicName?: string | null;
  /** Embedded Veta logo data URL when mode is veta. */
  vetaLogoDataUrl?: string | null;
}): PdfBranding {
  const profile = resolveClientFacingPublicProfile({
    planConfig: params.planConfig,
    publicName: params.publicName,
    publicLogoUrl: params.accountLogoDataUrl,
  });

  if (profile.brandingAllowed) {
    return {
      mode: "account",
      showVetaBranding: false,
      logoUrl: profile.publicLogoUrl,
      brandName: profile.publicName,
    };
  }

  return {
    mode: "veta",
    showVetaBranding: true,
    logoUrl: params.vetaLogoDataUrl?.trim() || undefined,
    brandName: "Veta",
  };
}
