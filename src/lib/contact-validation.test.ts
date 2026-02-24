import { describe, it, expect } from "vitest";
import {
  isValidPhoneFormat,
  optionalEmailSchema,
  optionalPhoneSchema,
} from "./contact-validation";

describe("isValidPhoneFormat", () => {
  it("accepts empty string", () => {
    expect(isValidPhoneFormat("")).toBe(true);
    expect(isValidPhoneFormat("   ")).toBe(true);
  });

  it("accepts international format with plus and spaces", () => {
    expect(isValidPhoneFormat("+34 600 000 000")).toBe(true);
    expect(isValidPhoneFormat("+1 234 567 890")).toBe(true);
  });

  it("accepts digits only when at least 9 digits", () => {
    expect(isValidPhoneFormat("600000000")).toBe(true);
    expect(isValidPhoneFormat("123456789")).toBe(true);
  });

  it("accepts format with hyphens and parentheses", () => {
    expect(isValidPhoneFormat("(34) 600-000-000")).toBe(true);
    expect(isValidPhoneFormat("+34-600-000-000")).toBe(true);
  });

  it("rejects when fewer than 9 digits", () => {
    expect(isValidPhoneFormat("123")).toBe(false);
    expect(isValidPhoneFormat("12345678")).toBe(false);
  });

  it("rejects when contains letters or other invalid chars", () => {
    expect(isValidPhoneFormat("600 000 000a")).toBe(false);
    expect(isValidPhoneFormat("call me")).toBe(false);
  });
});

describe("optionalEmailSchema", () => {
  it("accepts empty string", () => {
    expect(optionalEmailSchema.safeParse("").success).toBe(true);
    expect(optionalEmailSchema.safeParse("   ").success).toBe(true);
  });

  it("accepts valid email", () => {
    expect(optionalEmailSchema.safeParse("a@b.co").success).toBe(true);
    expect(optionalEmailSchema.safeParse("user@example.com").success).toBe(true);
  });

  it("rejects invalid email when non-empty", () => {
    expect(optionalEmailSchema.safeParse("invalid").success).toBe(false);
    expect(optionalEmailSchema.safeParse("a@").success).toBe(false);
  });
});

describe("optionalPhoneSchema", () => {
  it("accepts empty string", () => {
    expect(optionalPhoneSchema.safeParse("").success).toBe(true);
  });

  it("accepts valid phone", () => {
    expect(optionalPhoneSchema.safeParse("+34 600 000 000").success).toBe(true);
    expect(optionalPhoneSchema.safeParse("600000000").success).toBe(true);
  });

  it("rejects invalid phone", () => {
    expect(optionalPhoneSchema.safeParse("123").success).toBe(false);
    expect(optionalPhoneSchema.safeParse("abc").success).toBe(false);
  });
});
