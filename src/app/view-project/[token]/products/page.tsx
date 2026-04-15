import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getViewProjectLocale } from "@/lib/view-project-locale";
import { ViewProjectShell } from "../view-project-shell";
import { ViewProjectProductsClient } from "./products-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata() {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  return {
    title: t("productsMetaTitle"),
    description: t("productsMetaDescription"),
  };
}

export default async function ViewProjectProductsPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  const supabase = await createClient();

  const [shareRes, currencyRes, productsRes] = await Promise.all([
    supabase.rpc("get_project_share_by_token", { share_token: token }),
    supabase.rpc("get_project_public_currency", { share_token: token }),
    supabase.rpc("get_project_public_products", { share_token: token }),
  ]);

  if (shareRes.error || !shareRes.data?.length) notFound();
  const currency =
    (currencyRes.data?.[0] as { currency: string | null } | undefined)
      ?.currency ?? "EUR";
  const products = (productsRes.data ?? []) as {
    id: string;
    name: string;
    description: string;
    internal_reference: string | null;
    quantity: number;
    unit_price: number;
    total_price: number;
    status: string;
    image_url: string | null;
    space_name: string;
  }[];

  return (
    <ViewProjectShell token={token} title={t("products")} showBack>
      <ViewProjectProductsClient
        products={products}
        currency={currency}
        locale={locale}
      />
    </ViewProjectShell>
  );
}
