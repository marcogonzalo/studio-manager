import { describe, it, expect } from "vitest";
import {
  buildCsvTemplate,
  buildAllowedValueRows,
  defaultTemplateLabels,
} from "./template";

describe("buildCsvTemplate", () => {
  it("builds UTF-8 BOM CSV with ES semicolon delimiter", () => {
    const csv = buildCsvTemplate({
      target: "product",
      locale: "es",
      translateLabel: (k) => k,
    });
    expect(csv.filename).toContain("productos");
    expect(csv.content.startsWith("\uFEFF")).toBe(true);
    expect(csv.content).toContain(";");
  });

  it("builds EN CSV with comma delimiter", () => {
    const csv = buildCsvTemplate({
      target: "budget_line",
      locale: "en",
      translateLabel: (k) => k,
    });
    expect(csv.filename).toContain("budget-lines");
    const body = csv.content.replace("\uFEFF", "");
    expect(body.split("\n")[0]).toContain(",");
  });
});

describe("buildAllowedValueRows", () => {
  it("lists every category/subcategory pair for budget lines", () => {
    const labels = defaultTemplateLabels("en");
    const rows = buildAllowedValueRows({
      target: "budget_line",
      locale: "en",
      translateCategory: (k) => k,
      translateSubcategory: (_c, k) => k,
      translatePhase: (k) => k,
      labels,
    });
    expect(rows.some((r) => r.value === "construction/masonry")).toBe(true);
    expect(rows.some((r) => r.group === labels.phaseHeader)).toBe(true);
  });
});
