import { describe, it, expect, vi } from "vitest";
import {
  cn,
  getErrorMessage,
  getPhaseLabel,
  getBudgetCategoryLabel,
  getBudgetSubcategoryLabel,
  getSubcategoryOptions,
  getCategoryOptions,
  isCostCategory,
  isPlanLimitExceeded,
  isPlanFeatureUnavailable,
  getPlanErrorType,
  getPlanErrorMessage,
  PLAN_ERROR_MESSAGES,
  reportError,
  reportWarn,
} from "./utils";

describe("cn utility function", () => {
  it("should merge class names correctly", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("should merge Tailwind classes and resolve conflicts", () => {
    const result = cn("px-2 py-1", "px-4");
    expect(result).toBe("py-1 px-4");
  });

  it("should handle empty inputs", () => {
    const result = cn();
    expect(result).toBe("");
  });

  it("should handle arrays of class names", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });

  it("should handle objects with boolean values", () => {
    const result = cn({ foo: true, bar: false, baz: true });
    expect(result).toBe("foo baz");
  });

  it("should handle mixed inputs", () => {
    const result = cn("foo", ["bar", "baz"], { qux: true }, false && "quux");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
    expect(result).toContain("qux");
    expect(result).not.toContain("quux");
  });

  it("should handle undefined and null values", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("should merge conflicting Tailwind utilities correctly", () => {
    const result = cn("bg-red-500", "bg-blue-500");
    expect(result).toBe("bg-blue-500");
  });

  it("should handle string with whitespace", () => {
    const result = cn("  foo   bar  ", "baz");
    expect(result).toContain("foo");
    expect(result).toContain("bar");
    expect(result).toContain("baz");
  });
});

describe("getErrorMessage", () => {
  it("should return message for Error instance", () => {
    expect(getErrorMessage(new Error("Something failed"))).toBe(
      "Something failed"
    );
  });

  it("should return string when error is a string", () => {
    expect(getErrorMessage("Custom error")).toBe("Custom error");
  });

  it("should return message from object with message (Supabase-like)", () => {
    expect(getErrorMessage({ message: "DB constraint failed" })).toBe(
      "DB constraint failed"
    );
  });

  it("should return details from object when message is missing or empty", () => {
    expect(getErrorMessage({ details: "Duplicate key" })).toBe("Duplicate key");
    expect(getErrorMessage({ message: "", details: "Fallback" })).toBe(
      "Fallback"
    );
    expect(getErrorMessage({ message: "  ", details: "Detail" })).toBe(
      "Detail"
    );
  });

  it("should prefer message over details when both present", () => {
    expect(getErrorMessage({ message: "Primary", details: "Secondary" })).toBe(
      "Primary"
    );
  });

  it("should trim message and details", () => {
    expect(getErrorMessage({ message: "  trimmed  " })).toBe("trimmed");
    expect(getErrorMessage({ details: "  detail  " })).toBe("detail");
  });

  it("should return fallback for unknown error", () => {
    expect(getErrorMessage(null)).toBe("Error desconocido");
    expect(getErrorMessage(42)).toBe("Error desconocido");
    expect(getErrorMessage({})).toBe("Error desconocido");
    expect(getErrorMessage({ message: "", details: "" })).toBe(
      "Error desconocido"
    );
  });
});

describe("isPlanLimitExceeded", () => {
  it("should return true when Error message contains PLAN_LIMIT_EXCEEDED", () => {
    expect(
      isPlanLimitExceeded(new Error("Something PLAN_LIMIT_EXCEEDED happened"))
    ).toBe(true);
  });

  it("should return true when object message contains PLAN_LIMIT_EXCEEDED", () => {
    expect(
      isPlanLimitExceeded({ message: "PLAN_LIMIT_EXCEEDED: projects" })
    ).toBe(true);
  });

  it("should return false when message does not contain PLAN_LIMIT_EXCEEDED", () => {
    expect(isPlanLimitExceeded(new Error("Other error"))).toBe(false);
    expect(isPlanLimitExceeded({ message: "Other" })).toBe(false);
    expect(isPlanLimitExceeded(null)).toBe(false);
  });
});

describe("isPlanFeatureUnavailable", () => {
  it("should return true when message contains PLAN_FEATURE_UNAVAILABLE", () => {
    expect(
      isPlanFeatureUnavailable(
        new Error("PLAN_FEATURE_UNAVAILABLE: purchase_orders")
      )
    ).toBe(true);
  });

  it("should return false when message does not contain PLAN_FEATURE_UNAVAILABLE", () => {
    expect(isPlanFeatureUnavailable(new Error("Other error"))).toBe(false);
    expect(isPlanFeatureUnavailable(null)).toBe(false);
  });
});

describe("getPlanErrorType", () => {
  it("should return limit_exceeded when message contains PLAN_LIMIT_EXCEEDED", () => {
    expect(getPlanErrorType(new Error("PLAN_LIMIT_EXCEEDED: projects"))).toBe(
      "limit_exceeded"
    );
  });

  it("should return feature_unavailable when message contains PLAN_FEATURE_UNAVAILABLE", () => {
    expect(
      getPlanErrorType(new Error("PLAN_FEATURE_UNAVAILABLE: documents"))
    ).toBe("feature_unavailable");
  });

  it("should return null for non-plan errors", () => {
    expect(getPlanErrorType(new Error("Other"))).toBe(null);
    expect(getPlanErrorType(null)).toBe(null);
  });
});

describe("getPlanErrorMessage", () => {
  it("should return limitExceeded message for PLAN_LIMIT_EXCEEDED", () => {
    const result = getPlanErrorMessage(
      new Error("PLAN_LIMIT_EXCEEDED: active projects")
    );
    expect(result).toEqual(PLAN_ERROR_MESSAGES.limitExceeded);
  });

  it("should return featureUnavailable message for PLAN_FEATURE_UNAVAILABLE", () => {
    const result = getPlanErrorMessage(
      new Error("PLAN_FEATURE_UNAVAILABLE: purchase_orders")
    );
    expect(result).toEqual(PLAN_ERROR_MESSAGES.featureUnavailable);
  });

  it("should return null for non-plan errors", () => {
    expect(getPlanErrorMessage(new Error("Other"))).toBe(null);
  });
});

describe("getPhaseLabel", () => {
  it("should return label for each phase", () => {
    expect(getPhaseLabel("diagnosis")).toBe("Diagnóstico");
    expect(getPhaseLabel("design")).toBe("Diseño");
    expect(getPhaseLabel("executive")).toBe("Proyecto Ejecutivo");
    expect(getPhaseLabel("budget")).toBe("Presupuestos");
    expect(getPhaseLabel("construction")).toBe("Obra");
    expect(getPhaseLabel("delivery")).toBe("Entrega");
  });

  it("should return 'No asignada' for undefined or null", () => {
    expect(getPhaseLabel(undefined)).toBe("No asignada");
    expect(getPhaseLabel(null as unknown as undefined)).toBe("No asignada");
  });
});

describe("getBudgetCategoryLabel", () => {
  it("should return label for known category", () => {
    expect(getBudgetCategoryLabel("construction")).toBe("Obra");
    expect(getBudgetCategoryLabel("own_fees")).toBe("Honorarios Propios");
    expect(getBudgetCategoryLabel("external_services")).toBe(
      "Servicios Externos"
    );
    expect(getBudgetCategoryLabel("operations")).toBe("Gastos Operativos");
  });

  it("should return raw value for unknown category", () => {
    expect(getBudgetCategoryLabel("unknown" as "construction")).toBe("unknown");
  });
});

describe("getBudgetSubcategoryLabel", () => {
  it("should return label for known category and subcategory", () => {
    expect(getBudgetSubcategoryLabel("construction", "demolition")).toBe(
      "Demolición"
    );
    expect(getBudgetSubcategoryLabel("own_fees", "design")).toBe("Diseño");
    expect(getBudgetSubcategoryLabel("operations", "shipping")).toBe("Envío");
  });

  it("should return subcategory as-is for unknown subcategory", () => {
    expect(getBudgetSubcategoryLabel("construction", "unknown")).toBe(
      "unknown"
    );
  });

  it("should return subcategory as-is for unknown category", () => {
    expect(
      getBudgetSubcategoryLabel("unknown" as "construction", "demolition")
    ).toBe("demolition");
  });
});

describe("getSubcategoryOptions", () => {
  it("should return options array for category", () => {
    const opts = getSubcategoryOptions("construction");
    expect(opts.length).toBeGreaterThan(0);
    expect(opts[0]).toEqual({
      value: expect.any(String),
      label: expect.any(String),
    });
    expect(opts.find((o) => o.value === "demolition")).toEqual({
      value: "demolition",
      label: "Demolición",
    });
  });

  it("should return empty array for unknown category", () => {
    expect(getSubcategoryOptions("unknown" as "construction")).toEqual([]);
  });
});

describe("getCategoryOptions", () => {
  it("should return all categories as options", () => {
    const opts = getCategoryOptions();
    expect(opts).toHaveLength(4);
    expect(opts.map((o) => o.value)).toContain("construction");
    expect(opts.map((o) => o.value)).toContain("own_fees");
    expect(opts.find((o) => o.value === "construction")).toEqual({
      value: "construction",
      label: "Obra",
    });
  });
});

describe("isCostCategory", () => {
  it("should return true for cost categories", () => {
    expect(isCostCategory("construction")).toBe(true);
    expect(isCostCategory("external_services")).toBe(true);
    expect(isCostCategory("operations")).toBe(true);
  });

  it("should return false for own_fees (income, not cost)", () => {
    expect(isCostCategory("own_fees")).toBe(false);
  });
});

describe("reportError", () => {
  it("should call console.error with context and error when context provided", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportError(new Error("test"), "Context:");
    expect(spy).toHaveBeenCalledWith("Context:", expect.any(Error));
    spy.mockRestore();
  });

  it("should call console.error with only error when no context", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    reportError(new Error("test"));
    expect(spy).toHaveBeenCalledWith(expect.any(Error));
    spy.mockRestore();
  });
});

describe("reportWarn", () => {
  it("should call console.warn with message", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    reportWarn("Warning message");
    expect(spy).toHaveBeenCalledWith("Warning message");
    spy.mockRestore();
  });
});
