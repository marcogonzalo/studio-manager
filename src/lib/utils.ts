import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ProjectPhase } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPhaseLabel(phase?: ProjectPhase): string {
  if (!phase) return 'No asignada';
  
  const labels: Record<ProjectPhase, string> = {
    diagnosis: 'Diagnóstico',
    design: 'Diseño',
    executive: 'Proyecto Ejecutivo',
    budget: 'Presupuestos',
    construction: 'Obra',
    delivery: 'Entrega',
  };
  
  return labels[phase];
}
