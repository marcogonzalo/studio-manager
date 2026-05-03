"use client";

import { FolderKanban, Clock, Shield } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { AnimatedCounter } from "@/components/ui/animated-counter";

export function HomeStatsSection() {
  const t = useTranslations("Stats");

  const stats = [
    {
      value: Infinity,
      suffix: "",
      label: t("projectsLabel"),
      icon: FolderKanban,
    },
    {
      value: 65,
      suffix: "%",
      label: t("timeSavedLabel"),
      icon: Clock,
    },
    {
      value: 100,
      suffix: "%",
      label: t("allInOneLabel"),
      icon: Shield,
    },
  ];

  return (
    <section className="border-border/40 bg-muted/20 border-y py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <StaggerContainer
          className="grid gap-8 md:grid-cols-3"
          staggerDelay={0.15}
        >
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold tracking-tight sm:text-4xl">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  duration={2.5}
                />
              </div>
              <p className="text-muted-foreground mt-2 text-sm font-medium">
                {stat.label}
              </p>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
