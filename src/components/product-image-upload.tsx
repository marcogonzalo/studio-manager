"use client";

import { useCallback, useEffect, useState } from "react";
import { ImageIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateImageFile } from "@/lib/image-validation";

interface ProductImageUploadProps {
  productId: string;
  projectId?: string;
  currentImageUrl?: string;
  onUploadSuccess: (url: string, fileSizeBytes?: number) => void;
  onUploadError?: (error: string) => void;
  /** When true, only select file and call onFileSelect; upload is done by parent (e.g. after product creation) */
  deferUpload?: boolean;
  onFileSelect?: (file: File) => void;
  /** File selected in defer mode, for local preview */
  pendingFile?: File | null;
  disabled?: boolean;
  className?: string;
}

export function ProductImageUpload({
  productId,
  projectId,
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  deferUpload = false,
  onFileSelect,
  pendingFile = null,
  disabled = false,
  className,
}: ProductImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!pendingFile) {
      setPendingPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(pendingFile);
    setPendingPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pendingFile]);

  const uploadFile = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);
        if (projectId) formData.append("projectId", projectId);

        const res = await fetch("/api/upload/product-image", {
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
    [productId, projectId, onUploadSuccess, onUploadError]
  );

  const handleFile = useCallback(
    (file: File) => {
      setError(null);
      const validation = validateImageFile(file);
      if (!validation.valid) {
        setError(validation.error);
        onUploadError?.(validation.error);
        return;
      }
      if (deferUpload) {
        onFileSelect?.(file);
        return;
      }
      uploadFile(file);
    },
    [deferUpload, onFileSelect, onUploadError, uploadFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled || isUploading) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [disabled, isUploading, handleFile]
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
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  const previewUrl = currentImageUrl || pendingPreviewUrl;
  const showDeferPlaceholder = deferUpload && pendingFile;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
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
          title="Seleccionar imagen"
        />
        {isUploading ? (
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
        ) : showDeferPlaceholder && pendingPreviewUrl ? (
          <div className="relative flex h-full min-h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-md p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingPreviewUrl}
              alt="Vista previa (se subirá al guardar)"
              className="max-h-[180px] max-w-full object-contain"
            />
            <p className="text-muted-foreground mt-2 text-center text-xs">
              Imagen lista para subir cuando se guarde el producto.
            </p>
          </div>
        ) : previewUrl ? (
          <div className="relative flex h-full min-h-[120px] w-full items-center justify-center overflow-hidden rounded-md p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Vista previa"
              className="max-h-[180px] max-w-full object-contain"
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
            {deferUpload ? (
              <p className="text-muted-foreground/70 text-xs">
                La imagen se subirá al guardar el producto.
              </p>
            ) : (
              <p className="text-muted-foreground/70 text-xs">
                La imagen será redimensionada a 1200px como máximo y convertida
                a formato WebP.
              </p>
            )}
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
