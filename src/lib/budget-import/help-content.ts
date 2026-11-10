import type { ImportFieldDef, ImportTarget } from "./fields";
import {
  BOOLEAN_FALSE_ALIASES,
  BOOLEAN_TRUE_ALIASES,
  BUDGET_CATEGORY_KEYS,
  BUDGET_LINE_IMPORT_FIELDS,
  PRODUCT_IMPORT_FIELDS,
  PROJECT_PHASES,
  fieldsForTarget,
  isRequiredMarker,
} from "./fields";
import { BUDGET_SUBCATEGORIES } from "@/lib/utils";

export type HelpLocale = "es" | "en";

export type HelpFieldBlock = {
  id: string;
  title: string;
  required: string;
  format: string;
  example: string;
  emptyBehavior: string;
  acceptedValues?: string[];
  notes: string[];
};

export type BudgetImportHelpModel = {
  title: string;
  intro: string[];
  limits: string[];
  notImported: string[];
  pricing: string[];
  tax: string[];
  spacesSuppliers: string[];
  products: HelpFieldBlock[];
  budgetLines: HelpFieldBlock[];
  categories: { category: string; subcategories: string[] }[];
  phases: string[];
  booleanAccepted: string[];
};

export type HelpCopy = {
  title: string;
  intro: string[];
  limits: string[];
  notImported: string[];
  pricing: string[];
  taxGeneric: string[];
  taxApplies: string;
  taxDoesNotApply: string;
  spacesSuppliers: string[];
  requiredYes: string;
  requiredNo: string;
  requiredPricing: string;
  emptyGeneral: string;
  emptyDefaultProjectTax: string;
  emptyCreateOnImport: string;
  emptyOtherSubcategory: string;
  emptyNeedsCategory: string;
  emptyNoPhase: string;
  emptyZero: string;
  emptyFalse: string;
  emptyOptional: string;
};

