"use client";

import { use } from "react";
import { ProjectDocuments } from "@/modules/app/projects/project-documents";
import { useProjectContext } from "../project-context";

export default function DocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectDocuments
      projectId={id}
      readOnly={isReadOnly}
      disabled={capabilities.documentsDisabled}
    />
  );
}
