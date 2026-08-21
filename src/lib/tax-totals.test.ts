import { describe, expect, it } from "vitest";
import {
  computeTaxGroups,
  effectiveLineTaxRate,
  formatTaxRatePercent,
  sumTaxAmounts,
  type TaxableLine,
} from "./tax-totals";

describe("effectiveLineTaxRate", () => {
  it("uses project tax when multitax is off", () => {
    expect(
      effectiveLineTaxRate({ tax_rate: 10 }, { multitax: false, tax_rate: 21 })
    ).toBe(21);
  });

  it("uses line tax when multitax is on", () => {
    expect(
      effectiveLineTaxRate({ tax_rate: 10 }, { multitax: true, tax_rate: 21 })
    ).toBe(10);
  });

  it("falls back to project tax when line tax is missing", () => {
    expect(effectiveLineTaxRate({}, { multitax: true, tax_rate: 21 })).toBe(21);
    expect(
      effectiveLineTaxRate({ tax_rate: null }, { multitax: true, tax_rate: 16 })
    ).toBe(16);
  });

  it("treats missing project tax as 0", () => {
    expect(effectiveLineTaxRate({}, { multitax: false })).toBe(0);
  });
});

describe("computeTaxGroups", () => {
  const lines: TaxableLine[] = [
    { amount: 100, tax_rate: 21 },
    { amount: 50, tax_rate: 10 },
    { amount: 25, tax_rate: 21 },
    { amount: 0, tax_rate: 4 },
  ];

  it("returns one group at project rate when multitax is off", () => {
    const groups = computeTaxGroups(lines, {
      multitax: false,
      tax_rate: 21,
    });
    expect(groups).toEqual([{ rate: 21, taxableBase: 175, taxAmount: 36.75 }]);
  });

  it("groups by effective line rate when multitax is on", () => {
    const groups = computeTaxGroups(lines, {
      multitax: true,
      tax_rate: 21,
    });
    expect(groups).toEqual([
      { rate: 10, taxableBase: 50, taxAmount: 5 },
      { rate: 21, taxableBase: 125, taxAmount: 26.25 },
    ]);
  });

  it("uses project rate for lines without tax_rate when multitax is on", () => {
    const groups = computeTaxGroups(
      [{ amount: 100 }, { amount: 40, tax_rate: 10 }],
      { multitax: true, tax_rate: 21 }
    );
    expect(groups).toEqual([
      { rate: 10, taxableBase: 40, taxAmount: 4 },
      { rate: 21, taxableBase: 100, taxAmount: 21 },
    ]);
  });

  it("omits zero-rate groups and returns empty when all rates are 0", () => {
    expect(
      computeTaxGroups([{ amount: 100, tax_rate: 0 }], {
        multitax: true,
        tax_rate: 0,
      })
    ).toEqual([]);

    expect(
      computeTaxGroups([{ amount: 100 }], { multitax: false, tax_rate: 0 })
    ).toEqual([]);
  });

  it("ignores non-positive amounts", () => {
    const groups = computeTaxGroups(
      [
        { amount: -10, tax_rate: 21 },
        { amount: 0, tax_rate: 21 },
        { amount: 100, tax_rate: 21 },
      ],
      { multitax: true, tax_rate: 21 }
    );
    expect(groups).toEqual([{ rate: 21, taxableBase: 100, taxAmount: 21 }]);
  });
});

describe("sumTaxAmounts", () => {
  it("sums taxAmount across groups", () => {
    expect(
      sumTaxAmounts([
        { rate: 10, taxableBase: 50, taxAmount: 5 },
        { rate: 21, taxableBase: 100, taxAmount: 21 },
      ])
    ).toBe(26);
  });
});

describe("formatTaxRatePercent", () => {
  it("formats rates with a percent sign", () => {
    expect(formatTaxRatePercent(21)).toBe("21%");
    expect(formatTaxRatePercent(10.5)).toBe("10.5%");
    expect(formatTaxRatePercent(Number.NaN)).toBe("0%");
  });
});
