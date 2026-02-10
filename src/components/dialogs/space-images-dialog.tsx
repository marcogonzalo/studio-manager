import { useEffect, useMemo, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SpaceImageUpload } from "@/components/space-image-upload";
import { toast } from "sonner";
import type { Space } from "@/types";
import { Trash2 } from "lucide-react";

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
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  space: Space;
  projectId: string;
}) {
  const supabase = getSupabaseClient();
  const [images, setImages] = useState<Image[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const imageIdForUpload = useMemo(
    () => (open ? crypto.randomUUID() : ""),
    [open]
  );

  const fetchImages = async () => {
    const { data } = await supabase
      .from("space_images")
      .select("*")
      .eq("space_id", space.id);
    setImages(data || []);
  };

  useEffect(() => {
    if (open) fetchImages();
  }, [open, space.id]);

  const insertImage = async (url: string) => {
    const { error } = await supabase.from("space_images").insert([
      {
        space_id: space.id,
        url,
        description: "Render",
      },
    ]);
    if (error) {
      toast.error("Error al añadir imagen");
      throw error;
    }
    toast.success("Imagen añadida");
    setNewImageUrl("");
    fetchImages();
  };

  const handleAddByUrl = async () => {
    if (!newImageUrl) return;
    setLoading(true);
    try {
      await insertImage(newImageUrl);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (url: string) => {
    setLoading(true);
    try {
      await insertImage(url);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("space_images").delete().eq("id", id);
    if (!error) {
      toast.success("Imagen eliminada");
      fetchImages();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Renders - {space.name}</DialogTitle>
          <DialogDescription>Visualizaciones del espacio.</DialogDescription>
        </DialogHeader>

        <div className="mb-4 space-y-2">
          <Tabs defaultValue="url" className="w-full">
            <TabsList>
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="upload">Subir archivo</TabsTrigger>
            </TabsList>
            <TabsContent value="url" className="mt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="https://..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                />
                <Button
                  onClick={handleAddByUrl}
                  disabled={loading || !newImageUrl?.trim()}
                >
                  Añadir
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-2">
              {imageIdForUpload && projectId ? (
                <SpaceImageUpload
                  projectId={projectId}
                  spaceId={space.id}
                  imageId={imageIdForUpload}
                  onUploadSuccess={handleUploadSuccess}
                  onUploadError={(msg) => toast.error(msg)}
                />
              ) : (
                <p className="text-muted-foreground text-sm">Cargando…</p>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {images.map((img) => (
            <div
              key={img.id}
              className="group relative aspect-video overflow-hidden rounded-md border"
            >
              <img
                src={img.url}
                alt={img.description}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDelete(img.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="text-muted-foreground col-span-full py-10 text-center">
              No hay imágenes.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
