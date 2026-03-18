import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  JsonLd,
  faqPageJsonLd,
  softwareApplicationPricingJsonLd,
} from "@/components/json-ld";
import { PricingCardsMarketing } from "@/app/[locale]/(marketing)/pricing/pricing-cards-marketing";
import { PricingSecondaryCtas } from "@/app/[locale]/(marketing)/pricing/pricing-secondary-ctas";
import {
  COMPACT_FEATURE_KEYS,
  getCommercialFeatures,
  getPlanConfigForDisplay,
  translatePlanCopyItem,
} from "@/lib/plan-copy";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL ??
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://veta.pro");

const PRICING_CURRENCY = "EUR";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Pricing" });
  const canonical = locale === "es" ? "/precios" : "/en/pricing";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: "/precios",
        en: "/en/pricing",
        "x-default": "/precios",
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

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Pricing");
  const tPlanCopy = await getTranslations("PlanCopy");

  const plans = [
    {
      name: t("planBaseName"),
      planCode: "BASE" as const,
      description: t("planBaseDesc"),
      price: t("planBasePrice"),
      priceNote: t("planBasePriceNote"),
      annualPrice: null as string | null,
      annualNote: null as string | null,
      currency: null as string | null,
      features: getCommercialFeatures(getPlanConfigForDisplay("BASE"), {
        include: COMPACT_FEATURE_KEYS,
      }).map((item) => translatePlanCopyItem(item, tPlanCopy)),
      cta: t("planBaseCta"),
      ctaVariant: "outline" as const,
      popular: false,
    },
    {
      name: t("planProName"),
      planCode: "PRO" as const,
      description: t("planProDesc"),
      price: "25",
      priceNote: t("planProPriceNote"),
      annualPrice: "250",
      annualNote: t("planProAnnualNote"),
      currency: PRICING_CURRENCY,
      features: getCommercialFeatures(getPlanConfigForDisplay("PRO"), {
        include: COMPACT_FEATURE_KEYS,
      }).map((item) => translatePlanCopyItem(item, tPlanCopy)),
      cta: t("planProCta"),
      ctaVariant: "default" as const,
      popular: true,
    },
    {
      name: t("planStudioName"),
      planCode: "STUDIO" as const,
      description: t("planStudioDesc"),
      price: "75",
      priceNote: t("planStudioPriceNote"),
      annualPrice: "750",
      annualNote: t("planStudioAnnualNote"),
      currency: PRICING_CURRENCY,
      features: getCommercialFeatures(getPlanConfigForDisplay("STUDIO"), {
        include: COMPACT_FEATURE_KEYS,
      }).map((item) => translatePlanCopyItem(item, tPlanCopy)),
      cta: t("planStudioCta"),
      ctaVariant: "outline" as const,
      popular: false,
    },
  ];

  const faqs = [
    { question: t("faq1Question"), answer: t("faq1Answer") },
    { question: t("faq2Question"), answer: t("faq2Answer") },
    { question: t("faq3Question"), answer: t("faq3Answer") },
    { question: t("faq4Question"), answer: t("faq4Answer") },
  ];

  const pricingUrl = `${baseUrl}${locale === "es" ? "/precios" : "/en/pricing"}`;
  return (
    <>
      <JsonLd data={faqPageJsonLd(faqs, pricingUrl)} />
      <JsonLd data={softwareApplicationPricingJsonLd(pricingUrl)} />

      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("heroTitle")}{" "}
              <span className="text-primary">{t("heroTitleHighlight")}</span>
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              {t("heroSubtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      <PricingCardsMarketing plans={plans} />

      <PricingSecondaryCtas />

      <section className="bg-muted/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {t("faqTitle")}
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              {t("faqSubtitle")}
            </p>
          </AnimatedSection>

          <StaggerContainer
            className="mx-auto max-w-3xl space-y-6"
            staggerDelay={0.1}
          >
            {faqs.map((faq) => (
              <StaggerItem key={faq.question}>
                <Card className="border-none shadow-sm transition-all duration-300 hover:shadow-md">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-medium">
                      {faq.question}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </>
  );
}
