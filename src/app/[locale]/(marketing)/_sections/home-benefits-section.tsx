"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { BenefitsList } from "@/app/[locale]/(marketing)/benefits-list";
import { ProductMockup } from "@/components/product-mockup";
import { TrackedCtaLink } from "@/components/gtm";

export function HomeBenefitsSection() {
  const t = useTranslations("Benefits");

  const benefits = [
    t("benefit1"),
    t("benefit2"),
    t("benefit3"),
    t("benefit4"),
    t("benefit5"),
    t("benefit6"),
  ];

  return (
    <section className="py-28">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedSection direction="left" triggerOnMount={false}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("sectionTitle")}{" "}
              <strong className="text-primary">
                {t("sectionTitleHighlight")}
              </strong>
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("sectionSubtitle")}
            </p>

            <BenefitsList benefits={benefits} />

            <div className="mt-10">
              <Button size="lg" asChild className="animate-glow">
                <TrackedCtaLink
                  href="/sign-up"
                  ctaLocation="benefits"
                  ctaText={t("tryFree")}
                >
                  {t("tryFree")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </TrackedCtaLink>
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.2} triggerOnMount={false}>
            <ProductMockup />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
