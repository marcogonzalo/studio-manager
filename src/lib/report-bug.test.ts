import { describe, it, expect } from "vitest";
import { getReportBugUrl } from "./report-bug";

describe("getReportBugUrl", () => {
  it("returns URL with template param when no params given", () => {
    const url = getReportBugUrl();
    expect(url).toContain("github.com");
    expect(url).toContain("/issues/new");
    expect(url).toContain("template=bug_report.es.yml");
  });

  it("adds view_title and view_url when provided", () => {
    const url = getReportBugUrl({
      viewTitle: "Dashboard",
      viewUrl: "https://app.example.com/veta-app/dashboard",
    });
    expect(url).toContain("view_title=Dashboard");
    expect(url).toContain("view_url=");
    expect(url).toContain(
      encodeURIComponent("https://app.example.com/veta-app/dashboard")
    );
  });

  it("omits empty viewTitle and viewUrl", () => {
    const url = getReportBugUrl({ viewTitle: "", viewUrl: "" });
    expect(url).not.toContain("view_title=");
    expect(url).not.toContain("view_url=");
  });

  it("trims whitespace from viewTitle and viewUrl", () => {
    const url = getReportBugUrl({
      viewTitle: "  Settings  ",
      viewUrl: "  https://example.com  ",
    });
    expect(url).toContain("view_title=Settings");
    expect(url).toContain("view_url=");
    expect(url).not.toContain("  ");
  });
});
