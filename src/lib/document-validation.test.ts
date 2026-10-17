import { describe, expect, it } from "vitest";
import { validateDocumentFile } from "@/lib/document-validation";

describe("validateDocumentFile", () => {
  it("rejects oversized files and includes the original filename", () => {
    const big = new Uint8Array(10 * 1024 * 1024 + 1);
    const file = new File([big], "specs-floorplan.pdf", {
      type: "application/pdf",
    });
    const result = validateDocumentFile(file, "en");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toMatch(/10MB/);
      expect(result.error).toMatch(/specs-floorplan\.pdf/);
      expect(result.error.indexOf("10MB")).toBeLessThan(
        result.error.indexOf("specs-floorplan.pdf")
      );
    }
  });
});
