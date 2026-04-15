"use client";

import { useCallback, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { validateImageFile } from "@/lib/image-validation";

interface SpaceImageUploadProps {
  projectId: string;
  spaceId: string;
  imageId: string;
  currentImageUrl?: string;
  /** Llamar antes de subir; debe crear el registro en BD para evitar archivos huérfanos. */
  onBeforeUpload?: () => Promise<void>;
  /** Si se proporciona, permite subir varias imágenes; debe crear el registro y devolver el id para cada una. */
  getImageIdForUpload?: () => Promise<string>;
  /** Si true, el input acepta múltiples archivos (requiere getImageIdForUpload). */
  multiple?: boolean;
  onUploadSuccess: (
    url: string,
    fileSizeBytes?: number,
    assetId?: string,
    imageIdUsed?: string
  ) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function SpaceImageUpload({
  projectId,
  spaceId,
  imageId,
  currentImageUrl,
  onBeforeUpload,
  getImageIdForUpload,
  multiple = false,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className,
}: SpaceImageUploadProps) {
  const t = useTranslations("SpaceImageUpload");
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File, imageIdOverride?: string) => {
      setError(null);
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        onUploadError?.(validation.error);
        return;
      }

      const idToUse = imageIdOverride ?? imageId;

      if (!imageIdOverride && onBeforeUpload) {
        try {
          await onBeforeUpload();
        } catch (err) {
          const msg = err instanceof Error ? err.message : t("createError");
          setError(msg);
          onUploadError?.(msg);
          return;
        }
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("projectId", projectId);
        formData.append("spaceId", spaceId);
        formData.append("imageId", idToUse);

        const res = await fetch("/api/upload/space-image", {
          method: "POST",
          body: formData,
        });

        const data = (await res.json()) as {
          url?: string;
          error?: string;
          fileSizeBytes?: number;
          assetId?: string;
        };

        if (!res.ok) {
          const msg = data.error || t("uploadError");
          setError(msg);
          onUploadError?.(msg);
          return;
        }

        if (data.url) {
          onUploadSuccess(data.url, data.fileSizeBytes, data.assetId, idToUse);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : t("uploadError");
        setError(msg);
        onUploadError?.(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [
      projectId,
      spaceId,
      imageId,
      onBeforeUpload,
      onUploadSuccess,
      onUploadError,
    ]
  );

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      if (multiple && getImageIdForUpload && files.length > 1) {
        for (const file of files) {
          const id = await getImageIdForUpload();
          await uploadFile(file, id);
        }
      } else if (getImageIdForUpload && files.length >= 1) {
        const id = await getImageIdForUpload();
        await uploadFile(files[0], id);
      } else {
        await uploadFile(files[0]);
      }
    },
    [disabled, isUploading, uploadFile, multiple, getImageIdForUpload]
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
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (!fileList?.length) return;
      const files = Array.from(fileList);
      e.target.value = "";
      if (multiple && getImageIdForUpload && files.length > 0) {
        for (const file of files) {
          const id = await getImageIdForUpload();
          await uploadFile(file, id);
        }
      } else if (getImageIdForUpload && files.length >= 1) {
        const id = await getImageIdForUpload();
        await uploadFile(files[0], id);
      } else if (files[0]) {
        await uploadFile(files[0]);
      }
    },
    [uploadFile, multiple, getImageIdForUpload]
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
          multiple={multiple}
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          aria-label={multiple ? t("selectImagesAria") : t("selectImageAria")}
        />
        {isUploading ? (
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
        ) : currentImageUrl ? (
          <div className="relative flex h-full min-h-[100px] w-full items-center justify-center overflow-hidden rounded-md p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentImageUrl}
              alt={t("previewAlt")}
              className="max-h-[160px] max-w-full object-contain"
            />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <ImageIcon className="text-muted-foreground h-10 w-10" />
            <div className="text-muted-foreground text-sm">
              <p className="font-medium">
                {multiple ? t("dropImages") : t("dropImage")}
              </p>
              <p>{t("clickToSelect")}</p>
            </div>
            <p className="text-muted-foreground/80 text-xs">{t("formats")}</p>
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
