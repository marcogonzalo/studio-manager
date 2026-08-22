"use client";

import { ProjectPurchases } from "@/modules/app/projects/project-purchases";
import { useProjectContext } from "../project-context";

export function PurchasesTab() {
  const { project, isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectPurchases
      projectId={project.id}
      taxRate={project.tax_rate}
      multitax={project.multitax}
      readOnly={isReadOnly}
      disabled={capabilities.purchasesDisabled}
    />
  );
}
