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
  | "project_updated"
  | "limit_hit"
  | "limit_cta_clicked"
  | "help_clicked"
  | "sample_viewed"
  | "sample_reopened"
  | "note_created"
  | "note_archived";

export type TrackEventOptions = {
  userId: string;
};

/**
 * Track a user event in the user_events table.
 *
 * When `options.userId` is provided, inserts with that id and skips `getUser()`.
 * Use only from server-only trusted callers after they have already authenticated
 * the user (route handlers, auth callback). Do not expose `options` through
 * client-callable server actions.
 *
 * When omitted, resolves the current user via `getUser()` (existing behavior).
 * Returns true if event was tracked successfully, false otherwise.
 * Errors are logged but not thrown - tracking failures should not break user flows.
 */
export async function trackEvent(
  event: UserEvent,
  props?: Record<string, unknown>,
  options?: TrackEventOptions
): Promise<boolean> {
  try {
    const supabase = await createClient();

    let userId = options?.userId;
    if (!userId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        return false;
      }
      userId = user.id;
    }

    const { error } = await supabase.from("user_events").insert({
      user_id: userId,
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
