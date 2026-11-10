import type { ImportFieldDef, ImportTarget } from "./fields";
import {
  BUDGET_CATEGORY_KEYS,
  BUDGET_LINE_IMPORT_FIELDS,
  PRODUCT_IMPORT_FIELDS,
  PROJECT_PHASES,
  isRequiredMarker,
} from "./fields";
import { BUDGET_SUBCATEGORIES } from "@/lib/utils";

export type TemplateLocale = "es" | "en";

export type TemplateLabels = {
  dataSheet: string;
  allowedValuesSheet: string;
  instructionsSheet: string;
  requiredSuffix: string;
  helpUrl: string;
  instructionsColumns: [string, string, string, string, string];
  booleanYes: string;
  booleanNo: string;
  categoryHeader: string;
  subcategoryHeader: string;
  phaseHeader: string;
  booleanHeader: string;
  fileNameProducts: string;
  fileNameBudgetLines: string;
};

export function defaultTemplateLabels(locale: TemplateLocale): TemplateLabels {
  if (locale === "es") {
    return {
      dataSheet: "Productos",
      allowedValuesSheet: "Valores permitidos",
      instructionsSheet: "Instrucciones",
      requiredSuffix: " *",
      helpUrl: "/veta-app/help/budget-import",
      instructionsColumns: [
        "Columna",
        "Obligatorio",
        "Formato",
        "Ejemplo",
        "Notas",
      ],
      booleanYes: "Sí",
      booleanNo: "No",
      categoryHeader: "Categoría",
      subcategoryHeader: "Subcategoría",
      phaseHeader: "Fase",
      booleanHeader: "Sí/No",
      fileNameProducts: "veta-plantilla-productos",
      fileNameBudgetLines: "veta-plantilla-partidas",
    };
  }
  return {
    dataSheet: "Products",
    allowedValuesSheet: "Allowed values",
    instructionsSheet: "Instructions",
    requiredSuffix: " *",
    helpUrl: "/veta-app/help/budget-import",
    instructionsColumns: ["Column", "Required", "Format", "Example", "Notes"],
    booleanYes: "Yes",
    booleanNo: "No",
    categoryHeader: "Category",
    subcategoryHeader: "Subcategory",
    phaseHeader: "Phase",
    booleanHeader: "Yes/No",
    fileNameProducts: "veta-products-template",
    fileNameBudgetLines: "veta-budget-lines-template",
  };
}

export function fieldsForTemplate(
  target: ImportTarget
): readonly ImportFieldDef[] {
  return target === "product"
    ? PRODUCT_IMPORT_FIELDS
    : BUDGET_LINE_IMPORT_FIELDS;
}

export function headerForField(
  field: ImportFieldDef,
  locale: TemplateLocale,
  translateLabel: (labelKey: string) => string,
  labels: TemplateLabels
): string {
  const base = translateLabel(field.labelKey);
  return isRequiredMarker(field) ? `${base}${labels.requiredSuffix}` : base;
}

export function exampleRowValues(
  fields: readonly ImportFieldDef[],
  locale: TemplateLocale
): string[] {
  return fields.map((f) => f.example[locale]);
}

export function csvDelimiter(locale: TemplateLocale): string {
  return locale === "es" ? ";" : ",";
}

/** Build CSV string with UTF-8 BOM. */
export function buildCsvTemplate(options: {
  target: ImportTarget;
  locale: TemplateLocale;
  translateLabel: (labelKey: string) => string;
  fieldNotes?: (field: ImportFieldDef) => string;
}): { filename: string; content: string; mimeType: string } {
  const labels = defaultTemplateLabels(options.locale);
  if (options.target === "budget_line") {
    labels.dataSheet = options.locale === "es" ? "Partidas" : "Budget lines";
  }
  const fields = fieldsForTemplate(options.target);
  const delimiter = csvDelimiter(options.locale);
  const headers = fields.map((f) =>
    headerForField(f, options.locale, options.translateLabel, labels)
  );
  const example = exampleRowValues(fields, options.locale);
  const escape = (v: string) => {
    if (v.includes(delimiter) || v.includes('"') || v.includes("\n")) {
      return `"${v.replaceAll('"', '""')}"`;
    }
    return v;
  };
  const lines = [
    headers.map(escape).join(delimiter),
    example.map(escape).join(delimiter),
  ];
  const bom = "\uFEFF";
  const basename =
    options.target === "product"
      ? labels.fileNameProducts
      : labels.fileNameBudgetLines;
  return {
    filename: `${basename}.csv`,
    content: bom + lines.join("\n") + "\n",
    mimeType: "text/csv;charset=utf-8",
  };
}

export type AllowedValueRow = {
  group: string;
  value: string;
  label: string;
};

