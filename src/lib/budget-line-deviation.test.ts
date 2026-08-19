import { describe, expect, it } from "vitest";
import { isDeviationCalculable } from "./budget-line-deviation";

describe("isDeviationCalculable", () => {
  it("is false when estimated and actual are both zero", () => {
    expect(isDeviationCalculable(0, 0)).toBe(false);
  });

  it("is false when estimated is missing so a percentage cannot be computed", () => {
    expect(isDeviationCalculable(0, 40)).toBe(false);
  });

  it("is false when actual is still pending", () => {
    expect(isDeviationCalculable(100, 0)).toBe(false);
  });

  it("is true when both amounts are known and positive", () => {
    expect(isDeviationCalculable(100, 80)).toBe(true);
    expect(isDeviationCalculable(50, 50)).toBe(true);
  });
});
