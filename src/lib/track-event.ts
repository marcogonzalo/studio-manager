/**
 * F3: Server-side event tracking helper for user_events table.
 * Emit product engagement events for the first-party funnel.
 * Prefer props.project_id (or supplier_id) when the event is scoped to a resource.
 * invite_sent / plan_selected are reserved for future wiring.
 */

import { createClient } from "@/lib/supabase/server";
import { reportError } from "@/lib/utils";

export type UserEvent =
  | "signup"
  | "login"
  | "project_created"
  | "budget_created"
  | "supplier_created"
  | "invite_sent"
  | "plan_selected"
  | "project_updated";

/**
 * Track a user event in the user_events table.
 * Uses the current authenticated user from the Supabase server client.
 * Returns true if event was tracked successfully, false otherwise.
 * Errors are logged but not thrown - tracking failures should not break user flows.
 */
export async function trackEvent(
  event: UserEvent,
  props?: Record<string, unknown>
): Promise<boolean> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { error } = await supabase.from("user_events").insert({
      user_id: user.id,
      event,
      props: props ?? {},
    });

    if (error) {
      reportError(error, `[trackEvent] ${event}`);
      return false;
    }

    return true;
  } catch (err) {
    reportError(err, `[trackEvent] ${event}`);
    return false;
  }
}
