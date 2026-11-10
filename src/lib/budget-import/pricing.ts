export type PricingInput = {
  unitCost: string | null | undefined;
  markup: string | null | undefined;
  unitPrice: string | null | undefined;
  isPriceTbd: boolean;
};

export type PricingResult =
  | {
      ok: true;
      unitCost: number;
      markup: number;
      unitPrice: number;
      warning?: "markup_recomputed";
      givenMarkup?: number;
    }
  | { ok: false; error: "missing_cost" | "incomplete_pair" | "invalid_number" };

function parsePositiveMoney(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  if (/[eE]/.test(trimmed)) return null;
  // Accept both "12,5" and "1.234,56" / "1,234.56" via locale-aware helper when available.
  const normalized = normalizeMoneyString(trimmed);
  if (normalized == null) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

function parseMarkup(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  const normalized = normalizeMoneyString(trimmed);
  if (normalized == null) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return n;
}

/** Canonicalize locale money strings to a JS Number-parseable form (dot decimal). */
export function normalizeMoneyString(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed === "") return null;
  if (/[eE]/.test(trimmed)) return null;
  if (!/^[\d.,\s]+$/.test(trimmed)) return null;

  const cleaned = trimmed.replace(/\s/g, "");
  const lastComma = cleaned.lastIndexOf(",");
  const lastDot = cleaned.lastIndexOf(".");

  if (lastComma === -1 && lastDot === -1) {
    return cleaned;
  }

  if (lastComma > lastDot) {
    // European: 1.234,56 or 12,5
    return cleaned.replace(/\./g, "").replace(",", ".");
  }

  // US / EN: 1,234.56 or 12.5
  return cleaned.replace(/,/g, "");
}

/**
 * Resolve product pricing from a spreadsheet row.
 * Rules:
 * - Price TBD → cost/markup/price stored as 0.
 * - Unit cost always required (unless TBD).
 * - Cost + markup → price = cost * (1 + markup/100)
 * - Cost + price → markup = (price/cost - 1) * 100
 * - All three → cost + price win; markup recomputed; warn if given markup differs > 0.01
 * - Cost only, or price/markup without cost → error
 */
export function resolveProductPricing(input: PricingInput): PricingResult {
  if (input.isPriceTbd) {
    return { ok: true, unitCost: 0, markup: 0, unitPrice: 0 };
  }

  const cost = parsePositiveMoney(input.unitCost);
  const hasMarkup = input.markup != null && String(input.markup).trim() !== "";
  const hasPrice =
    input.unitPrice != null && String(input.unitPrice).trim() !== "";

  if (cost == null) {
    if (
      (input.unitCost == null || String(input.unitCost).trim() === "") &&
      !hasMarkup &&
      !hasPrice
    ) {
      return { ok: false, error: "missing_cost" };
    }
    if (input.unitCost != null && String(input.unitCost).trim() !== "") {
      return { ok: false, error: "invalid_number" };
    }
    return { ok: false, error: "missing_cost" };
  }

  if (!hasMarkup && !hasPrice) {
    return { ok: false, error: "incomplete_pair" };
  }

  if (hasPrice) {
    const price = parsePositiveMoney(input.unitPrice);
    if (price == null) return { ok: false, error: "invalid_number" };
    const markup = Math.round((price / cost - 1) * 10000) / 100;
    if (hasMarkup) {
      const given = parseMarkup(input.markup);
      if (given == null) return { ok: false, error: "invalid_number" };
      if (Math.abs(given - markup) > 0.01) {
        return {
          ok: true,
          unitCost: cost,
          markup,
          unitPrice: price,
          warning: "markup_recomputed",
          givenMarkup: given,
        };
      }
    }
    return { ok: true, unitCost: cost, markup, unitPrice: price };
  }

  const markup = parseMarkup(input.markup);
  if (markup == null) return { ok: false, error: "invalid_number" };
  const unitPrice = cost * (1 + markup / 100);
  return { ok: true, unitCost: cost, markup, unitPrice };
}
