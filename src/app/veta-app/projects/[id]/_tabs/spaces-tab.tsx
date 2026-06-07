"use client";

import { ProjectSpaces } from "@/modules/app/projects/project-spaces";
import { useProjectContext } from "../project-context";

export function SpacesTab() {
  const { project, isReadOnly } = useProjectContext();

  return (
    <ProjectSpaces
      projectId={project.id}
      readOnly={isReadOnly}
      disabled={false}
    />
  );
}
