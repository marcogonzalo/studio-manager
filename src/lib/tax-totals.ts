export type TaxProjectContext = {
  multitax?: boolean | null;
  tax_rate?: number | null;
};

export type TaxableLine = {
  amount: number;
  tax_rate?: number | null;
};

export type TaxGroup = {
  rate: number;
  taxableBase: number;
  taxAmount: number;
};

function normalizeRate(value: number | null | undefined): number {
  if (value == null || Number.isNaN(Number(value))) return 0;
  return Number(value);
}

/** Resolve the tax rate that applies to a line given project multitax settings. */
export function effectiveLineTaxRate(
  line: { tax_rate?: number | null },
  project: TaxProjectContext
): number {
  const projectRate = normalizeRate(project.tax_rate);
  if (project.multitax !== true) return projectRate;
  if (line.tax_rate == null || Number.isNaN(Number(line.tax_rate))) {
    return projectRate;
  }
  return Number(line.tax_rate);
}

/**
 * Group taxable bases by effective tax rate.
 * When multitax is off, all amounts use the project rate (one group).
 * Zero-rate groups are omitted.
 */
export function computeTaxGroups(
  lines: TaxableLine[],
  project: TaxProjectContext
): TaxGroup[] {
  const byRate = new Map<number, number>();

  for (const line of lines) {
    const amount = Number(line.amount ?? 0);
    if (!(amount > 0)) continue;
    const rate = effectiveLineTaxRate(line, project);
    byRate.set(rate, (byRate.get(rate) ?? 0) + amount);
  }

  return Array.from(byRate.entries())
    .filter(([rate]) => rate > 0)
    .sort(([a], [b]) => a - b)
    .map(([rate, taxableBase]) => ({
      rate,
      taxableBase,
      taxAmount: taxableBase * (rate / 100),
    }));
}

export function sumTaxAmounts(groups: TaxGroup[]): number {
  return groups.reduce((sum, group) => sum + group.taxAmount, 0);
}
