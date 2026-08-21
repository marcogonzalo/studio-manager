import { describe, expect, it } from "vitest";
import {
  BUDGET_NOTES_MAX_LENGTH,
  isBudgetNotesTooLong,
  normalizeBudgetNotes,
  splitBudgetNotesLines,
} from "./budget-notes";

describe("normalizeBudgetNotes", () => {
  it("returns null for empty / whitespace", () => {
    expect(normalizeBudgetNotes(null)).toBeNull();
    expect(normalizeBudgetNotes(undefined)).toBeNull();
    expect(normalizeBudgetNotes("")).toBeNull();
    expect(normalizeBudgetNotes("   \n\t  ")).toBeNull();
  });

  it("trims but keeps inner line breaks", () => {
    expect(normalizeBudgetNotes("  line1\nline2  ")).toBe("line1\nline2");
  });
});

describe("isBudgetNotesTooLong", () => {
  it("allows null and short text", () => {
    expect(isBudgetNotesTooLong(null)).toBe(false);
    expect(isBudgetNotesTooLong("ok")).toBe(false);
  });

  it("rejects over max length", () => {
    expect(isBudgetNotesTooLong("x".repeat(BUDGET_NOTES_MAX_LENGTH + 1))).toBe(
      true
    );
    expect(isBudgetNotesTooLong("x".repeat(BUDGET_NOTES_MAX_LENGTH))).toBe(
      false
    );
  });
});

describe("splitBudgetNotesLines", () => {
  it("returns empty for blank notes", () => {
    expect(splitBudgetNotesLines(null)).toEqual([]);
    expect(splitBudgetNotesLines("  ")).toEqual([]);
  });

  it("splits on LF and CRLF", () => {
    expect(splitBudgetNotesLines("a\nb\nc")).toEqual(["a", "b", "c"]);
    expect(splitBudgetNotesLines("a\r\nb")).toEqual(["a", "b"]);
  });
});
