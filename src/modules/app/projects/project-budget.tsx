"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
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
  MoreVertical,
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
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import {
  getBudgetCategoryLabel,
  getBudgetSubcategoryLabel,
  getPhaseLabel,
  getErrorMessage,
  reportError,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/utils";

import type {
  Project,
  ProjectBudgetLine,
  ProjectItem,
  BudgetCategory,
  ProjectPhase,
} from "@/types";

export function ProjectBudget({ projectId }: { projectId: string }) {
  const { user } = useAuth();
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
        setError("Error al cargar el proyecto");
      }

      // Fetch project items (products)
      const { data: itemsData, error: itemsError } = await supabase
        .from("project_items")
        .select(
          "*, space:spaces(name), product:products(name, supplier:suppliers(name), description, reference_code, category), purchase_order:purchase_orders(order_number, status, delivery_deadline, delivery_date)"
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
        "Error inesperado al cargar los datos: " + getErrorMessage(error)
      );
      setItems([]);
      await refetchBudgetLines();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleDeleteItem = async (id: string) => {
    if (!confirm("¿Eliminar ítem?")) return;
    await supabase.from("project_items").delete().eq("id", id);
    toast.success("Ítem eliminado");
    fetchData();
  };

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
      toast.error("No se pudo cargar la información del proyecto");
      return;
    }

    setIsGeneratingPDF(true);
    try {
      const { generateProjectPDF } = await import("@/lib/pdf-generator");
      let architectName: string | undefined;
      if (user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("public_name")
          .eq("id", user.id)
          .single();
        architectName = profile?.public_name?.trim() || undefined;
      }
      const taxRate =
        project.tax_rate !== null && project.tax_rate !== undefined
          ? project.tax_rate
          : 0;

      const itemsToPdf = option === "lines" ? [] : includedItems;
      const linesToPdf = option === "products" ? [] : budgetLines;

      const asPdf = await generateProjectPDF(
        project,
        itemsToPdf,
        linesToPdf,
        taxRate,
        architectName
      );
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Presupuesto_${project.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success("PDF generado correctamente");
    } catch (error) {
      reportError(error, "Error generating PDF:");
      toast.error("Error al generar el PDF");
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Group budget lines by phase first, then by category
  const budgetLinesByPhaseAndCategory = budgetLines.reduce(
    (acc, line) => {
      const phaseKey = line.phase || "no_phase";
      if (!acc[phaseKey]) {
        acc[phaseKey] = {} as Record<BudgetCategory, ProjectBudgetLine[]>;
      }
      if (!acc[phaseKey][line.category]) {
        acc[phaseKey][line.category] = [];
      }
      acc[phaseKey][line.category].push(line);
      return acc;
    },
    {} as Record<string, Record<BudgetCategory, ProjectBudgetLine[]>>
  );

  // Exclude products marked as excluded from display and totals
  const includedItems = items.filter((item) => !item.is_excluded);

  // Calculate totals
  const totalItemsPrice = includedItems.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );
  const totalBudgetLinesEstimated = budgetLines.reduce(
    (sum, line) => sum + Number(line.estimated_amount),
    0
  );

  // For client budget, we use estimated_amount as the price shown
  const grandTotal = totalItemsPrice + totalBudgetLinesEstimated;

  const formatCurrency = (amount: number) =>
    formatCurrencyUtil(amount, project?.currency);

  // Map delivery_deadline codes to readable labels (same as purchase-order-dialog options)
  const deliveryDeadlineLabel: Record<string, string> = {
    "1w": "1 semana",
    "2w": "2 semanas",
    "3w": "3 semanas",
    "4w": "4 semanas",
    "6w": "6 semanas",
    tbd: "A convenir",
  };

  // Helper function to get status icon and label
  const getStatusDisplay = (status: string) => {
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case "pending":
        return {
          icon: Clock,
          label: "Pendiente",
          className: "text-muted-foreground",
        };
      case "ordered":
        return {
          icon: Truck,
          label: "Pedido",
          className: "text-blue-600 dark:text-blue-400",
        };
      case "received":
        return {
          icon: PackageCheck,
          label: "Recibido",
          className: "text-cyan-600 dark:text-cyan-400",
        };
      case "installed":
        return {
          icon: Wrench,
          label: "Instalado",
          className: "text-orange-600 dark:text-orange-400",
        };
      case "completed":
        return {
          icon: Check,
          label: "Completado",
          className: "text-green-600 dark:text-green-400",
        };
      case "canceled":
      case "cancelled":
        return {
          icon: XCircle,
          label: "Cancelado",
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

  // Order of phases to display
  const phaseOrder: (ProjectPhase | "no_phase")[] = [
    "diagnosis",
    "design",
    "executive",
    "budget",
    "construction",
    "delivery",
    "no_phase",
  ];

  // Order of categories to display within each phase
  const categoryOrder: BudgetCategory[] = [
    "own_fees",
    "external_services",
    "construction",
    "operations",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <p className="text-muted-foreground">Cargando presupuesto...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <p className="text-destructive font-medium">{error}</p>
          <Button onClick={fetchData} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Presupuesto</h3>
          <div className="text-muted-foreground text-sm">
            Productos: {formatCurrency(totalItemsPrice)} | Partidas:{" "}
            {formatCurrency(totalBudgetLinesEstimated)} |
            <span className="font-semibold">
              {" "}
              Total: {formatCurrency(grandTotal)}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={() => setIsPrintOptionsOpen(true)}
            className="print:hidden"
            disabled={isGeneratingPDF || !project}
          >
            <Printer className="mr-2 h-4 w-4" />
            {isGeneratingPDF ? "Generando PDF..." : "Exportar PDF"}
          </Button>
          <Button
            variant="outline"
            onClick={handleAddBudgetLine}
            className="print:hidden"
          >
            <Plus className="mr-2 h-4 w-4" /> Nueva Partida
          </Button>
          <Button onClick={handleAddItem} className="print:hidden">
            <Plus className="mr-2 h-4 w-4" /> Añadir Producto
          </Button>
        </div>
      </div>

      {/* Budget Lines by Phase and Category */}
      {phaseOrder.map((phase) => {
        const phaseData = budgetLinesByPhaseAndCategory[phase];
        if (!phaseData) return null;

        // Check if this phase has any lines
        const hasLines = Object.values(phaseData).some(
          (lines) => lines.length > 0
        );
        if (!hasLines) return null;

        const phaseTotal = Object.values(phaseData).reduce(
          (sum, lines) =>
            sum +
            lines.reduce(
              (lineSum, line) => lineSum + Number(line.estimated_amount),
              0
            ),
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
                          ? "Sin Fase"
                          : getPhaseLabel(phase as ProjectPhase)}
                      </CardTitle>
                      <span className="text-primary font-semibold">
                        {formatCurrency(phaseTotal)}
                      </span>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-3 pt-0">
                    {categoryOrder.map((category) => {
                      const lines = phaseData[category] || [];
                      if (lines.length === 0) return null;

                      const categoryTotal = lines.reduce(
                        (sum, line) => sum + Number(line.estimated_amount),
                        0
                      );
                      const categorySectionKey = `${phaseSectionKey}_${category}`;

                      return (
                        <Collapsible
                          key={category}
                          open={openSections[categorySectionKey] !== false}
                          onOpenChange={() => toggleSection(categorySectionKey)}
                        >
                          <Card className="ml-4">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="hover:bg-accent/30 cursor-pointer py-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="flex items-center gap-2 text-sm">
                                    <ChevronDown
                                      className={`h-3 w-3 transition-transform ${openSections[categorySectionKey] !== false ? "" : "-rotate-90"}`}
                                    />
                                    {getBudgetCategoryLabel(category)}
                                  </CardTitle>
                                  <span className="text-primary text-sm font-semibold">
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
                                      <TableHead>Concepto</TableHead>
                                      <TableHead>Descripción</TableHead>
                                      <TableHead className="text-right">
                                        Importe
                                      </TableHead>
                                      <TableHead className="w-[80px]"></TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {lines.map((line) => (
                                      <TableRow key={line.id}>
                                        <TableCell className="font-medium">
                                          {getBudgetSubcategoryLabel(
                                            category,
                                            line.subcategory
                                          )}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                          {line.description || "-"}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                          {formatCurrency(
                                            Number(line.estimated_amount)
                                          )}
                                        </TableCell>
                                        <TableCell>
                                          <div className="flex justify-end">
                                            <DropdownMenu>
                                              <DropdownMenuTrigger asChild>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
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
                                                    handleDeleteBudgetLine(
                                                      line.id
                                                    )
                                                  }
                                                  className="text-destructive"
                                                >
                                                  <Trash2 className="mr-2 h-4 w-4" />
                                                  Eliminar
                                                </DropdownMenuItem>
                                              </DropdownMenuContent>
                                            </DropdownMenu>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>
        );
      })}

      {/* Products Section */}
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
                  Mobiliario y Productos
                </CardTitle>
                <span className="text-primary font-semibold">
                  {formatCurrency(totalItemsPrice)}
                </span>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="pt-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Img</TableHead>
                    <TableHead>Ítem</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">Costo Unit.</TableHead>
                    <TableHead className="text-right">Precio Venta</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {includedItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        {item.image_url && (
                          <img
                            src={item.image_url}
                            className="h-8 w-8 cursor-pointer rounded object-cover transition-opacity hover:opacity-80"
                            onClick={() => {
                              setSelectedItem(item);
                              setIsProductModalOpen(true);
                            }}
                            alt={item.product?.name || item.name}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {item.product?.name || item.name}
                        </div>
                        {item.product?.reference_code && (
                          <div className="text-muted-foreground mt-1 font-mono text-xs">
                            Ref: {item.product.reference_code}
                          </div>
                        )}
                        <div className="text-muted-foreground text-xs">
                          {item.product?.supplier?.name || "-"}
                        </div>
                      </TableCell>
                      <TableCell>{item.space?.name || "General"}</TableCell>
                      <TableCell>
                        {(() => {
                          const statusDisplay = getStatusDisplay(item.status);
                          const Icon = statusDisplay.icon;
                          const po = item.purchase_order;
                          const isOrderedNotReceived =
                            item.status === "ordered" && po;
                          const deliveryInfo =
                            isOrderedNotReceived &&
                            (po.delivery_date || po.delivery_deadline)
                              ? po.delivery_date
                                ? `Entrega: ${new Date(po.delivery_date).toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" })}`
                                : `Entrega: ${deliveryDeadlineLabel[po.delivery_deadline ?? ""] || po.delivery_deadline}`
                              : null;
                          const statusLabel =
                            deliveryInfo ?? statusDisplay.label;
                          return (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div className="flex items-center justify-center">
                                    <Icon
                                      className={`h-4 w-4 ${statusDisplay.className} cursor-help`}
                                    />
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{statusLabel}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.quantity}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right">
                        {formatCurrency(item.unit_cost)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(item.unit_price)}
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatCurrency(item.unit_price * item.quantity)}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => handleEditItem(item)}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteItem(item.id)}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {items.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-muted-foreground py-8 text-center"
                      >
                        No hay productos añadidos.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* Grand Total Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Total Presupuesto</p>
              <p className="text-muted-foreground text-xs">
                Partidas: {formatCurrency(totalBudgetLinesEstimated)} +
                Productos: {formatCurrency(totalItemsPrice)}
              </p>
            </div>
            <p className="text-primary text-3xl font-bold">
              {formatCurrency(grandTotal)}
            </p>
          </div>
        </CardContent>
      </Card>

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
        onEdit={() => {
          setIsProductModalOpen(false);
          setEditingItem(selectedItem);
          setIsItemDialogOpen(true);
        }}
      />

      <BudgetPrintOptionsDialog
        open={isPrintOptionsOpen}
        onOpenChange={setIsPrintOptionsOpen}
        onConfirm={handleGeneratePDF}
        isGenerating={isGeneratingPDF}
      />
    </div>
  );
}
