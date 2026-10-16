import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase/keys";
import { trackEvent } from "@/lib/track-event";
import { reportError } from "@/lib/utils";
import { checkRateLimit, getRateLimitMessage } from "@/lib/rate-limit";
import { localeFromRequest } from "@/lib/app-ui-copy";
import type { LimitHitType } from "@/lib/plan-limit-ux";

const LEAD_SOURCE = "plan_limit_interest";

const bodySchema = z.object({
  type: z.enum(["projects", "storage", "feature"]).optional(),
});

/**
 * Authenticated waitlist for Pro when payments are not live.
 * Upserts leads by email (service role) and emits limit_cta_clicked.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const locale = localeFromRequest(request);
    const { allowed, resetAt } = checkRateLimit(`user:${user.id}`, "plan");
    if (!allowed) {
      return NextResponse.json(
        { error: getRateLimitMessage(locale) },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
            ),
          },
        }
      );
    }

    let limitType: LimitHitType | undefined;
    try {
      const raw = await request.json();
      const parsed = bodySchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json({ error: "Invalid body" }, { status: 400 });
      }
      limitType = parsed.data.type;
    } catch {
      // body optional / empty
    }

    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Operation unavailable" },
        { status: 503 }
      );
    }

    const email = user.email.trim().toLowerCase();
    const admin = createServiceClient(getSupabaseUrl(), serviceRoleKey, {
      auth: { persistSession: false },
    });

    const { error: leadError } = await admin.from("leads").upsert(
      {
        email,
        source: LEAD_SOURCE,
        user_id: user.id,
        marketing_consent: false,
        consent_at: null,
      },
      { onConflict: "email" }
    );

    if (leadError) {
      reportError(leadError, "[notify-interest] lead upsert");
      return NextResponse.json(
        { error: "Could not save interest" },
        { status: 500 }
      );
    }

    await trackEvent(
      "limit_cta_clicked",
      {
        type: limitType ?? "projects",
        source: LEAD_SOURCE,
      },
      { userId: user.id }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    reportError(err, "[notify-interest]");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
