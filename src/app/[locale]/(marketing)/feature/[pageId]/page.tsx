import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { JsonLd, faqPageJsonLd } from "@/components/json-ld";
import { MarketingBreadcrumbJsonLd } from "@/components/marketing/marketing-breadcrumb-json-ld";
import { FeaturesHubLanding } from "@/components/marketing/features-hub-landing";
import { FeatureArticlePage } from "@/components/marketing/feature-article-page";
import { FeatureComingSoon } from "@/components/marketing/feature-coming-soon";
import {
  buildMarketingOpenGraph,
  buildMarketingTwitter,
} from "@/lib/marketing-open-graph";
import {
  marketingFeaturesHubPath,
  marketingHomePath,
} from "@/lib/marketing-canonical-paths";
import { getSiteUrl } from "@/lib/site-url";
import {
  FEATURE_PAGES,
  type FeatureLocale,
  type FeaturePageId,
  getFeaturePublicPath,
  isFeaturePageId,
} from "@/lib/feature-registry";
import {
  getFeaturePageContent,
  getFeatureStaticParams,
} from "@/lib/feature-pages";

export function generateStaticParams() {
  return getFeatureStaticParams();
}

function breadcrumbLabelKey(pageId: FeaturePageId): string {
  const map: Record<FeaturePageId, string> = {
    funcionalidades: "features",
    presupuestos: "presupuestos",
    "plantilla-pdf": "plantillaPdf",
    "control-costes": "controlCostes",
    pedidos: "pedidos",
    "empiezas-por-tu-cuenta": "empiezasPorTuCuenta",
    "app-freelance": "appFreelance",
    "estudios-con-equipo": "estudiosConEquipo",
    "alternativas-excel": "alternativasExcel",
    "veta-vs-programa": "vsPrograma",
    "veta-vs-monday-notion": "vsMondayNotion",
    "veta-vs-houzz-pro": "vsHouzzPro",
  };
  return map[pageId];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; pageId: string }>;
}): Promise<Metadata> {
  const { locale: localeParam, pageId: rawId } = await params;
  if (!isFeaturePageId(rawId)) return {};
  const pageId = rawId;
  const locale = localeParam as FeatureLocale;
  const canonical = getFeaturePublicPath(locale, pageId);
  const languages = {
    es: getFeaturePublicPath("es", pageId),
    en: getFeaturePublicPath("en", pageId),
    "x-default": getFeaturePublicPath("es", pageId),
  };

  const t = await getTranslations({
    locale: localeParam,
    namespace: "FeaturePages",
  });

  if (pageId === "funcionalidades") {
    return {
      title: { absolute: t("hubMetaTitle") },
      description: t("hubMetaDescription"),
      alternates: { canonical, languages },
      openGraph: buildMarketingOpenGraph({
        title: t("hubOgTitle"),
        description: t("hubOgDescription"),
        url: canonical,
      }),
      twitter: buildMarketingTwitter({
        title: t("hubTwitterTitle"),
        description: t("hubTwitterDescription"),
      }),
    };
  }

  const def = FEATURE_PAGES[pageId];
  if (def.comingSoon) {
    const titleMap = {
      "veta-vs-programa": t("stubProgramaTitle"),
      "veta-vs-monday-notion": t("stubMondayTitle"),
      "veta-vs-houzz-pro": t("stubHouzzTitle"),
    } as const;
    const title =
      titleMap[pageId as keyof typeof titleMap] ?? t("comingSoonTitle");
    const description = t("comingSoonDesc");
    return {
      title: { absolute: `${title}${t("metaTitleSuffix")}` },
      description,
      alternates: { canonical, languages },
      openGraph: buildMarketingOpenGraph({
        title,
        description,
        url: canonical,
      }),
      twitter: buildMarketingTwitter({ title, description }),
    };
  }

  const content = await getFeaturePageContent(locale, pageId);
  if (!content) return {};

  const title = `${content.title}${t("metaTitleSuffix")}`;

  return {
    title: { absolute: title },
    description: content.excerpt,
    alternates: { canonical, languages },
    openGraph: buildMarketingOpenGraph({
      title: content.title,
      description: content.excerpt,
      url: canonical,
      images: content.coverImage ? [{ url: content.coverImage }] : undefined,
    }),
    twitter: buildMarketingTwitter({
      title: content.title,
      description: content.excerpt,
      images: content.coverImage ? [content.coverImage] : undefined,
    }),
  };
}

