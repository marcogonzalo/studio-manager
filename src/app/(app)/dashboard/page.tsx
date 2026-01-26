'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Plus,
  ArrowRight,
  FolderKanban,
  Users,
  Calendar,
  User as UserIcon,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  LayoutDashboard,
} from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabase';
import { format } from 'date-fns';
import { toast } from 'sonner';
import type { Project } from '@/types';

interface DashboardStats {
  activeProjects: number;
  activeProjectsChange: number;
  totalClients: number;
  newClientsThisMonth: number;
  totalExpensesThisMonth: number;
  totalIncomeThisMonth: number;
  recentProjects: Project[];
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    activeProjectsChange: 0,
    totalClients: 0,
    newClientsThisMonth: 0,
    totalExpensesThisMonth: 0,
    totalIncomeThisMonth: 0,
    recentProjects: [],
  });
  const [loading, setLoading] = useState(true);
  const supabase = getSupabaseClient();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Obtener fecha actual y del mes pasado
      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      // Proyectos activos (sin completed_date o status != 'completed')
      const { data: activeProjects, error: activeError } = await supabase
        .from('projects')
        .select('id, created_at, completed_date')
        .or('completed_date.is.null,status.neq.completed');

      // Proyectos activos al final del mes pasado
      const { data: activeProjectsLastMonth, error: activeLastMonthError } =
        await supabase
          .from('projects')
          .select('id, completed_date')
          .or(
            `completed_date.is.null,completed_date.gt.${lastDayLastMonth.toISOString()}`
          );

      // Total de clientes
      const { data: clients, error: clientsError } = await supabase
        .from('clients')
        .select('id, created_at');

      // Clientes nuevos este mes
      const { data: newClients, error: newClientsError } = await supabase
        .from('clients')
        .select('id')
        .gte('created_at', firstDayThisMonth.toISOString());

      // Gastos adicionales este mes
      const { data: additionalCosts, error: additionalCostsError } = await supabase
        .from('additional_project_costs')
        .select('amount')
        .gte('created_at', firstDayThisMonth.toISOString());

      // Órdenes de compra confirmadas este mes
      const { data: confirmedOrders, error: confirmedOrdersError } = await supabase
        .from('purchase_orders')
        .select('id')
        .eq('status', 'confirmed')
        .gte('created_at', firstDayThisMonth.toISOString());

      // Calcular total de órdenes de compra confirmadas
      let ordersTotal = 0;
      if (confirmedOrders && confirmedOrders.length > 0) {
        const orderIds = confirmedOrders.map((order) => order.id);
        const { data: orderItems, error: orderItemsError } = await supabase
          .from('project_items')
          .select('quantity, unit_cost')
          .in('purchase_order_id', orderIds);

        if (!orderItemsError && orderItems) {
          ordersTotal = orderItems.reduce((sum, item) => {
            return sum + Number(item.quantity || 0) * Number(item.unit_cost || 0);
          }, 0);
        }
      }

      // Total de gastos adicionales
      const additionalCostsTotal =
        additionalCosts?.reduce(
          (sum, cost) => sum + Number(cost.amount || 0),
          0
        ) || 0;

      // Proyectos recientes (últimos 5)
      const { data: recentProjects, error: recentError } = await supabase
        .from('projects')
        .select('*, client:clients(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      if (
        activeError ||
        activeLastMonthError ||
        clientsError ||
        newClientsError ||
        additionalCostsError ||
        confirmedOrdersError ||
        recentError
      ) {
        toast.error('Error al cargar estadísticas');
        return;
      }

      const activeCount = activeProjects?.length || 0;
      const activeLastMonthCount = activeProjectsLastMonth?.length || 0;
      const activeChange =
        activeLastMonthCount > 0
          ? Math.round(
              ((activeCount - activeLastMonthCount) / activeLastMonthCount) * 100
            )
          : activeCount > 0
            ? 100
            : 0;

      setStats({
        activeProjects: activeCount,
        activeProjectsChange: activeChange,
        totalClients: clients?.length || 0,
        newClientsThisMonth: newClients?.length || 0,
        totalExpensesThisMonth: additionalCostsTotal + ordersTotal,
        totalIncomeThisMonth: 0,
        recentProjects: recentProjects || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (change: number) => {
    if (change === 0) return 'Sin cambios';
    const sign = change > 0 ? '+' : '';
    return `${sign}${change}%`;
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-start gap-3">
          <LayoutDashboard className="h-8 w-8 text-primary mt-1" />
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Hola, Bienvenido
            </h2>
            <p className="text-muted-foreground mt-1">
              Aquí tienes un resumen de tu estudio de diseño.
            </p>
          </div>
        </div>
        <Button
          asChild
          className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Link href="/projects">
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 dark:from-card dark:to-secondary/10 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Proyectos Activos
            </CardTitle>
            <FolderKanban className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-foreground">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {stats.activeProjects}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatChange(stats.activeProjectsChange)} desde el mes pasado
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 dark:from-card dark:to-secondary/10 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Clientes Totales
            </CardTitle>
            <Users className="h-4 w-4 text-chart-2 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-foreground">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {stats.totalClients}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  +{stats.newClientsThisMonth} nuevos este mes
                </p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 dark:from-card dark:to-secondary/10 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Gastos
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-foreground">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(stats.totalExpensesThisMonth)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Este mes</p>
              </>
            )}
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-secondary/20 dark:from-card dark:to-secondary/10 hover:shadow-lg transition-all duration-300 group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Ingresos
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-2xl font-bold text-foreground">...</div>
            ) : (
              <>
                <div className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('es-ES', {
                    style: 'currency',
                    currency: 'EUR',
                  }).format(stats.totalIncomeThisMonth)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este mes (próximamente)
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-none shadow-md">
          <CardHeader>
            <CardTitle>Proyectos Recientes</CardTitle>
            <CardDescription>
              {loading
                ? 'Cargando...'
                : stats.recentProjects.length > 0
                  ? `${stats.recentProjects.length} proyectos recientes`
                  : 'No tienes proyectos recientes.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">
                Cargando...
              </div>
            ) : stats.recentProjects.length > 0 ? (
              <div className="space-y-4">
                {stats.recentProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-accent/10 group border border-border/50"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="p-2 bg-primary/10 text-primary rounded-full">
                        <FolderKanban className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-none text-foreground truncate">
                          {project.name}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {project.client?.full_name && (
                            <div className="flex items-center gap-1">
                              <UserIcon className="h-3 w-3" />
                              <span className="truncate">
                                {project.client.full_name}
                              </span>
                            </div>
                          )}
                          {project.start_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>
                                {format(new Date(project.start_date), 'dd/MM/yyyy')}
                              </span>
                            </div>
                          )}
                          <span className="capitalize">{project.status}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform flex-shrink-0 ml-4" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center space-y-4 bg-secondary/10 rounded-xl border border-dashed border-border">
                <div className="p-4 bg-background rounded-full shadow-sm">
                  <FolderKanban className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-foreground">
                    Comienza tu primer proyecto
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Crea un proyecto para empezar a gestionar clientes, espacios y
                    presupuestos.
                  </p>
                </div>
                <Button variant="outline" asChild className="mt-4">
                  <Link href="/projects">Crear Proyecto</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3 border-none shadow-md bg-primary/5">
          <CardHeader>
            <CardTitle>Accesos Rápidos</CardTitle>
            <CardDescription>Acciones frecuentes</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link
              href="/clients"
              className="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-accent/10 group border border-border/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-chart-2/10 text-chart-2 rounded-full group-hover:scale-110 transition-transform">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none text-foreground">
                    Registrar Cliente
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Añadir nuevo contacto
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href="/catalog"
              className="flex items-center justify-between p-4 bg-background rounded-xl shadow-sm hover:shadow-md transition-all hover:bg-accent/10 group border border-border/50"
            >
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-chart-4/10 text-chart-4 rounded-full group-hover:scale-110 transition-transform">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium leading-none text-foreground">
                    Añadir Producto
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Actualizar catálogo
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
