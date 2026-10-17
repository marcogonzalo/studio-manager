import { describe, expect, it } from "vitest";
import { buildPurchaseOrderCoverage } from "./purchase-order-coverage";

describe("buildPurchaseOrderCoverage", () => {
  const pos = [
    {
      id: "po-1",
      order_number: "PO-100",
      project_items: [
        { id: "i1", quantity: 2, unit_cost: 50 },
        { id: "i2", quantity: 1, unit_cost: 100 },
      ],
    },
    {
      id: "po-2",
      order_number: null,
      project_items: [{ id: "i3", quantity: 1, unit_cost: 200 }],
    },
  ];

  it("aggregates payments by purchase_order_id without needing per-PO queries", () => {
    const coverage = buildPurchaseOrderCoverage(pos, [
      { purchase_order_id: "po-1", amount: 100 },
      { purchase_order_id: "po-1", amount: 50 },
      { purchase_order_id: "po-2", amount: 50 },
      { purchase_order_id: null, amount: 999 },
    ]);

    expect(coverage).toEqual([
      {
        id: "po-1",
        order_number: "PO-100",
        total_amount: 200,
        covered_amount: 150,
        status: "partial",
      },
      {
        id: "po-2",
        order_number: "PO-po-2",
        total_amount: 200,
        covered_amount: 50,
        status: "partial",
      },
    ]);
  });

  it("marks covered when payments meet or exceed PO total", () => {
    const coverage = buildPurchaseOrderCoverage(
      [pos[0]],
      [{ purchase_order_id: "po-1", amount: 200 }]
    );
    expect(coverage[0].status).toBe("covered");
    expect(coverage[0].covered_amount).toBe(200);
  });

  it("marks pending when no payments are linked", () => {
    const coverage = buildPurchaseOrderCoverage([pos[0]], []);
    expect(coverage[0].status).toBe("pending");
    expect(coverage[0].covered_amount).toBe(0);
  });
});
