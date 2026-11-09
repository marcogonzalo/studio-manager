/**
 * Resolve budget PDF header/footer branding from plan modality + account logo.
 * Base (basic): Veta header + footer.
 * Pro/Studio (plus|full): account logo + public name; no Veta branding.
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

export function resolvePdfBranding(params: {
  planConfig: PlanConfig | null | undefined;
  /** Already embedded data URL preferred for react-pdf. */
  accountLogoDataUrl?: string | null;
  publicName?: string | null;
  /** Embedded Veta logo data URL when mode is veta. */
  vetaLogoDataUrl?: string | null;
}): PdfBranding {
  const useAccount = isAccountLogoBrandingAvailable(params.planConfig);
  if (useAccount) {
    const brandName = params.publicName?.trim() || undefined;
    const logoUrl = params.accountLogoDataUrl?.trim() || undefined;
    return {
      mode: "account",
      showVetaBranding: false,
      logoUrl,
      brandName,
    };
  }

  return {
    mode: "veta",
    showVetaBranding: true,
    logoUrl: params.vetaLogoDataUrl?.trim() || undefined,
    brandName: "Veta",
  };
}
