"use client";

import { BarChart3, ClipboardCheck, Smartphone } from "lucide-react";
import { useTranslations } from "next-intl";
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

export function HomeFeaturesSection() {
  const t = useTranslations("Features");

  const features = [
    {
      icon: BarChart3,
      badge: t("elenaBadge"),
      title: t("elenaTitle"),
      description: t("elenaDesc"),
    },
    {
      icon: Smartphone,
      badge: t("javiBadge"),
      title: t("javiTitle"),
      description: t("javiDesc"),
    },
    {
      icon: ClipboardCheck,
      badge: t("beatrizBadge"),
      title: t("beatrizTitle"),
      description: t("beatrizDesc"),
    },
  ];

  return (
    <section id="features" className="bg-muted/30 pt-20 pb-28">
      <div className="container mx-auto max-w-7xl px-4">
        <AnimatedSection
          className="mx-auto mb-16 max-w-2xl text-center"
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
          className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3 md:items-stretch"
          staggerDelay={0.1}
          triggerOnMount={false}
        >
          {features.map((feature) => (
            <StaggerItem key={feature.title} className="h-full">
              <Card className="group/card flex h-full flex-col border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <CardHeader>
                  <span className="bg-muted text-muted-foreground mb-4 inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium">
                    {feature.badge}
                  </span>
                  <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover/card:scale-110">
                    <feature.icon className="text-muted-foreground group-hover/card:text-primary h-6 w-6 transition-colors duration-300" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1">
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
