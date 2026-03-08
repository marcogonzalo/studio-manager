// Dynamic PDF generator utility
// This file helps Vite handle @react-pdf/renderer by loading it dynamically

import type { Project, ProjectItem, ProjectBudgetLine } from "@/types";

export async function generateProjectPDF(
  project: Project & {
    client?: {
      full_name: string;
      email?: string;
      phone?: string;
      address?: string;
    };
  },
  items: ProjectItem[],
  budgetLines: ProjectBudgetLine[],
  taxRate: number = 0,
  architectName?: string,
  architectEmail?: string,
  /** When true (pdf_export_mode basic/plus), show Veta header and footer in the PDF. */
  showVetaBranding: boolean = false,
  /** Data URL (base64) o URL absoluta del logo Veta. Preferir data URL para que la imagen se incruste y no falle por CORS. */
  vetaLogoUrl?: string
) {
  // Dynamic import: tras cambiar project-pdf.tsx, haz refresh completo (F5) para cargar el chunk nuevo
  const { pdf } = await import("@react-pdf/renderer");
  const { ProjectPDF } = await import("@/components/project-pdf");

  const React = await import("react");
  const doc = React.createElement(ProjectPDF, {
    project,
    items,
    budgetLines,
    taxRate,
    architectName,
    architectEmail,
    showVetaBranding,
    vetaLogoUrl,
  });

  // Type assertion to satisfy react-pdf's type requirements
  // ProjectPDF returns a Document component, which is what pdf() expects
  // react-pdf's pdf() expects DocumentProps; createElement returns ReactElement
  const asPdf = pdf(doc as Parameters<typeof pdf>[0]);
  return asPdf;
}
