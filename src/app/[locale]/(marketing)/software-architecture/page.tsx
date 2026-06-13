import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  PmHubLanding,
  type PmHubLandingContent,
} from "@/components/marketing/pm-hub-landing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "SoftwareArquitectura",
  });
  const canonical =
    locale === "es"
      ? "/software-gestion-proyectos-arquitectura"
      : "/en/architecture-project-management-software";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: "/software-gestion-proyectos-arquitectura",
        en: "/en/architecture-project-management-software",
        "x-default": "/software-gestion-proyectos-arquitectura",
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

export default async function SoftwareArchitecturePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("SoftwareArquitectura");

  const content: PmHubLandingContent = {
    badge: t("badge"),
    heroTitle: t("heroTitle"),
    heroTitleHighlight: t("heroTitleHighlight"),
    heroSubtitle: t("heroSubtitle"),
    primaryCta: t("primaryCta"),
    secondaryCta: t("secondaryCta"),
    painsTitle: t("painsTitle"),
    painsSubtitle: t("painsSubtitle"),
    pains: [
      { title: t("pain1Title"), description: t("pain1Desc") },
      { title: t("pain2Title"), description: t("pain2Desc") },
      { title: t("pain3Title"), description: t("pain3Desc") },
    ],
    featuresTitle: t("featuresTitle"),
    featuresSubtitle: t("featuresSubtitle"),
    features: [
      { title: t("feature1Title"), text: t("feature1Text") },
      { title: t("feature2Title"), text: t("feature2Text") },
      { title: t("feature3Title"), text: t("feature3Text") },
      { title: t("feature4Title"), text: t("feature4Text") },
      { title: t("feature5Title"), text: t("feature5Text") },
      { title: t("feature6Title"), text: t("feature6Text") },
    ],
    plansTitle: t("plansTitle"),
    plansSubtitle: t("plansSubtitle"),
    plans: [
      {
        title: t("planBaseTitle"),
        description: t("planBaseDesc"),
        href: "/plan-base",
        cta: t("planBaseCta"),
      },
      {
        title: t("planProTitle"),
        description: t("planProDesc"),
        href: "/plan-pro",
        cta: t("planProCta"),
      },
      {
        title: t("planStudioTitle"),
        description: t("planStudioDesc"),
        href: "/plan-studio",
        cta: t("planStudioCta"),
      },
    ],
    siblingHubTitle: t("siblingHubTitle"),
    siblingHubDescription: t("siblingHubDescription"),
    siblingHubCta: t("siblingHubCta"),
    siblingHubHref: "/software-interior-design",
    ctaBadge: t("ctaBadge"),
    ctaTitle: t("ctaTitle"),
    ctaSubtitle: t("ctaSubtitle"),
    ctaButton: t("ctaButton"),
  };

  return <PmHubLanding content={content} />;
}
