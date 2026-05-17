"use client";

import { use } from "react";
import { ProjectBudget } from "@/modules/app/projects/project-budget";
import { useProjectContext } from "../project-context";

export default function QuotationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly } = useProjectContext();

  return (
    <ProjectBudget projectId={id} readOnly={isReadOnly} disabled={false} />
  );
}
