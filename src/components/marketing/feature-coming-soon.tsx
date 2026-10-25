import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { FeaturePlanCtas } from "@/components/marketing/feature-plan-ctas";
import type { FeaturePageDef, FeaturePageId } from "@/lib/feature-registry";

const TITLE_KEY: Record<
  Extract<
    FeaturePageId,
    "veta-vs-programa" | "veta-vs-monday-notion" | "veta-vs-houzz-pro"
  >,
  string
> = {
  "veta-vs-programa": "stubProgramaTitle",
  "veta-vs-monday-notion": "stubMondayTitle",
  "veta-vs-houzz-pro": "stubHouzzTitle",
};

type FeatureComingSoonProps = {
  def: FeaturePageDef;
};

export async function FeatureComingSoon({ def }: FeatureComingSoonProps) {
  const t = await getTranslations("FeaturePages");
  const titleKey =
    TITLE_KEY[def.id as keyof typeof TITLE_KEY] ?? "comingSoonTitle";
  const title = t(titleKey);

  return (
    <article className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
      <AnimatedSection delay={0} duration={0.4} triggerOnMount>
        <Button
          variant="ghost"
          className="text-muted-foreground mb-8 -ml-2"
          asChild
        >
          <Link href="/feature/alternativas-excel">{t("backToExcelHub")}</Link>
        </Button>
      </AnimatedSection>

      <header className="mb-10">
        <p className="bg-muted text-muted-foreground mb-4 inline-flex rounded-md px-2 py-0.5 text-xs font-medium">
          {t("comingSoon")}
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          {title}
        </h1>
        <p className="text-muted-foreground mt-4 text-lg">
          {t("comingSoonDesc")}
        </p>
        <div className="mt-8">
          <FeaturePlanCtas planCtas={def.planCtas} />
        </div>
      </header>
    </article>
  );
}
