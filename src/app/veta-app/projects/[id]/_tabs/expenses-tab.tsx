"use client";

import { ProjectCostControl } from "@/modules/app/projects/project-cost-control";
import { useProjectContext } from "../project-context";

export function ExpensesTab() {
  const { project, isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectCostControl
      projectId={project.id}
      readOnly={isReadOnly}
      disabled={capabilities.expensesDisabled}
      advancedCostOptionsEnabled={capabilities.advancedCostOptionsEnabled}
    />
  );
}
