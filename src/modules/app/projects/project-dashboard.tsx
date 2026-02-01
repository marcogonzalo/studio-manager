"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Wallet,
  TrendingUp,
  FolderKanban,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  FileText,
  Receipt,
} from "lucide-react";
import {
  getPhaseLabel,
  getBudgetCategoryLabel,
  isCostCategory,
  reportError,
  reportWarn,
  formatCurrency as formatCurrencyUtil,
} from "@/lib/utils";
import type {
  Project,
  Payment,
  ProjectBudgetLine,
  ProjectPhase,
  BudgetCategory,
} from "@/types";

interface PurchaseOrderCoverage {
  id: string;
  order_number: string;
  total_amount: number;
  covered_amount: number;
  status: "covered" | "partial" | "pending";
}

interface DashboardKPIs {
  coverage: number;
  margin: number;
  marginPercentage: number;
  progress: number;
  deviation: number;
}

interface ProjectItem {
  id: string;
  quantity: number;
  unit_cost: number;
  unit_price: number;
}

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const supabase = getSupabaseClient();
  const [project, setProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [budgetLines, setBudgetLines] = useState<ProjectBudgetLine[]>([]);
  const [poCoverage, setPoCoverage] = useState<PurchaseOrderCoverage[]>([]);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);

    // Fetch project
    const { data: projectData } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();
    if (projectData) setProject(projectData);

    // Fetch payments
    const { data: paymentsData } = await supabase
      .from("payments")
      .select("*")
      .eq("project_id", projectId);
    if (paymentsData) setPayments(paymentsData || []);

    // Fetch budget lines
    const { data: budgetLinesData, error: budgetLinesError } = await supabase
      .from("project_budget_lines")
      .select("*")
      .eq("project_id", projectId);

    if (budgetLinesError) {
      // Table might not exist yet - silently handle it
      if (
        budgetLinesError.code === "42P01" ||
        budgetLinesError.message?.includes("does not exist")
      ) {
        reportWarn(
          "Table project_budget_lines does not exist yet. Please run migrations."
        );
        setBudgetLines([]);
      } else {
        reportError(budgetLinesError, "Error fetching budget lines:");
        setBudgetLines([]);
      }
    } else {
      setBudgetLines(budgetLinesData || []);
    }

    // Fetch purchase orders with coverage
    const { data: posData } = await supabase
      .from("purchase_orders")
      .select("id, order_number, project_items(id, quantity, unit_cost)")
      .eq("project_id", projectId);

    if (posData) {
      const coveragePromises = posData.map(async (po) => {
        type PoItem = { id: string; quantity: number; unit_cost: number };
        const totalAmount = (po.project_items || []).reduce(
          (sum: number, item: PoItem) => sum + item.unit_cost * item.quantity,
          0
        );

        const { data: paymentsForPO } = await supabase
          .from("payments")
          .select("amount")
          .eq("purchase_order_id", po.id);

        const coveredAmount = (paymentsForPO || []).reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );

        let status: "covered" | "partial" | "pending" = "pending";
        if (coveredAmount >= totalAmount) status = "covered";
        else if (coveredAmount > 0) status = "partial";

        return {
          id: po.id,
          order_number: po.order_number || `PO-${po.id.slice(0, 8)}`,
          total_amount: totalAmount,
          covered_amount: coveredAmount,
          status,
        };
      });

      const coverage = await Promise.all(coveragePromises);
      setPoCoverage(coverage);
    }

    // Fetch items
    const { data: itemsData } = await supabase
      .from("project_items")
      .select("id, quantity, unit_cost, unit_price")
      .eq("project_id", projectId);
    if (itemsData) setItems(itemsData || []);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  // Products
  const totalProductsCost = items.reduce(
    (sum, item) => sum + item.unit_cost * item.quantity,
    0
  );
  const totalProductsPrice = items.reduce(
    (sum, item) => sum + item.unit_price * item.quantity,
    0
  );

  // Budget lines
  const clientBudgetLines = budgetLines.filter(
    (line) => !line.is_internal_cost
  );
  const totalBudgetLinesEstimated = clientBudgetLines.reduce(
    (sum, line) => sum + Number(line.estimated_amount),
    0
  );
  // Solo contar como coste real las categorías de coste (excluir own_fees que son ingresos)
  const costBudgetLines = budgetLines.filter((line) =>
    isCostCategory(line.category)
  );
  const totalBudgetLinesActual = costBudgetLines.reduce(
    (sum, line) => sum + Number(line.actual_amount),
    0
  );

  // Totals
  const clientBudget = totalProductsPrice + totalBudgetLinesEstimated;
  const totalCosts = totalProductsCost + totalBudgetLinesActual;
  const margin = clientBudget - totalCosts;
  const marginPercentage = clientBudget > 0 ? (margin / clientBudget) * 100 : 0;

  // Calculate KPIs
  const calculateKPIs = (): DashboardKPIs => {
    const coverage = clientBudget > 0 ? (totalPaid / clientBudget) * 100 : 0;

    // Progress based on phase
    const phaseProgress = getPhaseProgress(project?.phase);

    // Deviation: Compare estimated vs actual for cost budget lines only (excluir own_fees)
    const totalEstimated = costBudgetLines.reduce(
      (sum, line) => sum + Number(line.estimated_amount),
      0
    );
    const totalActual = costBudgetLines.reduce(
      (sum, line) => sum + Number(line.actual_amount),
      0
    );
    const deviation =
      totalEstimated > 0
        ? ((totalActual - totalEstimated) / totalEstimated) * 100
        : 0;

    return {
      coverage,
      margin,
      marginPercentage,
      progress: phaseProgress,
      deviation,
    };
  };

  const getPhaseProgress = (phase?: ProjectPhase): number => {
    const phases: ProjectPhase[] = [
      "diagnosis",
      "design",
      "executive",
      "budget",
      "construction",
      "delivery",
    ];
    if (!phase) return 0;
    const index = phases.indexOf(phase);
    return ((index + 1) / phases.length) * 100;
  };

  const kpis = calculateKPIs();

  // Group budget lines by category for display
  const budgetLinesByCategory = budgetLines.reduce(
    (acc, line) => {
      if (!acc[line.category]) {
        acc[line.category] = { estimated: 0, actual: 0, count: 0 };
      }
      acc[line.category].estimated += Number(line.estimated_amount);
      acc[line.category].actual += Number(line.actual_amount);
      acc[line.category].count += 1;
      return acc;
    },
    {} as Record<
      BudgetCategory,
      { estimated: number; actual: number; count: number }
    >
  );

  const formatCurrency = (amount: number) =>
    formatCurrencyUtil(amount, project?.currency);

  if (loading) {
    return <div className="py-12 text-center">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Avance"
          value={`${kpis.progress.toFixed(0)}%`}
          subtitle={
            project?.phase ? getPhaseLabel(project.phase) : "No asignada"
          }
          icon={FolderKanban}
          color="primary"
        />
        <KPICard
          title="Cobertura de Pagos"
          value={`${kpis.coverage.toFixed(1)}%`}
          subtitle={`${formatCurrency(totalPaid)} de ${formatCurrency(clientBudget)}`}
          icon={Wallet}
          color="chart-1"
        />
        <KPICard
          title="Desviación Costes"
          value={`${kpis.deviation >= 0 ? "+" : ""}${kpis.deviation.toFixed(1)}%`}
          subtitle={
            kpis.deviation > 5
              ? "Sobrecoste"
              : kpis.deviation < -5
                ? "Ahorro"
                : "En línea"
          }
          icon={AlertTriangle}
          color="text-muted-foreground"
          valueIcon={kpis.deviation < 0 ? ArrowDown : ArrowUp}
          valueColor={kpis.deviation < 0 ? "text-primary" : "text-destructive"}
        />
        <KPICard
          title="Presupuestado"
          value={formatCurrency(clientBudget)}
          subtitle={`Productos: ${formatCurrency(totalProductsPrice)} + Partidas: ${formatCurrency(totalBudgetLinesEstimated)}`}
          icon={FileText}
          color="chart-2"
        />
        <KPICard
          title="Coste total"
          value={formatCurrency(totalCosts)}
          subtitle={`Productos: ${formatCurrency(totalProductsCost)} + Partidas: ${formatCurrency(totalBudgetLinesActual)}`}
          icon={Receipt}
          color="chart-3"
        />
        <KPICard
          title="Margen Bruto"
          value={formatCurrency(margin)}
          subtitle={`${marginPercentage.toFixed(1)}% del presupuesto`}
          icon={TrendingUp}
          color={margin >= 0 ? "chart-4" : "destructive"}
        />
      </div>

      {/* Budget by Category & Project Progress */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Budget by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Presupuesto por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(budgetLinesByCategory).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay partidas de presupuesto
              </p>
            ) : (
              <div className="space-y-3">
                {(
                  Object.entries(budgetLinesByCategory) as [
                    BudgetCategory,
                    { estimated: number; actual: number; count: number },
                  ][]
                ).map(([category, data]) => {
                  const deviation =
                    data.estimated > 0
                      ? ((data.actual - data.estimated) / data.estimated) * 100
                      : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">
                          {getBudgetCategoryLabel(category)}
                        </span>
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${
                            deviation > 5
                              ? "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive"
                              : deviation < -5
                                ? "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary"
                                : "bg-muted text-foreground"
                          }`}
                        >
                          {deviation >= 0 ? "+" : ""}
                          {deviation.toFixed(0)}%
                        </span>
                      </div>
                      <div className="text-muted-foreground flex justify-between text-xs">
                        <span>Est: {formatCurrency(data.estimated)}</span>
                        <span>Real: {formatCurrency(data.actual)}</span>
                      </div>
                      <div className="bg-muted h-1 w-full rounded-full">
                        <div
                          className={`h-1 rounded-full ${
                            deviation > 5
                              ? "bg-destructive"
                              : deviation < -5
                                ? "bg-primary"
                                : "bg-primary"
                          }`}
                          style={{
                            width: `${data.estimated > 0 ? Math.min(100, (data.actual / data.estimated) * 100) : 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* Products summary */}
                <div className="space-y-1 border-t pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Productos</span>
                    <span className="bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary rounded-full px-2 py-1 text-xs">
                      +
                      {(
                        ((totalProductsPrice - totalProductsCost) /
                          totalProductsPrice) *
                        100
                      ).toFixed(0)}
                      % margen
                    </span>
                  </div>
                  <div className="text-muted-foreground flex justify-between text-xs">
                    <span>Coste: {formatCurrency(totalProductsCost)}</span>
                    <span>Venta: {formatCurrency(totalProductsPrice)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PO Coverage */}
        <Card>
          <CardHeader>
            <CardTitle>Cobertura de Órdenes de Compra</CardTitle>
          </CardHeader>
          <CardContent>
            {poCoverage.length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No hay órdenes de compra
              </p>
            ) : (
              <div className="space-y-3">
                {poCoverage.map((po) => (
                  <div key={po.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">
                        {po.order_number}
                      </span>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          po.status === "covered"
                            ? "bg-primary/5 text-primary dark:bg-primary/10 dark:text-primary"
                            : po.status === "partial"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/50 dark:text-yellow-300"
                              : "bg-muted text-foreground"
                        }`}
                      >
                        {po.status === "covered"
                          ? "✓ Cubierta"
                          : po.status === "partial"
                            ? "⚠ Parcial"
                            : "○ Pendiente"}
                      </span>
                    </div>
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>{formatCurrency(po.total_amount)}</span>
                      <span>
                        {po.total_amount > 0
                          ? Math.min(
                              100,
                              (po.covered_amount / po.total_amount) * 100
                            ).toFixed(0)
                          : 0}
                        %
                      </span>
                    </div>
                    <div className="bg-muted h-1 w-full rounded-full">
                      <div
                        className={`h-1 rounded-full ${
                          po.status === "covered"
                            ? "bg-primary"
                            : po.status === "partial"
                              ? "bg-yellow-500"
                              : "bg-muted-foreground"
                        }`}
                        style={{
                          width: `${po.total_amount > 0 ? Math.min(100, (po.covered_amount / po.total_amount) * 100) : 0}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {poCoverage.filter((po) => po.status === "pending").length > 0 && (
              <div className="flex items-start gap-2 rounded bg-yellow-50 p-2 dark:bg-yellow-950/30">
                <AlertTriangle className="mt-0.5 h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                <div>
                  <p className="text-sm font-medium">
                    Órdenes de compra pendientes de pago
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {poCoverage.filter((po) => po.status === "pending").length}{" "}
                    orden(es) sin cobertura
                  </p>
                </div>
              </div>
            )}
            {kpis.deviation > 5 && (
              <div className="bg-destructive/10 dark:bg-destructive/20 flex items-start gap-2 rounded p-2">
                <AlertTriangle className="text-destructive mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">
                    Desviación presupuestaria
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Los costes reales superan en {kpis.deviation.toFixed(1)}% el
                    estimado
                  </p>
                </div>
              </div>
            )}
            {margin < 0 && (
              <div className="bg-destructive/10 dark:bg-destructive/20 flex items-start gap-2 rounded p-2">
                <AlertTriangle className="text-destructive mt-0.5 h-4 w-4" />
                <div>
                  <p className="text-sm font-medium">Margen negativo</p>
                  <p className="text-muted-foreground text-xs">
                    Los costes superan el presupuesto del cliente en{" "}
                    {formatCurrency(Math.abs(margin))}
                  </p>
                </div>
              </div>
            )}
            {poCoverage.filter((po) => po.status === "pending").length === 0 &&
              kpis.deviation <= 5 &&
              margin >= 0 && (
                <div className="bg-primary/10 dark:bg-primary/20 flex items-start gap-2 rounded p-2">
                  <CheckCircle2 className="text-primary mt-0.5 h-4 w-4" />
                  <p className="text-sm font-medium">
                    Todo en orden. No hay alertas.
                  </p>
                </div>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  valueColor?: string;
  valueIcon?: React.ComponentType<{ className?: string }>;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  valueColor,
  valueIcon: ValueIcon,
}: KPICardProps) {
  return (
    <Card className="from-card to-muted/30 border-none bg-gradient-to-br shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {title}
        </CardTitle>
        <Icon className={color} />
      </CardHeader>
      <CardContent>
        <div
          className={`flex items-center gap-2 text-2xl font-bold ${valueColor || ""}`}
        >
          {ValueIcon && valueColor && (
            <ValueIcon className={`h-5 w-5 ${valueColor}`} />
          )}
          <span>{value}</span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
