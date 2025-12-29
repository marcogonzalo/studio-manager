// Dynamic PDF generator utility
// This file helps Vite handle @react-pdf/renderer by loading it dynamically

export async function generateProjectPDF(
  project: any,
  items: any[],
  additionalCosts: any[],
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
    additionalCosts,
    taxRate,
    architectName,
  });
  
  const asPdf = pdf(doc);
  return asPdf;
}

