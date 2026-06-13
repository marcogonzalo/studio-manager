"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { pushCtaClick } from "@/lib/gtm";
import { cn } from "@/lib/utils";

const PLAN_LINKS = [
  {
    href: "/plan-base" as const,
    titleKey: "basePlanTitle" as const,
    messageKey: "basePlanMessage" as const,
  },
  {
    href: "/plan-pro" as const,
    titleKey: "proPlanTitle" as const,
    messageKey: "proPlanMessage" as const,
  },
  {
    href: "/plan-studio" as const,
    titleKey: "studioPlanTitle" as const,
    messageKey: "studioPlanMessage" as const,
  },
] as const;

export function PricingSecondaryCtas() {
  const t = useTranslations("PricingSecondary");

  return (
    <>
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("sectionTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("sectionSubtitle")}
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto mt-10 grid max-w-5xl gap-6 md:grid-cols-3"
            staggerDelay={0.1}
          >
            {PLAN_LINKS.map(({ href, titleKey, messageKey }) => {
              const title = t(titleKey);
              const message = t(messageKey);

              return (
                <StaggerItem key={href}>
                  <Link
                    href={href}
                    onClick={() =>
                      pushCtaClick({
                        cta_location: "pricing_plan_links",
                        cta_text: title,
                        destination_url: href,
                      })
                    }
                    className={cn(
                      "group border-input bg-background hover:bg-brand-tertiary hover:text-brand-tertiary-foreground",
                      "flex h-full flex-col rounded-xl border p-6 text-left shadow-sm transition-colors",
                      "focus-visible:ring-ring focus-visible:ring-1 focus-visible:outline-none"
                    )}
                  >
                    <h3 className="text-lg font-semibold">{title}</h3>
                    <p className="text-muted-foreground group-hover:text-brand-tertiary-foreground/90 mt-3 flex-1 text-sm leading-relaxed">
                      {message}
                    </p>
                    <span className="text-primary group-hover:text-brand-tertiary-foreground mt-5 inline-flex items-center gap-2 text-sm font-medium">
                      {t("planLinkCta")}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{t("customBadge")}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("customTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("customSubtitle")}
            </p>
            <div className="mt-8">
              <Button
                size="lg"
                variant="outline"
                asChild
                className="animate-glow"
              >
                <Link
                  href="/contact"
                  onClick={() =>
                    pushCtaClick({
                      cta_location: "pricing_contact_sales",
                      cta_text: t("contactSales"),
                      destination_url: "/contact",
                    })
                  }
                >
                  {t("contactSales")}
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
