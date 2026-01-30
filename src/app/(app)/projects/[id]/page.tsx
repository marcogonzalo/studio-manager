"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabase";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Project } from "@/types";
import { getPhaseLabel } from "@/lib/utils";
import { ProjectNotes } from "@/modules/app/projects/project-notes";
import { ProjectPurchases } from "@/modules/app/projects/project-purchases";
import { ProjectSpaces } from "@/modules/app/projects/project-spaces";
import { ProjectBudget } from "@/modules/app/projects/project-budget";
import { ProjectCostControl } from "@/modules/app/projects/project-cost-control";
import { ProjectDocuments } from "@/modules/app/projects/project-documents";
import { ProjectPayments } from "@/modules/app/projects/project-payments";
import { ProjectDashboard } from "@/modules/app/projects/project-dashboard";
import { ProjectDialog } from "@/components/project-dialog";
import { toast } from "sonner";
import { Pencil, ChevronDown } from "lucide-react";

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("resumen");
  const tabsListRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  async function fetchProject() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(full_name)")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Error al cargar proyecto");
    } else {
      setProject(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProject();
  }, [id]);

  // Scroll to active tab when it changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!tabsListRef.current) return;

      const container = tabsListRef.current.parentElement;
      if (!container) return;

      const activeTrigger = tabsListRef.current.querySelector(
        `[data-state="active"]`
      ) as HTMLElement;
      if (!activeTrigger) return;

      const triggerLeft = activeTrigger.offsetLeft;
      const triggerWidth = activeTrigger.offsetWidth;
      const containerWidth = container.clientWidth;
      const scrollLeft = container.scrollLeft;

      const isFullyVisible =
        triggerLeft >= scrollLeft &&
        triggerLeft + triggerWidth <= scrollLeft + containerWidth;

      if (!isFullyVisible) {
        const targetScroll =
          triggerLeft - containerWidth / 2 + triggerWidth / 2;
        container.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: "smooth",
        });
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  if (loading) return <div className="text-muted-foreground">Cargando...</div>;
  if (!project)
    return <div className="text-muted-foreground">Proyecto no encontrado</div>;

  return (
    <div className="space-y-6">
      <Collapsible>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="group flex-1 text-left">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                  {project.name}
                  <ChevronDown className="text-muted-foreground h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                </h2>
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                    {project.status}
                  </span>
                  {project.phase && (
                    <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {getPhaseLabel(project.phase)}
                    </span>
                  )}
                </div>
              </div>
              <p className="text-muted-foreground">
                {project.client?.full_name}
              </p>
            </div>
          </CollapsibleTrigger>
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            className="shrink-0"
          >
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>

        <CollapsibleContent className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalles del Proyecto</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4">
              {project.address && (
                <div className="md:col-span-2">
                  <p className="text-muted-foreground text-sm">Dirección</p>
                  <p className="font-medium">{project.address}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm">Fecha Inicio</p>
                <p className="font-medium">
                  {project.start_date
                    ? new Date(project.start_date).toLocaleDateString("es-ES")
                    : "No definida"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Fecha Estimada de Entrega
                </p>
                <p className="font-medium">
                  {project.end_date
                    ? new Date(project.end_date).toLocaleDateString("es-ES")
                    : "No definida"}
                </p>
              </div>
              {project.description && (
                <div className="md:col-span-4">
                  <p className="text-muted-foreground text-sm">Descripción</p>
                  <p className="font-medium">{project.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
          <TabsList ref={tabsListRef} className="inline-flex w-max min-w-full">
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
            <TabsTrigger value="espacios">Espacios</TabsTrigger>
            <TabsTrigger value="presupuesto">Presupuesto</TabsTrigger>
            <TabsTrigger value="control">Control Costos</TabsTrigger>
            <TabsTrigger value="compras">Compras</TabsTrigger>
            <TabsTrigger value="pagos">Pagos</TabsTrigger>
            <TabsTrigger value="documentos">Documentos</TabsTrigger>
            <TabsTrigger value="notas">Notas</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="resumen">
          <ProjectDashboard projectId={id} />
        </TabsContent>

        <TabsContent value="espacios">
          <ProjectSpaces projectId={id} />
        </TabsContent>

        <TabsContent value="presupuesto">
          <ProjectBudget projectId={id} />
        </TabsContent>

        <TabsContent value="control">
          <ProjectCostControl projectId={id} />
        </TabsContent>

        <TabsContent value="compras">
          <ProjectPurchases projectId={id} />
        </TabsContent>

        <TabsContent value="pagos">
          <ProjectPayments projectId={id} />
        </TabsContent>

        <TabsContent value="documentos">
          <ProjectDocuments projectId={id} />
        </TabsContent>

        <TabsContent value="notas">
          <ProjectNotes projectId={id} />
        </TabsContent>
      </Tabs>

      <ProjectDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        project={project}
        onSuccess={() => {
          setIsEditDialogOpen(false);
          fetchProject();
        }}
      />
    </div>
  );
}
