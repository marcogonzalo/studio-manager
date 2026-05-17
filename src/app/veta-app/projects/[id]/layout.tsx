"use client";

import { Suspense, useEffect, useState, useRef, useMemo, use } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { usePlanCapability } from "@/lib/use-plan-capability";
import { PageLoading } from "@/components/loaders/page-loading";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Project } from "@/types";
import { appPath } from "@/lib/app-paths";
import { getPhaseLabel, getProjectStatusLabel } from "@/lib/utils";
import { ProjectDialog } from "@/components/project-dialog";
import { ProjectDetailModal } from "@/components/project-detail-modal";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { FileText, Eye, EyeOff } from "lucide-react";
import { ProjectShareDialog } from "@/components/dialogs/project-share-dialog";
import { ProjectContext } from "./project-context";

function ProjectLayoutContent({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { id: string };
}) {
  const t = useTranslations("ProjectDetailPage");
  const pathname = usePathname();
  const router = useRouter();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [activeProjects, setActiveProjects] = useState<
    { id: string; name: string; status: string }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [shareViewEnabled, setShareViewEnabled] = useState<boolean | null>(
    null
  );

  const tabsListRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  const purchasesDisabled = !usePlanCapability("purchase_orders");
  const paymentsDisabled = !usePlanCapability("payments_management");
  const documentsDisabled = !usePlanCapability("documents");
  const expensesDisabled = !usePlanCapability("costs_management");
  const costsDisabled = false;
  const advancedCostOptionsEnabled = usePlanCapability("costs_management", {
    minModality: "plus",
  });

  const budgetModeAtLeastPlus = usePlanCapability("pdf_export_mode", {
    minModality: "plus",
  });
  const costsManagementAtLeastPlus = usePlanCapability("costs_management", {
    minModality: "plus",
  });
  const purchaseOrdersAtLeastPlus = usePlanCapability("purchase_orders", {
    minModality: "plus",
  });
  const paymentsManagementAtLeastPlus = usePlanCapability(
    "payments_management",
    { minModality: "plus" }
  );

  const capabilities = useMemo(
    () => ({
      costsDisabled,
      purchasesDisabled,
      paymentsDisabled,
      documentsDisabled,
      expensesDisabled,
      advancedCostOptionsEnabled,
      budgetModeAtLeastPlus,
      costsManagementAtLeastPlus,
      purchaseOrdersAtLeastPlus,
      paymentsManagementAtLeastPlus,
    }),
    [
      costsDisabled,
      purchasesDisabled,
      paymentsDisabled,
      documentsDisabled,
      expensesDisabled,
      advancedCostOptionsEnabled,
      budgetModeAtLeastPlus,
      costsManagementAtLeastPlus,
      purchaseOrdersAtLeastPlus,
      paymentsManagementAtLeastPlus,
    ]
  );

  const pathSegments = pathname.split("/").filter(Boolean);
  const lastSegment = pathSegments[pathSegments.length - 1];
  const activeTab = lastSegment === id ? "overview" : lastSegment;

  const currentTabHasRestrictedContent = (() => {
    switch (activeTab) {
      case "spaces":
        return documentsDisabled;
      case "quotation":
        return !budgetModeAtLeastPlus;
      case "expenses":
        return !costsManagementAtLeastPlus;
      case "purchases":
        return !purchaseOrdersAtLeastPlus;
      case "payments":
        return !paymentsManagementAtLeastPlus;
      case "documents":
        return documentsDisabled;
      default:
        return false;
    }
  })();

  const setActiveTabAndUrl = (tab: string) => {
    if (tab === "overview") {
      router.push(appPath(`/projects/${id}`));
    } else {
      router.push(appPath(`/projects/${id}/${tab}`));
    }
  };

  useEffect(() => {
    if (
      (activeTab === "expenses" && costsDisabled) ||
      (activeTab === "purchases" && purchasesDisabled) ||
      (activeTab === "payments" && paymentsDisabled) ||
      (activeTab === "documents" && documentsDisabled)
    ) {
      router.replace(appPath(`/projects/${id}`), { scroll: false });
    }
  }, [
    activeTab,
    costsDisabled,
    purchasesDisabled,
    paymentsDisabled,
    documentsDisabled,
    router,
    id,
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
      toast.error(t("toastLoadError"), { id: "project-load" });
    } else {
      setProject(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchProject();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when id changes only
  }, [id]);

  async function fetchActiveProjects() {
    const { data, error } = await supabase
      .from("projects")
      .select("id, name, status")
      .or(`status.eq.active,id.eq.${id}`)
      .order("status", { ascending: true })
      .order("name");
    if (!error && data) {
      const list = data as { id: string; name: string; status: string }[];
      const deduped = list.filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
      );
      setActiveProjects(deduped);
    }
  }

  useEffect(() => {
    if (id) fetchActiveProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when id changes only
  }, [id]);

  async function fetchShareLinkStatus() {
    if (!id) return;
    const { data } = await supabase
      .from("projects")
      .select("is_public_enabled")
      .eq("id", id)
      .single();
    setShareViewEnabled(data?.is_public_enabled ?? false);
  }

  useEffect(() => {
    if (id) fetchShareLinkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when id changes only
  }, [id]);

  function handleShareDialogOpenChange(open: boolean) {
    setIsShareDialogOpen(open);
    if (!open) fetchShareLinkStatus();
  }

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const rafId = requestAnimationFrame(() => {
      timeoutId = setTimeout(() => {
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
    });
    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [activeTab]);

  if (loading) return <PageLoading variant="detail" />;
  if (!project)
    return <div className="text-muted-foreground">{t("notFound")}</div>;

  const isReadOnly =
    project.status === "completed" || project.status === "cancelled";

  const handleProjectSwitch = (projectId: string) => {
    if (projectId === id) return;
    router.push(appPath(`/projects/${projectId}`));
  };

  return (
    <ProjectContext.Provider value={{ project, isReadOnly, capabilities }}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            <div className="w-[fit-content] self-start">
              <Select value={id} onValueChange={handleProjectSwitch}>
                <SelectTrigger className="text-muted-foreground h-auto min-h-12 w-[fit-content] max-w-full border-0 bg-transparent py-2 pr-16 text-left text-2xl font-bold shadow-none focus:ring-0 sm:text-3xl [&>svg]:ml-0 [&>svg]:h-8 [&>svg]:w-8">
                  <SelectValue>
                    <span
                      className={
                        project.status === "completed" ||
                        project.status === "cancelled"
                          ? "text-muted-foreground"
                          : undefined
                      }
                    >
                      {project.name}
                    </span>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {activeProjects.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="font-medium">{p.name}</span>
                      {p.status !== "active" && (
                        <span className="text-muted-foreground ml-2 text-xs">
                          {getProjectStatusLabel(p.status)}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
              {getProjectStatusLabel(project.status)}
            </span>
            {isReadOnly && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="bg-muted text-muted-foreground inline-flex cursor-help items-center rounded-full px-2.5 py-0.5 text-xs font-medium">
                      {t("readOnly")}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent variant="tertiary">
                    {t("readOnlyDescription")}
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
          <Button
            variant="secondary"
            onClick={() => setIsShareDialogOpen(true)}
            className="shrink-0"
          >
            {shareViewEnabled ? (
              <Eye className="mr-2 h-4 w-4" />
            ) : (
              <EyeOff className="mr-2 h-4 w-4" />
            )}
            {t("publicView")}
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsDetailModalOpen(true)}
            className="shrink-0"
          >
            <FileText className="mr-2 h-4 w-4" />
            {t("detail")}
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTabAndUrl}>
          <div className="scrollbar-hide -mx-4 overflow-x-auto px-4">
            <TabsList
              ref={tabsListRef}
              className="inline-flex w-max min-w-full"
            >
              <TabsTrigger value="overview">{t("tabs.overview")}</TabsTrigger>
              <TabsTrigger value="spaces">{t("tabs.spaces")}</TabsTrigger>
              <TabsTrigger value="quotation">{t("tabs.quotation")}</TabsTrigger>
              <TabsTrigger value="expenses" disabled={costsDisabled}>
                {t("tabs.expenses")}
              </TabsTrigger>
              <TabsTrigger value="purchases" disabled={purchasesDisabled}>
                {t("tabs.purchases")}
              </TabsTrigger>
              <TabsTrigger value="payments" disabled={paymentsDisabled}>
                {t("tabs.payments")}
              </TabsTrigger>
              <TabsTrigger value="documents" disabled={documentsDisabled}>
                {t("tabs.documents")}
              </TabsTrigger>
              <TabsTrigger value="notes">{t("tabs.notes")}</TabsTrigger>
            </TabsList>
          </div>
          {currentTabHasRestrictedContent && (
            <div
              className="bg-secondary/50 text-secondary-foreground border-border mt-2 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
              role="alert"
            >
              <span>
                {t("upgradeHint")}{" "}
                <Link
                  href={appPath("/settings/plan/change")}
                  className="font-medium underline hover:no-underline"
                >
                  {t("upgradeCta")}
                </Link>
              </span>
            </div>
          )}

          <TabsContent value={activeTab}>{children}</TabsContent>
        </Tabs>

        <ProjectDetailModal
          open={isDetailModalOpen}
          onOpenChange={setIsDetailModalOpen}
          project={project}
          onEdit={() => setIsEditDialogOpen(true)}
          readOnly={isReadOnly}
        />
        <ProjectShareDialog
          open={isShareDialogOpen}
          onOpenChange={handleShareDialogOpenChange}
          projectId={id}
        />
        <ProjectDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          project={project}
          onSuccess={() => {
            setIsEditDialogOpen(false);
            fetchProject();
            fetchActiveProjects();
          }}
        />
      </div>
    </ProjectContext.Provider>
  );
}

export default function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  return (
    <Suspense fallback={<PageLoading variant="detail" />}>
      <ProjectLayoutContent params={resolvedParams}>
        {children}
      </ProjectLayoutContent>
    </Suspense>
  );
}
