import { describe, expect, it } from "vitest";
import {
  buildCatalogProductInsertFromProject,
  buildCatalogProductUpdateFromProject,
} from "./catalog-product-from-project";

const baseFields = {
  name: "Marble table",
  description: "Project-specific copy",
  reference_code: "MT-01",
  reference_url: "https://example.com/table",
  category: "Furniture",
  unit_cost: "1200",
  image_url: "https://cdn.example.com/table.webp",
  supplier_id: "supplier-1",
};

describe("buildCatalogProductInsertFromProject", () => {
  it("stores the project currency on new catalog products (issue #188)", () => {
    const payload = buildCatalogProductInsertFromProject({
      ...baseFields,
      user_id: "user-1",
      projectCurrency: "USD",
    });

    expect(payload).toMatchObject({
      currency: "USD",
      cost_price: "1200",
      user_id: "user-1",
    });
    expect(Object.prototype.hasOwnProperty.call(payload, "currency")).toBe(
      true
    );
  });

  it("defaults to EUR when project currency is missing", () => {
    const payload = buildCatalogProductInsertFromProject({
      ...baseFields,
      user_id: "user-1",
      projectCurrency: undefined,
    });

    expect(payload.currency).toBe("EUR");
  });

  it("clears supplier_id when none is selected", () => {
    const payload = buildCatalogProductInsertFromProject({
      ...baseFields,
      supplier_id: "none",
      user_id: "user-1",
      projectCurrency: "USD",
    });

    expect(payload.supplier_id).toBeNull();
  });

  it("defers image_url while a file upload is pending", () => {
    const payload = buildCatalogProductInsertFromProject({
      ...baseFields,
      user_id: "user-1",
      projectCurrency: "USD",
      pendingImageUpload: true,
    });

    expect(payload.image_url).toBeNull();
  });
});

describe("buildCatalogProductUpdateFromProject", () => {
  it("keeps catalog currency aligned with the project on edit", () => {
    const payload = buildCatalogProductUpdateFromProject({
      name: baseFields.name,
      reference_code: baseFields.reference_code,
      reference_url: baseFields.reference_url,
      category: baseFields.category,
      unit_cost: baseFields.unit_cost,
      image_url: baseFields.image_url,
      supplier_id: baseFields.supplier_id,
      projectCurrency: "USD",
    });

    expect(payload.currency).toBe("USD");
    expect(payload).not.toHaveProperty("description");
  });
});
