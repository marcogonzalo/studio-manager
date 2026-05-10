import { describe, expect, it } from "vitest";
import type { PlanConfig } from "@/types";
import {
  consumableUsageBarPercent,
  DEFAULT_SETTINGS_PLAN_STORAGE_LIMIT_MB,
  getCurrentAssignment,
  getFallbackNumericConsumableLimit,
  getPastHistory,
  getSettingsPlanExpiryMessageKey,
  localCalendarDayString,
  planAssignmentExpiresCalendarDay,
  planExpiresOnOrAfterLocalDay,
  resolveNumericConsumableLimit,
  resolveStorageLimitMb,
  shouldShowPlanExpiryText,
  startOfLocalDay,
  storageUsageBarPercent,
} from "./settings-plan-logic";

describe("planAssignmentExpiresCalendarDay", () => {
  it("keeps Postgres DATE YYYY-MM-DD as calendar string", () => {
    expect(planAssignmentExpiresCalendarDay("2026-05-10")).toBe("2026-05-10");
    expect(planAssignmentExpiresCalendarDay(" 2026-05-10 ")).toBe("2026-05-10");
  });

  it("uses date part for midnight ISO (avoids UTC-only Date parsing)", () => {
    expect(planAssignmentExpiresCalendarDay("2026-05-10T00:00:00.000Z")).toBe(
      "2026-05-10"
    );
    expect(planAssignmentExpiresCalendarDay("2026-05-10T00:00:00+00:00")).toBe(
      "2026-05-10"
    );
  });

  it("uses local calendar day for non-midnight timestamps", () => {
    const d = new Date(2026, 4, 10, 15, 30, 0);
    const iso = d.toISOString();
    expect(planAssignmentExpiresCalendarDay(iso)).toBe("2026-05-10");
  });

  it("returns null for unparseable values", () => {
    expect(planAssignmentExpiresCalendarDay("")).toBeNull();
    expect(planAssignmentExpiresCalendarDay("not-a-date")).toBeNull();
  });
});

describe("calendar day vs UTC-parsed Date (Postgres DATE)", () => {
  it("compares DATE-only API strings to local today (no timestamp fixtures)", () => {
    const may10Local = startOfLocalDay(new Date(2026, 4, 10));
    expect(localCalendarDayString(may10Local)).toBe("2026-05-10");
    expect(planExpiresOnOrAfterLocalDay("2026-05-10", may10Local)).toBe(true);
    expect(planExpiresOnOrAfterLocalDay("2026-05-09", may10Local)).toBe(false);
  });
});

describe("startOfLocalDay", () => {
  it("zeros time components in local timezone", () => {
    const d = new Date(2026, 4, 10, 15, 30, 45, 123);
    const s = startOfLocalDay(d);
    expect(s.getHours()).toBe(0);
    expect(s.getMinutes()).toBe(0);
    expect(s.getSeconds()).toBe(0);
    expect(s.getMilliseconds()).toBe(0);
    expect(s.getFullYear()).toBe(2026);
    expect(s.getMonth()).toBe(4);
    expect(s.getDate()).toBe(10);
  });
});

describe("getPastHistory / getCurrentAssignment", () => {
  // Fixtures use YYYY-MM-DD like plan_assignments.expires_at (Postgres date) from Supabase.
  const may10 = new Date(2026, 4, 10, 0, 0, 0, 0);

  it("returns empty / undefined when history is empty", () => {
    expect(getPastHistory([], may10)).toEqual([]);
    expect(getCurrentAssignment([], may10)).toBeUndefined();
  });

  it("splits past vs current by calendar expires_at vs local today", () => {
    const rows = [
      { id: "a", expires_at: "2026-05-09" },
      { id: "b", expires_at: "2026-06-01" },
    ];
    const past = getPastHistory(rows, may10);
    const current = getCurrentAssignment(rows, may10);
    expect(past.map((r) => r.id)).toEqual(["a"]);
    expect(current?.id).toBe("b");
  });

  it("boundary: expiry on same local calendar day as today is current (like expires_at >= current_date)", () => {
    const row = { id: "expires-today", expires_at: "2026-05-10" };
    expect(getCurrentAssignment([row], may10)?.id).toBe("expires-today");
    expect(getPastHistory([row], may10)).toEqual([]);
  });

  it("boundary: day before local today is past only (DATE-only strings)", () => {
    const row = { id: "yesterday", expires_at: "2026-05-09" };
    expect(getCurrentAssignment([row], may10)).toBeUndefined();
    expect(getPastHistory([row], may10)).toEqual([row]);
  });

  it("uses find order: first row that is still valid wins", () => {
    const rows = [
      { id: "first", expires_at: "2026-12-31" },
      { id: "second", expires_at: "2026-12-31" },
    ];
    expect(getCurrentAssignment(rows, may10)?.id).toBe("first");
  });

  it("keeps a far-future assignment in current and out of past", () => {
    const row = { id: "x", expires_at: "2030-06-01" };
    expect(getPastHistory([row], may10)).toEqual([]);
    expect(getCurrentAssignment([row], may10)?.id).toBe("x");
  });
});

