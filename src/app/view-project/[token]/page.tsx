import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import {
  defaultDateFormatForLocale,
  formatDateByPattern,
} from "@/lib/formatting";
import { getViewProjectLocale } from "@/lib/view-project-locale";
import { ViewProjectShell } from "./view-project-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { ProjectPhase } from "@/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

const PHASE_KEYS = new Set<string>([
  "diagnosis",
  "design",
  "executive",
  "budget",
  "construction",
  "delivery",
]);

export async function generateMetadata() {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ViewProjectPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  const tPhases = await getTranslations("Phases");
  const dateFmt = defaultDateFormatForLocale(locale);

  const supabase = await createClient();
  const { data: rows, error } = await supabase.rpc(
    "get_project_share_by_token",
    {
      share_token: token,
    }
  );

  if (error || !rows?.length) notFound();

  const row = rows[0] as {
    project_name: string;
    architect_name: string | null;
    phase: string | null;
    start_date: string | null;
    end_date: string | null;
  };

  const phaseLabel = (phase: string | null) => {
    if (!phase) return tPhases("unassigned");
    if (PHASE_KEYS.has(phase)) return tPhases(phase as ProjectPhase);
    return tPhases("unassigned");
  };

  return (
    <ViewProjectShell token={token}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center md:max-w-2xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold tracking-tight">
              {row.project_name}
            </h1>
            <p className="text-muted-foreground text-sm">{t("homeSubtitle")}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-border grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
              {row.architect_name && (
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("architectLabel")}
                  </p>
                  <p className="font-medium">{row.architect_name}</p>
                </div>
              )}
              {row.phase && (
                <div>
                  <p className="text-muted-foreground text-sm">
                    {t("phaseLabel")}
                  </p>
                  <p className="font-medium">{phaseLabel(row.phase)}</p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm">
                  {t("startDateLabel")}
                </p>
                <p className="font-medium">
                  {row.start_date
                    ? formatDateByPattern(row.start_date, dateFmt)
                    : t("dateNotSet")}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  {t("endDateLabel")}
                </p>
                <p className="font-medium">
                  {row.end_date
                    ? formatDateByPattern(row.end_date, dateFmt)
                    : t("dateNotSet")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <nav
          className="mt-6 flex flex-col gap-3 pt-4"
          aria-label={t("moreInfoNavAria")}
        >
          <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:flex-wrap md:justify-between md:gap-2">
            <Button variant="secondary" asChild className="min-h-12 text-base">
              <Link href={`/view-project/${token}/spaces`}>{t("spaces")}</Link>
            </Button>
            <Button variant="secondary" asChild className="min-h-12 text-base">
              <Link href={`/view-project/${token}/costs`}>{t("costs")}</Link>
            </Button>
            <Button variant="secondary" asChild className="min-h-12 text-base">
              <Link href={`/view-project/${token}/payments`}>
                {t("payments")}
              </Link>
            </Button>
            <Button variant="secondary" asChild className="min-h-12 text-base">
              <Link href={`/view-project/${token}/documents`}>
                {t("documents")}
              </Link>
            </Button>
          </div>
        </nav>
      </div>
    </ViewProjectShell>
  );
}
