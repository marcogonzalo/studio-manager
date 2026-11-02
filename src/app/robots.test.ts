import { describe, expect, it } from "vitest";
import robots from "@/app/robots";

describe("robots metadata", () => {
  it("allows major AI crawlers explicitly", () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    const agents = rules.map((rule) => rule?.userAgent);
    expect(agents).toEqual(
      expect.arrayContaining([
        "*",
        "GPTBot",
        "OAI-SearchBot",
        "PerplexityBot",
        "ClaudeBot",
        "Google-Extended",
      ])
    );
  });
});
