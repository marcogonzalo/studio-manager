/**
 * Item status derived from purchase-order status:
 * draft/sent → pending, confirmed → ordered, received → received.
 */
export function getItemStatusForPO(poStatus: string): string {
  const s = poStatus?.toLowerCase();
  if (s === "confirmed") return "ordered";
  if (s === "received") return "received";
  return "pending"; // draft, sent, cancelled, unknown
}
