import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { ViewProjectShell } from "../view-project-shell";
import { getViewProjectLocale } from "@/lib/view-project-locale";
import type { BudgetCategory } from "@/types";
import {
  ViewProjectCostsClient,
  type PublicBudgetLine,
  type PublicProduct,
} from "./costs-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata() {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  return {
    title: t("costsMetaTitle"),
    description: t("costsMetaDescription"),
  };
}

export default async function ViewProjectCostsPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  const supabase = await createClient();
  const categoryLabels: Record<BudgetCategory, string> = {
    construction: t("budgetCategory.construction"),
    own_fees: t("budgetCategory.own_fees"),
    external_services: t("budgetCategory.external_services"),
    operations: t("budgetCategory.operations"),
  };
  const subcategoryLabels: Record<BudgetCategory, Record<string, string>> = {
    construction: {
      demolition: t("budgetSubcategory.construction.demolition"),
      masonry: t("budgetSubcategory.construction.masonry"),
      electricity: t("budgetSubcategory.construction.electricity"),
      plumbing: t("budgetSubcategory.construction.plumbing"),
      interior_painting: t("budgetSubcategory.construction.interior_painting"),
      exterior_painting: t("budgetSubcategory.construction.exterior_painting"),
      domotics: t("budgetSubcategory.construction.domotics"),
      carpentry: t("budgetSubcategory.construction.carpentry"),
      locksmithing: t("budgetSubcategory.construction.locksmithing"),
      hvac: t("budgetSubcategory.construction.hvac"),
      flooring: t("budgetSubcategory.construction.flooring"),
      tiling: t("budgetSubcategory.construction.tiling"),
      other: t("budgetSubcategory.construction.other"),
    },
    own_fees: {
      design: t("budgetSubcategory.own_fees.design"),
      executive_project: t("budgetSubcategory.own_fees.executive_project"),
      site_supervision: t("budgetSubcategory.own_fees.site_supervision"),
      management: t("budgetSubcategory.own_fees.management"),
      other: t("budgetSubcategory.own_fees.other"),
    },
    external_services: {
      technical_architect: t(
        "budgetSubcategory.external_services.technical_architect"
      ),
      engineering: t("budgetSubcategory.external_services.engineering"),
      logistics: t("budgetSubcategory.external_services.logistics"),
      permits: t("budgetSubcategory.external_services.permits"),
      consulting: t("budgetSubcategory.external_services.consulting"),
      other: t("budgetSubcategory.external_services.other"),
    },
    operations: {
      shipping: t("budgetSubcategory.operations.shipping"),
      packaging: t("budgetSubcategory.operations.packaging"),
      transport: t("budgetSubcategory.operations.transport"),
      storage: t("budgetSubcategory.operations.storage"),
      insurance: t("budgetSubcategory.operations.insurance"),
      customs: t("budgetSubcategory.operations.customs"),
      handling: t("budgetSubcategory.operations.handling"),
      assembly: t("budgetSubcategory.operations.assembly"),
      other: t("budgetSubcategory.operations.other"),
    },
  };

  const [shareRes, currencyRes, budgetRes, productsRes] = await Promise.all([
    supabase.rpc("get_project_share_by_token", { share_token: token }),
    supabase.rpc("get_project_public_currency", { share_token: token }),
    supabase.rpc("get_project_public_budget", { share_token: token }),
    supabase.rpc("get_project_public_products", { share_token: token }),
  ]);

  if (shareRes.error || !shareRes.data?.length) notFound();
  const currencyRow = currencyRes.data?.[0] as
    | {
        currency: string | null;
        tax_rate: number;
        multitax?: boolean;
        budget_notes?: string | null;
      }
    | undefined;
  const currency = currencyRow?.currency ?? "EUR";
  const taxRate = Number(currencyRow?.tax_rate ?? 0);
  const multitax = currencyRow?.multitax === true;
  const budgetNotes = currencyRow?.budget_notes?.trim() || null;

  return (
    <ViewProjectShell token={token} showBack title={t("costsTitle")}>
      <ViewProjectCostsClient
        budgetLines={(budgetRes.data ?? []) as PublicBudgetLine[]}
        products={(productsRes.data ?? []) as PublicProduct[]}
        currency={currency}
        taxRate={taxRate}
        multitax={multitax}
        budgetNotes={budgetNotes}
        locale={locale}
        categoryLabels={categoryLabels}
        subcategoryLabels={subcategoryLabels}
      />
    </ViewProjectShell>
  );
}
