export type PricedItem = {
  unit_price?: number | null;
  unit_cost?: number | null;
  quantity?: number | null;
  is_price_tbd?: boolean | null;
  is_excluded?: boolean | null;
};

export function isItemPriceTbd(item: {
  is_price_tbd?: boolean | null;
}): boolean {
  return item.is_price_tbd === true;
}

export function isItemIncluded(item: {
  is_excluded?: boolean | null;
}): boolean {
  return item.is_excluded !== true;
}

export function itemSaleAmount(item: PricedItem): number {
  if (!isItemIncluded(item) || isItemPriceTbd(item)) return 0;
  return Number(item.unit_price ?? 0) * Number(item.quantity ?? 0);
}

export function itemCostAmount(item: PricedItem): number {
  if (!isItemIncluded(item) || isItemPriceTbd(item)) return 0;
  return Number(item.unit_cost ?? 0) * Number(item.quantity ?? 0);
}

export function sumItemSaleAmounts(items: PricedItem[]): number {
  return items.reduce((sum, item) => sum + itemSaleAmount(item), 0);
}

export function sumItemCostAmounts(items: PricedItem[]): number {
  return items.reduce((sum, item) => sum + itemCostAmount(item), 0);
}

export function hasPricedItemsWithTbd(items: PricedItem[]): boolean {
  return items.some((item) => isItemIncluded(item) && isItemPriceTbd(item));
}

export function appendTbdAsterisk(
  formattedAmount: string,
  hasTbd: boolean
): string {
  return hasTbd ? `${formattedAmount} *` : formattedAmount;
}

export type BudgetLineAmounts = {
  estimated_amount?: number | null;
  actual_amount?: number | null;
  is_price_tbd?: boolean | null;
};

export function budgetLineEstimatedAmount(line: BudgetLineAmounts): number {
  if (isItemPriceTbd(line)) return 0;
  return Number(line.estimated_amount ?? 0);
}

export function budgetLineActualAmount(line: BudgetLineAmounts): number {
  if (isItemPriceTbd(line)) return 0;
  return Number(line.actual_amount ?? 0);
}

export function sumBudgetLineEstimatedAmounts(
  lines: BudgetLineAmounts[]
): number {
  return lines.reduce((sum, line) => sum + budgetLineEstimatedAmount(line), 0);
}

export function sumBudgetLineActualAmounts(lines: BudgetLineAmounts[]): number {
  return lines.reduce((sum, line) => sum + budgetLineActualAmount(line), 0);
}

export function hasBudgetLinesWithTbd(lines: BudgetLineAmounts[]): boolean {
  return lines.some((line) => isItemPriceTbd(line));
}

export function formatItemSalePrice(
  item: PricedItem,
  formatCurrency: (amount: number) => string,
  tbdLabel: string
): string {
  if (isItemPriceTbd(item)) return tbdLabel;
  return formatCurrency(Number(item.unit_price ?? 0));
}

export function formatItemSaleTotal(
  item: PricedItem,
  formatCurrency: (amount: number) => string,
  tbdLabel: string
): string {
  if (isItemPriceTbd(item)) return tbdLabel;
  return formatCurrency(
    Number(item.unit_price ?? 0) * Number(item.quantity ?? 0)
  );
}

export function formatItemUnitCost(
  item: PricedItem,
  formatCurrency: (amount: number) => string,
  tbdLabel: string
): string {
  if (isItemPriceTbd(item)) return tbdLabel;
  return formatCurrency(Number(item.unit_cost ?? 0));
}
