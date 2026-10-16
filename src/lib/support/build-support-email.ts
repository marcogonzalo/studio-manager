import type { SupportReason } from "./reasons";

/** Strips CR/LF from a fragment used in email Subject to mitigate header injection. */
export function sanitizeEmailSubjectFragment(value: string): string {
  return value
    .replace(/\r\n|\r|\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function buildSupportEmailSubject(
  reason: SupportReason,
  subjectField: string
): string {
  const safe = sanitizeEmailSubjectFragment(subjectField);
  return `[Veta] Contact: (${reason}) ${safe}`;
}

export type SupportEmailBodyInput = {
  reason: SupportReason;
  name: string;
  email: string;
  subject: string;
  message: string;
  locale: string;
  path?: string | null;
  planCode?: string | null;
};

/**
 * Markdown-shaped body for the support inbox.
 * From stays Veta Web; identity is Reply-To + contact line in body.
 */
export function buildSupportEmailText(input: SupportEmailBodyInput): string {
  const plan = input.planCode?.trim() ?? "";
  const path = input.path?.trim() ?? "";
  return [
    `# Veta contact from ${input.reason} (${input.locale})`,
    "",
    "---",
    `**Contact**: ${input.name} (${input.email})`,
    `**Plan**: ${plan}`,
    `**Path**: ${path}`,
    "---",
    "",
    `**Subject**: ${input.subject}`,
    "",
    "**Message**:",
    input.message,
    "",
  ].join("\n");
}

export function buildSupportEmailHtml(
  input: SupportEmailBodyInput,
  escapeHtml: (s: string) => string
): string {
  const plan = input.planCode?.trim() ?? "";
  const path = input.path?.trim() ?? "";
  return `
    <h1>Veta contact from ${escapeHtml(input.reason)} (${escapeHtml(input.locale)})</h1>
    <hr>
    <p><strong>Contact</strong>: ${escapeHtml(input.name)} (${escapeHtml(input.email)})</p>
    <p><strong>Plan</strong>: ${escapeHtml(plan)}</p>
    <p><strong>Path</strong>: ${escapeHtml(path)}</p>
    <hr>
    <p><strong>Subject</strong>: ${escapeHtml(input.subject)}</p>
    <p><strong>Message</strong>:</p>
    <p>${escapeHtml(input.message).replace(/\n/g, "<br>")}</p>
  `;
}
