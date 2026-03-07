"use client";

import { useCallback, useEffect, useState } from "react";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Link from "next/link";
import { Plus, Image as ImageIcon, Package } from "lucide-react";
import { SpaceDialog } from "@/components/dialogs/space-dialog";
import { SpaceImagesDialog } from "@/components/dialogs/space-images-dialog";
import { SpaceProductsDialog } from "@/components/dialogs/space-products-dialog";

import type { Space } from "@/types";
import { ProjectTabContent } from "./project-tab-content";

export function ProjectSpaces({
  projectId,
  readOnly = false,
  disabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const addRendersAndDocumentsEnabled = usePlanCapability("documents");
  const canAddRenders = !readOnly && !disabled && addRendersAndDocumentsEnabled;
  const supabase = getSupabaseClient();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [firstImageBySpaceId, setFirstImageBySpaceId] = useState<
    Record<string, string>
  >({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

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

  return (
    <TooltipProvider>
      <ProjectTabContent
        disabled={disabled}
        disabledMessage="Los espacios no están incluidos en tu plan actual."
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Espacios del Proyecto</h3>
            {!readOnly && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Nuevo Espacio
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {spaces.map((space) => {
              const firstImageUrl = firstImageBySpaceId[space.id];
              return (
                <Card key={space.id} className="relative overflow-hidden">
                  {firstImageUrl && (
                    <>
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${firstImageUrl})`,
                          backgroundRepeat: "no-repeat",
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          opacity: 0.85,
                        }}
                        aria-hidden
                      />
                      <div
                        className="absolute inset-0"
                        aria-hidden
                        style={{ backgroundColor: "rgba(245, 245, 220, 0.75)" }}
                      />
                    </>
                  )}
                  <CardHeader className="relative z-10">
                    <CardTitle
                      style={
                        firstImageUrl
                          ? {
                              textShadow:
                                "0 0 12px rgba(255,255,255,0.9), 0 0 24px rgba(255,255,255,0.6)",
                            }
                          : undefined
                      }
                    >
                      {space.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="relative z-10">
                    <p
                      className="text-muted-foreground text-sm"
                      style={
                        firstImageUrl
                          ? {
                              textShadow:
                                "0 0 10px rgba(255,255,255,0.9), 0 0 20px rgba(255,255,255,0.5)",
                            }
                          : undefined
                      }
                    >
                      {space.description || "Sin descripción"}
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
                          <Package className="h-4 w-4 lg:mr-2" />
                          <span className="hidden lg:inline">Productos</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Productos del espacio</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="flex-1">
                          <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => openImages(space)}
                            disabled={!canAddRenders}
                          >
                            <ImageIcon className="h-4 w-4 lg:mr-2" />
                            <span className="hidden lg:inline">Renders</span>
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        {!canAddRenders ? (
                          <p>
                            No disponible en tu plan.{" "}
                            <Link
                              href="/pricing"
                              className="underline"
                              onClick={(e) => e.stopPropagation()}
                            >
                              Mejora tu plan
                            </Link>{" "}
                            para subir renders.
                          </p>
                        ) : (
                          "Visualizaciones del espacio"
                        )}
                      </TooltipContent>
                    </Tooltip>
                  </CardFooter>
                </Card>
              );
            })}
            {spaces.length === 0 && (
              <div className="text-muted-foreground col-span-full rounded-md border border-dashed py-8 text-center">
                No hay espacios registrados.
              </div>
            )}
          </div>

          <SpaceDialog
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            projectId={projectId}
            onSuccess={() => {
              setIsDialogOpen(false);
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
