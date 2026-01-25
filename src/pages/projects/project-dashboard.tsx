import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, TrendingUp, FolderKanban, AlertTriangle, CheckCircle2, ArrowUp, ArrowDown, FileText, Receipt } from 'lucide-react';
import { getPhaseLabel, getBudgetCategoryLabel, isCostCategory } from '@/lib/utils';
import type { Project, Payment, ProjectBudgetLine, ProjectPhase, BudgetCategory } from '@/types';

interface PurchaseOrderCoverage {
  id: string;
  order_number: string;
  total_amount: number;
  covered_amount: number;
  status: 'covered' | 'partial' | 'pending';
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
  const [project, setProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [budgetLines, setBudgetLines] = useState<ProjectBudgetLine[]>([]);
  const [poCoverage, setPoCoverage] = useState<PurchaseOrderCoverage[]>([]);
  const [items, setItems] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch project
    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    if (projectData) setProject(projectData);

    // Fetch payments
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('*')
      .eq('project_id', projectId);
    if (paymentsData) setPayments(paymentsData || []);

    // Fetch budget lines
    const { data: budgetLinesData, error: budgetLinesError } = await supabase
      .from('project_budget_lines')
      .select('*')
      .eq('project_id', projectId);
    
    if (budgetLinesError) {
      // Table might not exist yet - silently handle it
      if (budgetLinesError.code === '42P01' || budgetLinesError.message?.includes('does not exist')) {
        console.warn('Table project_budget_lines does not exist yet. Please run migrations.');
        setBudgetLines([]);
      } else {
        console.error('Error fetching budget lines:', budgetLinesError);
        setBudgetLines([]);
      }
    } else {
      setBudgetLines(budgetLinesData || []);
    }

    // Fetch purchase orders with coverage
    const { data: posData } = await supabase
      .from('purchase_orders')
      .select('id, order_number, project_items(id, quantity, unit_cost)')
      .eq('project_id', projectId);

    if (posData) {
      const coveragePromises = posData.map(async (po) => {
        const totalAmount = (po.project_items || []).reduce(
          (sum: number, item: any) => sum + (item.unit_cost * item.quantity),
          0
        );
        
        const { data: paymentsForPO } = await supabase
          .from('payments')
          .select('amount')
          .eq('purchase_order_id', po.id);
        
        const coveredAmount = (paymentsForPO || []).reduce(
          (sum, p) => sum + Number(p.amount),
          0
        );
        
        let status: 'covered' | 'partial' | 'pending' = 'pending';
        if (coveredAmount >= totalAmount) status = 'covered';
        else if (coveredAmount > 0) status = 'partial';
        
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
      .from('project_items')
      .select('id, quantity, unit_cost, unit_price')
      .eq('project_id', projectId);
    if (itemsData) setItems(itemsData || []);

    setLoading(false);
  };

  // Calculate totals
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  
  // Products
  const totalProductsCost = items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  const totalProductsPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  
  // Budget lines
  const clientBudgetLines = budgetLines.filter(line => !line.is_internal_cost);
  const totalBudgetLinesEstimated = clientBudgetLines.reduce((sum, line) => sum + Number(line.estimated_amount), 0);
  // Solo contar como coste real las categorías de coste (excluir own_fees que son ingresos)
  const costBudgetLines = budgetLines.filter(line => isCostCategory(line.category));
  const totalBudgetLinesActual = costBudgetLines.reduce((sum, line) => sum + Number(line.actual_amount), 0);
  
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
    const totalEstimated = costBudgetLines.reduce((sum, line) => sum + Number(line.estimated_amount), 0);
    const totalActual = costBudgetLines.reduce((sum, line) => sum + Number(line.actual_amount), 0);
    const deviation = totalEstimated > 0 ? ((totalActual - totalEstimated) / totalEstimated) * 100 : 0;
    
    return { coverage, margin, marginPercentage, progress: phaseProgress, deviation };
  };

  const getPhaseProgress = (phase?: ProjectPhase): number => {
    const phases: ProjectPhase[] = ['diagnosis', 'design', 'executive', 'budget', 'construction', 'delivery'];
    if (!phase) return 0;
    const index = phases.indexOf(phase);
    return ((index + 1) / phases.length) * 100;
  };

  const kpis = calculateKPIs();

  // Group budget lines by category for display
  const budgetLinesByCategory = budgetLines.reduce((acc, line) => {
    if (!acc[line.category]) {
      acc[line.category] = { estimated: 0, actual: 0, count: 0 };
    }
    acc[line.category].estimated += Number(line.estimated_amount);
    acc[line.category].actual += Number(line.actual_amount);
    acc[line.category].count += 1;
    return acc;
  }, {} as Record<BudgetCategory, { estimated: number; actual: number; count: number }>);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <KPICard
          title="Avance"
          value={`${kpis.progress.toFixed(0)}%`}
          subtitle={project?.phase ? getPhaseLabel(project.phase) : 'No asignada'}
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
          value={`${kpis.deviation >= 0 ? '+' : ''}${kpis.deviation.toFixed(1)}%`}
          subtitle={kpis.deviation > 5 ? 'Sobrecoste' : kpis.deviation < -5 ? 'Ahorro' : 'En línea'}
          icon={AlertTriangle}
          color="text-muted-foreground"
          valueIcon={kpis.deviation < 0 ? ArrowDown : ArrowUp}
          valueColor={kpis.deviation < 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}
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
          color={margin >= 0 ? 'chart-4' : 'destructive'}
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
              <p className="text-sm text-muted-foreground">No hay partidas de presupuesto</p>
            ) : (
              <div className="space-y-3">
                {(Object.entries(budgetLinesByCategory) as [BudgetCategory, { estimated: number; actual: number; count: number }][]).map(([category, data]) => {
                  const deviation = data.estimated > 0 
                    ? ((data.actual - data.estimated) / data.estimated) * 100 
                    : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{getBudgetCategoryLabel(category)}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          deviation > 5 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                          deviation < -5 ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {deviation >= 0 ? '+' : ''}{deviation.toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Est: {formatCurrency(data.estimated)}</span>
                        <span>Real: {formatCurrency(data.actual)}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full ${
                            deviation > 5 ? 'bg-red-500' :
                            deviation < -5 ? 'bg-green-500' :
                            'bg-primary'
                          }`}
                          style={{ width: `${data.estimated > 0 ? Math.min(100, (data.actual / data.estimated) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
                {/* Products summary */}
                <div className="pt-2 border-t space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Productos</span>
                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      +{((totalProductsPrice - totalProductsCost) / totalProductsPrice * 100).toFixed(0)}% margen
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
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
              <p className="text-sm text-muted-foreground">No hay órdenes de compra</p>
            ) : (
              <div className="space-y-3">
                {poCoverage.map((po) => (
                  <div key={po.id} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{po.order_number}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        po.status === 'covered' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        po.status === 'partial' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {po.status === 'covered' ? '✓ Cubierta' : po.status === 'partial' ? '⚠ Parcial' : '○ Pendiente'}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(po.total_amount)}</span>
                      <span>{po.total_amount > 0 ? Math.min(100, (po.covered_amount / po.total_amount) * 100).toFixed(0) : 0}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1">
                      <div 
                        className={`h-1 rounded-full ${
                          po.status === 'covered' ? 'bg-green-500' :
                          po.status === 'partial' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`}
                        style={{ width: `${po.total_amount > 0 ? Math.min(100, (po.covered_amount / po.total_amount) * 100) : 0}%` }}
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
            {poCoverage.filter(po => po.status === 'pending').length > 0 && (
              <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Órdenes de compra pendientes de pago</p>
                  <p className="text-xs text-muted-foreground">
                    {poCoverage.filter(po => po.status === 'pending').length} orden(es) sin cobertura
                  </p>
                </div>
              </div>
            )}
            {kpis.deviation > 5 && (
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Desviación presupuestaria</p>
                  <p className="text-xs text-muted-foreground">
                    Los costes reales superan en {kpis.deviation.toFixed(1)}% el estimado
                  </p>
                </div>
              </div>
            )}
            {margin < 0 && (
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Margen negativo</p>
                  <p className="text-xs text-muted-foreground">
                    Los costes superan el presupuesto del cliente en {formatCurrency(Math.abs(margin))}
                  </p>
                </div>
              </div>
            )}
            {poCoverage.filter(po => po.status === 'pending').length === 0 && 
             kpis.deviation <= 5 && 
             margin >= 0 && (
              <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <p className="text-sm font-medium">Todo en orden. No hay alertas.</p>
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

function KPICard({ title, value, subtitle, icon: Icon, color, valueColor, valueIcon: ValueIcon }: KPICardProps) {
  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={color} />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold flex items-center gap-2 ${valueColor || ''}`}>
          {ValueIcon && valueColor && <ValueIcon className={`h-5 w-5 ${valueColor}`} />}
          <span>{value}</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
