import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  FileText,
  FolderKanban,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import {
  getCommercialFeatures,
  getPlanConfigForDisplay,
  COMPACT_FEATURE_KEYS,
  translatePlanCopyItem,
} from "@/lib/plan-copy";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PlanBase" });
  const canonical =
    locale === "es"
      ? "/plan-base-primer-proyecto-interiorismo"
      : "/en/base-plan-first-interior-design-project";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: "/plan-base-primer-proyecto-interiorismo",
        en: "/en/base-plan-first-interior-design-project",
        "x-default": "/plan-base-primer-proyecto-interiorismo",
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    },
  };
}

const highlightIcons = [FolderKanban, FileText, BarChart3, Shield] as const;

export default async function PlanBasePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PlanBase");
  const tPlanCopy = await getTranslations("PlanCopy");
  const features = getCommercialFeatures(getPlanConfigForDisplay("BASE"), {
    include: COMPACT_FEATURE_KEYS,
  }).map((item) => translatePlanCopyItem(item, tPlanCopy));

  const pains = [
    { title: t("pain1Title"), description: t("pain1Desc") },
    { title: t("pain2Title"), description: t("pain2Desc") },
    { title: t("pain3Title"), description: t("pain3Desc") },
  ];

  const highlights = [
    { title: t("highlight1Title"), text: t("highlight1Text") },
    { title: t("highlight2Title"), text: t("highlight2Text") },
    { title: t("highlight3Title"), text: t("highlight3Text") },
    { title: t("highlight4Title"), text: t("highlight4Text") },
  ].map((item, i) => ({ ...item, icon: highlightIcons[i] }));

  return (
    <>
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <div className="text-primary border-primary/30 bg-primary/10 mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
              <Zap className="h-4 w-4" />
              {t("badge")}
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("heroTitle")}{" "}
              <span className="text-primary">{t("heroTitleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              {t("heroSubtitle")}
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/sign-up">
                  {t("createAccount")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/pricing">{t("viewAllPlans")}</Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("painsTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("painsSubtitle")}
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto grid max-w-4xl gap-8 sm:grid-cols-1 md:grid-cols-3"
            staggerDelay={0.1}
          >
            {pains.map((pain) => (
              <StaggerItem key={pain.title}>
                <Card className="h-full border-none shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="text-lg">{pain.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{pain.description}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("highlightsTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("highlightsSubtitle")}
            </p>
          </AnimatedSection>

          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-2">
            {highlights.map((item) => (
              <AnimatedSection key={item.title} className="flex gap-4">
                <div className="bg-primary/10 text-primary flex h-12 w-12 shrink-0 items-center justify-center rounded-lg">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground mt-1">{item.text}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mx-auto mt-16 max-w-xl">
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Check className="text-primary h-5 w-5" />
                  {t("includedTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-muted-foreground space-y-2">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <Check className="text-primary h-4 w-4 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </AnimatedSection>
        </div>
      </section>

      <section className="relative overflow-hidden py-20">
        <div className="from-primary/10 via-primary/5 absolute inset-0 bg-gradient-to-br to-transparent" />
        <div className="bg-primary/10 absolute top-0 right-0 h-96 w-96 translate-x-1/3 -translate-y-1/2 rounded-full blur-3xl" />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-2xl text-center">
            <div className="text-primary mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              {t("ctaBadge")}
            </div>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("ctaTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("ctaSubtitle")}
            </p>
            <div className="mt-8">
              <Button size="lg" className="animate-glow" asChild>
                <Link href="/sign-up">
                  {t("createAccount")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
