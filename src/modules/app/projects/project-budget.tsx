"use client";

import type { Locale } from "@/i18n/config";
import { Fragment, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { useProjectBudgetLines } from "@/lib/use-project-budget-lines";
import { Button } from "@/components/ui/button";
import {
  ExpandableRowActionsMenu,
  ExpandableRowActionsPanel,
  MobileDetailField,
  TableCellMd,
  TableHeadExpandPlaceholder,
  TableHeadMd,
  TableRowExpandTrigger,
  TableRowMobileDetail,
  useExpandableTableRow,
  type ExpandableTableRowAction,
} from "@/components/ui/expandable-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  Trash2,
  Printer,
  Pencil,
  ChevronDown,
  Clock,
  Truck,
  PackageCheck,
  Wrench,
  Check,
  XCircle,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddItemDialog } from "@/components/dialogs/add-item-dialog";
import { BudgetLineDialog } from "@/components/dialogs/budget-line-dialog";
import {
  BudgetPrintOptionsDialog,
  type BudgetPrintOption,
} from "@/components/dialogs/budget-print-options-dialog";
import { ProductDetailModal } from "@/components/product-detail-modal";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { toast } from "sonner";
import { ItemPriceOrTbd } from "@/components/price-tbd-pill";
import { useAuth } from "@/components/auth-provider";
import { useAppFormatting } from "@/components/providers/app-formatting-provider";
import { usePlanCapability } from "@/lib/use-plan-capability";
import {
  getDemoAccountMessage,
  getErrorMessage,
  reportError,
} from "@/lib/utils";
import {
  BUDGET_PHASE_DISPLAY_ORDER,
  groupBudgetLinesByPhaseThenCategory,
  groupItemsBySpaceThenCreatedAt,
  orderedBudgetCategoryKeys,
} from "@/lib/project-list-order";
import { usePhaseLabel } from "@/lib/use-project-labels";
import {
  budgetLineEstimatedAmount,
  hasBudgetLinesWithTbd,
  hasPricedItemsWithTbd,
  itemSaleAmount,
  sumBudgetLineEstimatedAmounts,
  sumItemSaleAmounts,
} from "@/lib/project-item-price";
import {
  computeTaxGroups,
  effectiveLineTaxRate,
  formatTaxRatePercent,
  sumTaxAmounts,
} from "@/lib/tax-totals";

import type {
  Project,
  ProjectBudgetLine,
  ProjectItem,
  BudgetCategory,
  ProjectPhase,
} from "@/types";
import { ProjectTabContent, TabSectionHeader } from "./project-tab-content";

