"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth-provider";
import { PageLoading } from "@/components/loaders/page-loading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, FolderKanban, Users, Truck, ShoppingBag } from "lucide-react";
import { getSupabaseClient } from "@/lib/supabase";
import type { PlanConfig } from "@/types";
import { reportError } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

const PLAN_DISPLAY_NAMES: Record<string, string> = {
  BASE: "Base",
  PRO: "Pro",
  STUDIO: "Studio",
};

const DURATION_LABELS: Record<string, string> = {
  "1m": "Mensual",
  "1y": "Anual",
  "15d": "Prueba 15 días",
};

interface PlanAssignmentRow {
  id: string;
  assigned_at: string;
  duration: string;
  expires_at: string;
  next_period_duration: string | null;
  plans: { code: string; name: string } | null;
}

interface UsageCounts {
  projects: number;
  clients: number;
  suppliers: number;
  products: number;
  storage: number; // in bytes
}

const CONSUMABLE_LABELS: Record<keyof UsageCounts, string> = {
  projects: "Proyectos activos",
  clients: "Clientes",
  suppliers: "Proveedores",
  products: "Productos en catálogo",
  storage: "Almacenamiento",
};

const CONSUMABLE_ICONS: Record<
  keyof UsageCounts,
  React.ComponentType<{ className?: string }>
> = {
  projects: FolderKanban,
  clients: Users,
  suppliers: Truck,
  products: ShoppingBag,
  storage: ShoppingBag, // TODO: use a better icon for storage
};

const CONFIG_LIMIT_KEYS: Record<
  Exclude<keyof UsageCounts, "storage">,
  keyof Pick<
    PlanConfig,
    | "projects_limit"
    | "clients_limit"
    | "suppliers_limit"
    | "catalog_products_limit"
  >
> = {
  projects: "projects_limit",
  clients: "clients_limit",
  suppliers: "suppliers_limit",
  products: "catalog_products_limit",
};

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 MB";
  const mb = bytes / (1024 * 1024);
  if (mb < 1024) {
    return `${mb.toFixed(mb < 10 ? 1 : 0)} MB`;
  }
  const gb = mb / 1024;
  return `${gb.toFixed(gb < 10 ? 1 : 0)} GB`;
}

