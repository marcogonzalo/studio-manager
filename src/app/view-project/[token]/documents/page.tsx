import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { getViewProjectLocale } from "@/lib/view-project-locale";
import { ViewProjectShell } from "../view-project-shell";
import { ViewProjectDocumentsClient } from "./documents-client";

interface PageProps {
  params: Promise<{ token: string }>;
}

export async function generateMetadata() {
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  return {
    title: t("documentsMetaTitle"),
    description: t("documentsMetaDescription"),
  };
}

export default async function ViewProjectDocumentsPage({ params }: PageProps) {
  const { token } = await params;
  const locale = await getViewProjectLocale();
  setRequestLocale(locale);
  const t = await getTranslations("ViewProject");
  const supabase = await createClient();

  const [shareRes, documentsRes] = await Promise.all([
    supabase.rpc("get_project_share_by_token", { share_token: token }),
    supabase.rpc("get_project_public_documents", { share_token: token }),
  ]);

  if (shareRes.error) throw shareRes.error;
  if (!shareRes.data?.length) notFound();
  if (documentsRes.error) throw documentsRes.error;

  const documents = (documentsRes.data ?? []) as {
    id: string;
    name: string;
    file_url: string;
    file_type: string;
  }[];

  return (
    <ViewProjectShell token={token} title={t("documents")} showBack>
      <ViewProjectDocumentsClient documents={documents} />
    </ViewProjectShell>
  );
}
