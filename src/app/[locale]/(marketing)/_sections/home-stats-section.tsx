"use client";

import { FolderKanban, Clock, Layers } from "lucide-react";
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
      prefix: "",
      label: t("projectsLabel"),
      icon: FolderKanban,
    },
    {
      value: 65,
      suffix: "%",
      prefix: t("timeSavedPrefix"),
      label: t("timeSavedLabel"),
      icon: Clock,
    },
    {
      value: 100,
      suffix: "%",
      label: t("allInOneLabel"),
      icon: Layers,
      prefix: "",
    },
  ];

  return (
    <section className="border-border/40 bg-muted/20 border-y py-16">
      <div className="container mx-auto max-w-7xl px-4">
        <StaggerContainer
          className="grid gap-8 md:grid-cols-3"
          staggerDelay={0.15}
          triggerOnMount={false}
        >
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className="text-center">
              <div className="bg-primary/10 text-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl">
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="text-3xl font-bold tracking-tight sm:text-4xl">
                {stat.prefix ? (
                  <span className="text-muted-foreground mr-1 text-lg font-medium sm:text-xl">
                    {stat.prefix}
                  </span>
                ) : null}
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
        <p className="text-muted-foreground mx-auto mt-8 max-w-2xl text-center text-xs">
          {t("footnote")}
        </p>
      </div>
    </section>
  );
}
