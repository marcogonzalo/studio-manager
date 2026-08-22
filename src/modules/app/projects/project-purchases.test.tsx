import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { PurchaseOrderItemsTable } from "./project-purchases";
import enModules from "@/i18n/messages/en/app-project-modules.json";

function renderTable() {
  return render(
    <NextIntlClientProvider
      locale="en"
      messages={{
        ProjectModulePurchases: enModules.ProjectModulePurchases,
        ProjectModuleShared: enModules.ProjectModuleShared,
      }}
    >
      <PurchaseOrderItemsTable
        items={[
          {
            id: "item-1",
            name: "Oak table",
            quantity: 2,
            unit_cost: 100,
            tax_rate: 21,
          },
        ]}
        taxProject={{ tax_rate: 21, multitax: true }}
      />
    </NextIntlClientProvider>
  );
}

describe("PurchaseOrderItemsTable column order", () => {
  it("shows unit cost, qty, tax, then amount", () => {
    renderTable();

    const headers = screen
      .getAllByRole("columnheader")
      .map((header) => header.textContent?.trim())
      .filter((label) => label && label !== "Expand row");

    expect(headers).toEqual(["Item", "Unit Cost", "Qty.", "Tax", "Amount"]);
  });

  it("renders cells as unit cost, qty, tax, amount", () => {
    renderTable();

    const cells = screen.getAllByRole("cell").map((cell) => cell.textContent);
    expect(cells).toContain("Oak table");
    expect(cells.indexOf("$100.00")).toBeLessThan(cells.indexOf("2"));
    expect(cells.indexOf("2")).toBeLessThan(cells.indexOf("21%"));
    expect(cells.indexOf("21%")).toBeLessThan(cells.indexOf("$200.00"));
  });
});
