import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { FeaturePlanCtas } from "@/components/marketing/feature-plan-ctas";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FEATURE_PAGES,
  type FeatureLocale,
  type FeaturePageDef,
  type FeaturePageId,
} from "@/lib/feature-registry";
import type { FeaturePageContent } from "@/lib/feature-pages";

type FeatureArticlePageProps = {
  def: FeaturePageDef;
  content: FeaturePageContent;
  locale: FeatureLocale;
  showComparisonStubs?: boolean;
  showExcelBlogLink?: boolean;
};

const BREADCRUMB_LABEL: Partial<Record<FeaturePageId, string>> = {
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

const VETA_VS_EXCEL_SLUG: Record<FeatureLocale, string> = {
  es: "veta-vs-excel-presupuestos-interiorismo",
  en: "veta-vs-spreadsheets-interior-design-budgets",
};

function relatedIds(def: FeaturePageDef): FeaturePageId[] {
  const ids = new Set<FeaturePageId>();
  if (def.parentId) ids.add(def.parentId);
  for (const child of def.childIds ?? []) ids.add(child);
  if (def.parentId) {
    const parent = FEATURE_PAGES[def.parentId];
    for (const sib of parent.childIds ?? []) {
      if (sib !== def.id) ids.add(sib);
    }
  }
  if (def.group === "funcionalidades" && def.id !== "funcionalidades") {
    for (const id of ["presupuestos", "control-costes", "pedidos"] as const) {
      if (id !== def.id && id !== def.parentId) ids.add(id);
    }
  }
  if (def.group === "audience") {
    for (const id of [
      "empiezas-por-tu-cuenta",
      "app-freelance",
      "estudios-con-equipo",
    ] as const) {
      if (id !== def.id) ids.add(id);
    }
  }
  ids.delete(def.id);
  return [...ids].slice(0, 4);
}

export async function FeatureArticlePage({
  def,
  content,
  locale,
  showComparisonStubs = false,
  showExcelBlogLink = false,
}: FeatureArticlePageProps) {
  const t = await getTranslations("FeaturePages");
  const tBreadcrumbs = await getTranslations("Breadcrumbs");
  const related = relatedIds(def);

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      {def.group === "funcionalidades" ? (
        <AnimatedSection delay={0} duration={0.4} triggerOnMount>
          <Button
            variant="ghost"
            className="text-muted-foreground mb-8 -ml-2"
            asChild
          >
            <Link href="/feature/funcionalidades">{t("backToFeatures")}</Link>
          </Button>
        </AnimatedSection>
      ) : null}

      <header className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {content.title}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">{content.excerpt}</p>
        <div className="mt-8">
          <FeaturePlanCtas planCtas={def.planCtas} />
        </div>
      </header>

      {content.coverImage ? (
        <div className="border-border/60 relative mb-12 aspect-[16/9] w-full overflow-hidden rounded-2xl border shadow-md">
          <Image
            src={content.coverImage}
            alt=""
            fill
            className="object-cover"
            sizes="(min-width: 768px) 720px, 100vw"
            priority
          />
        </div>
      ) : null}

      <div
        className="prose prose-neutral dark:prose-invert prose-headings:scroll-mt-24 prose-a:text-primary max-w-none"
        dangerouslySetInnerHTML={{ __html: content.contentHtml }}
      />

      {showExcelBlogLink ? (
        <div className="border-border/60 mt-12 rounded-xl border p-6">
          <Link
            href={{
              pathname: "/blog/[slug]",
              params: { slug: VETA_VS_EXCEL_SLUG[locale] },
            }}
            className="text-primary font-medium hover:underline"
          >
            {t("excelBlogLink")}
          </Link>
        </div>
      ) : null}

      {showComparisonStubs ? (
        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-bold tracking-tight">
            {t("hubGroupComparativas")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                {
                  id: "veta-vs-programa" as const,
                  titleKey: "stubProgramaTitle" as const,
                },
                {
                  id: "veta-vs-monday-notion" as const,
                  titleKey: "stubMondayTitle" as const,
                },
                {
                  id: "veta-vs-houzz-pro" as const,
                  titleKey: "stubHouzzTitle" as const,
                },
              ] as const
            ).map(({ id, titleKey }) => (
              <Link
                key={id}
                href={FEATURE_PAGES[id].routeKey}
                className="block"
              >
                <Card className="border-border/60 h-full transition-shadow hover:shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base font-semibold">
                      {t(titleKey)}
                    </CardTitle>
                    <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs font-medium">
                      {t("comingSoon")}
                    </span>
                  </CardHeader>
                  <CardContent />
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {def.group === "audience" ? (
        <section className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            {t("disciplineLinksTitle")}
          </h2>
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href="/software-interior-design"
                className="text-primary font-medium hover:underline"
              >
                {t("disciplineInteriorLink")}
              </Link>
            </li>
            <li>
              <Link
                href="/software-architecture"
                className="text-primary font-medium hover:underline"
              >
                {t("disciplineArchitectureLink")}
              </Link>
            </li>
          </ul>
        </section>
      ) : null}

      {related.length > 0 ? (
        <section className="mt-16 border-t pt-10">
          <h2 className="mb-6 text-xl font-bold tracking-tight">
            {t("relatedFeatures")}
          </h2>
          <ul className="flex flex-col gap-3">
            {related.map((id) => {
              const rel = FEATURE_PAGES[id];
              const labelKey = BREADCRUMB_LABEL[id];
              return (
                <li key={id}>
                  <Link
                    href={rel.routeKey}
                    className="text-primary font-medium hover:underline"
                  >
                    {labelKey ? tBreadcrumbs(labelKey) : id}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}

      <div className="mt-12 border-t pt-10">
        <FeaturePlanCtas planCtas={def.planCtas} />
      </div>
    </article>
  );
}
