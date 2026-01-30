"use client";

import { useEffect, useState } from "react";
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
import { Plus, Calendar, User as UserIcon, FolderKanban } from "lucide-react";
import { ProjectDialog } from "@/components/project-dialog";
import { toast } from "sonner";
import { format } from "date-fns";

import type { Project } from "@/types";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = getSupabaseClient();

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(full_name)")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar proyectos");
    } else {
      setProjects(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="text-primary h-8 w-8" />
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Proyecto
        </Button>
      </div>

      {loading ? (
        <div className="text-muted-foreground">Cargando...</div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardHeader>
                <CardTitle>{project.name}</CardTitle>
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
                      ? format(new Date(project.start_date), "dd/MM/yyyy")
                      : "Sin fecha"}
                  </div>
                  <div className="capitalize">
                    Estado:{" "}
                    <span className="text-foreground font-medium">
                      {project.status}
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
          ))}
          {projects.length === 0 && (
            <div className="text-muted-foreground col-span-full py-10 text-center">
              No tienes proyectos activos. Crea uno nuevo.
            </div>
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
