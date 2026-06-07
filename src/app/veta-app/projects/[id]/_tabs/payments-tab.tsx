"use client";

import { ProjectPayments } from "@/modules/app/projects/project-payments";
import { useProjectContext } from "../project-context";

export function PaymentsTab() {
  const { project, isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectPayments
      projectId={project.id}
      readOnly={isReadOnly}
      disabled={capabilities.paymentsDisabled}
    />
  );
}
