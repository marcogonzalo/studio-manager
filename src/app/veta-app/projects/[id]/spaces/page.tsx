"use client";

import { use } from "react";
import { ProjectSpaces } from "@/modules/app/projects/project-spaces";
import { useProjectContext } from "../project-context";

export default function SpacesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly } = useProjectContext();

  return (
    <ProjectSpaces projectId={id} readOnly={isReadOnly} disabled={false} />
  );
}
