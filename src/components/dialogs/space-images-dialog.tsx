import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SpaceImageUpload } from "@/components/space-image-upload";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import type { Space } from "@/types";
import { Plus, Trash2 } from "lucide-react";

interface Image {
  id: string;
  url: string;
  description: string;
}

export function SpaceImagesDialog({
  open,
  onOpenChange,
  space,
  projectId,
  canAddRenders = true,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  space: Space;
  projectId: string;
  /** Si false (plan sin subida de renders), el botón Añadir y el input se deshabilitan y se muestra mensaje. */
  canAddRenders?: boolean;
}) {
  const t = useTranslations("DialogSpaceImages");
  const supabase = getSupabaseClient();
  const [images, setImages] = useState<Image[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [expandedImage, setExpandedImage] = useState<Image | null>(null);

  const fetchImages = async () => {
    const { data } = await supabase
      .from("space_images")
      .select("*")
      .eq("space_id", space.id);
    setImages(data || []);
  };

  useEffect(() => {
    if (open) fetchImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when open or space.id changes only
  }, [open, space.id]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("space_images").delete().eq("id", id);
    if (!error) {
      toast.success(t("toastDeleted"));
      fetchImages();
    }
  };

  const createRowForUpload = useCallback(async () => {
    const id = crypto.randomUUID();
    const { error } = await supabase.from("space_images").insert([
      {
        id,
        space_id: space.id,
        url: "",
        description: "Render",
      },
    ]);
    if (error) throw error;
    return id;
  }, [space.id, supabase]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1 space-y-1.5">
              <DialogTitle>{t("title", { name: space.name })}</DialogTitle>
              <DialogDescription>{t("description")}</DialogDescription>
            </div>
            <div className="flex shrink-0 justify-end">
              {canAddRenders ? (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setAddModalOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  {t("addImages")}
                </Button>
              ) : (
                <p className="text-muted-foreground text-right text-xs">
                  {t("notAvailable")}{" "}
                  <Link href="/pricing" className="underline">
                    {t("upgradePlan")}
                  </Link>{" "}
                  {t("upgradeSuffix")}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((img) => (
            <button
              key={img.id}
              type="button"
              className="group focus-visible:ring-ring relative aspect-video overflow-hidden rounded-md border bg-transparent p-0 text-left transition-opacity hover:opacity-95 focus:outline-none focus-visible:ring-2"
              onClick={() => setExpandedImage(img)}
              aria-label={t("expandAria", { description: img.description })}
            >
              <Image
                src={img.url}
                alt={img.description}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
              />
              <div
                className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden
              >
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete(img.id);
                  }}
                  aria-label={t("deleteImageAria")}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </button>
          ))}
          {images.length === 0 && (
            <div className="text-muted-foreground col-span-full py-10 text-center">
              {t("empty")}
            </div>
          )}
        </div>
      </DialogContent>

      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("addImages")}</DialogTitle>
            <DialogDescription>{t("addDescription")}</DialogDescription>
          </DialogHeader>
          {projectId && (
            <SpaceImageUpload
              projectId={projectId}
              spaceId={space.id}
              imageId=""
              multiple
              getImageIdForUpload={createRowForUpload}
              onUploadSuccess={async (
                url,
                fileSizeBytes,
                assetId,
                imageIdUsed
              ) => {
                if (imageIdUsed) {
                  const update: Record<string, unknown> = { url };
                  if (fileSizeBytes != null)
                    update.file_size_bytes = fileSizeBytes;
                  if (assetId != null) update.asset_id = assetId;
                  await supabase
                    .from("space_images")
                    .update(update)
                    .eq("id", imageIdUsed)
                    .eq("space_id", space.id);
                  toast.success(t("toastAdded"));
                }
                fetchImages();
              }}
              onUploadError={(msg) => toast.error(msg)}
              disabled={!canAddRenders}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!expandedImage}
        onOpenChange={(o) => !o && setExpandedImage(null)}
      >
        <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-hidden border-0 bg-black/95 p-2 sm:max-w-[90vw]">
          {expandedImage && (
            <div className="relative flex min-h-[200px] items-center justify-center">
              <Image
                src={expandedImage.url}
                alt={expandedImage.description}
                width={1200}
                height={675}
                className="max-h-[85vh] w-auto max-w-full object-contain"
                sizes="90vw"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