export function ProjectBudget({
  projectId,
  readOnly = false,
  disabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("ProjectModuleBudget");
  const locale = useLocale() as Locale;
  const ts = useTranslations("ProjectModuleShared");
  const phaseLabel = usePhaseLabel();
  const { formatCurrency: formatCurrencyWithSettings, lang } =
    useAppFormatting();
  const { user, effectivePlan } = useAuth();
  const printFilterOptionsEnabled = usePlanCapability("pdf_export_mode", {
    minModality: "full",
  });
  const showVetaBranding =
    effectivePlan?.config?.pdf_export_mode === "basic" ||
    effectivePlan?.config?.pdf_export_mode === "plus";
  const supabase = getSupabaseClient();
  const { budgetLines, refetch: refetchBudgetLines } = useProjectBudgetLines(
    projectId,
    { excludeInternal: true, autoFetch: false }
  );

  const [items, setItems] = useState<ProjectItem[]>([]);
  const [project, setProject] = useState<
    | (Project & {
        client?: {
          full_name: string;
          email?: string;
          phone?: string;
          address?: string;
        };
      })
    | null
  >(null);
  const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
  const [isBudgetLineDialogOpen, setIsBudgetLineDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProjectItem | null>(null);
  const [editingBudgetLine, setEditingBudgetLine] =
    useState<ProjectBudgetLine | null>(null);
  const [selectedItem, setSelectedItem] = useState<ProjectItem | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isPrintOptionsOpen, setIsPrintOptionsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    products: true,
  });
  const { toggleRow, isExpanded } = useExpandableTableRow();
  const mobileVisibleColumnCount = 3;
  const [deleteTarget, setDeleteTarget] = useState<
    { kind: "item"; id: string } | { kind: "budgetLine"; id: string } | null
  >(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch project with client info
      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .select("*, client:clients(full_name, email, phone, address)")
        .eq("id", projectId)
        .single();

      if (!projectError && projectData) {
        setProject(projectData);
      } else if (projectError) {
        reportError(projectError, "Error fetching project:");
        setError(t("toastLoadProjectError"));
      }

      // Fetch project items (products)
      const { data: itemsData, error: itemsError } = await supabase
        .from("project_items")
        .select(
          "*, space:spaces(name, created_at), product:products(name, supplier:suppliers(name), description, reference_code, category, image_url), purchase_order:purchase_orders(order_number, status, delivery_deadline, delivery_date)"
        )
        .eq("project_id", projectId)
        .order("created_at");

      if (itemsError) {
        reportError(itemsError, "Error fetching items:");
        setItems([]);
      } else {
        setItems(itemsData || []);
      }

      await refetchBudgetLines();
    } catch (error: unknown) {
      reportError(error, "Unexpected error in fetchData:");
      setError(
        t("toastUnexpectedLoadError", {
          message: getErrorMessage(error, locale),
        })
      );
      setItems([]);
      await refetchBudgetLines();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when projectId changes only
  }, [projectId]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      if (deleteTarget.kind === "item") {
        await supabase.from("project_items").delete().eq("id", deleteTarget.id);
        toast.success(t("toastItemDeleted"));
        setDeleteTarget(null);
        fetchData();
        return;
      }

      const { error } = await supabase
        .from("project_budget_lines")
        .delete()
        .eq("id", deleteTarget.id);
      if (error) {
        const demoMsg = getDemoAccountMessage(error, locale);
        if (demoMsg) {
          toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
            duration: 5000,
          });
        } else {
          toast.error(t("toastDeleteLineError"));
          reportError(error, "Error deleting budget line:");
        }
        return;
      }
      toast.success(t("toastLineDeleted"));
      setDeleteTarget(null);
      refetchBudgetLines();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditItem = (item: ProjectItem) => {
    setEditingItem(item);
    setIsItemDialogOpen(true);
  };

  const handleEditBudgetLine = (line: ProjectBudgetLine) => {
    setEditingBudgetLine(line);
    setIsBudgetLineDialogOpen(true);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setIsItemDialogOpen(true);
  };

  const handleAddBudgetLine = () => {
    setEditingBudgetLine(null);
    setIsBudgetLineDialogOpen(true);
  };

  const handleGeneratePDF = async (option: BudgetPrintOption) => {
    if (!project) {
      toast.error(t("toastProjectInfoError"));
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const { generateProjectPDF } = await import("@/lib/pdf-generator");
      let architectName: string | undefined;
      let architectEmail: string | undefined;
      if (user?.id) {
        const { data: settings } = await supabase
          .from("account_settings")
          .select("public_name, public_email")
          .eq("user_id", user.id)
          .single();
        const { data: profile } = await supabase
          .from("profiles")
          .select("email")
          .eq("id", user.id)
          .single();
        architectName = settings?.public_name?.trim() || undefined;
        architectEmail =
          settings?.public_email?.trim() || profile?.email?.trim() || undefined;
      }
      const taxRate =
        project.tax_rate !== null && project.tax_rate !== undefined
          ? project.tax_rate
          : 0;

      const origin =
        typeof window !== "undefined" ? window.location.origin : undefined;
      const { attachPdfItemThumbnails, fetchImageAsDataUrl } =
        await import("@/lib/pdf-item-images");
      const itemsToPdf = option === "lines" ? [] : includedItems;
      const itemsWithThumbs = await attachPdfItemThumbnails(
        itemsToPdf,
        fetch,
        origin
      );
      const linesToPdf = option === "products" ? [] : budgetLines;

      // Logo as data URL so react-pdf embeds it without a CORS fetch
      let vetaLogoDataUrl: string | undefined;
      if (origin && showVetaBranding) {
        vetaLogoDataUrl =
          (await fetchImageAsDataUrl(
            `${origin}/img/veta-logo.png`,
            fetch,
            origin
          )) ?? undefined;
      }
      const asPdf = await generateProjectPDF(
        project,
        itemsWithThumbs,
        linesToPdf,
        taxRate,
        architectName,
        architectEmail,
        showVetaBranding,
        vetaLogoDataUrl,
        lang
      );
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${t("pdfFilenamePrefix")}_${project.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t("toastPdfGenerated"));
    } catch (error) {
      reportError(error, "Error generating PDF:");
      toast.error(t("toastPdfError"));
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const budgetLinesByPhaseAndCategory =
    groupBudgetLinesByPhaseThenCategory(budgetLines);

  // Exclude products marked as excluded from display and totals
  const includedItems = items.filter((item) => !item.is_excluded);
  const itemsBySpace = groupItemsBySpaceThenCreatedAt(
    includedItems,
    t("spaceGeneral")
  );
  const tbdLabel = t("priceTbd");
  const hasPriceTbd =
    hasPricedItemsWithTbd(includedItems) || hasBudgetLinesWithTbd(budgetLines);

  // Calculate totals
  const totalItemsPrice = sumItemSaleAmounts(includedItems);
  const totalBudgetLinesEstimated = sumBudgetLineEstimatedAmounts(budgetLines);

  // For client budget, we use estimated_amount as the price shown
  const grandTotal = totalItemsPrice + totalBudgetLinesEstimated;
  const taxGroups = computeTaxGroups(
    [
      ...includedItems.map((item) => ({
        amount: itemSaleAmount(item),
        tax_rate: item.tax_rate,
      })),
      ...budgetLines.map((line) => ({
        amount: budgetLineEstimatedAmount(line),
        tax_rate: line.tax_rate,
      })),
    ],
    {
      multitax: project?.multitax === true,
      tax_rate: project?.tax_rate ?? 0,
    }
  );
  const taxAmountTotal = sumTaxAmounts(taxGroups);
  const totalWithTax = grandTotal + taxAmountTotal;
  const taxProjectCtx = {
    multitax: project?.multitax === true,
    tax_rate: project?.tax_rate ?? 0,
  };

  const formatCurrency = (amount: number) =>
    formatCurrencyWithSettings(amount, project?.currency);
  const categoryLabels: Record<BudgetCategory, string> = {
    construction: t("budgetCategory.construction"),
    own_fees: t("budgetCategory.own_fees"),
    external_services: t("budgetCategory.external_services"),
    operations: t("budgetCategory.operations"),
  };
  const subcategoryLabels: Record<BudgetCategory, Record<string, string>> = {
    construction: {
      demolition: t("budgetSubcategory.construction.demolition"),
      masonry: t("budgetSubcategory.construction.masonry"),
      electricity: t("budgetSubcategory.construction.electricity"),
      plumbing: t("budgetSubcategory.construction.plumbing"),
      interior_painting: t("budgetSubcategory.construction.interior_painting"),
      exterior_painting: t("budgetSubcategory.construction.exterior_painting"),
      domotics: t("budgetSubcategory.construction.domotics"),
      carpentry: t("budgetSubcategory.construction.carpentry"),
      locksmithing: t("budgetSubcategory.construction.locksmithing"),
      hvac: t("budgetSubcategory.construction.hvac"),
      flooring: t("budgetSubcategory.construction.flooring"),
      tiling: t("budgetSubcategory.construction.tiling"),
      other: t("budgetSubcategory.construction.other"),
    },
    own_fees: {
      design: t("budgetSubcategory.own_fees.design"),
      executive_project: t("budgetSubcategory.own_fees.executive_project"),
      site_supervision: t("budgetSubcategory.own_fees.site_supervision"),
      management: t("budgetSubcategory.own_fees.management"),
      other: t("budgetSubcategory.own_fees.other"),
    },
    external_services: {
      technical_architect: t(
        "budgetSubcategory.external_services.technical_architect"
      ),
      engineering: t("budgetSubcategory.external_services.engineering"),
      logistics: t("budgetSubcategory.external_services.logistics"),
      permits: t("budgetSubcategory.external_services.permits"),
      consulting: t("budgetSubcategory.external_services.consulting"),
      other: t("budgetSubcategory.external_services.other"),
    },
    operations: {
      shipping: t("budgetSubcategory.operations.shipping"),
      packaging: t("budgetSubcategory.operations.packaging"),
      transport: t("budgetSubcategory.operations.transport"),
      storage: t("budgetSubcategory.operations.storage"),
      insurance: t("budgetSubcategory.operations.insurance"),
      customs: t("budgetSubcategory.operations.customs"),
      handling: t("budgetSubcategory.operations.handling"),
      assembly: t("budgetSubcategory.operations.assembly"),
      other: t("budgetSubcategory.operations.other"),
    },
  };

  // Map delivery_deadline codes to readable labels (same as purchase-order-dialog options)
  const deliveryDeadlineLabel: Record<string, string> = {
    "1w": t("deliveryDeadline.1w"),
    "2w": t("deliveryDeadline.2w"),
    "3w": t("deliveryDeadline.3w"),
    "4w": t("deliveryDeadline.4w"),
    "6w": t("deliveryDeadline.6w"),
    tbd: t("deliveryDeadline.tbd"),
  };

  // Helper function to get status icon and label
  const getStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return {
          icon: Clock,
          label: t("status.pending"),
          className: "text-muted-foreground",
        };
      case "ordered":
        return {
          icon: Truck,
          label: t("status.ordered"),
          className: "text-blue-600 dark:text-blue-400",
        };
      case "received":
        return {
          icon: PackageCheck,
          label: t("status.received"),
          className: "text-cyan-600 dark:text-cyan-400",
        };
      case "installed":
        return {
          icon: Wrench,
          label: t("status.installed"),
          className: "text-orange-600 dark:text-orange-400",
        };
      case "completed":
        return {
          icon: Check,
          label: t("status.completed"),
          className: "text-green-600 dark:text-green-400",
        };
      case "canceled":
      case "cancelled":
        return {
          icon: XCircle,
          label: t("status.cancelled"),
          className: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          icon: Clock,
          label: status,
          className: "text-muted-foreground",
        };
    }
  };

  const phaseOrder = BUDGET_PHASE_DISPLAY_ORDER.filter(
    (phase) => budgetLinesByPhaseAndCategory[phase]
  );
  const extraPhases = Object.keys(budgetLinesByPhaseAndCategory).filter(
    (phase) =>
      !(BUDGET_PHASE_DISPLAY_ORDER as readonly string[]).includes(phase)
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-28 rounded-md" />
        </div>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button onClick={fetchData} variant="outline">
            {ts("retry")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ProjectTabContent
      disabled={disabled}
      disabledMessage={t("disabledMessage")}
    >
      <TooltipProvider>
        <div className="space-y-6">
          <TabSectionHeader title={t("title")}>
            <div className="flex space-x-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    className="shrink-0 print:hidden"
                    aria-label={t("exportAria")}
                  >
                    {t("export")}
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => setIsPrintOptionsOpen(true)}
                    disabled={isGeneratingPDF || !project}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    {isGeneratingPDF ? t("generatingPdf") : t("exportPdf")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {!readOnly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="shrink-0 print:hidden"
                      aria-label={t("addAria")}
                    >
                      {t("add")}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleAddBudgetLine}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("newBudgetLine")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleAddItem}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("addProduct")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </TabSectionHeader>

          {/* Grand Total Summary */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <h4 className="text-muted-foreground mb-2 font-medium">
                {t("totalBudget")}
              </h4>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs">
                    {t("budgetLinesTotal", {
                      amount: formatCurrency(totalBudgetLinesEstimated),
                    })}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {t("productsTotal", {
                      amount: formatCurrency(totalItemsPrice),
                    })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-0.5">
                  <p className="text-primary text-3xl font-bold">
                    {formatCurrency(grandTotal)}
                  </p>
                  {hasPriceTbd && (
                    <p className="text-muted-foreground max-w-[16rem] text-right text-xs">
                      {t("priceTbdNote")}
                    </p>
                  )}
                </div>
              </div>
              {taxGroups.length > 0 && (
                <div className="space-y-1 pt-2">
                  {taxGroups.map((group) => (
                    <div
                      key={group.rate}
                      className="flex items-center justify-between"
                    >
                      <p className="text-muted-foreground text-xs">
                        {t("taxLabel", {
                          rate: group.rate,
                          amount: formatCurrency(group.taxAmount),
                        })}
                      </p>
                      {taxGroups.length === 1 && (
                        <p className="text-muted-foreground text-xs font-medium">
                          {t("withTax", {
                            amount: formatCurrency(totalWithTax),
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                  {taxGroups.length > 1 && (
                    <div className="flex items-center justify-between pt-1">
                      <p className="text-muted-foreground text-xs font-medium">
                        {t("taxTotal", {
                          amount: formatCurrency(taxAmountTotal),
                        })}
                      </p>
                      <p className="text-muted-foreground text-xs font-medium">
                        {t("withTax", {
                          amount: formatCurrency(totalWithTax),
                        })}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Products Section */}
          <Collapsible
            open={openSections.products}
            onOpenChange={() => toggleSection("products")}
          >
            <Card className="border-l-primary border-l-4">
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-accent/30 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.products ? "" : "-rotate-90"}`}
                      />
                      {t("furnitureAndProducts")}
                    </CardTitle>
                    <span className="text-foreground font-semibold">
                      {formatCurrency(totalItemsPrice)}
                      {hasPricedItemsWithTbd(includedItems) ? "*" : ""}
                    </span>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="space-y-3 pt-0">
                  {items.length === 0 ? (
                    <p className="text-muted-foreground py-8 text-center">
                      {t("noProducts")}
                    </p>
                  ) : (
                    itemsBySpace.map(
                      ({ spaceKey, spaceName, items: spaceItems }) => {
                        const spaceSectionKey = `products_${spaceKey}`;
                        const spaceTotal = sumItemSaleAmounts(spaceItems);
                        const spaceHasTbd = hasPricedItemsWithTbd(spaceItems);
                        return (
                          <Collapsible
                            key={spaceKey}
                            open={openSections[spaceSectionKey] !== false}
                            onOpenChange={() => toggleSection(spaceSectionKey)}
                          >
                            <Card>
                              <CollapsibleTrigger asChild>
                                <CardHeader className="hover:bg-accent/30 cursor-pointer py-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center gap-2 text-sm">
                                      <ChevronDown
                                        className={`h-3 w-3 transition-transform ${openSections[spaceSectionKey] !== false ? "" : "-rotate-90"}`}
                                      />
                                      {spaceName}
                                    </CardTitle>
                                    <span className="text-foreground text-sm font-semibold">
                                      {formatCurrency(spaceTotal)}
                                      {spaceHasTbd ? "*" : ""}
                                    </span>
                                  </div>
                                </CardHeader>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <CardContent className="pt-0">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>{ts("colItem")}</TableHead>
                                        <TableHeadMd>
                                          {ts("colStatus")}
                                        </TableHeadMd>
                                        <TableHeadMd className="text-right">
                                          {ts("colQuantity")}
                                        </TableHeadMd>
                                        <TableHeadMd className="text-right">
                                          {ts("colUnitCost")}
                                        </TableHeadMd>
                                        <TableHeadMd className="text-right">
                                          {ts("colSalePrice")}
                                        </TableHeadMd>
                                        <TableHeadMd className="text-right">
                                          {ts("colTax")}
                                        </TableHeadMd>
                                        <TableHead className="text-right">
                                          {ts("colAmount")}
                                        </TableHead>
                                        <TableHeadMd className="w-[80px]" />
                                        <TableHeadExpandPlaceholder
                                          srLabel={ts("expandRow")}
                                        />
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {spaceItems.map((item) => {
                                        const expanded = isExpanded(item.id);
                                        const rowActions: ExpandableTableRowAction[] =
                                          readOnly
                                            ? []
                                            : [
                                                {
                                                  id: "edit",
                                                  label: ts("edit"),
                                                  icon: Pencil,
                                                  onClick: () =>
                                                    handleEditItem(item),
                                                },
                                                {
                                                  id: "delete",
                                                  label: ts("delete"),
                                                  icon: Trash2,
                                                  onClick: () =>
                                                    setDeleteTarget({
                                                      kind: "item",
                                                      id: item.id,
                                                    }),
                                                  destructive: true,
                                                },
                                              ];
                                        const imageSrc =
                                          item.image_url ||
                                          item.product?.image_url;
                                        const statusDisplay = getStatusDisplay(
                                          item.status
                                        );
                                        const StatusIcon = statusDisplay.icon;
                                        const po = item.purchase_order;
                                        const isOrderedNotReceived =
                                          item.status === "ordered" && po;
                                        const deliveryInfo =
                                          isOrderedNotReceived &&
                                          (po.delivery_date ||
                                            po.delivery_deadline)
                                            ? po.delivery_date
                                              ? `${t("deliveryPrefix")} ${new Date(po.delivery_date).toLocaleDateString(undefined, { day: "2-digit", month: "2-digit", year: "numeric" })}`
                                              : `${t("deliveryPrefix")} ${deliveryDeadlineLabel[po.delivery_deadline ?? ""] || po.delivery_deadline}`
                                            : null;
                                        const statusLabel =
                                          deliveryInfo ?? statusDisplay.label;
                                        const statusIndicator = (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="flex items-center justify-center">
                                                <StatusIcon
                                                  className={`h-4 w-4 ${statusDisplay.className} cursor-help`}
                                                />
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent variant="tertiary">
                                              <p>{statusLabel}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        );

                                        return (
                                          <Fragment key={item.id}>
                                            <TableRow>
                                              <TableCell>
                                                <div className="flex items-center gap-2.5">
                                                  {imageSrc ? (
                                                    <button
                                                      type="button"
                                                      className="relative h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded transition-opacity hover:opacity-80 md:h-8 md:w-8"
                                                      onClick={() => {
                                                        setSelectedItem(item);
                                                        setIsProductModalOpen(
                                                          true
                                                        );
                                                      }}
                                                    >
                                                      <Image
                                                        src={imageSrc}
                                                        alt={
                                                          item.product?.name ||
                                                          item.name
                                                        }
                                                        fill
                                                        className="object-cover"
                                                        sizes="40px"
                                                      />
                                                    </button>
                                                  ) : null}
                                                  <div className="min-w-0 flex-1">
                                                    <div className="max-w-[10rem] font-medium sm:max-w-none">
                                                      {item.product?.name ||
                                                        item.name}
                                                    </div>
                                                    {item.internal_reference && (
                                                      <div className="text-muted-foreground mt-1 font-mono text-xs">
                                                        {t("codePrefix")}{" "}
                                                        {
                                                          item.internal_reference
                                                        }
                                                      </div>
                                                    )}
                                                    <div className="text-muted-foreground text-xs">
                                                      {item.product?.supplier
                                                        ?.name || "-"}
                                                    </div>
                                                  </div>
                                                  <span className="shrink-0 md:hidden">
                                                    {statusIndicator}
                                                  </span>
                                                </div>
                                              </TableCell>
                                              <TableCellMd>
                                                {statusIndicator}
                                              </TableCellMd>
                                              <TableCellMd className="text-right tabular-nums">
                                                {item.quantity}
                                              </TableCellMd>
                                              <TableCellMd className="text-muted-foreground text-right tabular-nums">
                                                <ItemPriceOrTbd
                                                  item={item}
                                                  tbdLabel={tbdLabel}
                                                >
                                                  {formatCurrency(
                                                    item.unit_cost
                                                  )}
                                                </ItemPriceOrTbd>
                                              </TableCellMd>
                                              <TableCellMd className="text-right font-medium tabular-nums">
                                                <ItemPriceOrTbd
                                                  item={item}
                                                  tbdLabel={tbdLabel}
                                                >
                                                  {formatCurrency(
                                                    item.unit_price
                                                  )}
                                                </ItemPriceOrTbd>
                                              </TableCellMd>
                                              <TableCellMd className="text-muted-foreground text-right tabular-nums">
                                                {formatTaxRatePercent(
                                                  effectiveLineTaxRate(
                                                    item,
                                                    taxProjectCtx
                                                  )
                                                )}
                                              </TableCellMd>
                                              <TableCell className="text-right font-bold tabular-nums">
                                                <ItemPriceOrTbd
                                                  item={item}
                                                  tbdLabel={tbdLabel}
                                                >
                                                  {formatCurrency(
                                                    item.unit_price *
                                                      item.quantity
                                                  )}
                                                </ItemPriceOrTbd>
                                              </TableCell>
                                              <TableCellMd className="text-right">
                                                <ExpandableRowActionsMenu
                                                  actions={rowActions}
                                                  menuAriaLabel={t(
                                                    "productActionsAria"
                                                  )}
                                                />
                                              </TableCellMd>
                                              <TableRowExpandTrigger
                                                expanded={expanded}
                                                onToggle={() =>
                                                  toggleRow(item.id)
                                                }
                                                expandLabel={t(
                                                  "expandProductDetails"
                                                )}
                                                collapseLabel={t(
                                                  "collapseProductDetails"
                                                )}
                                              />
                                            </TableRow>
                                            <TableRowMobileDetail
                                              open={expanded}
                                              colSpan={mobileVisibleColumnCount}
                                            >
                                              <div className="space-y-2">
                                                <MobileDetailField
                                                  label={ts("colQuantity")}
                                                  value={item.quantity}
                                                />
                                                <MobileDetailField
                                                  label={ts("colUnitCost")}
                                                  value={
                                                    <ItemPriceOrTbd
                                                      item={item}
                                                      tbdLabel={tbdLabel}
                                                    >
                                                      {formatCurrency(
                                                        item.unit_cost
                                                      )}
                                                    </ItemPriceOrTbd>
                                                  }
                                                />
                                                <MobileDetailField
                                                  label={ts("colSalePrice")}
                                                  value={
                                                    <ItemPriceOrTbd
                                                      item={item}
                                                      tbdLabel={tbdLabel}
                                                    >
                                                      {formatCurrency(
                                                        item.unit_price
                                                      )}
                                                    </ItemPriceOrTbd>
                                                  }
                                                />
                                                <MobileDetailField
                                                  label={ts("colTax")}
                                                  value={formatTaxRatePercent(
                                                    effectiveLineTaxRate(
                                                      item,
                                                      taxProjectCtx
                                                    )
                                                  )}
                                                />
                                                <ExpandableRowActionsPanel
                                                  actions={rowActions}
                                                />
                                              </div>
                                            </TableRowMobileDetail>
                                          </Fragment>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        );
                      }
                    )
                  )}
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Budget Lines by Phase and Category */}
          {[...phaseOrder, ...extraPhases].map((phase) => {
            const phaseData = budgetLinesByPhaseAndCategory[phase];
            if (!phaseData) return null;

            // Check if this phase has any lines
            const hasLines = Object.values(phaseData).some(
              (lines) => lines.length > 0
            );
            if (!hasLines) return null;

            const phaseTotal = Object.values(phaseData).reduce(
              (sum, lines) => sum + sumBudgetLineEstimatedAmounts(lines),
              0
            );

            const phaseSectionKey = `phase_${phase}`;

            return (
              <div key={phase} className="space-y-3">
                <Collapsible
                  open={openSections[phaseSectionKey] !== false}
                  onOpenChange={() => toggleSection(phaseSectionKey)}
                >
                  <Card className="border-l-primary border-l-4">
                    <CollapsibleTrigger asChild>
                      <CardHeader className="hover:bg-accent/30 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <ChevronDown
                              className={`h-4 w-4 transition-transform ${openSections[phaseSectionKey] !== false ? "" : "-rotate-90"}`}
                            />
                            {phase === "no_phase"
                              ? t("noPhase")
                              : phaseLabel(phase as ProjectPhase)}
                          </CardTitle>
                          <span className="text-foreground font-semibold">
                            {formatCurrency(phaseTotal)}
                          </span>
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="space-y-3 pt-0">
                        {orderedBudgetCategoryKeys(phaseData).map(
                          (category) => {
                            const lines = phaseData[category] || [];
                            if (lines.length === 0) return null;
                            const categoryKey = category as BudgetCategory;

                            const categoryTotal =
                              sumBudgetLineEstimatedAmounts(lines);
                            const categorySectionKey = `${phaseSectionKey}_${category}`;

                            return (
                              <Collapsible
                                key={category}
                                open={
                                  openSections[categorySectionKey] !== false
                                }
                                onOpenChange={() =>
                                  toggleSection(categorySectionKey)
                                }
                              >
                                <Card>
                                  <CollapsibleTrigger asChild>
                                    <CardHeader className="hover:bg-accent/30 cursor-pointer py-3">
                                      <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-sm">
                                          <ChevronDown
                                            className={`h-3 w-3 transition-transform ${openSections[categorySectionKey] !== false ? "" : "-rotate-90"}`}
                                          />
                                          {categoryLabels[categoryKey] ??
                                            category}
                                        </CardTitle>
                                        <span className="text-foreground text-sm font-semibold">
                                          {formatCurrency(categoryTotal)}
                                        </span>
                                      </div>
                                    </CardHeader>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <CardContent className="pt-0">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>
                                              {ts("colConcept")}
                                            </TableHead>
                                            <TableHeadMd>
                                              {ts("colDescription")}
                                            </TableHeadMd>
                                            <TableHeadMd className="text-right">
                                              {ts("colTax")}
                                            </TableHeadMd>
                                            <TableHead className="text-right">
                                              {ts("colAmount")}
                                            </TableHead>
                                            <TableHeadMd className="w-[80px]" />
                                            <TableHeadExpandPlaceholder
                                              srLabel={ts("expandRow")}
                                            />
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {lines.map((line) => {
                                            const expanded = isExpanded(
                                              line.id
                                            );
                                            const rowActions: ExpandableTableRowAction[] =
                                              readOnly
                                                ? []
                                                : [
                                                    {
                                                      id: "edit",
                                                      label: ts("edit"),
                                                      icon: Pencil,
                                                      onClick: () =>
                                                        handleEditBudgetLine(
                                                          line
                                                        ),
                                                    },
                                                    {
                                                      id: "delete",
                                                      label: ts("delete"),
                                                      icon: Trash2,
                                                      onClick: () =>
                                                        setDeleteTarget({
                                                          kind: "budgetLine",
                                                          id: line.id,
                                                        }),
                                                      destructive: true,
                                                    },
                                                  ];

                                            return (
                                              <Fragment key={line.id}>
                                                <TableRow>
                                                  <TableCell className="max-w-[8rem] truncate font-medium sm:max-w-none">
                                                    {subcategoryLabels[
                                                      categoryKey
                                                    ]?.[line.subcategory] ??
                                                      line.subcategory}
                                                  </TableCell>
                                                  <TableCellMd className="text-muted-foreground">
                                                    {line.description || "-"}
                                                  </TableCellMd>
                                                  <TableCellMd className="text-muted-foreground text-right tabular-nums">
                                                    {formatTaxRatePercent(
                                                      effectiveLineTaxRate(
                                                        line,
                                                        taxProjectCtx
                                                      )
                                                    )}
                                                  </TableCellMd>
                                                  <TableCell className="text-right font-semibold tabular-nums">
                                                    <ItemPriceOrTbd
                                                      item={line}
                                                      tbdLabel={tbdLabel}
                                                    >
                                                      {formatCurrency(
                                                        Number(
                                                          line.estimated_amount
                                                        )
                                                      )}
                                                    </ItemPriceOrTbd>
                                                  </TableCell>
                                                  <TableCellMd className="text-right">
                                                    <ExpandableRowActionsMenu
                                                      actions={rowActions}
                                                      menuAriaLabel={t(
                                                        "budgetLineActionsAria"
                                                      )}
                                                    />
                                                  </TableCellMd>
                                                  <TableRowExpandTrigger
                                                    expanded={expanded}
                                                    onToggle={() =>
                                                      toggleRow(line.id)
                                                    }
                                                    expandLabel={t(
                                                      "expandLineDetails"
                                                    )}
                                                    collapseLabel={t(
                                                      "collapseLineDetails"
                                                    )}
                                                  />
                                                </TableRow>
                                                <TableRowMobileDetail
                                                  open={expanded}
                                                  colSpan={
                                                    mobileVisibleColumnCount
                                                  }
                                                >
                                                  <div className="space-y-2">
                                                    <MobileDetailField
                                                      label={ts(
                                                        "colDescription"
                                                      )}
                                                      value={
                                                        line.description || "-"
                                                      }
                                                    />
                                                    <MobileDetailField
                                                      label={ts("colTax")}
                                                      value={formatTaxRatePercent(
                                                        effectiveLineTaxRate(
                                                          line,
                                                          taxProjectCtx
                                                        )
                                                      )}
                                                    />
                                                    <ExpandableRowActionsPanel
                                                      actions={rowActions}
                                                    />
                                                  </div>
                                                </TableRowMobileDetail>
                                              </Fragment>
                                            );
                                          })}
                                        </TableBody>
                                      </Table>
                                    </CardContent>
                                  </CollapsibleContent>
                                </Card>
                              </Collapsible>
                            );
                          }
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            );
          })}

          {/* Dialogs */}
          <AddItemDialog
            open={isItemDialogOpen}
            onOpenChange={(open) => {
              setIsItemDialogOpen(open);
              if (!open) setEditingItem(null);
            }}
            projectId={projectId}
            item={editingItem}
            onSuccess={() => {
              setIsItemDialogOpen(false);
              setEditingItem(null);
              fetchData();
            }}
          />

          <BudgetLineDialog
            open={isBudgetLineDialogOpen}
            onOpenChange={(open) => {
              setIsBudgetLineDialogOpen(open);
              if (!open) setEditingBudgetLine(null);
            }}
            projectId={projectId}
            budgetLine={editingBudgetLine}
            onSuccess={() => {
              setIsBudgetLineDialogOpen(false);
              setEditingBudgetLine(null);
              fetchData();
            }}
          />

          <ProductDetailModal
            open={isProductModalOpen}
            onOpenChange={setIsProductModalOpen}
            projectItem={selectedItem}
            projectId={projectId}
            currency={project?.currency}
            onEdit={
              readOnly
                ? undefined
                : () => {
                    setIsProductModalOpen(false);
                    setEditingItem(selectedItem);
                    setIsItemDialogOpen(true);
                  }
            }
          />

          <BudgetPrintOptionsDialog
            open={isPrintOptionsOpen}
            onOpenChange={setIsPrintOptionsOpen}
            onConfirm={handleGeneratePDF}
            isGenerating={isGeneratingPDF}
            printFilterOptionsEnabled={printFilterOptionsEnabled}
          />

          <ConfirmDeleteDialog
            open={deleteTarget !== null}
            onOpenChange={(open) => !open && setDeleteTarget(null)}
            title={
              deleteTarget?.kind === "item"
                ? t("confirmDeleteItem")
                : t("confirmDeleteLine")
            }
            description={ts("confirmDeleteDescription")}
            onConfirm={handleConfirmDelete}
            loading={deleteLoading}
          />
        </div>
      </TooltipProvider>
    </ProjectTabContent>
  );
}
