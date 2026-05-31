"use client";

import { useEffect, useState } from "react";
import {
  CONSENT_STORAGE_KEY,
  CONSENT_UPDATE_EVENT,
  loadStoredConsent,
} from "@/lib/consent";
import { GtmScript } from "@/components/gtm/gtm-script";

function hasAnalyticsConsent(): boolean {
  return loadStoredConsent()?.analytics === true;
}

/**
 * Loads GTM only after the user grants analytics cookies (or had prior consent).
 * Keeps gtm.js/gtag off the critical path for first-time visitors.
 */
export function GtmScriptGate() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(hasAnalyticsConsent());

    const sync = () => setEnabled(hasAnalyticsConsent());

    window.addEventListener(CONSENT_UPDATE_EVENT, sync);
    const onStorage = (event: StorageEvent) => {
      if (event.key === CONSENT_STORAGE_KEY) sync();
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener(CONSENT_UPDATE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  if (!enabled) return null;
  return <GtmScript />;
}
