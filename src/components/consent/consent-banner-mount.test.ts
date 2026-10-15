import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const root = join(process.cwd(), "src/app");

describe("CookieConsentBanner mount points (#220)", () => {
  it("is mounted in [locale] layout (covers auth + marketing)", () => {
    const src = readFileSync(join(root, "[locale]/layout.tsx"), "utf8");
    expect(src).toContain("CookieConsentBanner");
  });

  it("is mounted in veta-app layout (confirmation / app routes)", () => {
    const src = readFileSync(join(root, "veta-app/layout.tsx"), "utf8");
    expect(src).toContain("CookieConsentBanner");
  });

  it("is not duplicated in marketing layout", () => {
    const src = readFileSync(
      join(root, "[locale]/(marketing)/layout.tsx"),
      "utf8"
    );
    expect(src).not.toContain("CookieConsentBanner");
  });
});
