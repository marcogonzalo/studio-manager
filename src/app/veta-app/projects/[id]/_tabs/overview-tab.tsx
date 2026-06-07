"use client";

import { ProjectDashboard } from "@/modules/app/projects/project-dashboard";
import { useProjectContext } from "../project-context";

export function OverviewTab() {
  const { project, isReadOnly } = useProjectContext();

  return (
    <ProjectDashboard
      projectId={project.id}
      readOnly={isReadOnly}
      disabled={false}
    />
  );
}
