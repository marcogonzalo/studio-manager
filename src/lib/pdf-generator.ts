// Dynamic PDF generator utility
// This file helps Vite handle @react-pdf/renderer by loading it dynamically

import type { Project, ProjectItem, ProjectBudgetLine } from "@/types";

export async function generateProjectPDF(
  project: Project & { client?: { full_name: string; email?: string; phone?: string; address?: string } },
  items: ProjectItem[],
  budgetLines: ProjectBudgetLine[],
  taxRate: number = 0,
  architectName?: string
) {
  // Dynamic import to avoid Vite resolution issues
  const { pdf } = await import("@react-pdf/renderer");
  const { ProjectPDF } = await import("@/components/project-pdf");

  // Use React.createElement instead of JSX to avoid static analysis
  const React = await import("react");
  const doc = React.createElement(ProjectPDF, {
    project,
    items,
    budgetLines,
    taxRate,
    architectName,
  });

  // Type assertion to satisfy react-pdf's type requirements
  // ProjectPDF returns a Document component, which is what pdf() expects
  // react-pdf's pdf() expects DocumentProps; createElement returns ReactElement
  const asPdf = pdf(doc as Parameters<typeof pdf>[0]);
  return asPdf;
}
