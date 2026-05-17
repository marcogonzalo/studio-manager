"use client";

import { use } from "react";
import { ProjectPurchases } from "@/modules/app/projects/project-purchases";
import { useProjectContext } from "../project-context";

export default function PurchasesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { isReadOnly, capabilities } = useProjectContext();

  return (
    <ProjectPurchases
      projectId={id}
      readOnly={isReadOnly}
      disabled={capabilities.purchasesDisabled}
    />
  );
}
