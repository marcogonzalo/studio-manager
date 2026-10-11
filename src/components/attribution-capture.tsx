"use client";

import { useEffect } from "react";
import { captureAndSaveAttribution } from "@/lib/attribution";
import { CONSENT_UPDATE_EVENT } from "@/lib/consent";

/**
 * F2: Capture attribution data on first visit (client-side).
 * Listens to cookie consent updates to save attribution cookie when analytics consent is granted.
 * Place this component in the marketing layout to capture attribution for all public pages.
 */
export function AttributionCapture() {
  useEffect(() => {
    captureAndSaveAttribution();

    const handleConsentUpdate = () => {
      captureAndSaveAttribution();
    };

    window.addEventListener(CONSENT_UPDATE_EVENT, handleConsentUpdate);
    return () => {
      window.removeEventListener(CONSENT_UPDATE_EVENT, handleConsentUpdate);
    };
  }, []);

  return null;
}
