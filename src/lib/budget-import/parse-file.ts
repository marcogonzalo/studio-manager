import type { ImportTarget } from "./fields";

export const IMPORT_MAX_FILE_BYTES = 10 * 1024 * 1024;
export const IMPORT_MAX_ROWS = 500;

export type ParsedSheet = {
  name: string;
  headers: string[];
  rows: string[][];
};

export type ParseFileResult =
  | {
      ok: true;
      sheets: ParsedSheet[];
      targetHint?: ImportTarget;
    }
  | {
      ok: false;
      error:
        "too_large" | "empty" | "too_many_rows" | "unsupported" | "parse_error";
      detail?: string;
    };

function decodeText(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  // UTF-8 BOM
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return new TextDecoder("utf-8").decode(bytes.subarray(3));
  }
  // Try UTF-8; if replacement chars dominate, fall back to windows-1252
  const utf8 = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  if (utf8.includes("\uFFFD")) {
    return new TextDecoder("windows-1252").decode(bytes);
  }
  return utf8;
}

function sheetFromMatrix(name: string, matrix: string[][]): ParsedSheet | null {
  if (matrix.length === 0) return null;
  const headers = matrix[0].map((h) => String(h ?? "").trim());
  if (headers.every((h) => h === "")) return null;
  const rows = matrix
    .slice(1)
    .map((r) => headers.map((_, i) => String(r[i] ?? "").trim()))
    .filter((r) => r.some((c) => c !== ""));
  return { name, headers, rows };
}

export async function parseImportFile(file: File): Promise<ParseFileResult> {
  if (file.size > IMPORT_MAX_FILE_BYTES) {
    return { ok: false, error: "too_large" };
  }

  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  try {
    if (name.endsWith(".csv") || file.type === "text/csv") {
      const Papa = (await import("papaparse")).default;
      const text = decodeText(buffer);
      const parsed = Papa.parse<string[]>(text, {
        header: false,
        skipEmptyLines: "greedy",
        delimiter: "", // auto-detect
      });
      if (
        parsed.errors.length > 0 &&
        (!parsed.data || parsed.data.length === 0)
      ) {
        return {
          ok: false,
          error: "parse_error",
          detail: parsed.errors[0]?.message,
        };
      }
      const matrix = (parsed.data as string[][]).map((row) =>
        row.map((c) => String(c ?? ""))
      );
      const sheet = sheetFromMatrix("CSV", matrix);
      if (!sheet) return { ok: false, error: "empty" };
      if (sheet.rows.length > IMPORT_MAX_ROWS) {
        return { ok: false, error: "too_many_rows" };
      }
      return { ok: true, sheets: [sheet] };
    }

    if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      const ExcelJS = await import("exceljs");
      const workbook = new ExcelJS.Workbook();
      // exceljs typings accept Buffer-like inputs at runtime
      await workbook.xlsx.load(buffer as unknown as ArrayBuffer);
      const sheets: ParsedSheet[] = [];
      workbook.eachSheet((ws) => {
        const matrix: string[][] = [];
        ws.eachRow({ includeEmpty: false }, (row) => {
          const values = row.values as unknown[];
          // exceljs is 1-indexed; index 0 is empty
          const cells = values.slice(1).map((v) => {
            if (v == null) return "";
            if (typeof v === "object" && "text" in (v as object)) {
              return String((v as { text: string }).text);
            }
            if (typeof v === "object" && "result" in (v as object)) {
              return String((v as { result: unknown }).result ?? "");
            }
            return String(v);
          });
          matrix.push(cells);
        });
        const sheet = sheetFromMatrix(ws.name, matrix);
        if (sheet) sheets.push(sheet);
      });
      if (sheets.length === 0) return { ok: false, error: "empty" };
      const totalRows = sheets.reduce((n, s) => n + s.rows.length, 0);
      if (totalRows > IMPORT_MAX_ROWS) {
        return { ok: false, error: "too_many_rows" };
      }
      return { ok: true, sheets };
    }

    return { ok: false, error: "unsupported" };
  } catch (err) {
    return {
      ok: false,
      error: "parse_error",
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}

export function rowsToObjects(
  headers: string[],
  rows: string[][]
): Record<string, string>[] {
  return rows.map((row) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] ?? "";
    });
    return obj;
  });
}
