import { describe, expect, it } from "vitest";
import {
  getExtensionFromMime,
  isAllowedImageType,
  validateImageFile,
} from "./image-validation";

describe("isAllowedImageType", () => {
  it("accepts jpeg, png, webp and avif", () => {
    expect(isAllowedImageType("image/jpeg")).toBe(true);
    expect(isAllowedImageType("image/png")).toBe(true);
    expect(isAllowedImageType("image/webp")).toBe(true);
    expect(isAllowedImageType("image/avif")).toBe(true);
  });

  it("rejects other mime types", () => {
    expect(isAllowedImageType("image/gif")).toBe(false);
    expect(isAllowedImageType("application/pdf")).toBe(false);
    expect(isAllowedImageType("")).toBe(false);
  });
});

describe("getExtensionFromMime", () => {
  it("maps known image types to extensions", () => {
    expect(getExtensionFromMime("image/jpeg")).toBe(".jpg");
    expect(getExtensionFromMime("image/png")).toBe(".png");
    expect(getExtensionFromMime("image/webp")).toBe(".webp");
    expect(getExtensionFromMime("image/avif")).toBe(".avif");
  });

  it("falls back to .jpg for unknown types", () => {
    expect(getExtensionFromMime("image/unknown")).toBe(".jpg");
  });
});

describe("validateImageFile", () => {
  it("accepts allowed image files", () => {
    const file = new File(["content"], "photo.avif", { type: "image/avif" });
    expect(validateImageFile(file)).toEqual({ valid: true });
  });

  it("rejects disallowed image files", () => {
    const file = new File(["content"], "photo.gif", { type: "image/gif" });
    const result = validateImageFile(file, "en");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toContain("AVIF");
    }
  });
});
