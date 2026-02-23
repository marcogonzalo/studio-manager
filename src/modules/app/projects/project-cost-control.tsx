"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useProjectBudgetLines } from "@/lib/use-project-budget-lines";
import { Button } from "@/components/ui/button";
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
  Pencil,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  EyeOff,
  MoreVertical,
} from "lucide-react";
import { BudgetLineDialog } from "@/components/dialogs/budget-line-dialog";
import { toast } from "sonner";
import {
  getBudgetCategoryLabel,
  getBudgetSubcategoryLabel,
  getPhaseLabel,
  reportError,
  COST_CATEGORIES,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/utils";

import type { ProjectBudgetLine, ProjectItem, BudgetCategory } from "@/types";

export function ProjectCostControl({
  projectId,
  readOnly = false,
}: {
  projectId: string;
  readOnly?: boolean;
}) {
  const { effectivePlan } = useAuth();
  const costsManagementEnabled =
    !readOnly && effectivePlan?.config?.costs_management === "full";
  const supabase = getSupabaseClient();
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

  const handleDeleteBudgetLine = async (id: string) => {
    if (!confirm("¿Eliminar partida?")) return;
    const { error } = await supabase
      .from("project_budget_lines")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error("Error al eliminar la partida");
      reportError(error, "Error deleting budget line:");
    } else {
      toast.success("Partida eliminada");
      refetchBudgetLines();
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
      toast.error("Error al abrir el diálogo");
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
    if (percentage < 100) return "bg-primary";
    if (percentage <= 101) return "bg-yellow-500";
    return "bg-destructive";
  };

  const getDeviationTextColor = (percentage: number) => {
    if (percentage < 100) return "text-primary";
    if (percentage <= 101) return "text-yellow-600 dark:text-yellow-400";
    return "text-destructive";
  };

  const formatCurrency = (amount: number) =>
    formatCurrencyUtil(amount, project?.currency);

  const getDeviationIndicator = (estimated: number, actual: number) => {
    if (estimated === 0 && actual === 0)
      return { icon: Minus, color: "text-muted-foreground", text: "-" };
    if (actual === 0)
      return { icon: Minus, color: "text-muted-foreground", text: "Pendiente" };

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
      <div className="relative">
        <div
          className={
            !costsManagementEnabled ? "pointer-events-none select-none" : ""
          }
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium">Control de Costes</h3>
              <p className="text-muted-foreground text-sm">
                Seguimiento interno de estimado vs real
              </p>
            </div>
            {!readOnly && (
              <Button
                onClick={handleAddBudgetLine}
                disabled={!costsManagementEnabled}
              >
                <Plus className="mr-2 h-4 w-4" /> Nueva Partida
              </Button>
            )}
          </div>

          {/* Cost Totalization Summary */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {/* Totals row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">
                      Total Estimado
                    </p>
                    <p className="text-xl font-bold">
                      {formatCurrency(grandTotalEstimated)}
                    </p>
                  </div>
                  <div className="bg-secondary/30 rounded-lg p-3">
                    <p className="text-muted-foreground text-xs">Total Real</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(grandTotalActual)}
                    </p>
                  </div>
                </div>

                {/* Deviation bar with percentage */}
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
                          {getBudgetCategoryLabel(category)}
                        </CardTitle>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-muted-foreground text-sm">
                              Est: {formatCurrency(categoryEstimated)}
                            </p>
                            <p className="font-semibold">
                              Real: {formatCurrency(categoryActual)}
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
                            <TableHead>Concepto</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Fase</TableHead>
                            <TableHead className="text-right">
                              Estimado
                            </TableHead>
                            <TableHead className="text-right">Real</TableHead>
                            <TableHead className="text-right">
                              Desviación
                            </TableHead>
                            <TableHead className="w-[100px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lines.map((line) => {
                            const deviation = getDeviationIndicator(
                              Number(line.estimated_amount),
                              Number(line.actual_amount)
                            );
                            return (
                              <TableRow key={line.id}>
                                <TableCell className="font-medium">
                                  {getBudgetSubcategoryLabel(
                                    category,
                                    line.subcategory
                                  )}
                                </TableCell>
                                <TableCell className="text-muted-foreground max-w-[200px] truncate">
                                  {line.description || "-"}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs">
                                  {line.phase ? getPhaseLabel(line.phase) : "-"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {formatCurrency(
                                    Number(line.estimated_amount)
                                  )}
                                </TableCell>
                                <TableCell className="text-right font-semibold">
                                  {formatCurrency(Number(line.actual_amount))}
                                </TableCell>
                                <TableCell className="text-right">
                                  <div
                                    className={`flex items-center justify-end gap-1 ${deviation.color}`}
                                  >
                                    <deviation.icon className="h-3 w-3" />
                                    <span className="text-sm">
                                      {deviation.text}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center justify-end gap-2">
                                    {line.is_internal_cost ? (
                                      <span title="Coste interno (no visible para cliente)">
                                        <EyeOff className="text-muted-foreground h-4 w-4" />
                                      </span>
                                    ) : (
                                      <span title="Visible para cliente">
                                        <Eye className="text-muted-foreground h-4 w-4" />
                                      </span>
                                    )}
                                    {!readOnly && (
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Acciones de la partida"
                                          >
                                            <MoreVertical className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleEditBudgetLine(line)
                                            }
                                          >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Editar
                                          </DropdownMenuItem>
                                          <DropdownMenuItem
                                            onClick={() =>
                                              handleDeleteBudgetLine(line.id)
                                            }
                                            className="text-destructive"
                                          >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            Eliminar
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
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
                      Coste de Productos
                    </CardTitle>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-muted-foreground text-sm">
                          Precio Venta: {formatCurrency(totalProductsPrice)}
                        </p>
                        <p className="font-semibold">
                          Coste: {formatCurrency(totalProductsCost)}
                        </p>
                      </div>
                      <div className="text-primary flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Margen:{" "}
                          {formatCurrency(
                            totalProductsPrice - totalProductsCost
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <p className="text-muted-foreground mb-4 text-sm">
                    Resumen de costes de adquisición de los productos del
                    proyecto. El detalle de productos se gestiona en la pestaña
                    "Presupuesto".
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">
                        Total Coste
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(totalProductsCost)}
                      </p>
                    </div>
                    <div className="bg-secondary/30 rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">
                        Total Venta
                      </p>
                      <p className="text-xl font-bold">
                        {formatCurrency(totalProductsPrice)}
                      </p>
                    </div>
                    <div className="bg-primary/10 dark:bg-primary/20 rounded-lg p-4">
                      <p className="text-muted-foreground text-sm">
                        Margen Productos
                      </p>
                      <p className="text-primary text-xl font-bold">
                        {formatCurrency(totalProductsPrice - totalProductsCost)}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {totalProductsPrice > 0
                          ? `${(((totalProductsPrice - totalProductsCost) / totalProductsPrice) * 100).toFixed(1)}%`
                          : "0%"}
                      </p>
                    </div>
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
                  No hay partidas de presupuesto registradas.
                </p>
                {!readOnly && (
                  <Button
                    onClick={handleAddBudgetLine}
                    disabled={!costsManagementEnabled}
                  >
                    <Plus className="mr-2 h-4 w-4" /> Añadir Primera Partida
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {!costsManagementEnabled && (
          <div
            className="bg-background/50 pointer-events-auto absolute inset-0 z-10"
            aria-hidden="true"
          />
        )}
      </div>

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
    </div>
  );
}
