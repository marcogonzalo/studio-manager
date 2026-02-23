"use client";

import { Suspense, useEffect, useState, useRef } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { PageLoading } from "@/components/loaders/page-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Project } from "@/types";
import { getPhaseLabel, formatDate, getProjectStatusLabel } from "@/lib/utils";
import { ProjectNotes } from "@/modules/app/projects/project-notes";
import { ProjectPurchases } from "@/modules/app/projects/project-purchases";
import { ProjectSpaces } from "@/modules/app/projects/project-spaces";
import { ProjectBudget } from "@/modules/app/projects/project-budget";
import { ProjectCostControl } from "@/modules/app/projects/project-cost-control";
import { ProjectDocuments } from "@/modules/app/projects/project-documents";
import { ProjectPayments } from "@/modules/app/projects/project-payments";
import { ProjectDashboard } from "@/modules/app/projects/project-dashboard";
import { ProjectDialog } from "@/components/project-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { Pencil, ChevronDown } from "lucide-react";

const VALID_TABS = [
  "overview",
  "spaces",
  "quotation",
  "expenses",
  "purchases",
  "payments",
  "documents",
  "notes",
] as const;

function ProjectDetailContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const id = params.id as string;
  const { effectivePlan } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const tabFromUrl = searchParams.get("tab");
  const initialTab =
    tabFromUrl && VALID_TABS.includes(tabFromUrl as (typeof VALID_TABS)[number])
      ? tabFromUrl
      : "overview";
  const [activeTab, setActiveTab] = useState(initialTab);
  const tabsListRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  const config = effectivePlan?.config;
  const costsDisabled = false;
  const purchasesDisabled =
    config?.purchase_orders === "none" || !config?.purchase_orders;
  const paymentsDisabled =
    config?.payments_management === "none" || !config?.payments_management;
  const documentsDisabled = config?.documents === "none" || !config?.documents;
  const expensesDisabled =
    config?.costs_management === "none" || !config?.costs_management;

  /** Solo mostrar el aviso de plan en pestañas que tengan algún elemento en modalidad basic o none */
  const currentTabHasRestrictedContent = (() => {
    const isBasicOrNone = (v: string | undefined) =>
      v === "basic" || v === "none" || !v;
    switch (activeTab) {
      case "spaces":
        return isBasicOrNone(config?.documents);
      case "quotation":
        return isBasicOrNone(config?.budget_mode);
      case "expenses":
        return isBasicOrNone(config?.costs_management);
      case "purchases":
        return isBasicOrNone(config?.purchase_orders);
      case "payments":
        return isBasicOrNone(config?.payments_management);
      case "documents":
        return isBasicOrNone(config?.documents);
      default:
        return false;
    }
  })();

  const setActiveTabAndUrl = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", tab);
      router.replace(url.pathname + url.search, { scroll: false });
    }
  };

  // Sync tab from URL on mount / navigation (e.g. back/forward)
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && VALID_TABS.includes(tab as (typeof VALID_TABS)[number])) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    if (
      (activeTab === "expenses" && costsDisabled) ||
      (activeTab === "purchases" && purchasesDisabled) ||
      (activeTab === "payments" && paymentsDisabled) ||
      (activeTab === "documents" && documentsDisabled)
    ) {
      setActiveTab("overview");
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("tab", "overview");
        router.replace(url.pathname + url.search, { scroll: false });
      }
    }
  }, [
    activeTab,
    costsDisabled,
    purchasesDisabled,
    paymentsDisabled,
    documentsDisabled,
    router,
  ]);

  async function fetchProject() {
    if (!id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(full_name)")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Error al cargar proyecto", { id: "project-load" });
    } else {
      setProject(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when id changes only
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

  if (loading) return <PageLoading variant="detail" />;
  if (!project)
    return <div className="text-muted-foreground">Proyecto no encontrado</div>;

  const isReadOnly =
    project.status === "completed" || project.status === "cancelled";

  return (
    <div className="space-y-6">
      <Collapsible>
        <div className="flex items-center justify-between">
          <CollapsibleTrigger className="group flex-1 text-left">
            <div
              className={
                project.status === "completed" || project.status === "cancelled"
                  ? "text-muted-foreground"
                  : undefined
              }
            >
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
                  {project.name}
                  <ChevronDown className="text-muted-foreground h-5 w-5 transition-transform group-data-[state=open]:rotate-180" />
                </h1>
                <div className="flex items-center gap-2">
                  <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                    {getProjectStatusLabel(project.status)}
                  </span>
                  {isReadOnly && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="bg-muted text-muted-foreground inline-flex cursor-help items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                            Solo lectura
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-brand-tertiary text-brand-tertiary-foreground">
                          No se pueden editar datos ni añadir contenido.
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
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
          {!isReadOnly && (
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(true)}
              className="shrink-0"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
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
                    ? formatDate(project.start_date)
                    : "No definida"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Fecha Estimada de Entrega
                </p>
                <p className="font-medium">
                  {project.end_date
                    ? formatDate(project.end_date)
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

      <Tabs value={activeTab} onValueChange={setActiveTabAndUrl}>
        <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
          <TabsList ref={tabsListRef} className="inline-flex w-max min-w-full">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="spaces">Espacios</TabsTrigger>
            <TabsTrigger value="quotation">Presupuesto</TabsTrigger>
            <TabsTrigger value="expenses" disabled={costsDisabled}>
              Control Costos
            </TabsTrigger>
            <TabsTrigger value="purchases" disabled={purchasesDisabled}>
              Compras
            </TabsTrigger>
            <TabsTrigger value="payments" disabled={paymentsDisabled}>
              Pagos
            </TabsTrigger>
            <TabsTrigger value="documents" disabled={documentsDisabled}>
              Documentos
            </TabsTrigger>
            <TabsTrigger value="notes">Notas</TabsTrigger>
          </TabsList>
        </div>
        {currentTabHasRestrictedContent && (
          <div
            className="bg-secondary/50 text-secondary-foreground border-border mt-2 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
            role="alert"
          >
            <span>
              Algunas secciones no están disponibles en tu plan.{" "}
              <Link
                href="/settings/plan/change"
                className="font-medium underline hover:no-underline"
              >
                Mejora tu plan
              </Link>
            </span>
          </div>
        )}

        <TabsContent value="overview">
          <ProjectDashboard
            projectId={id}
            readOnly={isReadOnly}
            disabled={false}
          />
        </TabsContent>

        <TabsContent value="spaces">
          <ProjectSpaces
            projectId={id}
            readOnly={isReadOnly}
            disabled={false}
          />
        </TabsContent>

        <TabsContent value="quotation">
          <ProjectBudget
            projectId={id}
            readOnly={isReadOnly}
            disabled={false}
          />
        </TabsContent>

        <TabsContent value="expenses">
          <ProjectCostControl
            projectId={id}
            readOnly={isReadOnly}
            disabled={expensesDisabled}
            costsManagementFull={config?.costs_management === "full"}
          />
        </TabsContent>

        <TabsContent value="purchases">
          <ProjectPurchases
            projectId={id}
            readOnly={isReadOnly}
            disabled={purchasesDisabled}
          />
        </TabsContent>

        <TabsContent value="payments">
          <ProjectPayments
            projectId={id}
            readOnly={isReadOnly}
            disabled={paymentsDisabled}
          />
        </TabsContent>

        <TabsContent value="documents">
          <ProjectDocuments
            projectId={id}
            readOnly={isReadOnly}
            disabled={documentsDisabled}
          />
        </TabsContent>

        <TabsContent value="notes">
          <ProjectNotes projectId={id} readOnly={isReadOnly} disabled={false} />
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

export default function ProjectDetailPage() {
  return (
    <Suspense fallback={<PageLoading variant="detail" />}>
      <ProjectDetailContent />
    </Suspense>
  );
}
