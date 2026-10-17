"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FileIcon, Loader2 } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { validateDocumentFile } from "@/lib/document-validation";
import type { Locale } from "@/i18n/config";
import { useStorageUsage } from "@/hooks/use-storage-usage";
import { useRateLimitAutoResume } from "@/hooks/use-rate-limit-auto-resume";
import { StorageWarningBanner } from "@/components/plan/storage-warning-banner";
import { StorageLimitInlineError } from "@/components/plan/storage-limit-inline-error";
import { RateLimitResumeBanner } from "@/components/plan/rate-limit-resume-banner";
import { UploadErrorList } from "@/components/plan/upload-error-list";
import {
  isStorageLimitErrorBody,
  type StorageLimitErrorBody,
} from "@/lib/plan-limit-ux";
import {
  isRateLimitStatus,
  parseRetryAfterSeconds,
} from "@/lib/upload-rate-limit";
import {
  formatUploadFileError,
  humanizeUploadError,
  type UploadFailureItem,
} from "@/lib/upload-user-error";

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
  const t = useTranslations("DocumentFileUpload");
  const locale = useLocale() as Locale;
  const { usedBytes, limitMb } = useStorageUsage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [failures, setFailures] = useState<UploadFailureItem[]>([]);
  const [storageLimitError, setStorageLimitError] =
    useState<StorageLimitErrorBody | null>(null);
  const cancelRequestedRef = useRef(false);

  const pendingUploadRef = useRef<File | null>(null);
  const uploadFileRef = useRef<(file: File) => Promise<void>>(
    async () => undefined
  );

  const handleAutoResume = useCallback(() => {
    const file = pendingUploadRef.current;
    if (!file) return;
    void uploadFileRef.current(file);
  }, []);

  const {
    isPaused,
    secondsLeft,
    pendingCount,
    startPause,
    cancel: cancelPause,
  } = useRateLimitAutoResume(handleAutoResume);

  const handleCancelPending = useCallback(() => {
    cancelRequestedRef.current = true;
    pendingUploadRef.current = null;
    cancelPause();
    setIsUploading(false);
  }, [cancelPause]);

  const uploadFile = useCallback(
    async (file: File) => {
      cancelRequestedRef.current = false;
      setFailures([]);
      const validation = validateDocumentFile(file, locale);
      if (!validation.valid) {
        const msg = formatUploadFileError(validation.error, file.name, locale);
        setFailures([{ message: msg, fileName: file.name }]);
        onUploadError?.(msg);
        return;
      }

      if (onBeforeUpload && !pendingUploadRef.current) {
        try {
          await onBeforeUpload();
        } catch (err) {
          const msg = humanizeUploadError(
            err instanceof Error ? err.message : t("createError"),
            locale
          );
          setFailures([{ message: msg, fileName: file.name }]);
          onUploadError?.(msg);
          return;
        }
      }

      setIsUploading(true);
      setStorageLimitError(null);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("documentId", documentId);
        formData.append("projectId", projectId);

        const res = await fetch("/api/upload/document", {
          method: "POST",
          body: formData,
        });

        if (cancelRequestedRef.current) return;

        const data = (await res.json()) as {
          url?: string;
          error?: string;
          fileSizeBytes?: number;
          assetId?: string;
          code?: string;
          currentUsed?: number;
          limitMb?: number;
        };

        if (cancelRequestedRef.current) return;

        if (isRateLimitStatus(res.status)) {
          pendingUploadRef.current = file;
          startPause(parseRetryAfterSeconds(res), 1);
          return;
        }

        if (!res.ok) {
          pendingUploadRef.current = null;
          if (isStorageLimitErrorBody(data)) {
            setStorageLimitError(data);
            onUploadError?.(data.error);
            return;
          }
          const msg = formatUploadFileError(
            humanizeUploadError(data.error || t("uploadError"), locale),
            file.name,
            locale
          );
          setFailures([{ message: msg, fileName: file.name }]);
          onUploadError?.(msg);
          return;
        }

        pendingUploadRef.current = null;
        if (data.url) {
          onUploadSuccess(
            data.url,
            file.name,
            data.fileSizeBytes,
            data.assetId
          );
        }
      } catch (err) {
        if (cancelRequestedRef.current) return;
        pendingUploadRef.current = null;
        const msg = formatUploadFileError(
          humanizeUploadError(
            err instanceof Error ? err.message : t("uploadError"),
            locale
          ),
          file.name,
          locale
        );
        setFailures([{ message: msg, fileName: file.name }]);
        onUploadError?.(msg);
      } finally {
        setIsUploading(false);
      }
    },
    [
      documentId,
      projectId,
      onBeforeUpload,
      onUploadSuccess,
      onUploadError,
      t,
      locale,
      startPause,
    ]
  );

  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);

  const busy = disabled || isUploading || isPaused;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (busy) return;
      const file = e.dataTransfer.files[0];
      if (file) void uploadFile(file);
    },
    [busy, uploadFile]
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
      if (file && !busy) void uploadFile(file);
      e.target.value = "";
    },
    [uploadFile, busy]
  );

  return (
    <div className={cn("space-y-2", className)}>
      <StorageWarningBanner usedBytes={usedBytes} limitMb={limitMb} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex min-h-[100px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          "bg-muted/30 border-muted-foreground/25",
          isDragging && "border-primary bg-primary/5",
          busy && "pointer-events-none opacity-60",
          !busy && "hover:border-primary/50 cursor-pointer"
        )}
      >
        <input
          type="file"
          accept=".pdf,.txt,.csv,.doc,.docx,.xls,.xlsx,.numbers,.ppt,.pptx,.key,.rtf,.odt,.ods,.odp,application/pdf,text/plain,text/csv,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.apple.numbers,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.apple.keynote,application/rtf,text/rtf,application/vnd.oasis.opendocument.text,application/vnd.oasis.opendocument.spreadsheet,application/vnd.oasis.opendocument.presentation"
          onChange={handleFileInput}
          disabled={busy}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          aria-label={t("selectDocumentAria")}
        />
        {isUploading ? (
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
        ) : currentFileUrl ? (
          <div className="flex flex-col items-center gap-2 p-4">
            <FileIcon className="text-muted-foreground h-10 w-10" />
            <p className="text-muted-foreground max-w-[200px] truncate text-center text-sm">
              {t("uploaded")}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <FileIcon className="text-muted-foreground h-10 w-10" />
            <div className="text-muted-foreground text-sm">
              <p className="font-medium">{t("dropDocument")}</p>
              <p>{t("clickToSelect")}</p>
            </div>
            <p className="text-muted-foreground/80 text-xs">{t("formats")}</p>
          </div>
        )}
      </div>
      {(isUploading || isPaused) && (
        <RateLimitResumeBanner
          isPaused={isPaused}
          secondsLeft={secondsLeft}
          pendingCount={isPaused ? pendingCount : 1}
          onCancel={handleCancelPending}
        />
      )}
      {storageLimitError && (
        <StorageLimitInlineError body={storageLimitError} />
      )}
      {!storageLimitError && failures.length > 0 && (
        <UploadErrorList items={failures} />
      )}
    </div>
  );
}
