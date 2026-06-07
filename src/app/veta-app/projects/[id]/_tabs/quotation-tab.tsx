"use client";

import { ProjectBudget } from "@/modules/app/projects/project-budget";
import { useProjectContext } from "../project-context";

export function QuotationTab() {
  const { project, isReadOnly } = useProjectContext();

  return (
    <ProjectBudget
      projectId={project.id}
      readOnly={isReadOnly}
      disabled={false}
    />
  );
}
