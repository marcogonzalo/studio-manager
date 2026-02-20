import { describe, it, expect } from "vitest";
import { getDisplayName } from "./display-name";

describe("getDisplayName", () => {
  it("returns first word of profileFullName when set", () => {
    expect(
      getDisplayName(
        { email: "a@b.com", user_metadata: {} },
        "María García López"
      )
    ).toBe("María");
    expect(getDisplayName(null, "  Ana  ")).toBe("Ana");
  });

  it("prefers profileFullName over user_metadata.full_name", () => {
    expect(
      getDisplayName(
        { email: "a@b.com", user_metadata: { full_name: "Meta Name" } },
        "Profile Name"
      )
    ).toBe("Profile");
  });

  it("uses user_metadata.full_name first word when no profileFullName", () => {
    expect(
      getDisplayName(
        { email: "a@b.com", user_metadata: { full_name: "John Doe" } },
        null
      )
    ).toBe("John");
  });

  it("uses email local part when no full name", () => {
    expect(
      getDisplayName({ email: "juan@example.com", user_metadata: {} }, null)
    ).toBe("juan");
    expect(getDisplayName({ email: "  base@veta.pro  ", user_metadata: {} }, ""))
      .toBe("base");
  });

  it("returns Usuario when no user or no email and no name", () => {
    expect(getDisplayName(null, null)).toBe("Usuario");
    expect(getDisplayName({ email: "", user_metadata: {} }, "")).toBe("Usuario");
  });
});
