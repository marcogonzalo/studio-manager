// Dynamic PDF generator utility
// This file helps Vite handle @react-pdf/renderer by loading it dynamically

import type { ProjectBudgetLine } from '@/types';

export async function generateProjectPDF(
  project: any,
  items: any[],
  budgetLines: ProjectBudgetLine[],
  taxRate: number = 21,
  architectName?: string
) {
  // Dynamic import to avoid Vite resolution issues
  const { pdf } = await import('@react-pdf/renderer');
  const { ProjectPDF } = await import('@/components/project-pdf');
  
  // Use React.createElement instead of JSX to avoid static analysis
  const React = await import('react');
  const doc = React.createElement(ProjectPDF, {
    project,
    items,
    budgetLines,
    taxRate,
    architectName,
  });
  
  // Type assertion to satisfy react-pdf's type requirements
  // ProjectPDF returns a Document component, which is what pdf() expects
  const asPdf = pdf(doc as any);
  return asPdf;
}

