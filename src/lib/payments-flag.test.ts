import { describe, it, expect } from "vitest";
import { isPaymentsEnabled } from "./payments-flag";

describe("isPaymentsEnabled", () => {
  it("is false when unset or empty", () => {
    expect(isPaymentsEnabled({})).toBe(false);
    expect(isPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "" })).toBe(false);
  });

  it("is true for true or 1", () => {
    expect(isPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "true" })).toBe(
      true
    );
    expect(isPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "TRUE" })).toBe(
      true
    );
    expect(isPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "1" })).toBe(true);
  });

  it("is false for other values", () => {
    expect(isPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "false" })).toBe(
      false
    );
    expect(isPaymentsEnabled({ NEXT_PUBLIC_PAYMENTS_ENABLED: "0" })).toBe(
      false
    );
  });
});
