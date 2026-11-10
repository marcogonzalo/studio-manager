import type { ImportFieldDef, ImportTarget } from "./fields";
import { fieldsForTarget } from "./fields";
import { normalizeHeader } from "./normalize-header";

export type ColumnMapping = {
  sourceHeader: string;
  fieldKey: string | null; // null = ignore
  confidence: "exact" | "alias" | "none";
};

export type AutoMapResult = {
  mappings: ColumnMapping[];
  unmappedRequired: string[];
};

function aliasIndex(fields: readonly ImportFieldDef[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const field of fields) {
    map.set(normalizeHeader(field.key.replaceAll("_", " ")), field.key);
    for (const locale of ["es", "en"] as const) {
      for (const alias of field.aliases[locale]) {
        const n = normalizeHeader(alias);
        if (!map.has(n)) map.set(n, field.key);
      }
    }
  }
  return map;
}

export function autoMapColumns(options: {
  headers: string[];
  target: ImportTarget;
}): AutoMapResult {
  const fields = fieldsForTarget(options.target);
  const index = aliasIndex(fields);
  const used = new Set<string>();
  const mappings: ColumnMapping[] = options.headers.map((header) => {
    const n = normalizeHeader(header);
    const exactKey = fields.find(
      (f) => normalizeHeader(f.key.replaceAll("_", " ")) === n
    )?.key;
    if (exactKey && !used.has(exactKey)) {
      used.add(exactKey);
      return { sourceHeader: header, fieldKey: exactKey, confidence: "exact" };
    }
    const aliasKey = index.get(n);
    if (aliasKey && !used.has(aliasKey)) {
      used.add(aliasKey);
      return { sourceHeader: header, fieldKey: aliasKey, confidence: "alias" };
    }
    return { sourceHeader: header, fieldKey: null, confidence: "none" };
  });

  const unmappedRequired = fields
    .filter((f) => f.required === "always" && !used.has(f.key))
    .map((f) => f.key);

  return { mappings, unmappedRequired };
}

export function mappingBlocksNextStep(result: AutoMapResult): boolean {
  return result.unmappedRequired.length > 0;
}
