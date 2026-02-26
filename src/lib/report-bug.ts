/**
 * Builds the GitHub "new issue" URL with the bug report form template,
 * pre-filling view title and URL when the user opens the link from the app.
 *
 * Requires NEXT_PUBLIC_GITHUB_ISSUES_REPO (e.g. "owner/repo") to be set,
 * or defaults to the repo where the app is hosted (e.g. marcogonzalo/studio-manager).
 */
const GITHUB_ISSUES_REPO =
  typeof process !== "undefined" && process.env?.NEXT_PUBLIC_GITHUB_ISSUES_REPO
    ? process.env.NEXT_PUBLIC_GITHUB_ISSUES_REPO
    : "marcogonzalo/studio-manager";

const BUG_REPORT_TEMPLATE_ES = "bug_report.es.yml";

export type ReportBugParams = {
  /** Page title (e.g. document.title). */
  viewTitle?: string;
  /** Full page URL (e.g. window.location.href). */
  viewUrl?: string;
};

/**
 * Returns the URL to open a new GitHub issue with the bug report form (Spanish),
 * with optional pre-filled view title and URL.
 */
export function getReportBugUrl(params: ReportBugParams = {}): string {
  const { viewTitle = "", viewUrl = "" } = params;
  const base = `https://github.com/${GITHUB_ISSUES_REPO}/issues/new`;
  const search = new URLSearchParams({ template: BUG_REPORT_TEMPLATE_ES });
  if (viewTitle.trim()) search.set("view_title", viewTitle.trim());
  if (viewUrl.trim()) search.set("view_url", viewUrl.trim());
  return `${base}?${search.toString()}`;
}
