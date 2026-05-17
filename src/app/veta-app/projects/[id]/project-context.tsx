"use client";

import { createContext, useContext } from "react";
import type { Project } from "@/types";

export type ProjectCapabilities = {
  costsDisabled: boolean;
  purchasesDisabled: boolean;
  paymentsDisabled: boolean;
  documentsDisabled: boolean;
  expensesDisabled: boolean;
  advancedCostOptionsEnabled: boolean;
  budgetModeAtLeastPlus: boolean;
  costsManagementAtLeastPlus: boolean;
  purchaseOrdersAtLeastPlus: boolean;
  paymentsManagementAtLeastPlus: boolean;
};

type ProjectContextType = {
  project: Project | null;
  isReadOnly: boolean;
  capabilities: ProjectCapabilities;
};

export const ProjectContext = createContext<ProjectContextType | null>(null);

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProjectContext must be used within a ProjectProvider");
  }
  return context;
}
