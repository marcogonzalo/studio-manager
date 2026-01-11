import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Wallet, TrendingUp, FolderKanban, AlertTriangle, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getPhaseLabel } from '@/lib/utils';
import type { Project, Payment, AdditionalCost, ProjectPhase } from '@/types';

interface PurchaseOrderCoverage {
  id: string;
  order_number: string;
  total_amount: number;
  covered_amount: number;
  status: 'covered' | 'partial' | 'pending';
}

interface DashboardKPIs {
  coverage: number; // Porcentaje de cobertura
  utility: number; // Utilidad en €
  progress: number; // Porcentaje de avance
  deviation: number; // Porcentaje de desviación
}

interface ProjectDashboardProps {
  projectId: string;
}

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  const [poCoverage, setPoCoverage] = useState<PurchaseOrderCoverage[]>([]);
  const [items, setItems] = useState<any[]>([]);
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

    // Fetch additional costs
    const { data: costsData } = await supabase
      .from('additional_project_costs')
      .select('*')
      .eq('project_id', projectId);
    if (costsData) setAdditionalCosts(costsData || []);

    // Fetch purchase orders with coverage
    const { data: posData } = await supabase
      .from('purchase_orders')
      .select('id, order_number, project_items(id, quantity, unit_cost)')
      .eq('project_id', projectId);

    if (posData) {
      // Calculate coverage for each PO
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
      .select('*')
      .eq('project_id', projectId);
    if (itemsData) setItems(itemsData || []);

    setLoading(false);
  };

  // Calculate KPIs
  const calculateKPIs = (): DashboardKPIs => {
    const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalCost = items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
    const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
    const totalCosts = totalCost + totalAdditionalCosts;
    
    // Client budget: Use total price of items + additional costs (if no explicit budget field exists)
    const totalPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
    const clientBudget = totalPrice + totalAdditionalCosts;
    
    const coverage = clientBudget > 0 ? (totalPaid / clientBudget) * 100 : 0;
    const utility = clientBudget - totalCosts;
    
    // Progress: Based on phase + items completed
    const phaseProgress = getPhaseProgress(project?.phase);
    const progress = phaseProgress;
    
    // Deviation: (actual_cost - estimated_cost) / estimated_cost * 100
    // Estimated cost is the sum of item costs
    const estimatedCost = items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
    const actualCost = totalCosts;
    const deviation = estimatedCost > 0 ? ((actualCost - estimatedCost) / estimatedCost) * 100 : 0;
    
    return { coverage, utility, progress, deviation };
  };

  const getPhaseProgress = (phase?: ProjectPhase): number => {
    const phases: ProjectPhase[] = ['diagnosis', 'design', 'executive', 'budget', 'construction', 'delivery'];
    if (!phase) return 0;
    const index = phases.indexOf(phase);
    return ((index + 1) / phases.length) * 100;
  };

  const kpis = calculateKPIs();
  const totalPaid = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalCost = items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  const totalAdditionalCosts = additionalCosts.reduce((sum, cost) => sum + Number(cost.amount), 0);
  const totalCosts = totalCost + totalAdditionalCosts;
  const totalPrice = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const clientBudget = totalPrice + totalAdditionalCosts;

  if (loading) {
    return <div className="text-center py-12">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Cobertura"
          value={`${kpis.coverage.toFixed(1)}%`}
          subtitle={`${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalPaid)} de ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(clientBudget)}`}
          icon={Wallet}
          color="chart-1"
        />
        <KPICard
          title="Utilidad"
          value={new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(kpis.utility)}
          subtitle={`Margen: ${clientBudget > 0 ? ((kpis.utility / clientBudget) * 100).toFixed(1) : 0}%`}
          icon={TrendingUp}
          color="chart-2"
        />
        <KPICard
          title="Avance"
          value={`${kpis.progress.toFixed(0)}%`}
          subtitle={project?.phase ? getPhaseLabel(project.phase) : 'No asignada'}
          icon={FolderKanban}
          color="primary"
        />
        <KPICard
          title="Desviación"
          value={`${kpis.deviation >= 0 ? '+' : ''}${kpis.deviation.toFixed(1)}%`}
          subtitle={kpis.deviation > 5 ? 'Sobrecoste detectado' : kpis.deviation < -5 ? 'Ahorro' : 'En línea'}
          icon={AlertTriangle}
          color={kpis.deviation > 5 ? 'destructive' : 'chart-1'}
        />
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Financiero</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Presupuesto Cliente</p>
              <p className="text-2xl font-bold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(clientBudget)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Costes Totales</p>
              <p className="text-2xl font-bold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalCosts)}</p>
              <p className="text-xs text-muted-foreground">
                {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalCost)} productos + {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalAdditionalCosts)} adicionales
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Margen Bruto</p>
              <p className="text-2xl font-bold text-green-600">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(kpis.utility)}</p>
              <p className="text-xs text-muted-foreground">
                {clientBudget > 0 ? ((kpis.utility / clientBudget) * 100).toFixed(1) : 0}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pagos Recibidos</p>
              <p className="text-2xl font-bold">{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(totalPaid)}</p>
              <p className="text-xs text-muted-foreground">
                Pendiente: {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(Math.max(0, clientBudget - totalPaid))}
              </p>
            </div>
          </div>
          <div className="pt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Cobertura de Pagos</span>
              <span>{kpis.coverage.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, kpis.coverage)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PO Coverage & Project Progress */}
      <div className="grid gap-4 md:grid-cols-2">
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
                      <span>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(po.covered_amount)} / {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(po.total_amount)}</span>
                      <span>{po.total_amount > 0 ? ((po.covered_amount / po.total_amount) * 100).toFixed(0) : 0}%</span>
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
                <div className="pt-2 border-t">
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                      poCoverage.reduce((sum, po) => sum + po.covered_amount, 0)
                    )} / {new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(
                      poCoverage.reduce((sum, po) => sum + po.total_amount, 0)
                    )}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Avance del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Fase Actual</span>
                  <span className="text-sm text-muted-foreground">{kpis.progress.toFixed(0)}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{project?.phase ? getPhaseLabel(project.phase) : 'No asignada'}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${kpis.progress}%` }}
                  />
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Ítems del Presupuesto</p>
                <p className="text-sm text-muted-foreground">
                  {items.length} ítem{items.length !== 1 ? 's' : ''} en el presupuesto
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alertas y Desviaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {poCoverage.filter(po => po.status === 'pending').length > 0 && (
              <div className="flex items-start gap-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
                <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">POs sin cobertura de pago</p>
                  <p className="text-xs text-muted-foreground">
                    {poCoverage.filter(po => po.status === 'pending').length} orden(es) pendiente(s) de pago
                  </p>
                </div>
              </div>
            )}
            {kpis.deviation > 5 && (
              <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Desviación presupuestaria detectada</p>
                  <p className="text-xs text-muted-foreground">
                    Sobrecoste de {kpis.deviation.toFixed(1)}% sobre el estimado
                  </p>
                </div>
              </div>
            )}
            {poCoverage.filter(po => po.status === 'pending').length === 0 && kpis.deviation <= 5 && (
              <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5" />
                <p className="text-sm font-medium">No hay alertas. Todo en orden.</p>
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
}

function KPICard({ title, value, subtitle, icon: Icon, color }: KPICardProps) {
  return (
    <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={`h-4 w-4 text-${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
