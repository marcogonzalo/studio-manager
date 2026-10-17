"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImageIcon, Loader2 } from "lucide-react";
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
  humanizeUploadError,
  type UploadFailureItem,
} from "@/lib/upload-user-error";

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

type QueueItem = { file: File; imageId?: string };

type UploadOutcome =
  | { kind: "ok" }
  | { kind: "rate_limit"; retryAfterSec: number }
  | { kind: "storage_limit"; body: StorageLimitErrorBody }
  | { kind: "error"; message: string };

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
  const locale = useLocale() as Locale;
  const { usedBytes, limitMb } = useStorageUsage();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [queueRemaining, setQueueRemaining] = useState(0);
  const [failures, setFailures] = useState<UploadFailureItem[]>([]);
  const [storageLimitError, setStorageLimitError] =
    useState<StorageLimitErrorBody | null>(null);

  const pendingRef = useRef<QueueItem[]>([]);
  const cancelRequestedRef = useRef(false);
  const processQueueRef = useRef<(items: QueueItem[]) => Promise<void>>(
    async () => undefined
  );

  const handleAutoResume = useCallback(() => {
    if (cancelRequestedRef.current) return;
    const items = pendingRef.current;
    if (items.length === 0) return;
    void processQueueRef.current(items);
  }, []);

  const {
    isPaused,
    secondsLeft,
    pendingCount,
    startPause,
    cancel: cancelPause,
  } = useRateLimitAutoResume(handleAutoResume);

  const handleCancelAll = useCallback(() => {
    cancelRequestedRef.current = true;
    pendingRef.current = [];
    cancelPause();
    setQueueRemaining(0);
    setIsUploading(false);
  }, [cancelPause]);

  const uploadOne = useCallback(
    async (file: File, idToUse: string): Promise<UploadOutcome> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("projectId", projectId);
      formData.append("spaceId", spaceId);
      formData.append("imageId", idToUse);

      try {
        const res = await fetch("/api/upload/space-image", {
          method: "POST",
          body: formData,
        });

        let data: {
          url?: string;
          error?: string;
          fileSizeBytes?: number;
          assetId?: string;
          code?: string;
          currentUsed?: number;
          limitMb?: number;
        } = {};
        try {
          data = (await res.json()) as typeof data;
        } catch {
          if (isRateLimitStatus(res.status)) {
            return {
              kind: "rate_limit",
              retryAfterSec: parseRetryAfterSeconds(res),
            };
          }
          return {
            kind: "error",
            message: humanizeUploadError(undefined, locale),
          };
        }

        if (isRateLimitStatus(res.status)) {
          return {
            kind: "rate_limit",
            retryAfterSec: parseRetryAfterSeconds(res),
          };
        }

        if (!res.ok) {
          if (isStorageLimitErrorBody(data)) {
            return { kind: "storage_limit", body: data };
          }
          return {
            kind: "error",
            message: humanizeUploadError(
              data.error || t("uploadError"),
              locale
            ),
          };
        }

        if (data.url) {
          onUploadSuccess(data.url, data.fileSizeBytes, data.assetId, idToUse);
        }
        return { kind: "ok" };
      } catch (err) {
        return {
          kind: "error",
          message: humanizeUploadError(
            err instanceof Error ? err.message : t("uploadError"),
            locale
          ),
        };
      }
    },
    [projectId, spaceId, onUploadSuccess, t, locale]
  );

  const processQueue = useCallback(
    async (items: QueueItem[]) => {
      if (items.length === 0) return;

      cancelRequestedRef.current = false;
      setFailures([]);
      setStorageLimitError(null);
      setIsUploading(true);
      setQueueRemaining(items.length);

      const collected: UploadFailureItem[] = [];

      for (let i = 0; i < items.length; i++) {
        if (cancelRequestedRef.current) break;

        setQueueRemaining(items.length - i);
        const item = items[i];
        const validation = validateImageFile(item.file, locale);
        if (!validation.valid) {
          collected.push({
            message: validation.error,
            fileName: item.file.name,
          });
          continue;
        }

        let idToUse = item.imageId;
        try {
          if (!idToUse && getImageIdForUpload) {
            idToUse = await getImageIdForUpload();
          } else if (!idToUse && onBeforeUpload) {
            await onBeforeUpload();
            idToUse = imageId;
          } else if (!idToUse) {
            idToUse = imageId;
          }
        } catch (err) {
          const msg =
            err instanceof Error
              ? humanizeUploadError(err.message, locale)
              : t("createError");
          collected.push({ message: msg, fileName: item.file.name });
          setFailures([...collected]);
          onUploadError?.(msg);
          pendingRef.current = [];
          setQueueRemaining(0);
          setIsUploading(false);
          return;
        }

        if (cancelRequestedRef.current) break;

        const outcome = await uploadOne(item.file, idToUse);

        if (cancelRequestedRef.current) break;

        if (outcome.kind === "ok") continue;

        if (outcome.kind === "rate_limit") {
          const remaining: QueueItem[] = [
            { file: item.file, imageId: idToUse },
            ...items.slice(i + 1),
          ];
          pendingRef.current = remaining;
          setFailures(collected);
          setQueueRemaining(remaining.length);
          setIsUploading(false);
          startPause(outcome.retryAfterSec, remaining.length);
          return;
        }

        if (outcome.kind === "storage_limit") {
          setStorageLimitError(outcome.body);
          setFailures(collected);
          onUploadError?.(outcome.body.error);
          pendingRef.current = [];
          setQueueRemaining(0);
          setIsUploading(false);
          return;
        }

        collected.push({
          message: outcome.message,
          fileName: item.file.name,
        });
      }

      pendingRef.current = [];
      setFailures(collected);
      if (collected.length > 0) {
        onUploadError?.(
          collected
            .map((f) =>
              f.fileName ? `${f.message} — ${f.fileName}` : f.message
            )
            .join("\n")
        );
      }
      setQueueRemaining(0);
      setIsUploading(false);
    },
    [
      locale,
      getImageIdForUpload,
      onBeforeUpload,
      imageId,
      uploadOne,
      onUploadError,
      startPause,
      t,
    ]
  );

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  const busy = disabled || isUploading || isPaused;
  const showQueueBanner = isUploading || isPaused;

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (busy) return;
      const files = Array.from(e.dataTransfer.files);
      if (files.length === 0) return;
      if (multiple && getImageIdForUpload && files.length > 1) {
        await processQueue(files.map((file) => ({ file })));
      } else if (getImageIdForUpload && files.length >= 1) {
        await processQueue([{ file: files[0] }]);
      } else {
        await processQueue([{ file: files[0] }]);
      }
    },
    [busy, processQueue, multiple, getImageIdForUpload]
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
      if (busy) return;
      if (multiple && getImageIdForUpload && files.length > 0) {
        await processQueue(files.map((file) => ({ file })));
      } else if (getImageIdForUpload && files.length >= 1) {
        await processQueue([{ file: files[0] }]);
      } else if (files[0]) {
        await processQueue([{ file: files[0] }]);
      }
    },
    [busy, processQueue, multiple, getImageIdForUpload]
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
          accept="image/jpeg,image/png,image/webp,image/avif,.jpg,.jpeg,.png,.webp,.avif"
          multiple={multiple}
          onChange={handleFileInput}
          disabled={busy}
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
      {showQueueBanner && (
        <RateLimitResumeBanner
          isPaused={isPaused}
          secondsLeft={secondsLeft}
          pendingCount={isPaused ? pendingCount : Math.max(1, queueRemaining)}
          onCancel={handleCancelAll}
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
