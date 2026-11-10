import { describe, it, expect } from "vitest";
import { buildAddItemFormSchema } from "@/lib/add-item-form-schema";
import { buildBudgetLineFormSchema } from "@/lib/budget-line-form-schema";
import { normalizeHeader } from "./normalize-header";
import {
  BUDGET_LINE_IMPORT_FIELDS,
  BUDGET_LINE_SCHEMA_EXCLUDED_KEYS,
  BUDGET_LINE_SCHEMA_LOOKUP_KEYS,
  PRODUCT_IMPORT_FIELDS,
  PRODUCT_SCHEMA_DERIVED_KEYS,
  PRODUCT_SCHEMA_EXCLUDED_KEYS,
  PRODUCT_SCHEMA_LOOKUP_KEYS,
} from "./fields";

const t = (key: string) => key;

function schemaKeys(schema: {
  in: { shape: Record<string, unknown> };
}): string[] {
  return Object.keys(schema.in.shape);
}

describe("PRODUCT_IMPORT_FIELDS contract vs add-item schema", () => {
  const keys = schemaKeys(buildAddItemFormSchema(t as never));
  const covered = new Set<string>([
    ...PRODUCT_IMPORT_FIELDS.map((f) => f.key).filter(
      (k) => k !== "space" && k !== "supplier"
    ),
    ...PRODUCT_SCHEMA_LOOKUP_KEYS,
    ...PRODUCT_SCHEMA_DERIVED_KEYS,
    ...PRODUCT_SCHEMA_EXCLUDED_KEYS,
  ]);
  // Lookups map to schema ids
  covered.add("space_id");
  covered.add("supplier_id");

  it("classifies every schema key", () => {
    const missing = keys.filter((k) => !covered.has(k));
    expect(missing).toEqual([]);
  });

  it("does not invent unknown keys outside schema + lookups", () => {
    const allowed = new Set([
      ...keys,
      "space",
      "supplier",
      ...PRODUCT_SCHEMA_LOOKUP_KEYS,
    ]);
    for (const field of PRODUCT_IMPORT_FIELDS) {
      expect(allowed.has(field.key) || field.lookup != null).toBe(true);
    }
  });
});

describe("BUDGET_LINE_IMPORT_FIELDS contract vs budget-line schema", () => {
  const keys = schemaKeys(buildBudgetLineFormSchema(t as never));
  const covered = new Set<string>([
    ...BUDGET_LINE_IMPORT_FIELDS.map((f) => f.key).filter(
      (k) => k !== "supplier"
    ),
    ...BUDGET_LINE_SCHEMA_LOOKUP_KEYS,
    ...BUDGET_LINE_SCHEMA_EXCLUDED_KEYS,
  ]);
  covered.add("supplier_id");

  it("classifies every schema key", () => {
    const missing = keys.filter((k) => !covered.has(k));
    expect(missing).toEqual([]);
  });
});

describe("alias normalization", () => {
  it("every localized alias normalizes uniquely within a target", () => {
    for (const fields of [PRODUCT_IMPORT_FIELDS, BUDGET_LINE_IMPORT_FIELDS]) {
      const seen = new Map<string, string>();
      for (const field of fields) {
        for (const locale of ["es", "en"] as const) {
          for (const alias of field.aliases[locale]) {
            const n = normalizeHeader(alias);
            const prev = seen.get(n);
            if (prev && prev !== field.key) {
              throw new Error(
                `Alias collision: "${alias}" → "${n}" maps to both ${prev} and ${field.key}`
              );
            }
            seen.set(n, field.key);
          }
        }
        // Key itself should also match
        const keyNorm = normalizeHeader(field.key.replaceAll("_", " "));
        expect(keyNorm.length).toBeGreaterThan(0);
      }
    }
  });

  it("field key with spaces normalizes to one of its aliases when present", () => {
    const name = PRODUCT_IMPORT_FIELDS.find((f) => f.key === "name");
    expect(name).toBeDefined();
    expect(name!.aliases.en.map(normalizeHeader)).toContain(
      normalizeHeader("Name")
    );
  });
});
