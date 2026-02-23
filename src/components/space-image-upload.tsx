"use client";

import { useCallback, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateImageFile } from "@/lib/image-validation";

interface SpaceImageUploadProps {
  projectId: string;
  spaceId: string;
  imageId: string;
  currentImageUrl?: string;
  onUploadSuccess: (url: string, fileSizeBytes?: number) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SpaceImageUpload({
  projectId,
  spaceId,
  imageId,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className,
}: SpaceImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        onUploadError?.(validation.error);
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);
        formData.append("spaceId", spaceId);
        formData.append("imageId", imageId);

        const res = await fetch("/api/upload/space-image", {
          method: "POST",
          body: formData,
        });

        const data = (await res.json()) as {
          url?: string;
          error?: string;
          fileSizeBytes?: number;
        };

        if (!res.ok) {
          const msg = data.error || "Error al subir la imagen";
          setError(msg);
          onUploadError?.(msg);
          return;
        }

        if (data.url) {
          onUploadSuccess(data.url, data.fileSizeBytes);
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al subir la imagen";
        setError(msg);
        onUploadError?.(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [projectId, spaceId, imageId, onUploadSuccess, onUploadError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      const file = e.dataTransfer.files[0];
      if (file) uploadFile(file);
    },
    [disabled, isUploading, uploadFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) uploadFile(file);
      e.target.value = "";
    },
    [uploadFile]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex min-h-[100px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          "bg-muted/30 border-muted-foreground/25",
          isDragging && "border-primary bg-primary/5",
          (disabled || isUploading) && "pointer-events-none opacity-60",
          !disabled && !isUploading && "hover:border-primary/50 cursor-pointer"
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          aria-label="Seleccionar imagen"
        />
        {isUploading ? (
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
        ) : currentImageUrl ? (
          <div className="relative flex h-full min-h-[100px] w-full items-center justify-center overflow-hidden rounded-md p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt="Vista previa"
              className="max-h-[160px] max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <ImageIcon className="text-muted-foreground h-10 w-10" />
            <div className="text-muted-foreground text-sm">
              <p className="font-medium">Arrastra una imagen aquí</p>
              <p>o haz clic para seleccionar</p>
            </div>
            <p className="text-muted-foreground/80 text-xs">
              JPG, PNG o WebP (máx. 5MB)
            </p>
          </div>
        )}
      </div>
      {error && (
        <div className="bg-destructive/10 text-destructive flex items-center gap-2 rounded-md px-3 py-2 text-sm">
          <X className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}
