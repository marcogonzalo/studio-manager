/**
 * Normalize spreadsheet headers for alias matching.
 * Lowercase, strip accents, drop "*", punctuation; collapse whitespace.
 */
export function normalizeHeader(raw: string): string {
  return raw
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[*]+/g, " ")
    .replace(/[%()[\]{}]/g, " ")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}
