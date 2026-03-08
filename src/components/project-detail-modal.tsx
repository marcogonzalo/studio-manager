"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  CURRENCIES,
  formatDate,
  getPhaseLabel,
  getProjectStatusLabel,
} from "@/lib/utils";
import type { Project } from "@/types";
import { Pencil } from "lucide-react";

export interface ProjectDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: (Project & { client?: { full_name: string } }) | null;
  onEdit: () => void;
  /** Si true, el proyecto está en solo lectura (completado/cancelado) y no se muestra el botón Editar. */
  readOnly?: boolean;
}

export function ProjectDetailModal({
  open,
  onOpenChange,
  project,
  onEdit,
  readOnly = false,
}: ProjectDetailModalProps) {
  if (!project) return null;

  const handleEdit = () => {
    onOpenChange(false);
    onEdit();
  };

  const startDate = project.start_date
    ? project.start_date.includes("T")
      ? project.start_date.split("T")[0]
      : project.start_date
    : null;
  const endDate = project.end_date
    ? project.end_date.includes("T")
      ? project.end_date.split("T")[0]
      : project.end_date
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalle del Proyecto</DialogTitle>
          <DialogDescription>
            Información del proyecto. Usa Editar para modificar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-sm">Nombre del Proyecto</p>
            <p className="font-medium">{project.name}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-sm">Cliente</p>
            <p className="font-medium">{project.client?.full_name ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-sm">Dirección</p>
            <p className="font-medium">{project.address ?? "—"}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground text-sm">Descripción</p>
            <p className="font-medium whitespace-pre-wrap">
              {project.description ?? "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Fase del Proyecto</p>
            <p className="font-medium">
              {project.phase ? getPhaseLabel(project.phase) : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Estado</p>
            <p className="font-medium">
              {getProjectStatusLabel(project.status)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Fecha Inicio</p>
            <p className="font-medium">
              {startDate ? formatDate(startDate) : "No definida"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">
              Fecha Estimada de Entrega
            </p>
            <p className="font-medium">
              {endDate ? formatDate(endDate) : "No definida"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Moneda</p>
            <p className="font-medium">
              {project.currency && CURRENCIES[project.currency]
                ? CURRENCIES[project.currency]
                : "—"}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-sm">Impuesto (%)</p>
            <p className="font-medium">
              {project.tax_rate != null ? String(project.tax_rate) : "—"}
            </p>
          </div>
        </div>
        <DialogFooter>
          {!readOnly && (
            <Button type="button" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
