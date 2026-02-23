"use client";

import { useCallback, useState } from "react";
import { FileIcon, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { validateDocumentFile } from "@/lib/document-validation";

interface DocumentFileUploadProps {
  documentId: string;
  projectId: string;
  currentFileUrl?: string;
  /** Llamar antes de subir; debe crear el registro en BD para evitar archivos huérfanos. */
  onBeforeUpload?: () => Promise<void>;
  onUploadSuccess: (
    url: string,
    fileName?: string,
    fileSizeBytes?: number,
    assetId?: string
  ) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function DocumentFileUpload({
  documentId,
  projectId,
  currentFileUrl,
  onBeforeUpload,
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className,
}: DocumentFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      const validation = validateDocumentFile(file);
      if (!validation.valid) {
        setError(validation.error);
        onUploadError?.(validation.error);
        return;
      }

      if (onBeforeUpload) {
        try {
          await onBeforeUpload();
        } catch (err) {
          const msg =
            err instanceof Error ? err.message : "Error al crear el documento";
          setError(msg);
          onUploadError?.(msg);
          return;
        }
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentId", documentId);
        formData.append("projectId", projectId);

        const res = await fetch("/api/upload/document", {
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
          const msg = data.error || "Error al subir el documento";
          setError(msg);
          onUploadError?.(msg);
          return;
        }

        if (data.url) {
          onUploadSuccess(
            data.url,
            file.name,
            data.fileSizeBytes,
            data.assetId
          );
        }
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Error al subir el documento";
        setError(msg);
        onUploadError?.(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [documentId, projectId, onBeforeUpload, onUploadSuccess, onUploadError]
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
          accept=".pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.numbers,.ppt,.pptx,.key,.rtf,.odt,.ods,.odp,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.apple.numbers,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.apple.keynote,application/rtf,text/rtf,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation"
          onChange={handleFileInput}
          disabled={disabled || isUploading}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          aria-label="Seleccionar documento"
        />
        {isUploading ? (
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
        ) : currentFileUrl ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <FileIcon className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground max-w-[200px] truncate text-center text-sm">
              Documento subido
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <FileIcon className="text-muted-foreground h-10 w-10" />
            <div className="text-muted-foreground text-sm">
              <p className="font-medium">Arrastra un documento aquí</p>
              <p>o haz clic para seleccionar</p>
            </div>
            <p className="text-muted-foreground/80 text-xs">
              PDFs, docs, hojas de cálculo, presentaciones, texto… (máx. 10MB)
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