describe("getSettingsPlanExpiryMessageKey", () => {
  it("renews when next period duration is non-empty", () => {
    expect(getSettingsPlanExpiryMessageKey("1y")).toBe("renewsOn");
    expect(getSettingsPlanExpiryMessageKey("1m")).toBe("renewsOn");
  });

  it("ends when missing or empty string", () => {
    expect(getSettingsPlanExpiryMessageKey(null)).toBe("endsOn");
    expect(getSettingsPlanExpiryMessageKey(undefined)).toBe("endsOn");
    expect(getSettingsPlanExpiryMessageKey("")).toBe("endsOn");
  });
});

describe("shouldShowPlanExpiryText", () => {
  it("hides for BASE", () => {
    expect(
      shouldShowPlanExpiryText({
        planCode: "BASE",
        assignment: { expires_at: "2026-12-01" },
      })
    ).toBe(false);
  });

  it("hides without assignment or expires_at", () => {
    expect(
      shouldShowPlanExpiryText({ planCode: "PRO", assignment: undefined })
    ).toBe(false);
    expect(
      shouldShowPlanExpiryText({ planCode: "PRO", assignment: null })
    ).toBe(false);
    expect(
      shouldShowPlanExpiryText({
        planCode: "PRO",
        assignment: { expires_at: "" },
      })
    ).toBe(false);
  });

  it("shows for paid plan with expires_at", () => {
    expect(
      shouldShowPlanExpiryText({
        planCode: "PRO",
        assignment: { expires_at: "2026-12-01" },
      })
    ).toBe(true);
  });
});

describe("resolveNumericConsumableLimit", () => {
  it("uses config values including 0", () => {
    const config = {
      projects_limit: 0,
      clients_limit: 0,
      suppliers_limit: 0,
      catalog_products_limit: 0,
      storage_limit_mb: 100,
      support_level: "none",
      pdf_export_mode: "none",
      multi_currency_per_project: "none",
      purchase_orders: "none",
      costs_management: "none",
      payments_management: "none",
      documents: "none",
      notes: "none",
      summary: "none",
    } satisfies PlanConfig;
    expect(resolveNumericConsumableLimit("projects", config)).toBe(0);
    expect(resolveNumericConsumableLimit("clients", config)).toBe(0);
  });

  it("uses -1 as unlimited from config", () => {
    const config: PlanConfig = {
      projects_limit: -1,
      clients_limit: -1,
      suppliers_limit: -1,
      catalog_products_limit: -1,
      storage_limit_mb: 500,
      support_level: "none",
      pdf_export_mode: "none",
      multi_currency_per_project: "none",
      purchase_orders: "none",
      costs_management: "none",
      payments_management: "none",
      documents: "none",
      notes: "none",
      summary: "none",
    };
    expect(resolveNumericConsumableLimit("projects", config)).toBe(-1);
  });

  it("falls back when config or field is missing", () => {
    expect(resolveNumericConsumableLimit("projects", undefined)).toBe(1);
    expect(resolveNumericConsumableLimit("products", undefined)).toBe(50);
    expect(resolveNumericConsumableLimit("clients", undefined)).toBe(10);
    expect(resolveNumericConsumableLimit("suppliers", undefined)).toBe(10);
  });
});

describe("getFallbackNumericConsumableLimit", () => {
  it("matches documented defaults", () => {
    expect(getFallbackNumericConsumableLimit("projects")).toBe(1);
    expect(getFallbackNumericConsumableLimit("products")).toBe(50);
    expect(getFallbackNumericConsumableLimit("clients")).toBe(10);
    expect(getFallbackNumericConsumableLimit("suppliers")).toBe(10);
  });
});

describe("resolveStorageLimitMb", () => {
  it("defaults when missing", () => {
    expect(resolveStorageLimitMb(undefined)).toBe(
      DEFAULT_SETTINGS_PLAN_STORAGE_LIMIT_MB
    );
  });

  it("uses 0 and -1 from config", () => {
    const base: PlanConfig = {
      projects_limit: 1,
      clients_limit: 10,
      suppliers_limit: 10,
      catalog_products_limit: 50,
      storage_limit_mb: 500,
      support_level: "none",
      pdf_export_mode: "none",
      multi_currency_per_project: "none",
      purchase_orders: "none",
      costs_management: "none",
      payments_management: "none",
      documents: "none",
      notes: "none",
      summary: "none",
    };
    expect(resolveStorageLimitMb({ ...base, storage_limit_mb: 0 })).toBe(0);
    expect(resolveStorageLimitMb({ ...base, storage_limit_mb: -1 })).toBe(-1);
  });
});

describe("consumableUsageBarPercent", () => {
  it("returns 5 for unlimited (-1)", () => {
    expect(consumableUsageBarPercent(999, -1)).toBe(5);
  });

  it("returns 0 when limit is 0", () => {
    expect(consumableUsageBarPercent(5, 0)).toBe(0);
  });

  it("caps at 100", () => {
    expect(consumableUsageBarPercent(200, 100)).toBe(100);
  });

  it("computes ratio below 100", () => {
    expect(consumableUsageBarPercent(25, 100)).toBe(25);
  });
});

describe("storageUsageBarPercent", () => {
  it("mirrors consumable rules with byte conversion", () => {
    expect(storageUsageBarPercent(0, -1)).toBe(5);
    expect(storageUsageBarPercent(100, 0)).toBe(0);
    const oneMb = 1024 * 1024;
    expect(storageUsageBarPercent(oneMb / 2, 1)).toBe(50);
    expect(storageUsageBarPercent(oneMb * 3, 1)).toBe(100);
  });
});
