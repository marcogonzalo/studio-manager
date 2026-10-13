import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIp,
  getRateLimitMessage,
} from "@/lib/rate-limit";
import { localeFromRequest } from "@/lib/app-ui-copy";
import {
  getSupabaseClientKey,
  getSupabaseServiceRoleKey,
  getSupabaseUrl,
} from "@/lib/supabase/keys";
import { reportError } from "@/lib/utils";

/**
 * Mark lead as demo-accessed for the authenticated user.
 * Requires Bearer access token (hash auth flow sets session client-side first).
 * Identity comes only from the token — never from a client-supplied email.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { allowed, resetAt } = checkRateLimit(ip, "auth");
    if (!allowed) {
      const retryAfter = Math.ceil((resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { error: getRateLimitMessage(localeFromRequest(request)) },
        {
          status: 429,
          headers: { "Retry-After": String(Math.max(1, retryAfter)) },
        }
      );
    }

    const authHeader = request.headers.get("authorization");
    const bearer = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();
    if (!bearer) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userClient = createClient(getSupabaseUrl(), getSupabaseClientKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${bearer}` } },
    });
    const {
      data: { user },
      error: userError,
    } = await userClient.auth.getUser(bearer);

    if (userError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service unavailable" },
        { status: 503 }
      );
    }

    const admin = createClient(getSupabaseUrl(), serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { error } = await admin
      .from("leads")
      .update({
        demo_accessed_at: new Date().toISOString(),
        user_id: user.id,
      })
      .eq("email", user.email);

    if (error) {
      reportError(error, "[demo-accessed] update error");
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    reportError(err, "[demo-accessed]");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