export function defaultHelpCopy(locale: HelpLocale): HelpCopy {
  if (locale === "es") {
    return {
      title: "Cómo rellenar la plantilla de presupuesto",
      intro: [
        "Usa una plantilla de Productos o de Partidas. Los encabezados pueden coincidir con los de Veta o con alias habituales (sin distinguir mayúsculas ni acentos).",
        "Descarga la plantilla XLSX o CSV desde la pestaña Presupuesto e importa el archivo con Importar.",
      ],
      limits: [
        "Formatos: CSV (UTF-8) o XLSX.",
        "Tamaño máximo: 10 MB.",
        "Máximo 500 filas por importación.",
        "En XLSX puedes elegir la hoja; por defecto se usa la primera.",
      ],
      notImported: [
        "Excluido (siempre no excluido).",
        "Imágenes.",
        "Estado del producto (siempre pendiente).",
      ],
      pricing: [
        "Obligatorio: Coste unitario más Margen (%) o Precio unitario (rellena 2 de 3).",
        "Coste + margen → precio = coste × (1 + margen / 100).",
        "Coste + precio → margen = (precio / coste − 1) × 100.",
        "Si rellenas los tres, mandan coste y precio; el margen se recalcula.",
        "Precio por definir = Sí ignora coste, margen y precio.",
      ],
      taxGeneric: [
        "El IVA por fila solo se aplica cuando el proyecto usa varios tipos impositivos.",
        "La disponibilidad depende de tu plan; si no aplica, se usa el IVA del proyecto.",
      ],
      taxApplies:
        "En este proyecto la columna de IVA se aplicará a las filas importadas.",
      taxDoesNotApply:
        "En este proyecto la columna de IVA se ignorará; se usará el IVA del proyecto.",
      spacesSuppliers: [
        "Espacio vacío → General (sin espacio asignado).",
        "Espacio o proveedor desconocido → se crea al importar.",
        "La coincidencia ignora mayúsculas y acentos.",
      ],
      requiredYes: "Obligatorio",
      requiredNo: "Opcional",
      requiredPricing: "Par de precios (salvo Precio por definir)",
      emptyGeneral: "Vacío → General",
      emptyDefaultProjectTax: "Vacío → IVA del proyecto",
      emptyCreateOnImport: "Vacío permitido; si hay nombre nuevo se crea",
      emptyOtherSubcategory: "Vacío o sin coincidencia → Otros de la categoría",
      emptyNeedsCategory:
        "Vacío o sin coincidencia → debes elegir categoría en la vista previa",
      emptyNoPhase: "Vacío → sin fase",
      emptyZero: "Vacío → 0",
      emptyFalse: "Vacío → No",
      emptyOptional: "Puede quedar vacío",
    };
  }
  return {
    title: "How to fill the budget template",
    intro: [
      "Use a Products or Budget lines template. Headers may match Veta labels or common aliases (case and accents ignored).",
      "Download the XLSX or CSV template from the Budget tab and import with Import.",
    ],
    limits: [
      "Formats: CSV (UTF-8) or XLSX.",
      "Max size: 10 MB.",
      "Max 500 rows per import.",
      "For XLSX you can pick the sheet; the first sheet is the default.",
    ],
    notImported: [
      "Excluded (always not excluded).",
      "Images.",
      "Product status (always pending).",
    ],
    pricing: [
      "Required: Unit cost plus Markup (%) or Unit price (fill 2 of 3).",
      "Cost + markup → price = cost × (1 + markup / 100).",
      "Cost + price → markup = (price / cost − 1) × 100.",
      "If all three are filled, cost and price win; markup is recomputed.",
      "Price TBD = Yes ignores cost, markup and price.",
    ],
    taxGeneric: [
      "Per-row tax is only applied when the project uses multiple tax rates.",
      "Availability depends on your plan; otherwise the project tax rate is used.",
    ],
    taxApplies:
      "For this project the tax column will be applied to imported rows.",
    taxDoesNotApply:
      "For this project the tax column will be ignored; the project tax rate is used.",
    spacesSuppliers: [
      "Empty space → General (unassigned).",
      "Unknown space or supplier → created on import.",
      "Matching ignores case and accents.",
    ],
    requiredYes: "Required",
    requiredNo: "Optional",
    requiredPricing: "Pricing pair (unless Price TBD)",
    emptyGeneral: "Empty → General",
    emptyDefaultProjectTax: "Empty → project tax rate",
    emptyCreateOnImport: "Empty allowed; new names are created",
    emptyOtherSubcategory: "Empty or no match → Other of that category",
    emptyNeedsCategory:
      "Empty or no match → choose category in the preview step",
    emptyNoPhase: "Empty → no phase",
    emptyZero: "Empty → 0",
    emptyFalse: "Empty → No",
    emptyOptional: "May be left empty",
  };
}

function requiredLabel(field: ImportFieldDef, copy: HelpCopy): string {
  if (field.required === "always") return copy.requiredYes;
  if (field.required === "pricing_pair") return copy.requiredPricing;
  return copy.requiredNo;
}

function emptyBehavior(field: ImportFieldDef, copy: HelpCopy): string {
  switch (field.key) {
    case "space":
      return copy.emptyGeneral;
    case "tax_rate":
      return copy.emptyDefaultProjectTax;
    case "supplier":
      return copy.emptyCreateOnImport;
    case "category":
      return field.target === "budget_line"
        ? copy.emptyNeedsCategory
        : copy.emptyOptional;
    case "subcategory":
      return copy.emptyOtherSubcategory;
    case "phase":
      return copy.emptyNoPhase;
    case "estimated_amount":
    case "actual_amount":
      return copy.emptyZero;
    case "is_price_tbd":
    case "is_internal_cost":
      return copy.emptyFalse;
    default:
      return copy.emptyOptional;
  }
}