export default function SettingsPlanPage() {
  const { user, effectivePlan, planLoading } = useAuth();
  const supabase = getSupabaseClient();
  const [history, setHistory] = useState<PlanAssignmentRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [usage, setUsage] = useState<UsageCounts>({
    projects: 0,
    clients: 0,
    suppliers: 0,
    products: 0,
    storage: 0,
  });
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setHistoryLoading(false);
      return;
    }
    void (async () => {
      const { data, error } = await supabase
        .from("plan_assignments")
        .select(
          "id, assigned_at, duration, expires_at, next_period_duration, plans(code, name)"
        )
        .eq("user_id", user.id)
        .order("assigned_at", { ascending: false });
      if (error) {
        reportError(error, "Plan history:");
        setHistory([]);
      } else {
        setHistory((data as PlanAssignmentRow[] | null) ?? []);
      }
      setHistoryLoading(false);
    })();
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setUsageLoading(false);
      return;
    }
    void (async () => {
      const [projectsRes, clientsRes, suppliersRes, productsRes, storageRes] =
        await Promise.all([
          supabase.from("projects").select("id").eq("user_id", user.id).eq("status", "active"),
          supabase.from("clients").select("id").eq("user_id", user.id),
          supabase.from("suppliers").select("id").eq("user_id", user.id),
          supabase.from("products").select("id").eq("user_id", user.id),
          supabase.from("user_storage_usage").select("bytes_used").eq("user_id", user.id).single(),
        ]);
      setUsage({
        projects: projectsRes.data?.length ?? 0,
        clients: clientsRes.data?.length ?? 0,
        suppliers: suppliersRes.data?.length ?? 0,
        products: productsRes.data?.length ?? 0,
        storage: storageRes.data?.bytes_used ?? 0,
      });
      setUsageLoading(false);
    })();
  }, [user?.id]);

  if (planLoading || !user) {
    return <PageLoading variant="form" />;
  }

  const currentPlanCode = effectivePlan?.plan_code ?? "BASE";
  const currentPlanLabel =
    PLAN_DISPLAY_NAMES[currentPlanCode] ?? currentPlanCode;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentAssignment = history.find(
    (r) => new Date(r.expires_at) >= today
  );
  const pastHistory = history.filter((r) => new Date(r.expires_at) < today);
  const showExpiryText =
    currentPlanCode !== "BASE" &&
    currentAssignment &&
    currentAssignment.expires_at;
  const expiryLabel = currentAssignment?.next_period_duration
    ? "Renueva el"
    : "Finaliza el";
  const expiryDateFormatted = currentAssignment
    ? formatDate(currentAssignment.expires_at, {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "";
  const periodPillLabel =
    currentPlanCode === "BASE"
      ? "∞"
      : (DURATION_LABELS[currentAssignment?.duration ?? ""] ?? "—");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
          Tu plan
        </h1>
        <p className="text-muted-foreground mt-1">
          Plan actual e histórico de planes adquiridos
        </p>
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="flex flex-row flex-wrap items-center gap-4 space-y-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="m-0 flex flex-wrap items-center gap-2 text-lg font-medium">
              Plan{" "}
              <span className="text-primary font-bold">{currentPlanLabel}</span>
            </h2>
            {currentAssignment?.next_period_duration != null && (
              <span className="bg-secondary text-secondary-foreground rounded-full px-3 py-1 text-sm font-medium">
                {periodPillLabel}
              </span>
            )}
            {showExpiryText && (
              <span className="text-muted-foreground text-xs">
                {expiryLabel} {expiryDateFormatted}
              </span>
            )}
          </div>
          <Button asChild className="ml-auto shrink-0 gap-2">
            <Link href="/settings/plan/change">
              <Rocket className="h-4 w-4" />
              Mejorar plan
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          <div className="border-border border-t pt-6">
            <h3 className="text-foreground mb-3 text-base font-semibold">
              Consumibles
            </h3>
            {usageLoading ? (
              <p className="text-muted-foreground text-sm">Cargando…</p>
            ) : (
              <div className="space-y-4">
                {(
                  ["projects", "clients", "suppliers", "products", "storage"] as const
                ).map((key) => {
                  if (key === "storage") {
                    const usedBytes = usage.storage;
                    const limitMB = effectivePlan?.config?.storage_limit_mb ?? 500;
                    const limitBytes = limitMB * 1024 * 1024;
                    const isUnlimited = limitMB === -1;
                    const percent = isUnlimited
                      ? 5
                      : limitMB === 0
                        ? 0
                        : Math.min(100, (usedBytes / limitBytes) * 100);
                    const label = CONSUMABLE_LABELS.storage;
                    const Icon = CONSUMABLE_ICONS.storage;
                    return (
                      <div key={key}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-foreground flex items-center gap-2 font-medium">
                            <Icon className="h-4 w-4 shrink-0" />
                            {label}
                          </span>
                          <span className="text-muted-foreground">
                            {isUnlimited ? `${formatBytes(usedBytes)} / ∞` : `${formatBytes(usedBytes)} / ${formatBytes(limitBytes)}`}
                          </span>
                        </div>
                        <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                          <div
                            className="bg-primary h-full rounded-full transition-[width] duration-300"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  }
                  
                  const used = usage[key];
                  const limit =
                    effectivePlan?.config?.[CONFIG_LIMIT_KEYS[key]] ??
                    (key === "projects" ? 1 : key === "products" ? 50 : 10);
                  const isUnlimited = limit === -1;
                  const percent = isUnlimited
                    ? 5
                    : limit === 0
                      ? 0
                      : Math.min(100, (used / limit) * 100);
                  const label = CONSUMABLE_LABELS[key];
                  const Icon = CONSUMABLE_ICONS[key];
                  return (
                    <div key={key}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-foreground flex items-center gap-2 font-medium">
                          <Icon className="h-4 w-4 shrink-0" />
                          {label}
                        </span>
                        <span className="text-muted-foreground">
                          {isUnlimited ? `${used} / ∞` : `${used} / ${limit}`}
                        </span>
                      </div>
                      <div className="bg-muted h-2 w-full overflow-hidden rounded-full">
                        <div
                          className="bg-primary h-full rounded-full transition-[width] duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-foreground mb-3 text-lg font-semibold">
          Histórico de planes
        </h2>
        {historyLoading ? (
          <div className="text-muted-foreground text-sm">
            Cargando histórico…
          </div>
        ) : pastHistory.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No hay registros de planes anteriores.
          </p>
        ) : (
          <ul className="space-y-2">
            {pastHistory.map((row) => {
              const planCode = row.plans?.code ?? "—";
              const planLabel = PLAN_DISPLAY_NAMES[planCode] ?? planCode;
              const durationLabel =
                DURATION_LABELS[row.duration] ?? row.duration;
              return (
                <li key={row.id}>
                  <Card>
                    <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
                      <div>
                        <p className="font-medium">{planLabel}</p>
                        <p className="text-muted-foreground text-sm">
                          {durationLabel}
                          {" · "}
                          Asignado{" "}
                          {formatDate(row.assigned_at, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                          {" · "}
                          Expira{" "}
                          {formatDate(row.expires_at, {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
