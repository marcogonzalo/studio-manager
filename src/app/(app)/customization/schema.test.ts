import { describe, it, expect } from "vitest";
import { customizationFormSchema } from "./schema";

describe("customizationFormSchema", () => {
  it("accepts valid optional fields", () => {
    const result = customizationFormSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("accepts valid email", () => {
    expect(
      customizationFormSchema.safeParse({ email: "user@example.com" }).success
    ).toBe(true);
    expect(customizationFormSchema.safeParse({ email: "a@b.co" }).success).toBe(
      true
    );
  });

  it("rejects invalid email", () => {
    const result = customizationFormSchema.safeParse({
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Correo no válido");
    }
  });

  it("accepts empty string for email (optional)", () => {
    expect(customizationFormSchema.safeParse({ email: "" }).success).toBe(true);
  });

  it("accepts default_tax_rate >= 0", () => {
    expect(
      customizationFormSchema.safeParse({ default_tax_rate: "0" }).success
    ).toBe(true);
    expect(
      customizationFormSchema.safeParse({ default_tax_rate: "21" }).success
    ).toBe(true);
    expect(
      customizationFormSchema.safeParse({ default_tax_rate: "10.5" }).success
    ).toBe(true);
  });

  it("rejects default_tax_rate < 0", () => {
    const result = customizationFormSchema.safeParse({
      default_tax_rate: "-1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Debe ser mayor o igual a 0");
    }
  });

  it("accepts empty default_tax_rate", () => {
    expect(
      customizationFormSchema.safeParse({ default_tax_rate: "" }).success
    ).toBe(true);
  });
});
