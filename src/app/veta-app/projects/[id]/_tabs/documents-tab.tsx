"use client";

import { ProjectDocuments } from "@/modules/app/projects/project-documents";
import { useProjectContext } from "../project-context";

export function DocumentsTab() {
  const { project, isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectDocuments
      projectId={project.id}
      readOnly={isReadOnly}
      disabled={capabilities.documentsDisabled}
    />
  );
}
