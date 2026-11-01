import { describe, expect, it } from "vitest";
import { formatAnimatedCounterValue } from "@/lib/animated-counter-format";

describe("formatAnimatedCounterValue", () => {
  it("formats a finite target the same way SSR should emit", () => {
    expect(formatAnimatedCounterValue(65)).toBe("65");
    expect(formatAnimatedCounterValue(100)).toBe("100");
    expect(formatAnimatedCounterValue(0)).toBe("0");
  });

  it("respects decimals", () => {
    expect(formatAnimatedCounterValue(12.5, { decimals: 1 })).toBe("12,5");
  });
});
