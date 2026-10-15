"use server";

import { trackEvent, type UserEvent } from "@/lib/track-event";

/**
 * F3: Server action wrapper for trackEvent.
 * Call this from client components to track user events.
 * Returns true if event was tracked successfully, false otherwise.
 */
export async function trackUserEvent(
  event: UserEvent,
  props?: Record<string, unknown>
): Promise<boolean> {
  return await trackEvent(event, props);
}
