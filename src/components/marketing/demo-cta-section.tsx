"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { TrackedCtaLink } from "@/components/gtm";

type DemoCtaSectionProps = {
  ctaLocation?: string;
};

export function DemoCtaSection({
  ctaLocation = "demo_cta",
}: DemoCtaSectionProps) {
  const t = useTranslations("DemoCta");

  return (
    <section className="relative overflow-hidden py-20">
      <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
      <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />

      <div className="relative container mx-auto max-w-7xl px-4">
        <AnimatedSection className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">{t("subtitle")}</p>
          <div className="mt-8">
            <Button
              size="lg"
              variant="outline"
              asChild
              className="animate-glow"
            >
              <TrackedCtaLink
                href="/demo"
                ctaLocation={ctaLocation}
                ctaText={t("cta")}
              >
                {t("cta")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </TrackedCtaLink>
            </Button>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
