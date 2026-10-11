import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase/keys";

/**
 * F1: Update leads.demo_accessed_at when user accesses demo.
 * Called from auth/complete page when demo=1 query param is present.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        { error: "Email required" },
        { status: 400 }
      );
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

    // Get the user_id for this email
    const { data: usersData } = await admin.auth.admin.listUsers();
    const user = usersData?.users.find((u) => u.email === email);
    const userId = user?.id;

    // Update leads table with demo_accessed_at and user_id
    const { error } = await admin
      .from("leads")
      .update({
        demo_accessed_at: new Date().toISOString(),
        user_id: userId,
      })
      .eq("email", email);

    if (error) {
      console.error("[demo-accessed] update error", error);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[demo-accessed]", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
