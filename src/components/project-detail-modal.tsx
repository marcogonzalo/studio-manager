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
        <dl className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">
              Nombre del Proyecto
            </dt>
            <dd className="font-medium">{project.name}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">Cliente</dt>
            <dd className="font-medium">{project.client?.full_name ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">Dirección</dt>
            <dd className="font-medium">{project.address ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">Descripción</dt>
            <dd className="font-medium whitespace-pre-wrap">
              {project.description ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Fase del Proyecto</dt>
            <dd className="font-medium">
              {project.phase ? getPhaseLabel(project.phase) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Estado</dt>
            <dd className="font-medium">
              {getProjectStatusLabel(project.status)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Fecha Inicio</dt>
            <dd className="font-medium">
              {startDate ? formatDate(startDate) : "No definida"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">
              Fecha Estimada de Entrega
            </dt>
            <dd className="font-medium">
              {endDate ? formatDate(endDate) : "No definida"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Moneda</dt>
            <dd className="font-medium">
              {project.currency && CURRENCIES[project.currency]
                ? CURRENCIES[project.currency]
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">Impuesto (%)</dt>
            <dd className="font-medium">
              {project.tax_rate != null ? String(project.tax_rate) : "—"}
            </dd>
          </div>
        </dl>
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
