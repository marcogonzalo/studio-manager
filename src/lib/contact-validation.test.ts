import { describe, it, expect } from "vitest";
import { optionalEmailSchema, optionalPhoneSchema } from "./contact-validation";

describe("optionalEmailSchema", () => {
  it("accepts empty string", () => {
    expect(optionalEmailSchema.safeParse("").success).toBe(true);
    expect(optionalEmailSchema.safeParse("   ").success).toBe(true);
  });

  it("accepts valid email", () => {
    expect(optionalEmailSchema.safeParse("a@b.co").success).toBe(true);
    expect(optionalEmailSchema.safeParse("user@example.com").success).toBe(
      true
    );
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

  it("accepts valid E.164 phone", () => {
    expect(optionalPhoneSchema.safeParse("+34600000000").success).toBe(true);
    expect(optionalPhoneSchema.safeParse("+12133734253").success).toBe(true);
  });

  it("rejects invalid phone", () => {
    expect(optionalPhoneSchema.safeParse("123").success).toBe(false);
    expect(optionalPhoneSchema.safeParse("abc").success).toBe(false);
  });

  it("error message includes country example when country can be inferred (no 'para el país seleccionado')", () => {
    const result = optionalPhoneSchema.safeParse("+3412");
    expect(result.success).toBe(false);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? "";
      expect(msg).toContain("Introduce un teléfono válido");
      expect(msg).not.toContain("para el país seleccionado");
      expect(msg).toContain("ej.");
      expect(msg).toMatch(/\+34\s/);
    }
  });
});
