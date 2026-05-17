import type { Metadata } from "next";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { PageLoading } from "@/components/loaders/page-loading";
import { ProjectDetailShell } from "./project-detail-shell";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .single();
  const name = data?.name ?? "Project";
  return { title: `Veta > ${name}` };
}

export default async function ProjectDetailLayout({ children, params }: Props) {
  const { id } = await params;
  return (
    <Suspense fallback={<PageLoading variant="detail" />}>
      <ProjectDetailShell projectId={id}>{children}</ProjectDetailShell>
    </Suspense>
  );
}
