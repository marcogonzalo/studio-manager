"use client";

import { use } from "react";
import { ProjectPayments } from "@/modules/app/projects/project-payments";
import { useProjectContext } from "../project-context";

export default function PaymentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectPayments
      projectId={id}
      readOnly={isReadOnly}
      disabled={capabilities.paymentsDisabled}
    />
  );
}
