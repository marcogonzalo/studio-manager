"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { appPath } from "@/lib/app-paths";
import { pushDemoAccess } from "@/lib/gtm";
import { getAppUiCopy } from "@/lib/app-ui-copy";
import { isAppLocale } from "@/lib/resolve-locale-from-accept-language";

function AuthCompleteContent() {
  const t = useTranslations("Common");
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    const next =
      searchParams.get("next")?.replace(/^\/+/, "") || appPath("/dashboard");
    const redirectPath = next.startsWith("/") ? next : `/${next}`;
    const isDemoAccess = searchParams.get("demo") === "1";
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "";
    const localeMatch = pathname.match(/^\/(en|es)(?:\/|$)/);
    const locale = isAppLocale(localeMatch?.[1]) ? localeMatch[1] : "es";
    const errors = getAppUiCopy(locale).errors;

    const hash =
      typeof window !== "undefined" ? window.location.hash.slice(1) : "";
    if (!hash) {
      window.location.href = `/${locale}/sign-in?error=${encodeURIComponent(errors.authMissingLink)}&redirect=${encodeURIComponent(redirectPath)}`;
      return;
    }

    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");

    if (!accessToken || !refreshToken) {
      setStatus("error");
      window.location.href = `/${locale}/sign-in?error=${encodeURIComponent(errors.authExpired)}&redirect=${encodeURIComponent(redirectPath)}`;
      return;
    }

    const supabase = getSupabaseClient();
    supabase.auth
      .setSession({ access_token: accessToken, refresh_token: refreshToken })
      .then(() => {
        if (isDemoAccess) pushDemoAccess();
        const origin = window.location.origin;
        window.location.replace(`${origin}${redirectPath}`);
      })
      .catch(() => {
        setStatus("error");
        window.location.href = `/${locale}/sign-in?error=${encodeURIComponent(errors.authGeneric)}&redirect=${encodeURIComponent(redirectPath)}`;
      });
  }, [searchParams]);

  if (status === "error") return null;

  return (
    <p className="text-muted-foreground text-center text-sm">
      {t("signingIn")}
    </p>
  );
}

/**
 * Handles auth redirect when Supabase sends tokens in the URL hash (implicit flow).
 * Used by demo magic link and any flow that redirects with #access_token=...
 * Reads hash, sets session, then redirects to `next` or dashboard.
 */
function AuthCompleteFallback() {
  const t = useTranslations("Common");
  return (
    <p className="text-muted-foreground text-center text-sm">
      {t("signingIn")}
    </p>
  );
}

export default function AuthCompletePage() {
  return (
    <Suspense fallback={<AuthCompleteFallback />}>
      <AuthCompleteContent />
    </Suspense>
  );
}
