"use client";

import { useTranslations } from "next-intl";
import type { ProjectPhase } from "@/types";

const PROJECT_STATUS_KEYS = [
  "active",
  "completed",
  "cancelled",
  "draft",
] as const;

type ProjectStatusKey = (typeof PROJECT_STATUS_KEYS)[number];

export function usePhaseLabel() {
  const t = useTranslations("Phases");

  return (phase?: ProjectPhase | null) => (phase ? t(phase) : t("unassigned"));
}

export function useProjectStatusLabel() {
  const t = useTranslations("ProjectStatus");

  return (status?: string | null) => {
    if (!status?.trim()) return "—";
    const key = status.toLowerCase();
    if ((PROJECT_STATUS_KEYS as readonly string[]).includes(key)) {
      return t(key as ProjectStatusKey);
    }
    return status;
  };
}
