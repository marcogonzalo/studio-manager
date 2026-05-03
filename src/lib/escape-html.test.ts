import { describe, it, expect } from "vitest";
import { escapeHtml } from "./escape-html";

describe("escapeHtml", () => {
  it("escapes HTML special characters", () => {
    expect(escapeHtml(`a<b>&"'`)).toBe("a&lt;b&gt;&amp;&quot;&#039;");
  });

  it("leaves safe text unchanged", () => {
    expect(escapeHtml("visitor@example.com")).toBe("visitor@example.com");
  });
});
