"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  pushSignUpConfirmed,
  pushLoginConfirmed,
  type PlanCode,
  type BillingPeriod,
} from "@/lib/gtm";

/**
 * When the user lands after clicking the magic link, the callback redirects with
 * ?auth_confirmed=signup or ?auth_confirmed=login. This component pushes the
 * corresponding GTM event and removes the param from the URL.
 */
export function AuthConfirmedTracker() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const confirmed = params.get("auth_confirmed");
    if (!confirmed) return;

    if (confirmed === "signup") {
      const planCode = params.get("plan_code");
      const billingPeriod = params.get("billing_period");
      pushSignUpConfirmed({
        method: "magic_link",
        ...(planCode && { plan_code: planCode as PlanCode }),
        ...(billingPeriod && {
          billing_period: billingPeriod as BillingPeriod,
        }),
      });
    } else if (confirmed === "login") {
      pushLoginConfirmed();
    }

    params.delete("auth_confirmed");
    params.delete("plan_code");
    params.delete("billing_period");
    const query = params.toString();
    const url = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;
    router.replace(url, { scroll: false });
  }, [router]);

  return null;
}