export default async function FeatureMarketingPage({
  params,
}: {
  params: Promise<{ locale: string; pageId: string }>;
}) {
  const { locale: localeParam, pageId: rawId } = await params;
  if (!isFeaturePageId(rawId)) notFound();
  const pageId = rawId;
  const locale = localeParam as FeatureLocale;
  setRequestLocale(localeParam);

  const def = FEATURE_PAGES[pageId];
  const tBreadcrumbs = await getTranslations("Breadcrumbs");
  const canonical = getFeaturePublicPath(locale, pageId);

  const breadcrumbItems = [
    { name: tBreadcrumbs("home"), path: marketingHomePath(localeParam) },
  ];

  if (def.group === "funcionalidades" && pageId !== "funcionalidades") {
    breadcrumbItems.push({
      name: tBreadcrumbs("features"),
      path: marketingFeaturesHubPath(localeParam),
    });
    if (def.parentId && def.parentId !== "funcionalidades") {
      breadcrumbItems.push({
        name: tBreadcrumbs(breadcrumbLabelKey(def.parentId)),
        path: getFeaturePublicPath(locale, def.parentId),
      });
    }
  } else if (def.group === "comparativas") {
    breadcrumbItems.push({
      name: tBreadcrumbs("comparativas"),
      path: getFeaturePublicPath(locale, "alternativas-excel"),
    });
  } else if (def.group === "audience") {
    breadcrumbItems.push({
      name: tBreadcrumbs("audience"),
      path: marketingFeaturesHubPath(localeParam),
    });
  }

  breadcrumbItems.push({
    name: tBreadcrumbs(breadcrumbLabelKey(pageId)),
    path: canonical,
  });

  if (pageId === "funcionalidades") {
    return (
      <>
        <MarketingBreadcrumbJsonLd
          id="json-ld-breadcrumb-features-hub"
          items={[
            {
              name: tBreadcrumbs("home"),
              path: marketingHomePath(localeParam),
            },
            {
              name: tBreadcrumbs("features"),
              path: marketingFeaturesHubPath(localeParam),
            },
          ]}
        />
        <FeaturesHubLanding />
      </>
    );
  }

  if (def.comingSoon) {
    return (
      <>
        <MarketingBreadcrumbJsonLd
          id={`json-ld-breadcrumb-feature-${pageId}`}
          items={breadcrumbItems}
        />
        <FeatureComingSoon def={def} />
      </>
    );
  }

  const content = await getFeaturePageContent(locale, pageId);
  if (!content) notFound();

  return (
    <>
      <MarketingBreadcrumbJsonLd
        id={`json-ld-breadcrumb-feature-${pageId}`}
        items={breadcrumbItems}
      />
      <JsonLd
        id={`json-ld-webpage-feature-${pageId}`}
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: content.title,
          description: content.excerpt,
          url: `${getSiteUrl()}${canonical}`,
        }}
      />
      {content.faq && content.faq.length > 0 ? (
        <JsonLd
          id={`json-ld-faq-feature-${pageId}`}
          data={faqPageJsonLd(content.faq, `${getSiteUrl()}${canonical}`)}
        />
      ) : null}
      <FeatureArticlePage
        def={def}
        content={content}
        locale={locale}
        showComparisonStubs={pageId === "alternativas-excel"}
        showExcelBlogLink={pageId === "alternativas-excel"}
      />
    </>
  );
}
