"use client";

import { use } from "react";
import { ProjectDashboard } from "@/modules/app/projects/project-dashboard";
import { useProjectContext } from "./project-context";

export default function OverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly } = useProjectContext();

  return (
    <ProjectDashboard projectId={id} readOnly={isReadOnly} disabled={false} />
  );
}
