import { describe, it, expect } from "vitest";
import {
  buildSupportEmailSubject,
  buildSupportEmailText,
  buildSupportEmailHtml,
  sanitizeEmailSubjectFragment,
} from "./build-support-email";
import { escapeHtml } from "@/lib/escape-html";

describe("build-support-email", () => {
  it("builds subject with reason tag and sanitized field", () => {
    expect(buildSupportEmailSubject("need_help", "I need help")).toBe(
      "[Veta] Contact: (need_help) I need help"
    );
    expect(buildSupportEmailSubject("report_error", "Break\nline")).toBe(
      "[Veta] Contact: (report_error) Break line"
    );
  });

  it("sanitizeEmailSubjectFragment strips CR/LF", () => {
    expect(sanitizeEmailSubjectFragment("a\r\nb")).toBe("a b");
  });

  it("text body follows markdown structure with contact and reason tag", () => {
    const text = buildSupportEmailText({
      reason: "need_help",
      name: "Jane Doe",
      email: "jane@example.com",
      subject: "Help please",
      message: "Stuck on dashboard",
      locale: "en",
      path: "/veta-app/dashboard",
      planCode: "BASE",
    });
    expect(text).toContain("# Veta contact from need_help (en)");
    expect(text).toContain("**Contact**: Jane Doe (jane@example.com)");
    expect(text).toContain("**Plan**: BASE");
    expect(text).toContain("**Path**: /veta-app/dashboard");
    expect(text).toContain("**Subject**: Help please");
    expect(text).toContain("**Message**:");
    expect(text).toContain("Stuck on dashboard");
    expect(text).not.toContain("I need help"); // no reason label
  });

  it("html escapes payload", () => {
    const html = buildSupportEmailHtml(
      {
        reason: "other",
        name: "Script <script>x</script>",
        email: "a@b.com",
        subject: "Hi there",
        message: "Hello <script>x</script> &",
        locale: "es",
      },
      escapeHtml
    );
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&amp;");
    expect(html).toContain("Veta contact from other (es)");
  });
});
