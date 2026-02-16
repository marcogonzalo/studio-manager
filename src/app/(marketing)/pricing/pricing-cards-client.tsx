"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { formatCurrency } from "@/lib/utils";

const PRICING_CURRENCY = "EUR";

const ANNUAL_SAVINGS_MONTHS = 2;
const ANNUAL_SAVINGS_PERCENT = Math.round((ANNUAL_SAVINGS_MONTHS / 12) * 100);

type PlanCode = "BASE" | "PRO" | "STUDIO";

export type PlanItem = {
  name: string;
  planCode: PlanCode;
  description: string;
  price: string;
  priceNote: string;
  annualPrice: string | null;
  annualNote: string | null;
  currency: string | null;
  features: string[];
  cta: string;
  ctaVariant: "default" | "outline";
  popular: boolean;
};

export function PricingCardsClient({ plans }: { plans: PlanItem[] }) {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="pb-20">
      <div className="container mx-auto max-w-7xl px-4">
        <StaggerContainer
          className="flex flex-col items-center"
          staggerDelay={0.12}
        >
          {/* Billing period switch */}
          <StaggerItem className="mt-8 mb-12 flex w-full justify-center">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-6">
              <span
                className={`text-base font-semibold sm:text-lg ${
                  !isAnnual ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                Mensual
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={isAnnual}
                aria-label="Cambiar a plan anual"
                onClick={() => setIsAnnual((v) => !v)}
                className="bg-background hover:bg-muted/80 border-primary/30 focus-visible:ring-ring relative inline-flex h-10 w-20 shrink-0 cursor-pointer items-center rounded-full border-2 shadow-inner transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <span
                  className={`bg-primary pointer-events-none block h-7 w-7 rounded-full shadow-md ring-0 transition-transform ${
                    isAnnual ? "translate-x-11" : "translate-x-1"
                  }`}
                />
              </button>
              <div
                className={`flex items-center gap-3 rounded-full px-4 py-2 transition-colors ${
                  isAnnual ? "bg-primary text-primary-foreground" : ""
                }`}
              >
                <span
                  className={`text-base font-semibold sm:text-lg ${
                    isAnnual
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
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
          </StaggerItem>

          <StaggerItem className="w-full">
            <StaggerContainer
              className="grid gap-8 md:grid-cols-3 md:items-stretch"
              staggerDelay={0.15}
            >
              {plans.map((plan) => {
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

                return (
                  <StaggerItem key={plan.name} className="h-full">
                    <Card
                      className={`relative flex h-full flex-col transition-all duration-300 hover:-translate-y-1 ${
                        plan.popular
                          ? "border-primary scale-105 shadow-lg hover:shadow-xl"
                          : "border-border scale-100 shadow-md hover:shadow-lg"
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <span className="bg-primary text-primary-foreground shadow-primary/25 rounded-full px-3 py-1 text-xs font-semibold shadow-lg">
                            Recomendado
                          </span>
                        </div>
                      )}
                      <CardHeader className="pb-2 text-center">
                        <CardTitle className="text-2xl">{plan.name}</CardTitle>
                        <CardDescription>{plan.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="mb-6 text-center">
                          <div className="flex items-baseline justify-center gap-1">
                            <span className="text-primary text-4xl font-bold">
                              {plan.price === "Gratis" && !showAnnual
                                ? plan.price
                                : formatCurrency(
                                    Number(displayPrice),
                                    currency,
                                    {
                                      maxFractionDigits: displayPriceDecimals,
                                    }
                                  )}
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
                        <ul className="space-y-3">
                          {plan.features.map((feature) => {
                            const isRestriction = feature.startsWith("Sin ");
                            return (
                              <li
                                key={feature}
                                className="flex items-start gap-3"
                              >
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
                      </CardContent>
                      <CardFooter>
                        <Button
                          className={`w-full transition-all ${
                            plan.popular ? "animate-glow" : ""
                          }`}
                          variant={plan.ctaVariant}
                          asChild
                        >
                          <Link
                            href={`/auth?mode=signup&plan=${plan.planCode}${
                              isAnnual ? "&billing=annual" : ""
                            }`}
                          >
                            {plan.cta}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </StaggerItem>
                );
              })}
            </StaggerContainer>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
