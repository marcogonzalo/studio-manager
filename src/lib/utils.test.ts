import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("should merge Tailwind classes and resolve conflicts", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle arrays of class names", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });

  it("should handle objects with boolean values", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe("foo baz");
  });

  it("should handle mixed inputs", () => {
    const result = cn("foo", ["bar", "baz"], { qux: true }, false && "quux");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
    expect(result).toContain("qux");
    expect(result).not.toContain("quux");
  });

  it("should handle undefined and null values", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("should merge conflicting Tailwind utilities correctly", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("should handle string with whitespace", () => {
    const result = cn("  foo   bar  ", "baz");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
  });
});
