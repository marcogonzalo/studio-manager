import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase/keys";
import { trackEvent } from "@/lib/track-event";
import { reportError } from "@/lib/utils";

const LEAD_SOURCE = "plan_limit_interest";

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

    let limitType: string | undefined;
    try {
      const body = (await request.json()) as { type?: string };
      limitType = body.type;
    } catch {
      // body optional
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

    await trackEvent("limit_cta_clicked", {
      type: limitType ?? "projects",
      source: LEAD_SOURCE,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    reportError(err, "[notify-interest]");
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
