import { describe, expect, it } from "vitest";
import {
  budgetLineActualAmount,
  budgetLineEstimatedAmount,
  formatItemSalePrice,
  formatItemSaleTotal,
  formatItemUnitCost,
  hasBudgetLinesWithTbd,
  hasPricedItemsWithTbd,
  isItemPriceTbd,
  itemCostAmount,
  itemSaleAmount,
  sumBudgetLineActualAmounts,
  sumBudgetLineEstimatedAmounts,
  sumItemCostAmounts,
  sumItemSaleAmounts,
} from "./project-item-price";

const formatCurrency = (amount: number) => `€${amount.toFixed(2)}`;
const tbdLabel = "To be defined";

describe("isItemPriceTbd", () => {
  it("is true only when flag is true", () => {
    expect(isItemPriceTbd({ is_price_tbd: true })).toBe(true);
    expect(isItemPriceTbd({ is_price_tbd: false })).toBe(false);
    expect(isItemPriceTbd({ is_price_tbd: null })).toBe(false);
    expect(isItemPriceTbd({})).toBe(false);
  });
});

describe("itemSaleAmount", () => {
  it("multiplies unit price by quantity", () => {
    expect(
      itemSaleAmount({ unit_price: 10, quantity: 3, is_price_tbd: false })
    ).toBe(30);
  });

  it("returns 0 for TBD and excluded items", () => {
    expect(
      itemSaleAmount({ unit_price: 99, quantity: 2, is_price_tbd: true })
    ).toBe(0);
    expect(
      itemSaleAmount({ unit_price: 99, quantity: 2, is_excluded: true })
    ).toBe(0);
  });

  it("treats missing numbers as 0", () => {
    expect(itemSaleAmount({})).toBe(0);
    expect(itemCostAmount({})).toBe(0);
  });
});

describe("itemCostAmount", () => {
  it("multiplies unit cost by quantity", () => {
    expect(itemCostAmount({ unit_cost: 8, quantity: 2 })).toBe(16);
  });

  it("returns 0 for excluded and TBD items", () => {
    expect(
      itemCostAmount({ unit_cost: 8, quantity: 2, is_excluded: true })
    ).toBe(0);
    expect(
      itemCostAmount({ unit_cost: 8, quantity: 2, is_price_tbd: true })
    ).toBe(0);
  });
});

describe("sum helpers", () => {
  const items = [
    { unit_price: 10, unit_cost: 4, quantity: 2, is_price_tbd: false },
    { unit_price: 50, unit_cost: 20, quantity: 1, is_price_tbd: true },
    { unit_price: 8, unit_cost: 3, quantity: 1, is_excluded: true },
  ];

  it("sums only included priced sale amounts", () => {
    expect(sumItemSaleAmounts(items)).toBe(20);
  });

  it("sums included costs excluding TBD items", () => {
    expect(sumItemCostAmounts(items)).toBe(8);
  });

  it("detects included TBD items", () => {
    expect(hasPricedItemsWithTbd(items)).toBe(true);
    expect(
      hasPricedItemsWithTbd([
        { is_price_tbd: true, is_excluded: true },
        { is_price_tbd: false },
      ])
    ).toBe(false);
  });
});

describe("formatItemSalePrice and formatItemSaleTotal", () => {
  it("shows TBD label instead of zero or estimate", () => {
    const item = { unit_price: 0, quantity: 2, is_price_tbd: true };
    expect(formatItemSalePrice(item, formatCurrency, tbdLabel)).toBe(tbdLabel);
    expect(formatItemSaleTotal(item, formatCurrency, tbdLabel)).toBe(tbdLabel);
  });

  it("formats known prices", () => {
    const item = { unit_price: 12.5, quantity: 2, is_price_tbd: false };
    expect(formatItemSalePrice(item, formatCurrency, tbdLabel)).toBe("€12.50");
    expect(formatItemSaleTotal(item, formatCurrency, tbdLabel)).toBe("€25.00");
  });

  it("formats missing priced fields as zero", () => {
    expect(formatItemSalePrice({}, formatCurrency, tbdLabel)).toBe("€0.00");
    expect(formatItemSaleTotal({}, formatCurrency, tbdLabel)).toBe("€0.00");
    expect(formatItemUnitCost({}, formatCurrency, tbdLabel)).toBe("€0.00");
  });
});

describe("formatItemUnitCost", () => {
  it("shows TBD label instead of zero or estimate", () => {
    expect(
      formatItemUnitCost(
        { unit_cost: 0, is_price_tbd: true },
        formatCurrency,
        tbdLabel
      )
    ).toBe(tbdLabel);
  });

  it("formats known unit cost", () => {
    expect(
      formatItemUnitCost(
        { unit_cost: 8.5, is_price_tbd: false },
        formatCurrency,
        tbdLabel
      )
    ).toBe("€8.50");
  });
});

describe("budget line TBD amounts", () => {
  it("returns 0 for TBD estimated and actual amounts", () => {
    expect(
      budgetLineEstimatedAmount({ estimated_amount: 200, is_price_tbd: true })
    ).toBe(0);
    expect(
      budgetLineActualAmount({ actual_amount: 150, is_price_tbd: true })
    ).toBe(0);
  });

  it("keeps known amounts", () => {
    expect(
      budgetLineEstimatedAmount({ estimated_amount: 200, is_price_tbd: false })
    ).toBe(200);
    expect(
      budgetLineActualAmount({ actual_amount: 150, is_price_tbd: false })
    ).toBe(150);
    expect(budgetLineEstimatedAmount({})).toBe(0);
    expect(budgetLineActualAmount({})).toBe(0);
  });

  it("sums excluding TBD lines", () => {
    const lines = [
      { estimated_amount: 100, actual_amount: 80, is_price_tbd: false },
      { estimated_amount: 50, actual_amount: 40, is_price_tbd: true },
    ];
    expect(sumBudgetLineEstimatedAmounts(lines)).toBe(100);
    expect(sumBudgetLineActualAmounts(lines)).toBe(80);
    expect(hasBudgetLinesWithTbd(lines)).toBe(true);
    expect(hasBudgetLinesWithTbd([{ is_price_tbd: false }])).toBe(false);
  });
});
