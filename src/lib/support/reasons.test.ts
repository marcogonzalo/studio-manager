import { describe, it, expect } from "vitest";
import {
  isSupportReason,
  parseSupportReasonParam,
  DEFAULT_SUPPORT_REASON,
} from "./reasons";

describe("support reasons", () => {
  it("isSupportReason accepts known codes", () => {
    expect(isSupportReason("need_help")).toBe(true);
    expect(isSupportReason("report_error")).toBe(true);
    expect(isSupportReason("bogus")).toBe(false);
  });

  it("parseSupportReasonParam trims and rejects unknown", () => {
    expect(parseSupportReasonParam(" need_help ")).toBe("need_help");
    expect(parseSupportReasonParam("nope")).toBeNull();
    expect(parseSupportReasonParam(null)).toBeNull();
  });

  it("default reason is other for public entry without param", () => {
    expect(DEFAULT_SUPPORT_REASON).toBe("other");
  });
});
