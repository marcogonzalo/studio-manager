import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ViewProjectShell } from "./view-project-shell";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, getPhaseLabel } from "@/lib/utils";
import type { ProjectPhase } from "@/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export const metadata = {
  title: "Vista del proyecto",
  description: "Información del proyecto compartido contigo",
};

export default async function ViewProjectPage({ params }: PageProps) {
  const { token } = await params;
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

  return (
    <ViewProjectShell token={token}>
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center md:max-w-2xl">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-semibold tracking-tight">
              {row.project_name}
            </h1>
            <p className="text-muted-foreground text-sm">
              Vista compartida para el cliente
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-border grid grid-cols-1 gap-4 border-t pt-4 md:grid-cols-2">
              {row.architect_name && (
                <div>
                  <p className="text-muted-foreground text-sm">
                    Arquitecto/a a cargo del proyecto
                  </p>
                  <p className="font-medium">{row.architect_name}</p>
                </div>
              )}
              {row.phase && (
                <div>
                  <p className="text-muted-foreground text-sm">
                    Fase del proyecto
                  </p>
                  <p className="font-medium">
                    {getPhaseLabel(row.phase as ProjectPhase)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-muted-foreground text-sm">Fecha de inicio</p>
                <p className="font-medium">
                  {row.start_date ? formatDate(row.start_date) : "No definida"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">
                  Fecha estimada de finalización
                </p>
                <p className="font-medium">
                  {row.end_date ? formatDate(row.end_date) : "No definida"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <nav
          className="mt-6 flex flex-col gap-3 pt-4"
          aria-label="Más información"
        >
          <div className="flex flex-col items-center justify-center gap-2 md:flex-row md:flex-wrap md:justify-between md:gap-2">
            <Button variant="secondary" asChild className="min-h-12 text-base">
              <Link href={`/view-project/${token}/products`}>Productos</Link>
            </Button>
            <Button variant="secondary" asChild className="min-h-12 text-base">
              <Link href={`/view-project/${token}/costs`}>
                Costes del proyecto
              </Link>
            </Button>
            <Button variant="secondary" asChild className="min-h-12 text-base">
              <Link href={`/view-project/${token}/payments`}>Pagos</Link>
            </Button>
          </div>
        </nav>
      </div>
    </ViewProjectShell>
  );
}
