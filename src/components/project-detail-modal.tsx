"use client";

import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAppFormatting } from "@/components/providers/app-formatting-provider";
import { CURRENCIES, getProjectStatusLabel } from "@/lib/utils";
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
  const { formatDate } = useAppFormatting();
  const tPhases = useTranslations("Phases");
  const tVP = useTranslations("ViewProject");
  const t = useTranslations("ProjectDetailModal");

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
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <dl className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">
              {t("projectName")}
            </dt>
            <dd className="font-medium">{project.name}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">{t("client")}</dt>
            <dd className="font-medium">{project.client?.full_name ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">{t("address")}</dt>
            <dd className="font-medium">{project.address ?? "—"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground text-sm">
              {t("descriptionLabel")}
            </dt>
            <dd className="font-medium whitespace-pre-wrap">
              {project.description ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">
              {t("projectPhase")}
            </dt>
            <dd className="font-medium">
              {project.phase ? tPhases(project.phase) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">{t("status")}</dt>
            <dd className="font-medium">
              {getProjectStatusLabel(project.status)}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">{t("startDate")}</dt>
            <dd className="font-medium">
              {startDate ? formatDate(startDate) : tVP("dateNotSet")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">
              {t("estimatedDeliveryDate")}
            </dt>
            <dd className="font-medium">
              {endDate ? formatDate(endDate) : tVP("dateNotSet")}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">{t("currency")}</dt>
            <dd className="font-medium">
              {project.currency && CURRENCIES[project.currency]
                ? CURRENCIES[project.currency]
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground text-sm">{t("tax")}</dt>
            <dd className="font-medium">
              {project.tax_rate != null ? String(project.tax_rate) : "—"}
            </dd>
          </div>
        </dl>
        <DialogFooter>
          {!readOnly && (
            <Button type="button" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              {t("edit")}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            {t("close")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
