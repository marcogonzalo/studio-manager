import { createClient } from "@/lib/supabase/server";

/**
 * Track session start with deduplication (max 1 per user per 30 minutes).
 * Reuses 'login' event type for session tracking.
 * Called on authenticated page loads to track user activity.
 */
export async function trackSessionStart(): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // Check if user has a recent session event (within last 30 minutes)
    const thirtyMinutesAgo = new Date(
      Date.now() - 30 * 60 * 1000
    ).toISOString();
    const { data: recentSessions } = await supabase
      .from("user_events")
      .select("id")
      .eq("user_id", user.id)
      .eq("event", "login")
      .gte("created_at", thirtyMinutesAgo)
      .limit(1);

    // If there's a recent session, skip tracking
    if (recentSessions && recentSessions.length > 0) {
      return;
    }

    // Track new session
    await supabase.from("user_events").insert({
      user_id: user.id,
      event: "login",
      props: { session_start: true },
    });
  } catch (error) {
    // Silent fail - don't break user experience if tracking fails
    console.error("[trackSessionStart]", error);
  }
}
