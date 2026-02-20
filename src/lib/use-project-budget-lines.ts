"use client";

import { useState, useCallback, useEffect } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { isCostCategory, reportError, reportWarn } from "@/lib/utils";
import type { BudgetCategory, ProjectBudgetLine } from "@/types";

export interface UseProjectBudgetLinesOptions {
  /** Si true, solo líneas con is_internal_cost = false (vista cliente). */
  excludeInternal?: boolean;
  /** Si true, filtrar solo categorías de coste (excluir own_fees). */
  costOnly?: boolean;
  /** Si false, no hacer fetch automático al montar; el padre debe llamar refetch(). Default true. */
  autoFetch?: boolean;
}

export function useProjectBudgetLines(
  projectId: string,
  options: UseProjectBudgetLinesOptions = {}
) {
  const {
    excludeInternal = false,
    costOnly = false,
    autoFetch = true,
  } = options;

  const supabase = getSupabaseClient();
  const [budgetLines, setBudgetLines] = useState<ProjectBudgetLine[]>([]);
  const [loading, setLoading] = useState(autoFetch);

  const refetch = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      let query = supabase
        .from("project_budget_lines")
        .select("*, supplier:suppliers(name)")
        .eq("project_id", projectId)
        .order("category")
        .order("created_at");

      if (excludeInternal) {
        query = query.eq("is_internal_cost", false);
      }

      const { data, error } = await query;

      if (error) {
        if (
          error.code === "42P01" ||
          error.message?.includes("does not exist")
        ) {
          reportWarn(
            "Table project_budget_lines does not exist yet. Please run migrations."
          );
          setBudgetLines([]);
        } else {
          reportError(error, "Error fetching budget lines:");
          setBudgetLines([]);
        }
      } else {
        let lines = data ?? [];
        if (costOnly) {
          lines = lines.filter((line: ProjectBudgetLine) =>
            isCostCategory((line.category ?? "construction") as BudgetCategory)
          );
        }
        setBudgetLines(lines);
      }
    } finally {
      setLoading(false);
    }
  }, [projectId, excludeInternal, costOnly, supabase]);

  useEffect(() => {
    if (autoFetch && projectId) {
      refetch();
    }
  }, [projectId, autoFetch, refetch]);

  return { budgetLines, loading, refetch };
}
