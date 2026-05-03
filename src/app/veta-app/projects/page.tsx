"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { getDemoAccountMessage } from "@/lib/utils";
import { useAppFormatting } from "@/components/providers/app-formatting-provider";
import { useOnboardingHighlight } from "@/lib/use-onboarding-highlight";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Calendar,
  User as UserIcon,
  FolderKanban,
  Search,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProjectDialog } from "@/components/project-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { appPath } from "@/lib/app-paths";
import { getProjectStatusLabel } from "@/lib/utils";

import type { Project } from "@/types";

const STATUS_ORDER: Record<string, number> = {
  active: 0,
  completed: 1,
  cancelled: 2,
};

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

type StatusFilter = "all" | "active" | "completed" | "cancelled";
type SortOption = "status" | "created_at" | "end_date";

export default function ProjectsPage() {
  const t = useTranslations("ProjectsPage");
  const { formatDate } = useAppFormatting();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  useOnboardingHighlight("project", !loading);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("status");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const supabase = getSupabaseClient();

  const handleDeleteClick = (project: Project) => {
    setDeleteTarget(project);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteLoading(true);
    try {
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        const demoMsg = getDemoAccountMessage(error);
        if (demoMsg) {
          toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
            duration: 5000,
          });
        } else {
          toast.error(t("toastDeleteError"));
        }
        return;
      }
      toast.success(t("toastDeleted"));
      setDeleteTarget(null);
      fetchProjects();
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    let list = projects.filter((p) => matchProject(p, search));
    if (statusFilter !== "all") {
      list = list.filter((p) => p.status === statusFilter);
    }
    const sorted = [...list].sort((a, b) => {
      if (sortBy === "status") {
        const orderA = STATUS_ORDER[a.status] ?? 3;
        const orderB = STATUS_ORDER[b.status] ?? 3;
        if (orderA !== orderB) return orderA - orderB;
        return (a.name ?? "").localeCompare(b.name ?? "");
      }
      if (sortBy === "created_at") {
        const da = (a as Project & { created_at?: string }).created_at ?? "";
        const db = (b as Project & { created_at?: string }).created_at ?? "";
        return db.localeCompare(da);
      }
      if (sortBy === "end_date") {
        const da = a.end_date ?? "";
        const db = b.end_date ?? "";
        if (!da && !db) return (a.name ?? "").localeCompare(b.name ?? "");
        if (!da) return 1;
        if (!db) return -1;
        return db.localeCompare(da);
      }
      return 0;
    });
    return sorted;
  }, [projects, search, statusFilter, sortBy]);

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*, client:clients(full_name)");

    if (error) {
      toast.error(t("toastLoadError"), { id: "projects-load" });
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
            <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            {...(projects.length > 0 && {
              "data-onboarding-target": "project",
            })}
          >
            <Plus className="mr-2 h-4 w-4" /> {t("newProject")}
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-sm min-w-[200px] flex-1">
          <Search
            className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4"
            aria-hidden
          />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label={t("searchAria")}
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as StatusFilter)}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t("statusPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("statusAll")}</SelectItem>
            <SelectItem value="active">{t("statusActive")}</SelectItem>
            <SelectItem value="completed">{t("statusCompleted")}</SelectItem>
            <SelectItem value="cancelled">{t("statusCancelled")}</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={sortBy}
          onValueChange={(v) => setSortBy(v as SortOption)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder={t("sortPlaceholder")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">{t("sortByStatus")}</SelectItem>
            <SelectItem value="created_at">{t("sortByCreated")}</SelectItem>
            <SelectItem value="end_date">{t("sortByEnd")}</SelectItem>
          </SelectContent>
        </Select>
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
          {filteredAndSortedProjects.map((project) => {
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
                <CardHeader className="flex flex-row items-start justify-between gap-2 space-y-0 pb-2">
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <CardTitle
                      className={isMuted ? "text-muted-foreground" : undefined}
                    >
                      {project.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {project.description}
                    </CardDescription>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                        aria-label={t("actionsAria")}
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => handleDeleteClick(project)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t("delete")}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground space-y-2 text-sm">
                    <div className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      {project.client?.full_name || t("noClient")}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      {project.start_date
                        ? formatDate(project.start_date)
                        : t("noDate")}
                    </div>
                    <div className="capitalize">
                      {t("statusLabel")}{" "}
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
                    <Link href={appPath(`/projects/${project.id}`)}>
                      {t("viewDetails")}
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
          {filteredAndSortedProjects.length === 0 && (
            <Card
              className="border-dashed md:col-span-2 lg:col-span-3"
              {...(projects.length === 0 && {
                "data-onboarding-target": "project",
              })}
            >
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="bg-muted rounded-full p-4">
                  <FolderKanban className="text-muted-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground mt-4 font-medium">
                  {projects.length === 0
                    ? t("emptyNoProjects")
                    : t("emptyNoResults")}
                </h3>
                <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                  {projects.length === 0
                    ? t("emptyNoProjectsDescription")
                    : t("emptyNoResultsDescription")}
                </p>
                {projects.length === 0 && (
                  <Button
                    onClick={() => setIsDialogOpen(true)}
                    className="mt-4"
                  >
                    <Plus className="mr-2 h-4 w-4" /> {t("newProject")}
                  </Button>
                )}
                {projects.length > 0 && (
                  <Button
                    variant="outline"
                    onClick={() => setSearch("")}
                    className="mt-4"
                  >
                    {t("clearSearch")}
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

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t("confirmDeleteTitle")}
        description={t("confirmDeleteDescription")}
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
