import { describe, it, expect } from "vitest";
import { demoSignUpHref } from "./demo-account-banner";

describe("demoSignUpHref", () => {
  it("returns Spanish sign-up path for es", () => {
    expect(demoSignUpHref("es")).toBe("/sign-up");
  });

  it("returns English sign-up path for en", () => {
    expect(demoSignUpHref("en")).toBe("/en/sign-up");
  });
});
