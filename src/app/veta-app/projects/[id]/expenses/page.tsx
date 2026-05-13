"use client";

import { use } from "react";
import { ProjectCostControl } from "@/modules/app/projects/project-cost-control";
import { useProjectContext } from "../project-context";

export default function ExpensesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectCostControl
      projectId={id}
      readOnly={isReadOnly}
      disabled={capabilities.expensesDisabled}
      advancedCostOptionsEnabled={capabilities.advancedCostOptionsEnabled}
    />
  );
}
