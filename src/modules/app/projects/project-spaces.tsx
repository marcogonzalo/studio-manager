"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { usePlanCapability } from "@/lib/use-plan-capability";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import {
  Plus,
  Image as ImageIcon,
  Package,
  MoreVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import { appPath } from "@/lib/app-paths";
import { SpaceDialog } from "@/components/dialogs/space-dialog";
import { SpaceImagesDialog } from "@/components/dialogs/space-images-dialog";
import { SpaceProductsDialog } from "@/components/dialogs/space-products-dialog";
import { DeleteSpaceDialog } from "@/components/dialogs/delete-space-dialog";

import type { Space } from "@/types";
import { ProjectTabContent, TabSectionHeader } from "./project-tab-content";

export function ProjectSpaces({
  projectId,
  readOnly = false,
  disabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("ProjectModuleSpaces");
  const addRendersAndDocumentsEnabled = usePlanCapability("documents");
  const canAddRenders = !readOnly && !disabled && addRendersAndDocumentsEnabled;
  const supabase = getSupabaseClient();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [itemCountBySpaceId, setItemCountBySpaceId] = useState<
    Record<string, number>
  >({});
  const [firstImageBySpaceId, setFirstImageBySpaceId] = useState<
    Record<string, string>
  >({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<Space | null>(null);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [deleteSpaceTarget, setDeleteSpaceTarget] = useState<Space | null>(
    null
  );

  const fetchSpaces = async () => {
    const { data, error } = await supabase
      .from("spaces")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at");

    if (!error) setSpaces(data || []);
  };

  useEffect(() => {
    fetchSpaces();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when projectId changes only
  }, [projectId]);

  const fetchItemCounts = useCallback(async () => {
    if (spaces.length === 0) {
      setItemCountBySpaceId({});
      return;
    }
    const spaceIds = spaces.map((s) => s.id);
    const { data } = await supabase
      .from("project_items")
      .select("space_id")
      .eq("project_id", projectId)
      .in("space_id", spaceIds);
    const map: Record<string, number> = {};
    for (const row of data || []) {
      if (!row.space_id) continue;
      map[row.space_id] = (map[row.space_id] || 0) + 1;
    }
    setItemCountBySpaceId(map);
  }, [spaces, projectId, supabase]);

  useEffect(() => {
    void fetchItemCounts();
  }, [fetchItemCounts]);

  const fetchFirstImages = useCallback(async () => {
    if (spaces.length === 0) {
      setFirstImageBySpaceId({});
      return;
    }
    const spaceIds = spaces.map((s) => s.id);
    const { data } = await supabase
      .from("space_images")
      .select("space_id, url")
      .in("space_id", spaceIds)
      .not("url", "eq", "")
      .order("created_at", { ascending: true });
    const map: Record<string, string> = {};
    for (const row of data || []) {
      if (row.space_id && row.url && !map[row.space_id])
        map[row.space_id] = row.url;
    }
    setFirstImageBySpaceId(map);
  }, [spaces, supabase]);

  useEffect(() => {
    fetchFirstImages();
  }, [fetchFirstImages]);

  const openImages = (space: Space) => {
    setSelectedSpace(space);
    setIsImagesOpen(true);
  };

  const openProducts = (space: Space) => {
    setSelectedSpace(space);
    setIsProductsOpen(true);
  };

  const openRename = (space: Space) => {
    setEditingSpace(space);
    setIsDialogOpen(true);
  };

  const openNew = () => {
    setEditingSpace(null);
    setIsDialogOpen(true);
  };

  return (
    <TooltipProvider>
      <ProjectTabContent
        disabled={disabled}
        disabledMessage={t("disabledMessage")}
      >
        <div className="space-y-6">
          <TabSectionHeader title={t("title")}>
            {!readOnly && (
              <Button onClick={openNew}>
                <Plus className="mr-2 h-4 w-4" /> {t("newSpace")}
              </Button>
            )}
          </TabSectionHeader>

          <div className="grid gap-4 md:grid-cols-3">
            {spaces.map((space) => {
              const firstImageUrl = firstImageBySpaceId[space.id];
              return (
                <Card key={space.id} className="relative overflow-hidden">
                  {firstImageUrl && (
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${firstImageUrl})`,
                        backgroundRepeat: "no-repeat",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        opacity: 0.15,
                      }}
                      aria-hidden
                    />
                  )}
                  <CardHeader className="relative z-10 flex flex-row items-start justify-between gap-2 space-y-0">
                    <CardTitle className="min-w-0 flex-1">
                      {space.name}
                    </CardTitle>
                    {!readOnly && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            aria-label={t("spaceActionsAria")}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openRename(space)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            {t("rename")}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => setDeleteSpaceTarget(space)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p className="text-muted-foreground text-sm">
                      {space.description || ""}
                    </p>
                  </CardContent>
                  <CardFooter className="relative z-10 flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => openProducts(space)}
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent variant="tertiary">
                        {t("spaceProductsTooltip")}
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => openImages(space)}
                          disabled={!canAddRenders}
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent variant="tertiary">
                        {!canAddRenders ? (
                          <p>
                            {t("rendersNotAvailable")}{" "}
                            <Link
                              href={appPath("/settings/plan")}
                              className="underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {t("upgradePlan")}
                            </Link>
                          </p>
                        ) : (
                          t("spaceRendersTooltip")
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </CardFooter>
                </Card>
              );
            })}
            {spaces.length === 0 && (
              <div className="text-muted-foreground col-span-full rounded-md border border-dashed py-8 text-center">
                {t("empty")}
              </div>
            )}
          </div>

          <SpaceDialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) setEditingSpace(null);
            }}
            projectId={projectId}
            space={editingSpace}
            onSuccess={() => {
              setIsDialogOpen(false);
              setEditingSpace(null);
              fetchSpaces();
            }}
          />

          <DeleteSpaceDialog
            open={!!deleteSpaceTarget}
            onOpenChange={(open) => {
              if (!open) setDeleteSpaceTarget(null);
            }}
            space={deleteSpaceTarget}
            itemCount={
              deleteSpaceTarget
                ? (itemCountBySpaceId[deleteSpaceTarget.id] ?? 0)
                : 0
            }
            onSuccess={() => {
              setDeleteSpaceTarget(null);
              fetchSpaces();
            }}
          />

          {selectedSpace && (
            <>
              <SpaceImagesDialog
                open={isImagesOpen}
                onOpenChange={(open) => {
                  setIsImagesOpen(open);
                  if (!open) fetchFirstImages();
                }}
                space={selectedSpace}
                projectId={projectId}
                canAddRenders={canAddRenders}
              />
              <SpaceProductsDialog
                open={isProductsOpen}
                onOpenChange={setIsProductsOpen}
                space={selectedSpace}
                projectId={projectId}
                readOnly={readOnly}
              />
            </>
          )}
        </div>
      </ProjectTabContent>
    </TooltipProvider>
  );
}
