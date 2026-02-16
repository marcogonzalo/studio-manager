"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { AnimatedCounter } from "@/components/ui/animated-counter";
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
} from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { getSupabaseClient } from "@/lib/supabase";
import { reportError } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Project, Profile } from "@/types";

interface DashboardStats {
  activeProjects: number;
  activeProjectsChange: number;
  totalClients: number;
  newClientsThisMonth: number;
  totalExpensesThisMonth: number;
  totalIncomeThisMonth: number;
  recentProjects: Project[];
}

function StatCardSkeleton() {
  return (
    <Card className="to-secondary/20 dark:from-card dark:to-secondary/10 border-none bg-gradient-to-br from-white shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="mb-2 h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  );
}

function ProjectRowSkeleton() {
  return (
    <div className="bg-background border-border/50 flex items-center justify-between rounded-xl border p-4">
      <div className="flex flex-1 items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  );
}

function QuickActionSkeleton() {
  return (
    <div className="bg-background border-border/50 flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-9 w-9 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="h-4 w-4" />
    </div>
  );
}

function getFirstName(fullName: string | null | undefined): string {
  if (!fullName?.trim()) return "Bienvenido";
  const first = fullName.trim().split(/\s+/)[0];
  return first || "Bienvenido";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on mount only
  }, []);

  useEffect(() => {
    if (!user?.id) return;
    supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single()
      .then(({ data }) => setProfile(data ?? null))
      .catch(() => setProfile(null));
  }, [user?.id]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const now = new Date();
      const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const { data: activeProjects, error: activeError } = await supabase
        .from("projects")
        .select("id, created_at, completed_date")
        .or("completed_date.is.null,status.neq.completed");

      const { data: activeProjectsLastMonth, error: activeLastMonthError } =
        await supabase
          .from("projects")
          .select("id, completed_date")
          .or(
            `completed_date.is.null,completed_date.gt.${lastDayLastMonth.toISOString()}`
          );

      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("id, created_at");

      const { data: newClients, error: newClientsError } = await supabase
        .from("clients")
        .select("id")
        .gte("created_at", firstDayThisMonth.toISOString());

      const { data: additionalCosts, error: additionalCostsError } =
        await supabase
          .from("additional_project_costs")
          .select("amount")
          .gte("created_at", firstDayThisMonth.toISOString());

      const { data: confirmedOrders, error: confirmedOrdersError } =
        await supabase
          .from("purchase_orders")
          .select("id")
          .eq("status", "confirmed")
          .gte("created_at", firstDayThisMonth.toISOString());

      let ordersTotal = 0;
      if (confirmedOrders && confirmedOrders.length > 0) {
        const orderIds = confirmedOrders.map((order) => order.id);
        const { data: orderItems, error: orderItemsError } = await supabase
          .from("project_items")
          .select("quantity, unit_cost")
          .in("purchase_order_id", orderIds);

        if (!orderItemsError && orderItems) {
          ordersTotal = orderItems.reduce((sum, item) => {
            return (
              sum + Number(item.quantity || 0) * Number(item.unit_cost || 0)
            );
          }, 0);
        }
      }

      const additionalCostsTotal =
        additionalCosts?.reduce(
          (sum, cost) => sum + Number(cost.amount || 0),
          0
        ) || 0;

      const { data: recentProjects, error: recentError } = await supabase
        .from("projects")
        .select("*, client:clients(full_name)")
        .order("created_at", { ascending: false })
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
        toast.error("Error al cargar estadísticas", { id: "dashboard-stats" });
        return;
      }

      const activeCount = activeProjects?.length || 0;
      const activeLastMonthCount = activeProjectsLastMonth?.length || 0;
      const activeChange =
        activeLastMonthCount > 0
          ? Math.round(
              ((activeCount - activeLastMonthCount) / activeLastMonthCount) *
                100
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
      reportError(error, "Error fetching dashboard stats:");
      toast.error("Error al cargar estadísticas", { id: "dashboard-stats" });
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (change: number) => {
    if (change === 0) return "Sin cambios";
    const sign = change > 0 ? "+" : "";
    return `${sign}${change}%`;
  };

  return (
    <div className="space-y-8">
      <AnimatedSection duration={0.4}>
        <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <LayoutDashboard className="text-primary mt-1 h-8 w-8" />
            <div>
              <h2 className="text-foreground text-3xl font-bold tracking-tight">
                Hola,{" "}
                {getFirstName(
                  profile?.full_name ??
                    (user?.user_metadata?.full_name as string | undefined)
                )}
              </h2>
              <p className="text-muted-foreground mt-1">
                Aquí tienes un resumen de tu estudio de diseño.
              </p>
            </div>
          </div>
          <Button
            asChild
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary/20 animate-glow shadow-lg transition-all hover:scale-105"
          >
            <Link href="/projects">
              <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Link>
          </Button>
        </div>
      </AnimatedSection>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <StaggerContainer
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-4"
          staggerDelay={0.1}
        >
          <StaggerItem>
            <Card className="to-secondary/20 dark:from-card dark:to-secondary/10 group border-none bg-gradient-to-br from-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Proyectos Activos
                </CardTitle>
                <FolderKanban className="text-primary h-4 w-4 transition-transform group-hover:scale-110" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  <AnimatedCounter
                    target={stats.activeProjects}
                    duration={1.5}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {formatChange(stats.activeProjectsChange)} desde el mes pasado
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="to-secondary/20 dark:from-card dark:to-secondary/10 group border-none bg-gradient-to-br from-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Clientes Totales
                </CardTitle>
                <Users className="text-chart-2 h-4 w-4 transition-transform group-hover:scale-110" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  <AnimatedCounter target={stats.totalClients} duration={1.5} />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  +{stats.newClientsThisMonth} nuevos este mes
                </p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="to-secondary/20 dark:from-card dark:to-secondary/10 group border-none bg-gradient-to-br from-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total de Gastos
                </CardTitle>
                <TrendingDown className="text-destructive h-4 w-4 transition-transform group-hover:scale-110" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  <AnimatedCounter
                    target={stats.totalExpensesThisMonth}
                    duration={1.5}
                    prefix="€"
                    decimals={2}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">Este mes</p>
              </CardContent>
            </Card>
          </StaggerItem>

          <StaggerItem>
            <Card className="to-secondary/20 dark:from-card dark:to-secondary/10 group border-none bg-gradient-to-br from-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  Total de Ingresos
                </CardTitle>
                <TrendingUp className="text-primary h-4 w-4 transition-transform group-hover:scale-110" />
              </CardHeader>
              <CardContent>
                <div className="text-foreground text-2xl font-bold">
                  <AnimatedCounter
                    target={stats.totalIncomeThisMonth}
                    duration={1.5}
                    prefix="€"
                    decimals={2}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Este mes (próximamente)
                </p>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <AnimatedSection delay={0.2} className="col-span-4">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Proyectos Recientes</CardTitle>
              <CardDescription>
                {loading
                  ? "Cargando..."
                  : stats.recentProjects.length > 0
                    ? `${stats.recentProjects.length} proyectos recientes`
                    : "No tienes proyectos recientes."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  <ProjectRowSkeleton />
                  <ProjectRowSkeleton />
                  <ProjectRowSkeleton />
                </div>
              ) : stats.recentProjects.length > 0 ? (
                <StaggerContainer className="space-y-4" staggerDelay={0.08}>
                  {stats.recentProjects.map((project) => (
                    <StaggerItem
                      key={project.id}
                      direction="left"
                      distance={15}
                    >
                      <Link
                        href={`/projects/${project.id}`}
                        className="bg-background hover:bg-accent/10 group border-border/50 flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                      >
                        <div className="flex flex-1 items-center space-x-4">
                          <div className="bg-primary/10 text-primary rounded-full p-2">
                            <FolderKanban className="h-5 w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground truncate text-sm leading-none font-medium">
                              {project.name}
                            </p>
                            <div className="text-muted-foreground mt-2 flex items-center gap-4 text-xs">
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
                                    {format(
                                      new Date(project.start_date),
                                      "dd/MM/yyyy"
                                    )}
                                  </span>
                                </div>
                              )}
                              <span className="capitalize">
                                {project.status}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="text-muted-foreground ml-4 h-4 w-4 flex-shrink-0 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </StaggerItem>
                  ))}
                </StaggerContainer>
              ) : (
                <div className="bg-secondary/10 border-border flex flex-col items-center justify-center space-y-4 rounded-xl border border-dashed py-10 text-center">
                  <div className="bg-background rounded-full p-4 shadow-sm">
                    <FolderKanban className="text-muted-foreground h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-foreground font-medium">
                      Comienza tu primer proyecto
                    </h3>
                    <p className="text-muted-foreground mx-auto max-w-xs text-sm">
                      Crea un proyecto para empezar a gestionar clientes,
                      espacios y presupuestos.
                    </p>
                  </div>
                  <Button variant="outline" asChild className="mt-4">
                    <Link href="/projects">Crear Proyecto</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>

        <AnimatedSection delay={0.3} className="col-span-3">
          <Card className="bg-primary/5 border-none shadow-md">
            <CardHeader>
              <CardTitle>Accesos Rápidos</CardTitle>
              <CardDescription>Acciones frecuentes</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {loading ? (
                <>
                  <QuickActionSkeleton />
                  <QuickActionSkeleton />
                </>
              ) : (
                <StaggerContainer
                  className="flex flex-col gap-5"
                  staggerDelay={0.12}
                >
                  <StaggerItem direction="right" distance={15}>
                    <Link
                      href="/clients"
                      className="bg-background hover:bg-accent/10 group border-border/50 flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-chart-2/10 text-chart-2 rounded-full p-2 transition-transform group-hover:scale-110">
                          <Users className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm leading-none font-medium">
                            Registrar Cliente
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Añadir nuevo contacto
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </StaggerItem>

                  <StaggerItem direction="right" distance={15}>
                    <Link
                      href="/catalog"
                      className="bg-background hover:bg-accent/10 group border-border/50 flex items-center justify-between rounded-xl border p-4 shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="bg-chart-4/10 text-chart-4 rounded-full p-2 transition-transform group-hover:scale-110">
                          <ShoppingBag className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-foreground text-sm leading-none font-medium">
                            Añadir Producto
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            Actualizar catálogo
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="text-muted-foreground h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </StaggerItem>
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </AnimatedSection>
      </div>
    </div>
  );
}