function fieldNotes(field: ImportFieldDef, locale: HelpLocale): string[] {
  const notes: string[] = [];
  if (field.appliesWhen === "multitax") {
    notes.push(
      locale === "es"
        ? "Solo se usa si el proyecto tiene varios tipos impositivos."
        : "Only used when the project has multiple tax rates."
    );
  }
  if (field.required === "pricing_pair") {
    notes.push(
      locale === "es"
        ? "Forma parte del par de precios (coste + margen o precio)."
        : "Part of the pricing pair (cost + markup or price)."
    );
  }
  if (field.key === "internal_reference" || field.key === "internal_notes") {
    notes.push(
      locale === "es"
        ? "Nunca se muestra al cliente."
        : "Never shown to the client."
    );
  }
  return notes;
}

function toFieldBlock(
  field: ImportFieldDef,
  locale: HelpLocale,
  copy: HelpCopy,
  translateLabel: (key: string) => string
): HelpFieldBlock {
  return {
    id: field.key,
    title: translateLabel(field.labelKey),
    required: requiredLabel(field, copy),
    format: field.type,
    example: field.example[locale],
    emptyBehavior: emptyBehavior(field, copy),
    acceptedValues:
      field.type === "boolean"
        ? [...BOOLEAN_TRUE_ALIASES, ...BOOLEAN_FALSE_ALIASES].map(String)
        : field.enumValues
          ? [...field.enumValues]
          : undefined,
    notes: fieldNotes(field, locale),
  };
}

export function buildBudgetImportHelpModel(options: {
  locale: HelpLocale;
  translateLabel: (labelKey: string) => string;
  translateCategory: (key: string) => string;
  translateSubcategory: (category: string, key: string) => string;
  translatePhase: (key: string) => string;
  /** When known, adds a contextual tax sentence. Never includes plan names. */
  taxAppliesToProject?: boolean;
}): BudgetImportHelpModel {
  const copy = defaultHelpCopy(options.locale);
  const tax = [...copy.taxGeneric];
  if (options.taxAppliesToProject === true) tax.push(copy.taxApplies);
  if (options.taxAppliesToProject === false) tax.push(copy.taxDoesNotApply);

  return {
    title: copy.title,
    intro: copy.intro,
    limits: copy.limits,
    notImported: copy.notImported,
    pricing: copy.pricing,
    tax,
    spacesSuppliers: copy.spacesSuppliers,
    products: PRODUCT_IMPORT_FIELDS.map((f) =>
      toFieldBlock(f, options.locale, copy, options.translateLabel)
    ),
    budgetLines: BUDGET_LINE_IMPORT_FIELDS.map((f) =>
      toFieldBlock(f, options.locale, copy, options.translateLabel)
    ),
    categories: BUDGET_CATEGORY_KEYS.map((category) => ({
      category: options.translateCategory(category),
      subcategories: Object.keys(BUDGET_SUBCATEGORIES[category]).map((sub) =>
        options.translateSubcategory(category, sub)
      ),
    })),
    phases: PROJECT_PHASES.map((p) => options.translatePhase(p)),
    booleanAccepted: [...BOOLEAN_TRUE_ALIASES, ...BOOLEAN_FALSE_ALIASES].map(
      String
    ),
  };
}

export function fieldNotesForTemplate(
  field: ImportFieldDef,
  locale: HelpLocale
): string {
  const copy = defaultHelpCopy(locale);
  const parts = [
    requiredLabel(field, copy),
    emptyBehavior(field, copy),
    ...fieldNotes(field, locale),
  ];
  return parts.join(". ");
}

export function allFieldIdsForTarget(target: ImportTarget): string[] {
  return fieldsForTarget(target).map((f) => f.key);
}

/** Plan display names that must never appear in help copy. */
export const FORBIDDEN_PLAN_NAMES_IN_HELP = [
  "Base",
  "Pro",
  "Studio",
  "plan Base",
  "plan Pro",
  "plan Studio",
] as const;

export function helpModelContainsPlanName(
  model: BudgetImportHelpModel
): boolean {
  const blob = JSON.stringify(model);
  return FORBIDDEN_PLAN_NAMES_IN_HELP.some((name) => {
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`\\b${escaped}\\b`, "i").test(blob);
  });
}

export function isRequiredHeaderField(field: ImportFieldDef): boolean {
  return isRequiredMarker(field);
}
