"use client";

import { ArrowRight, Building2, Palette } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

export function HomeSolutionsSection() {
  const t = useTranslations("HomeSolutions");

  const solutions = [
    {
      href: "/software-interior-design" as const,
      icon: Palette,
      title: t("interiorTitle"),
      description: t("interiorDesc"),
      cta: t("interiorCta"),
    },
    {
      href: "/software-architecture" as const,
      icon: Building2,
      title: t("architectureTitle"),
      description: t("architectureDesc"),
      cta: t("architectureCta"),
    },
  ] as const;

  return (
    <section className="py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <AnimatedSection
          className="mx-auto mb-12 max-w-2xl text-center"
          triggerOnMount={false}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("sectionTitle")}{" "}
            <strong className="text-primary">
              {t("sectionTitleHighlight")}
            </strong>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            {t("sectionSubtitle")}
          </p>
        </AnimatedSection>

        <StaggerContainer
          className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:items-stretch"
          staggerDelay={0.15}
          triggerOnMount={false}
        >
          {solutions.map((solution) => (
            <StaggerItem key={solution.href} className="h-full">
              <Card className="group/card flex h-full flex-col border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover/card:scale-110">
                    <solution.icon className="text-primary h-6 w-6" />
                  </div>
                  <CardTitle>{solution.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <CardDescription className="flex-1 text-base">
                    {solution.description}
                  </CardDescription>
                  <Link
                    href={solution.href}
                    className="text-primary mt-6 inline-flex items-center gap-1 text-sm font-medium underline-offset-4 hover:underline"
                  >
                    {solution.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover/card:translate-x-0.5" />
                  </Link>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
