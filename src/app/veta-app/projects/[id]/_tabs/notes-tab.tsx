"use client";

import { ProjectNotes } from "@/modules/app/projects/project-notes";
import { useProjectContext } from "../project-context";

export function NotesTab() {
  const { project, isReadOnly } = useProjectContext();

  return (
    <ProjectNotes
      projectId={project.id}
      readOnly={isReadOnly}
      disabled={false}
    />
  );
}
