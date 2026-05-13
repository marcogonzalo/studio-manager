"use client";

import { use } from "react";
import { ProjectNotes } from "@/modules/app/projects/project-notes";
import { useProjectContext } from "../project-context";

export default function NotesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly } = useProjectContext();

  return <ProjectNotes projectId={id} readOnly={isReadOnly} disabled={false} />;
}
