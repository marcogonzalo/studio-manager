"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Calendar,
  User as UserIcon,
  FolderKanban,
  Search,
} from "lucide-react";
import { ProjectDialog } from "@/components/project-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { formatDate, getProjectStatusLabel } from "@/lib/utils";

import type { Project } from "@/types";

function matchProject(project: Project, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const name = project.name?.toLowerCase() ?? "";
  const description = project.description?.toLowerCase() ?? "";
  const clientName =
    (
      project.client as { full_name?: string } | null
    )?.full_name?.toLowerCase() ?? "";
  return name.includes(q) || description.includes(q) || clientName.includes(q);
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = getSupabaseClient();

  const filteredProjects = useMemo(
    () => projects.filter((p) => matchProject(p, search)),
    [projects, search]
  );

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar proyectos", { id: "projects-load" });
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run on mount only
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FolderKanban className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Proyectos</h1>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Crea y gestiona proyectos de diseño con clientes, espacios y
          presupuestos.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search
            className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar proyectos, descripción o cliente…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Buscar proyectos"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="transition-shadow">
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const isMuted =
              project.status === "completed" || project.status === "cancelled";
            return (
              <Card
                key={project.id}
                className={
                  isMuted
                    ? "border-muted bg-muted/20 transition-shadow hover:shadow-md"
                    : "transition-shadow hover:shadow-md"
                }
              >
                <CardHeader>
                  <CardTitle
                    className={isMuted ? "text-muted-foreground" : undefined}
                  >
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground space-y-2 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      {project.client?.full_name || "Sin cliente"}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {project.start_date
                        ? formatDate(project.start_date)
                        : "Sin fecha"}
                    </div>
                    <div className="capitalize">
                      Estado:{" "}
                      <span
                        className={
                          isMuted
                            ? "text-muted-foreground font-medium"
                            : "text-foreground font-medium"
                        }
                      >
                        {getProjectStatusLabel(project.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/projects/${project.id}`}>Ver Detalles</Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {filteredProjects.length === 0 && (
            <Card className="border-dashed md:col-span-2 lg:col-span-3">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted rounded-full p-4">
                  <FolderKanban className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground mt-4 font-medium">
                  {projects.length === 0
                    ? "No tienes proyectos activos"
                    : "No hay resultados para la búsqueda"}
                </h3>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                  {projects.length === 0
                    ? "Crea un proyecto para gestionar clientes, espacios y presupuestos."
                    : "Prueba con otros términos o borra el filtro."}
                </p>
                {projects.length === 0 && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
                  </Button>
                )}
                {projects.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setSearch("")}
                    className="mt-4"
                  >
                    Limpiar búsqueda
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchProjects();
        }}
      />
    </div>
  );
}
