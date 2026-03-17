import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { CookieOptions } from "@supabase/ssr";
import { getFriendlyAuthErrorMessage } from "@/lib/auth-error-messages";
import { getSupabaseUrl, getSupabaseServerKey } from "@/lib/supabase/keys";
import { appPath } from "@/lib/app-paths";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

const AUTH_CONFIRMED_TYPES = ["signup", "login"] as const;
const VALID_PLAN_CODES = ["BASE", "PRO", "STUDIO"] as const;

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next");
  const typeParam = searchParams.get("type");
  const next = nextParam
    ? decodeURIComponent(nextParam)
    : appPath("/dashboard");

  if (code) {
    const redirectPath = next.startsWith("/") ? next : `/${next}`;
    const supabaseUrl = getSupabaseUrl();
    const pendingCookies: CookieToSet[] = [];

    const supabase = createServerClient(supabaseUrl, getSupabaseServerKey(), {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          pendingCookies.push(...cookiesToSet);
        },
      },
    });

    let error: { message?: string; code?: string } | null = null;
    let result: Awaited<
      ReturnType<typeof supabase.auth.exchangeCodeForSession>
    > | null = null;
    try {
      result = await supabase.auth.exchangeCodeForSession(code);
      error = result.error;
    } catch (err) {
      error = {
        message: err instanceof Error ? err.message : String(err),
        code: (err as { code?: string })?.code,
      };
    }

    if (!error && result?.data?.session) {
      const authConfirmed =
        typeParam &&
        AUTH_CONFIRMED_TYPES.includes(
          typeParam as (typeof AUTH_CONFIRMED_TYPES)[number]
        )
          ? typeParam
          : "login";
      const redirectUrl = new URL(redirectPath, origin);
      redirectUrl.searchParams.set("auth_confirmed", authConfirmed);

      if (authConfirmed === "signup") {
        const metadata = result.data.user?.user_metadata as
          | { signup_plan?: string; signup_billing?: string }
          | undefined;
        const plan =
          metadata?.signup_plan &&
          VALID_PLAN_CODES.includes(
            metadata.signup_plan as (typeof VALID_PLAN_CODES)[number]
          )
            ? metadata.signup_plan
            : null;
        const billing =
          metadata?.signup_billing?.toLowerCase() === "annual"
            ? "annual"
            : "monthly";
        if (plan) redirectUrl.searchParams.set("plan_code", plan);
        redirectUrl.searchParams.set("billing_period", billing);
      }

      const response = NextResponse.redirect(redirectUrl.toString());
      pendingCookies.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options)
      );
      return response;
    }

    if (error) {
      const friendlyMessage = getFriendlyAuthErrorMessage(
        error.message,
        error.code
      );
      const authUrl = new URL("/sign-in", origin);
      authUrl.searchParams.set("error", friendlyMessage);
      authUrl.searchParams.set("redirect", redirectPath);
      return NextResponse.redirect(authUrl.toString());
    }
  }

  const authUrl = new URL("/sign-in", origin);
  authUrl.searchParams.set(
    "error",
    "No se recibió el código de acceso. Por favor, intenta acceder nuevamente."
  );
  authUrl.searchParams.set("redirect", appPath("/dashboard"));
  return NextResponse.redirect(authUrl.toString());
}
