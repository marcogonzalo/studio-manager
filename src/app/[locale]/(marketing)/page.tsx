import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { ArrowRight, PencilRuler } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { JsonLd, faqPageJsonLd } from "@/components/json-ld";
import { AnimatedSection } from "@/components/ui/animated-section";
import { SmoothScrollLink } from "@/components/smooth-scroll-link";
import { TrackedCtaLink } from "@/components/gtm";
import { buildHomeMetadata } from "@/lib/marketing-home-metadata";
import { getSiteUrl } from "@/lib/site-url";
import { BlogLatestPostsSection } from "@/components/blog/blog-latest-posts-section";
import type { BlogLocale } from "@/lib/blog";

const ProductMockup = dynamic(
  () =>
    import("@/components/product-mockup").then((m) => ({
      default: m.ProductMockup,
    })),
  {
    ssr: true,
    loading: () => (
      <div
        className="bg-card border-border relative mx-auto h-[320px] w-full max-w-lg animate-pulse rounded-2xl border shadow-2xl"
        aria-hidden
      />
    ),
  }
);

/** Below-the-fold sections lazy-loaded to reduce initial JS bundle (framer-motion, etc.). */
const HomeStatsSection = dynamic(
  () =>
    import("./_sections/home-stats-section").then((m) => m.HomeStatsSection),
  { ssr: true }
);
const HomeFeaturesSection = dynamic(
  () =>
    import("./_sections/home-features-section").then(
      (m) => m.HomeFeaturesSection
    ),
  { ssr: true }
);
const HomeSolutionsSection = dynamic(
  () =>
    import("./_sections/home-solutions-section").then(
      (m) => m.HomeSolutionsSection
    ),
  { ssr: true }
);
const HomeBenefitsSection = dynamic(
  () =>
    import("./_sections/home-benefits-section").then(
      (m) => m.HomeBenefitsSection
    ),
  { ssr: true }
);
const HomeTestimonialsSection = dynamic(
  () =>
    import("./_sections/home-testimonials-section").then(
      (m) => m.HomeTestimonialsSection
    ),
  { ssr: true }
);
const HomeCtaBeforeFaqSection = dynamic(
  () =>
    import("./_sections/home-cta-before-faq-section").then(
      (m) => m.HomeCtaBeforeFaqSection
    ),
  { ssr: true }
);
const HomeFaqSection = dynamic(
  () => import("./_sections/home-faq-section").then((m) => m.HomeFaqSection),
  { ssr: true }
);
const HomeDemoCtaSection = dynamic(
  () =>
    import("@/components/marketing/demo-cta-section").then(
      (m) => m.DemoCtaSection
    ),
  { ssr: true }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return buildHomeMetadata(locale);
}

const baseUrl = getSiteUrl();

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("HomePage");
  const tFaq = await getTranslations("Faq");
  const homeUrl = `${baseUrl}${locale === "es" ? "" : "/en"}`;

  const homeFaqs = [
    {
      question: tFaq("question1"),
      answer: tFaq("answer1"),
    },
    {
      question: tFaq("question2"),
      answer: tFaq("answer2"),
    },
    {
      question: tFaq("question3"),
      answer: tFaq("answer3"),
    },
    {
      question: tFaq("question4"),
      answer: tFaq("answer4"),
    },
  ];

  return (
    <>
      <JsonLd id="json-ld-faq-home" data={faqPageJsonLd(homeFaqs, homeUrl)} />

      {/* Hero Section – momento hero: badge → título → subtítulo → CTAs con delays escalonados */}
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-28">
        {/* Background effects */}
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Copy — h1/subtitle are plain server HTML for LCP (no client animation shell). */}
            <div className="text-center lg:text-left">
              <div className="bg-primary/10 text-primary mt-6 mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium">
                <PencilRuler className="h-4 w-4" />
                <span>{t("badge")}</span>
              </div>

              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                {t("title")}{" "}
                <strong className="text-primary">{t("titleHighlight")}</strong>
              </h1>

              <p className="text-muted-foreground mt-6 text-lg md:text-xl">
                {t("subtitle")}
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
                <Button
                  size="lg"
                  asChild
                  className="animate-glow w-full sm:w-auto"
                >
                  <TrackedCtaLink
                    href="/sign-up"
                    ctaLocation="hero"
                    ctaText={t("startFree")}
                  >
                    {t("startFree")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </TrackedCtaLink>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto"
                >
                  <SmoothScrollLink href="#features">
                    {t("viewFeatures")}
                  </SmoothScrollLink>
                </Button>
              </div>

              <p className="text-muted-foreground mt-4 text-sm">
                {t("trialInfo")}
              </p>
            </div>

            {/* Product Mockup: below on small screens, right on lg+ */}
            <AnimatedSection
              direction="right"
              delay={0.4}
              duration={0.6}
              triggerOnMount
            >
              <ProductMockup />
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Franja decorativa (como la del footer) entre hero y contenido */}
      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      <div className="below-the-fold">
        <HomeStatsSection />
        <HomeFeaturesSection />
        <HomeSolutionsSection />
        <HomeBenefitsSection />
        <HomeTestimonialsSection />
        <HomeCtaBeforeFaqSection />
        <HomeFaqSection />
        <BlogLatestPostsSection locale={locale as BlogLocale} />
        <HomeDemoCtaSection ctaLocation="home_demo_cta" />
      </div>
    </>
  );
}
