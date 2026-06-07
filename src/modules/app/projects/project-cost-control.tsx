"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
  Plus,
  Trash2,
  Pencil,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
} from "lucide-react";
import { BudgetLineDialog } from "@/components/dialogs/budget-line-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { toast } from "sonner";
import {
  getDemoAccountMessage,
  reportError,
  COST_CATEGORIES,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/utils";
import { usePhaseLabel } from "@/lib/use-project-labels";

import type { ProjectBudgetLine, ProjectItem, BudgetCategory } from "@/types";
import { ProjectTabContent, TabSectionHeader } from "./project-tab-content";

export function ProjectCostControl({
  projectId,
  readOnly = false,
  disabled = false,
  advancedCostOptionsEnabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
  /** Si true, muestra margen y desviación %. Precio de venta y coste siempre se muestran. */
  advancedCostOptionsEnabled?: boolean;
}) {
  const t = useTranslations("ProjectModuleCostControl");
  const ts = useTranslations("ProjectModuleShared");
  const phaseLabel = usePhaseLabel();
  const supabase = getSupabaseClient();
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
      other: t("budgetSubcategory.operations.other"),
    },
  };
  const canEdit = !readOnly && !disabled;
  const { toggleRow, isExpanded } = useExpandableTableRow();
  const mobileVisibleColumnCount = 3;
  const [project, setProject] = useState<{ currency?: string } | null>(null);
  const {
    budgetLines,
    loading: budgetLinesLoading,
    refetch: refetchBudgetLines,
  } = useProjectBudgetLines(projectId, { costOnly: true });

  const [items, setItems] = useState<ProjectItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [isBudgetLineDialogOpen, setIsBudgetLineDialogOpen] = useState(false);
  const [editingBudgetLine, setEditingBudgetLine] =
    useState<ProjectBudgetLine | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    construction: true,
    external_services: true,
    operations: true,
    products: true,
  });

  const loading = budgetLinesLoading || itemsLoading;

  const fetchItems = async () => {
    setItemsLoading(true);
    const [{ data: projectData }, { data: itemsData, error }] =
      await Promise.all([
        supabase
          .from("projects")
          .select("currency")
          .eq("id", projectId)
          .single(),
        supabase
          .from("project_items")
          .select("id, name, quantity, unit_cost, unit_price")
          .eq("project_id", projectId),
      ]);
    if (projectData) setProject(projectData);
    if (!error) setItems(itemsData || []);
    setItemsLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when projectId changes only
  }, [projectId]);

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setDeleteLoading(true);
    try {
      const { error } = await supabase
        .from("project_budget_lines")
        .delete()
        .eq("id", deleteTargetId);
      if (error) {
        const demoMsg = getDemoAccountMessage(error);
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
      setDeleteTargetId(null);
      refetchBudgetLines();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditBudgetLine = (line: ProjectBudgetLine) => {
    setEditingBudgetLine(line);
    setIsBudgetLineDialogOpen(true);
  };

  const handleAddBudgetLine = () => {
    try {
      setEditingBudgetLine(null);
      setIsBudgetLineDialogOpen(true);
    } catch (error) {
      reportError(error, "Error opening budget line dialog:");
      toast.error(t("toastDialogError"));
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Group budget lines by category
  const budgetLinesByCategory = budgetLines.reduce(
    (acc, line) => {
      if (!acc[line.category]) {
        acc[line.category] = [];
      }
      acc[line.category].push(line);
      return acc;
    },
    {} as Record<BudgetCategory, ProjectBudgetLine[]>
  );

  // Calculate totals
  const totalProductsCost = items.reduce(
    (sum, item) => sum + item.unit_cost * item.quantity,
    0
  );
  const totalProductsPrice = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  // Total budget lines (estimated and actual)
  const totalBudgetLinesEstimated = budgetLines.reduce(
    (sum, line) => sum + Number(line.estimated_amount),
    0
  );
  const totalBudgetLinesActual = budgetLines.reduce(
    (sum, line) => sum + Number(line.actual_amount),
    0
  );

  // Grand totals (budget lines + products)
  const grandTotalEstimated = totalBudgetLinesEstimated + totalProductsCost;
  const grandTotalActual = totalBudgetLinesActual + totalProductsCost;

  // Deviation percentage (actual / estimated * 100)
  const deviationPercentage =
    grandTotalEstimated > 0
      ? (grandTotalActual / grandTotalEstimated) * 100
      : 0;

  // Get bar color based on deviation
  const getDeviationBarColor = (percentage: number) => {
    if (percentage <= 100) return "bg-primary";
    if (percentage > 100 && percentage <= 101) return "bg-yellow-500";
    return "bg-destructive";
  };

  const getDeviationTextColor = (percentage: number) => {
    if (percentage <= 100) return "text-primary";
    if (percentage <= 101) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  const formatCurrency = (amount: number) =>
    formatCurrencyUtil(amount, project?.currency);

  const getDeviationIndicator = (estimated: number, actual: number) => {
    if (estimated === 0 && actual === 0)
      return { icon: Minus, color: "text-muted-foreground", text: "-" };
    if (actual === 0)
      return {
        icon: Minus,
        color: "text-muted-foreground",
        text: t("pending"),
      };

    const deviation = ((actual - estimated) / estimated) * 100;

    if (deviation > 5) {
      return {
        icon: TrendingUp,
        color: "text-destructive",
        text: `+${deviation.toFixed(1)}%`,
      };
    } else if (deviation < -5) {
      return {
        icon: TrendingDown,
        color: "text-primary",
        text: `${deviation.toFixed(1)}%`,
      };
    }
    return {
      icon: Minus,
      color: "text-muted-foreground",
      text: `${deviation >= 0 ? "+" : ""}${deviation.toFixed(1)}%`,
    };
  };

  // Order of categories to display (solo categorías de coste, excluye own_fees)
  const categoryOrder: BudgetCategory[] = COST_CATEGORIES;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-56" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-md" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProjectTabContent
        disabled={disabled}
        disabledMessage={t("disabledMessage")}
      >
        <div className="space-y-6">
          <TabSectionHeader title={t("title")} subtitle={t("subtitle")}>
            {!readOnly && (
              <Button onClick={handleAddBudgetLine} disabled={!canEdit}>
                <Plus className="mr-2 h-4 w-4" /> {t("newBudgetLine")}
              </Button>
            )}
          </TabSectionHeader>

          {/* Cost Totalization Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Totals row */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">
                      {t("totalEstimated")}
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(grandTotalEstimated)}
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">
                      {t("totalActual")}
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(grandTotalActual)}
                    </p>
                  </div>
                </div>

                {/* Deviation bar with percentage (solo modalidad full) */}
                {advancedCostOptionsEnabled && (
                  <div className="flex items-center gap-3">
                    <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                      <div
                        className={`h-full ${getDeviationBarColor(deviationPercentage)} transition-all duration-300`}
                        style={{
                          width: `${Math.min(deviationPercentage, 100)}%`,
                        }}
                      />
                    </div>
                    <span
                      className={`min-w-[60px] text-right text-sm font-semibold ${getDeviationTextColor(deviationPercentage)}`}
                    >
                      {deviationPercentage.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Budget Lines by Category */}
          {categoryOrder.map((category) => {
            const lines = budgetLinesByCategory[category] || [];
            if (lines.length === 0) return null;

            const categoryEstimated = lines.reduce(
              (sum, line) => sum + Number(line.estimated_amount),
              0
            );
            const categoryActual = lines.reduce(
              (sum, line) => sum + Number(line.actual_amount),
              0
            );
            const categoryDeviation = getDeviationIndicator(
              categoryEstimated,
              categoryActual
            );

            return (
              <Collapsible
                key={category}
                open={openSections[category]}
                onOpenChange={() => toggleSection(category)}
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="hover:bg-accent/30 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <ChevronDown
                            className={`h-4 w-4 transition-transform ${openSections[category] ? "" : "-rotate-90"}`}
                          />
                          {categoryLabels[category] ?? category}
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">
                              {t("estimatedShort")}{" "}
                              {formatCurrency(categoryEstimated)}
                            </p>
                            <p className="font-semibold">
                              {t("actualShort")}{" "}
                              {formatCurrency(categoryActual)}
                            </p>
                          </div>
                          <div
                            className={`flex items-center gap-1 ${categoryDeviation.color}`}
                          >
                            <categoryDeviation.icon className="h-4 w-4" />
                            <span className="text-sm font-medium">
                              {categoryDeviation.text}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{ts("colConcept")}</TableHead>
                            <TableHead className="text-right">
                              {ts("colEstimated")}
                            </TableHead>
                            <TableHeadMd>{ts("colDescription")}</TableHeadMd>
                            <TableHeadMd>{ts("colPhase")}</TableHeadMd>
                            <TableHeadMd className="text-right">
                              {ts("colActual")}
                            </TableHeadMd>
                            <TableHeadMd className="text-right">
                              {ts("colDeviation")}
                            </TableHeadMd>
                            <TableHeadMd className="w-[100px]" />
                            <TableHeadExpandPlaceholder
                              srLabel={ts("expandRow")}
                            />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lines.map((line) => {
                            const deviation = getDeviationIndicator(
                              Number(line.estimated_amount),
                              Number(line.actual_amount)
                            );
                            const expanded = isExpanded(line.id);
                            const rowActions: ExpandableTableRowAction[] =
                              canEdit
                                ? [
                                    {
                                      id: "edit",
                                      label: ts("edit"),
                                      icon: Pencil,
                                      onClick: () => handleEditBudgetLine(line),
                                    },
                                    {
                                      id: "delete",
                                      label: ts("delete"),
                                      icon: Trash2,
                                      onClick: () => setDeleteTargetId(line.id),
                                      destructive: true,
                                    },
                                  ]
                                : [];
                            const visibilityLabel = line.is_internal_cost
                              ? t("internalCost")
                              : t("visibleToClient");

                            return (
                              <Fragment key={line.id}>
                                <TableRow>
                                  <TableCell className="max-w-[8rem] truncate font-medium sm:max-w-none">
                                    {subcategoryLabels[category]?.[
                                      line.subcategory
                                    ] ?? line.subcategory}
                                  </TableCell>
                                  <TableCell className="text-right tabular-nums">
                                    {formatCurrency(
                                      Number(line.estimated_amount)
                                    )}
                                  </TableCell>
                                  <TableCellMd className="text-muted-foreground max-w-[200px] truncate">
                                    {line.description || "-"}
                                  </TableCellMd>
                                  <TableCellMd className="text-muted-foreground text-xs">
                                    {line.phase ? phaseLabel(line.phase) : "-"}
                                  </TableCellMd>
                                  <TableCellMd className="text-right font-semibold tabular-nums">
                                    {formatCurrency(Number(line.actual_amount))}
                                  </TableCellMd>
                                  <TableCellMd className="text-right">
                                    <div
                                      className={`flex items-center justify-end gap-1 ${deviation.color}`}
                                    >
                                      <deviation.icon className="h-3 w-3" />
                                      <span className="text-sm">
                                        {deviation.text}
                                      </span>
                                    </div>
                                  </TableCellMd>
                                  <TableCellMd>
                                    <div className="flex items-center justify-end gap-2">
                                      {line.is_internal_cost ? (
                                        <span title={visibilityLabel}>
                                          <EyeOff className="text-muted-foreground h-4 w-4" />
                                        </span>
                                      ) : (
                                        <span title={visibilityLabel}>
                                          <Eye className="text-muted-foreground h-4 w-4" />
                                        </span>
                                      )}
                                      <ExpandableRowActionsMenu
                                        actions={rowActions}
                                        menuAriaLabel={t(
                                          "budgetLineActionsAria"
                                        )}
                                      />
                                    </div>
                                  </TableCellMd>
                                  <TableRowExpandTrigger
                                    expanded={expanded}
                                    onToggle={() => toggleRow(line.id)}
                                    expandLabel={t("expandLineDetails")}
                                    collapseLabel={t("collapseLineDetails")}
                                  />
                                </TableRow>
                                <TableRowMobileDetail
                                  open={expanded}
                                  colSpan={mobileVisibleColumnCount}
                                >
                                  <div className="space-y-2">
                                    <MobileDetailField
                                      label={ts("colDescription")}
                                      value={line.description || "-"}
                                    />
                                    <MobileDetailField
                                      label={ts("colPhase")}
                                      value={
                                        line.phase
                                          ? phaseLabel(line.phase)
                                          : "-"
                                      }
                                    />
                                    <MobileDetailField
                                      label={ts("colActual")}
                                      value={formatCurrency(
                                        Number(line.actual_amount)
                                      )}
                                    />
                                    <MobileDetailField
                                      label={ts("colDeviation")}
                                      value={
                                        <span
                                          className={`inline-flex items-center gap-1 ${deviation.color}`}
                                        >
                                          <deviation.icon className="h-3 w-3" />
                                          {deviation.text}
                                        </span>
                                      }
                                    />
                                    <MobileDetailField
                                      label={ts("colVisibility")}
                                      value={
                                        <span className="inline-flex items-center gap-1">
                                          {line.is_internal_cost ? (
                                            <EyeOff className="h-4 w-4" />
                                          ) : (
                                            <Eye className="h-4 w-4" />
                                          )}
                                          {visibilityLabel}
                                        </span>
                                      }
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
          })}

          {/* Products Cost Summary */}
          <Collapsible
            open={openSections.products}
            onOpenChange={() => toggleSection("products")}
          >
            <Card>
              <CollapsibleTrigger asChild>
                <CardHeader className="hover:bg-accent/30 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${openSections.products ? "" : "-rotate-90"}`}
                      />
                      {t("productsCostTitle")}
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-muted-foreground text-sm">
                          {t("salePriceShort")}{" "}
                          {formatCurrency(totalProductsPrice)}
                        </p>
                        <p className="font-semibold">
                          {t("costShort")} {formatCurrency(totalProductsCost)}
                        </p>
                      </div>
                      {advancedCostOptionsEnabled && (
                        <div className="text-primary flex items-center gap-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm font-medium">
                            {t("marginShort")}{" "}
                            {formatCurrency(
                              totalProductsPrice - totalProductsCost
                            )}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4 text-sm">
                    {t("productsCostSummary")}
                  </p>
                  <div
                    className={
                      advancedCostOptionsEnabled
                        ? "grid grid-cols-1 gap-4 text-center sm:grid-cols-2 lg:grid-cols-3"
                        : "grid grid-cols-1 gap-4 text-center sm:grid-cols-2"
                    }
                  >
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">
                        {t("totalCost")}
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(totalProductsCost)}
                      </p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">
                        {t("totalSale")}
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(totalProductsPrice)}
                      </p>
                    </div>
                    {advancedCostOptionsEnabled && (
                      <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
                        <p className="text-muted-foreground text-sm">
                          {t("productsMargin")}
                        </p>
                        <p className="text-primary text-xl font-bold">
                          {formatCurrency(
                            totalProductsPrice - totalProductsCost
                          )}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {totalProductsPrice > 0
                            ? `${(((totalProductsPrice - totalProductsCost) / totalProductsPrice) * 100).toFixed(1)}%`
                            : "0%"}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>

          {/* Empty State */}
          {budgetLines.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {t("emptyBudgetLines")}
                </p>
                {!readOnly && (
                  <Button onClick={handleAddBudgetLine} disabled={!canEdit}>
                    <Plus className="mr-2 h-4 w-4" /> {t("addFirstBudgetLine")}
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </ProjectTabContent>

      {/* Dialog */}
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
          refetchBudgetLines();
        }}
      />

      <ConfirmDeleteDialog
        open={deleteTargetId !== null}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
        title={t("confirmDeleteLine")}
        description={ts("confirmDeleteDescription")}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
