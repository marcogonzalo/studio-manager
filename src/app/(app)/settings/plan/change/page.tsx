"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, X, ArrowRight, ChevronDown } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getSupabaseClient } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { getErrorMessage, reportError } from "@/lib/utils";
import { toast } from "sonner";

const PRICING_CURRENCY = "EUR";

const ANNUAL_SAVINGS_MONTHS = 2;
const ANNUAL_SAVINGS_PERCENT = Math.round((ANNUAL_SAVINGS_MONTHS / 12) * 100);

type PlanCode = "PRO" | "STUDIO";

interface PlanOption {
  name: string;
  planCode: PlanCode;
  description: string;
  price: string;
  annualPrice: string | null;
  currency: string | null;
  features: string[];
  popular: boolean;
}

const PLANS: PlanOption[] = [
  {
    name: "Pro",
    planCode: "PRO",
    description: "Plan profesional con más recursos y funcionalidades",
    price: "25",
    annualPrice: "250",
    currency: PRICING_CURRENCY,
    features: [
      "Todas las características base",
      "Hasta 10 proyectos",
      "50 clientes",
      "50 proveedores",
      "500 productos en catálogo",
      "Exportación PDF personalizada",
      "Selección de moneda por proyecto",
      "Órdenes de compra",
      "Control de costes",
      "Gestión de pagos",
      "Subida de renders y documentos, notas y resumen",
    ],
    popular: true,
  },
  {
    name: "Studio",
    planCode: "STUDIO",
    description: "Plan ilimitado para estudios",
    price: "75",
    annualPrice: "750",
    currency: PRICING_CURRENCY,
    features: [
      "Todas las funcionalidades Pro",
      "Proyectos ilimitados",
      "Clientes ilimitados",
      "Proveedores ilimitados",
      "Catálogo ilimitado",
    ],
    popular: false,
  },
];

export default function ChangePlanPage() {
  const router = useRouter();
  const { effectivePlan, refetchEffectivePlan } = useAuth();
  const supabase = getSupabaseClient();
  const [isAnnual, setIsAnnual] = useState(false);
  const [submittingPlan, setSubmittingPlan] = useState<PlanCode | null>(null);
  const [openDetails, setOpenDetails] = useState<PlanCode[]>([]);

  async function handleAcquire(planCode: PlanCode) {
    const duration = isAnnual ? "1y" : "1m";
    setSubmittingPlan(planCode);
    try {
      const { error } = await supabase.rpc("assign_plan", {
        p_duration: duration,
        p_plan_code: planCode,
      });
      if (error) throw error;
      await refetchEffectivePlan();
      toast.success("Plan activado correctamente");
      router.push("/settings/plan");
    } catch (err) {
      reportError(err, "assign_plan:");
      toast.error("Error al activar el plan: " + getErrorMessage(err));
    } finally {
      setSubmittingPlan(null);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
          Modifica tu plan
        </h1>
        <p className="text-muted-foreground mt-1">
          Selecciona el plan que se ajusta a tus necesidades. Los cambios se
          aplican al instante.
        </p>
      </div>

      {/* Billing period switch */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
        <span
          className={`text-base font-semibold sm:text-lg ${
            !isAnnual ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Mensual
        </span>
        <label className="cursor-pointer">
          <input
            type="checkbox"
            checked={isAnnual}
            onChange={(e) => setIsAnnual(e.target.checked)}
            className="sr-only"
            aria-label="Cambiar a plan anual"
          />
          <span className="bg-background hover:bg-muted/80 border-primary/30 focus-within:ring-ring relative inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 shadow-inner transition-colors focus-within:ring-2 focus-within:ring-offset-2 focus-within:outline-none">
            <span
              className={`bg-primary pointer-events-none block h-7 w-7 rounded-full shadow-md ring-0 transition-transform ${
                isAnnual ? "translate-x-11" : "translate-x-1"
              }`}
            />
          </span>
        </label>
        <div
          className={`flex items-center gap-3 rounded-full px-4 py-2 transition-colors ${
            isAnnual ? "bg-primary text-primary-foreground" : ""
          }`}
        >
          <span
            className={`text-base font-semibold sm:text-lg ${
              isAnnual ? "text-primary-foreground" : "text-muted-foreground"
            }`}
          >
            Anual
          </span>
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
              isAnnual
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/10 text-primary"
            }`}
          >
            Ahorro {ANNUAL_SAVINGS_PERCENT}% (2 meses)
          </span>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2 md:items-stretch">
        {PLANS.map((plan) => {
          const showAnnual =
            isAnnual && plan.annualPrice != null && plan.currency != null;
          const currency = plan.currency ?? PRICING_CURRENCY;
          const displayPrice = showAnnual
            ? String(Number(plan.annualPrice!) / 12)
            : plan.price;
          const displayPriceDecimals = showAnnual ? 2 : 0;
          const annualPriceText =
            showAnnual && plan.annualPrice != null
              ? `${formatCurrency(Number(plan.annualPrice), currency, { maxFractionDigits: 0 })}/año`
              : null;
          const isSubmitting = submittingPlan === plan.planCode;
          const isCurrentPlan = effectivePlan?.plan_code === plan.planCode;

          return (
            <Card
              key={plan.planCode}
              className={`relative flex h-full flex-col shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isCurrentPlan ? "border-primary border-2" : "border-border"
              }`}
            >
              {isCurrentPlan && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground rounded-full px-3 py-1 text-xs font-semibold shadow-lg">
                    Plan actual
                  </span>
                </div>
              )}
              <CardHeader className="pb-2 text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <div className="mb-4 text-center">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-primary text-4xl font-bold">
                      {formatCurrency(Number(displayPrice), currency, {
                        maxFractionDigits: displayPriceDecimals,
                      })}
                    </span>
                    {showAnnual && (
                      <span className="text-muted-foreground text-lg font-medium">
                        /mes
                      </span>
                    )}
                  </div>
                  {annualPriceText && (
                    <p className="text-muted-foreground mt-1 text-sm">
                      {annualPriceText} - Ahorra 2 meses
                    </p>
                  )}
                </div>
                <Button
                  className="mb-4 w-full transition-all"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleAcquire(plan.planCode)}
                >
                  {isSubmitting ? (
                    "Activando…"
                  ) : (
                    <>
                      Adquirir plan
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <Collapsible
                  open={openDetails.includes(plan.planCode)}
                  onOpenChange={(open) =>
                    setOpenDetails((prev) =>
                      open
                        ? [...prev, plan.planCode]
                        : prev.filter((p) => p !== plan.planCode)
                    )
                  }
                >
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground flex w-full items-center justify-center gap-2 rounded-md py-2 text-sm font-medium transition-colors"
                    >
                      Más detalles
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          openDetails.includes(plan.planCode)
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <ul className="space-y-3 pt-2">
                      {plan.features.map((feature) => {
                        const isRestriction = feature.startsWith("Sin ");
                        return (
                          <li key={feature} className="flex items-start gap-3">
                            {isRestriction ? (
                              <X className="text-destructive mt-0.5 h-5 w-5 flex-shrink-0" />
                            ) : (
                              <Check className="text-primary mt-0.5 h-5 w-5 flex-shrink-0" />
                            )}
                            <span className="text-sm">{feature}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </CollapsibleContent>
                </Collapsible>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-muted-foreground text-center text-sm">
        <Link href="/settings/plan" className="underline hover:no-underline">
          Volver a Plan
        </Link>
      </p>
    </div>
  );
}
