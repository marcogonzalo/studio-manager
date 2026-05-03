import { describe, it, expect } from "vitest";
import { getDemoAccessEmailHtml, getDemoAccessEmailText } from "./demo-access";

describe("demo-access email templates", () => {
  const link = "https://example.com/verify?token=abc";

  it("defaults to Spanish copy", () => {
    expect(getDemoAccessEmailHtml(link)).toContain("Prueba la demo");
    expect(getDemoAccessEmailText(link)).toContain("Hola");
  });

  it("uses English when lang is en", () => {
    expect(getDemoAccessEmailHtml(link, "en")).toContain("Try the Veta demo");
    expect(getDemoAccessEmailText(link, "en")).toContain("Hello");
  });
});
