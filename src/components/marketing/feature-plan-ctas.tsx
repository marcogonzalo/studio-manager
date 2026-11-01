import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import type { PlanCta } from "@/lib/feature-registry";

const PLAN_HREF: Record<PlanCta, "/plan-base" | "/plan-pro" | "/plan-studio"> =
  {
    base: "/plan-base",
    pro: "/plan-pro",
    studio: "/plan-studio",
  };

const PLAN_LABEL_KEY: Record<
  PlanCta,
  "planBaseCta" | "planProCta" | "planStudioCta"
> = {
  base: "planBaseCta",
  pro: "planProCta",
  studio: "planStudioCta",
};

type FeaturePlanCtasProps = {
  planCtas: PlanCta[];
  showTrial?: boolean;
};

export async function FeaturePlanCtas({
  planCtas,
  showTrial = true,
}: FeaturePlanCtasProps) {
  const t = await getTranslations("FeaturePages");

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showTrial ? (
        <Button asChild size="lg" className="animate-glow">
          <Link href="/demo">{t("trialCta")}</Link>
        </Button>
      ) : null}
      {planCtas.map((cta) => (
        <Button key={cta} asChild size="lg" variant="outline">
          <Link href={PLAN_HREF[cta]}>{t(PLAN_LABEL_KEY[cta])}</Link>
        </Button>
      ))}
    </div>
  );
}
