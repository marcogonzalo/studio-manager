"use client";

import { SupportForm } from "@/components/support/support-form";
import {
  parseSupportReasonParam,
  DEFAULT_SUPPORT_REASON,
} from "@/lib/support/reasons";

/** Marketing contact page wrapper around shared SupportForm. */
export function ContactForm({ reasonParam }: { reasonParam?: string | null }) {
  const reason = parseSupportReasonParam(reasonParam) ?? DEFAULT_SUPPORT_REASON;

  return (
    <SupportForm defaultReason={reason} variant="marketing" withCardContent />
  );
}
