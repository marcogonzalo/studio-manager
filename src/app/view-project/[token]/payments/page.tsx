import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ViewProjectShell } from "../view-project-shell";
import { getViewProjectLocale } from "@/lib/view-project-locale";
import { ViewProjectPaymentsClient } from "./payments-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata() {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  return {
    title: t("paymentsMetaTitle"),
    description: t("paymentsMetaDescription"),
  };
}

export default async function ViewProjectPaymentsPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  const supabase = await createClient();

  const [shareRes, currencyRes, paymentsRes] = await Promise.all([
    supabase.rpc("get_project_share_by_token", { share_token: token }),
    supabase.rpc("get_project_public_currency", { share_token: token }),
    supabase.rpc("get_project_public_payments", { share_token: token }),
  ]);

  if (shareRes.error || !shareRes.data?.length) notFound();
  const currency =
    (currencyRes.data?.[0] as { currency: string | null } | undefined)
      ?.currency ?? "EUR";
  const payments = paymentsRes.data ?? [];

  return (
    <ViewProjectShell token={token} showBack title={t("payments")}>
      <ViewProjectPaymentsClient
        payments={payments}
        currency={currency}
        locale={locale}
      />
    </ViewProjectShell>
  );
}
