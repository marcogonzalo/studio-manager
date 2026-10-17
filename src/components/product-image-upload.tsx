"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2, Pencil } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { validateImageFile } from "@/lib/image-validation";
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

interface ProductImageUploadProps {
  productId: string;
  projectId?: string;
  currentImageUrl?: string;
  onUploadSuccess: (
    url: string,
    fileSizeBytes?: number,
    assetId?: string
  ) => void;
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
  const t = useTranslations("ProductImageUpload");
  const locale = useLocale() as Locale;
  const { usedBytes, limitMb } = useStorageUsage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [failures, setFailures] = useState<UploadFailureItem[]>([]);
  const [storageLimitError, setStorageLimitError] =
    useState<StorageLimitErrorBody | null>(null);
  const cancelRequestedRef = useRef(false);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(
    null
  );

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
      cancelRequestedRef.current = false;
      setIsUploading(true);
      setStorageLimitError(null);
      setFailures([]);
      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);
        if (projectId) formData.append("projectId", projectId);

        const res = await fetch("/api/upload/product-image", {
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
          onUploadSuccess(data.url, data.fileSizeBytes, data.assetId);
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
      productId,
      projectId,
      onUploadSuccess,
      onUploadError,
      t,
      startPause,
      locale,
    ]
  );

  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);

  const handleFile = useCallback(
    (file: File) => {
      setFailures([]);
      const validation = validateImageFile(file, locale);
      if (!validation.valid) {
        const msg = formatUploadFileError(validation.error, file.name, locale);
        setFailures([{ message: msg, fileName: file.name }]);
        onUploadError?.(msg);
        return;
      }
      if (deferUpload) {
        onFileSelect?.(file);
        return;
      }
      void uploadFile(file);
    },
    [deferUpload, onFileSelect, onUploadError, uploadFile, locale]
  );

  const busy = disabled || isUploading || isPaused;

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (busy) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [busy, handleFile]
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
      if (file && !busy) handleFile(file);
      e.target.value = "";
    },
    [handleFile, busy]
  );

  const previewUrl = currentImageUrl || pendingPreviewUrl;
  const showDeferPlaceholder = deferUpload && pendingFile;
  const hasExistingImage = Boolean(currentImageUrl?.trim());

  return (
    <div className={cn("space-y-2", className)}>
      <StorageWarningBanner usedBytes={usedBytes} limitMb={limitMb} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative flex min-h-[120px] flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
          "bg-muted/30 border-muted-foreground/25",
          hasExistingImage && "group",
          isDragging && "border-primary bg-primary/5",
          busy && "pointer-events-none opacity-60",
          !busy && "hover:border-primary/50 cursor-pointer"
        )}
      >
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
          onChange={handleFileInput}
          disabled={busy}
          className="absolute inset-0 z-10 cursor-pointer opacity-0"
          aria-label={
            hasExistingImage ? t("replaceImageAria") : t("selectImageAria")
          }
          title={
            hasExistingImage ? t("replaceImageTitle") : t("selectImageTitle")
          }
        />
        {isUploading ? (
          <Loader2 className="text-muted-foreground h-10 w-10 animate-spin" />
        ) : showDeferPlaceholder && pendingPreviewUrl ? (
          <div className="relative flex h-full min-h-[120px] w-full flex-col items-center justify-center overflow-hidden rounded-md p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pendingPreviewUrl}
              alt={t("previewPendingAlt")}
              className="max-h-[180px] max-w-full object-contain"
            />
            <p className="text-muted-foreground mt-2 text-center text-xs">
              {t("pendingUpload")}
            </p>
          </div>
        ) : previewUrl ? (
          <div className="relative flex h-full min-h-[120px] w-full items-center justify-center overflow-hidden rounded-md p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt={t("previewAlt")}
              className="max-h-[180px] max-w-full object-contain"
            />
            {hasExistingImage && (
              <>
                <div
                  className="pointer-events-none absolute inset-0 rounded-md bg-black/0 transition-colors group-hover:bg-black/35"
                  aria-hidden
                />
                <div
                  className="bg-background/95 text-foreground ring-border pointer-events-none absolute right-2 bottom-2 flex h-9 w-9 items-center justify-center rounded-full shadow-md ring-1"
                  aria-hidden
                >
                  <Pencil className="h-4 w-4" />
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-4 py-6 text-center">
            <ImageIcon className="text-muted-foreground h-10 w-10" />
            <div className="text-muted-foreground text-sm">
              <p className="font-medium">{t("dropImage")}</p>
              <p>{t("clickToSelect")}</p>
            </div>
            <p className="text-muted-foreground/80 text-xs">{t("formats")}</p>
            {deferUpload ? (
              <p className="text-muted-foreground/70 text-xs">
                {t("deferredHint")}
              </p>
            ) : (
              <p className="text-muted-foreground/70 text-xs">
                {t("resizeHint")}
              </p>
            )}
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