export function buildAllowedValueRows(options: {
  target: ImportTarget;
  locale: TemplateLocale;
  translateCategory: (key: string) => string;
  translateSubcategory: (category: string, key: string) => string;
  translatePhase: (key: string) => string;
  labels: TemplateLabels;
}): AllowedValueRow[] {
  const rows: AllowedValueRow[] = [
    {
      group: options.labels.booleanHeader,
      value: "yes",
      label: options.labels.booleanYes,
    },
    {
      group: options.labels.booleanHeader,
      value: "no",
      label: options.labels.booleanNo,
    },
  ];

  if (options.target === "budget_line") {
    for (const category of BUDGET_CATEGORY_KEYS) {
      const catLabel = options.translateCategory(category);
      for (const sub of Object.keys(BUDGET_SUBCATEGORIES[category])) {
        rows.push({
          group: options.labels.categoryHeader,
          value: `${category}/${sub}`,
          label: `${catLabel} › ${options.translateSubcategory(category, sub)}`,
        });
      }
    }
    for (const phase of PROJECT_PHASES) {
      rows.push({
        group: options.labels.phaseHeader,
        value: phase,
        label: options.translatePhase(phase),
      });
    }
  }
  return rows;
}

export function buildInstructionRows(options: {
  fields: readonly ImportFieldDef[];
  locale: TemplateLocale;
  translateLabel: (labelKey: string) => string;
  fieldNotes: (field: ImportFieldDef) => string;
  labels: TemplateLabels;
}): string[][] {
  const requiredYes = options.locale === "es" ? "Sí" : "Yes";
  const requiredNo = options.locale === "es" ? "No" : "No";
  const requiredPair =
    options.locale === "es"
      ? "Coste + margen o precio"
      : "Cost + markup or price";

  return options.fields.map((field) => [
    headerForField(
      field,
      options.locale,
      options.translateLabel,
      options.labels
    ),
    field.required === "always"
      ? requiredYes
      : field.required === "pricing_pair"
        ? requiredPair
        : requiredNo,
    field.type,
    field.example[options.locale],
    options.fieldNotes(field),
  ]);
}

/** Build an XLSX ArrayBuffer using exceljs (dynamic import). */
export async function buildXlsxTemplate(options: {
  target: ImportTarget;
  locale: TemplateLocale;
  translateLabel: (labelKey: string) => string;
  translateCategory: (key: string) => string;
  translateSubcategory: (category: string, key: string) => string;
  translatePhase: (key: string) => string;
  fieldNotes: (field: ImportFieldDef) => string;
}): Promise<{ filename: string; buffer: ArrayBuffer; mimeType: string }> {
  const ExcelJS = await import("exceljs");
  const labels = defaultTemplateLabels(options.locale);
  if (options.target === "budget_line") {
    labels.dataSheet = options.locale === "es" ? "Partidas" : "Budget lines";
  }
  const fields = fieldsForTemplate(options.target);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Veta";

  const dataSheet = workbook.addWorksheet(labels.dataSheet);
  const headers = fields.map((f) =>
    headerForField(f, options.locale, options.translateLabel, labels)
  );
  dataSheet.addRow(headers);
  dataSheet.addRow(exampleRowValues(fields, options.locale));
  dataSheet.getRow(1).font = { bold: true };
  dataSheet.views = [{ state: "frozen", ySplit: 1 }];
  dataSheet.getRow(2).font = { italic: true, color: { argb: "FF6B7280" } };

  fields.forEach((field, index) => {
    const col = index + 1;
    const note = options.fieldNotes(field);
    dataSheet.getCell(1, col).note = note;
    if (field.type === "boolean") {
      dataSheet
        .getColumn(col)
        .eachCell({ includeEmpty: false }, (cell, row) => {
          if (row === 1) return;
          cell.dataValidation = {
            type: "list",
            allowBlank: true,
            formulae: [`"${labels.booleanYes},${labels.booleanNo}"`],
          };
        });
    }
  });

  const allowedSheet = workbook.addWorksheet(labels.allowedValuesSheet);
  allowedSheet.addRow([
    options.locale === "es" ? "Grupo" : "Group",
    options.locale === "es" ? "Valor" : "Value",
    options.locale === "es" ? "Etiqueta" : "Label",
  ]);
  for (const row of buildAllowedValueRows({
    target: options.target,
    locale: options.locale,
    translateCategory: options.translateCategory,
    translateSubcategory: options.translateSubcategory,
    translatePhase: options.translatePhase,
    labels,
  })) {
    allowedSheet.addRow([row.group, row.value, row.label]);
  }
  allowedSheet.getRow(1).font = { bold: true };

  const instructionsSheet = workbook.addWorksheet(labels.instructionsSheet);
  instructionsSheet.addRow([
    options.locale === "es" ? "Guía" : "Guide",
    labels.helpUrl,
  ]);
  instructionsSheet.addRow(labels.instructionsColumns);
  instructionsSheet.getRow(2).font = { bold: true };
  for (const row of buildInstructionRows({
    fields,
    locale: options.locale,
    translateLabel: options.translateLabel,
    fieldNotes: options.fieldNotes,
    labels,
  })) {
    instructionsSheet.addRow(row);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  const basename =
    options.target === "product"
      ? labels.fileNameProducts
      : labels.fileNameBudgetLines;
  return {
    filename: `${basename}.xlsx`,
    buffer: buffer as ArrayBuffer,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };
}

export function downloadBlob(filename: string, blob: Blob): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
