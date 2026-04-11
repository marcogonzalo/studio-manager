import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Users, Target, Heart, Award, Linkedin, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  const canonical = locale === "es" ? "/sobre-veta" : "/en/about-veta";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: "/sobre-veta",
        en: "/en/about-veta",
        "x-default": "/sobre-veta",
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("twitterDescription"),
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const values = [
    {
      icon: Target,
      titleKey: "valueSimplicity" as const,
      descKey: "valueSimplicityDesc" as const,
    },
    {
      icon: Heart,
      titleKey: "valuePassion" as const,
      descKey: "valuePassionDesc" as const,
    },
    {
      icon: Users,
      titleKey: "valueCommunity" as const,
      descKey: "valueCommunityDesc" as const,
    },
    {
      icon: Award,
      titleKey: "valueExcellence" as const,
      descKey: "valueExcellenceDesc" as const,
    },
  ];

  return (
    <>
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("heroTitle")}{" "}
              <span className="text-primary">{t("heroTitleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              <strong className="text-foreground font-semibold">Veta</strong>{" "}
              {t("heroSubtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("storyTitle")}
            </h2>
            <div className="text-muted-foreground mt-6 space-y-4">
              <p>{t("storyP1")}</p>
              <p>{t("storyP2")}</p>
              <p>{t("storyP3")}</p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("valuesTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("valuesSubtitle")}
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="grid gap-8 md:grid-cols-2"
            staggerDelay={0.1}
          >
            {values.map((value) => (
              <StaggerItem key={value.titleKey}>
                <Card className="border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
                      <value.icon className="text-primary h-6 w-6" />
                    </div>
                    <CardTitle>{t(value.titleKey)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{t(value.descKey)}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="border-border relative overflow-hidden border-y py-20">
        <div className="from-primary/20 via-primary/10 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute bottom-0 left-0 h-72 w-72 -translate-x-1/4 translate-y-1/3 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("missionTitle")}
            </h2>
            <p className="text-muted-foreground mt-6 text-xl">
              <strong className="text-foreground font-semibold">Veta</strong>{" "}
              {t("missionBody")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <section className="bg-primary/5 relative overflow-hidden py-20">
        <div className="bg-primary/8 absolute top-0 right-0 h-80 w-80 translate-x-1/4 -translate-y-1/4 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto flex max-w-2xl flex-col items-center justify-center text-center">
            <div className="bg-primary/10 text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              <span>{t("creatorBadge")}</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("creatorTitle")}
            </h2>
            <h3 className="text-foreground mt-2 font-semibold">
              {t("creatorName")}
            </h3>
            <a
              href="https://www.linkedin.com/in/marcogonzalo"
              target="_blank"
              rel="noopener noreferrer"
              title={t("creatorLinkedinTitle")}
              className="text-primary mt-2 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:underline"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <p className="text-muted-foreground mt-4">{t("creatorBio")}</p>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
