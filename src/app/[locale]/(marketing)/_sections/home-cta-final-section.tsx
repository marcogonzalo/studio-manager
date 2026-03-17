"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { TrackedCtaLink } from "@/components/gtm";

export function HomeCtaFinalSection() {
  const t = useTranslations("CtaFinal");

  return (
    <section className="relative overflow-hidden py-20">
      <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-tl to-transparent" />
      <div className="bg-primary/8 absolute right-0 bottom-0 h-80 w-80 translate-x-1/4 translate-y-1/4 rounded-full blur-3xl" />

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
                ctaLocation="cta_final"
                ctaText={t("startFree")}
              >
                {t("startFree")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedCtaLink>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
