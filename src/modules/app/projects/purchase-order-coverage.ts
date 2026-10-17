export interface PurchaseOrderCoverage {
  id: string;
  order_number: string;
  total_amount: number;
  covered_amount: number;
  status: "covered" | "partial" | "pending";
}

export type PoWithItems = {
  id: string;
  order_number?: string | null;
  project_items?: Array<{
    id: string;
    quantity: number;
    unit_cost: number;
  }>;
};

/** Build PO payment coverage from already-fetched project payments (no extra queries). */
export function buildPurchaseOrderCoverage(
  posData: PoWithItems[],
  paymentsData: Array<{
    purchase_order_id?: string | null;
    amount?: number | null;
  }>
): PurchaseOrderCoverage[] {
  const coveredByPoId = new Map<string, number>();
  for (const payment of paymentsData) {
    const poId = payment.purchase_order_id;
    if (!poId) continue;
    coveredByPoId.set(
      poId,
      (coveredByPoId.get(poId) ?? 0) + Number(payment.amount ?? 0)
    );
  }

  return posData.map((po) => {
    const totalAmount = (po.project_items || []).reduce(
      (sum, item) => sum + item.unit_cost * item.quantity,
      0
    );
    const coveredAmount = coveredByPoId.get(po.id) ?? 0;

    let status: "covered" | "partial" | "pending" = "pending";
    if (coveredAmount >= totalAmount) status = "covered";
    else if (coveredAmount > 0) status = "partial";

    return {
      id: po.id,
      order_number: po.order_number || `PO-${po.id.slice(0, 8)}`,
      total_amount: totalAmount,
      covered_amount: coveredAmount,
      status,
    };
  });
}
