import { describe, it, expect } from "vitest";
import { isWithinNewUserHelpWindow, HELP_PROMINENT_DAYS } from "./help-window";

describe("isWithinNewUserHelpWindow", () => {
  const now = Date.parse("2026-10-16T12:00:00.000Z");

  it("returns false when confirmed_at missing", () => {
    expect(isWithinNewUserHelpWindow(null, now)).toBe(false);
    expect(isWithinNewUserHelpWindow(undefined, now)).toBe(false);
    expect(isWithinNewUserHelpWindow("", now)).toBe(false);
  });

  it("returns true within prominent window", () => {
    const confirmed = new Date(
      now - (HELP_PROMINENT_DAYS - 1) * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(isWithinNewUserHelpWindow(confirmed, now)).toBe(true);
  });

  it("returns false after prominent window", () => {
    const confirmed = new Date(
      now - (HELP_PROMINENT_DAYS + 1) * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(isWithinNewUserHelpWindow(confirmed, now)).toBe(false);
  });

  it("returns false for invalid date", () => {
    expect(isWithinNewUserHelpWindow("not-a-date", now)).toBe(false);
  });
});
