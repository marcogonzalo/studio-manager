"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { TrackedCtaLink } from "@/components/gtm";

export function HomeCtaBeforeFaqSection() {
  const t = useTranslations("CtaBeforeFaq");

  return (
    <section className="relative overflow-hidden py-20">
      <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
      <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="bg-primary/5 absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full blur-3xl" />
      <div className="noise-overlay" aria-hidden />

      <div className="relative container mx-auto max-w-7xl px-4">
        <AnimatedSection
          className="mx-auto max-w-2xl text-center"
          triggerOnMount={false}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">{t("subtitle")}</p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="animate-glow">
              <TrackedCtaLink
                href="/sign-up"
                ctaLocation="cta_section"
                ctaText={t("startFree")}
              >
                {t("startFree")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedCtaLink>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <TrackedCtaLink
                href="/contact"
                ctaLocation="cta_section"
                ctaText={t("contactSales")}
              >
                {t("contactSales")}
              </TrackedCtaLink>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
