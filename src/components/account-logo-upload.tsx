"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStorageUsage } from "@/hooks/use-storage-usage";
import { StorageWarningBanner } from "@/components/plan/storage-warning-banner";
import { UploadErrorList } from "@/components/plan/upload-error-list";
import { validateImageFile } from "@/lib/image-validation";
import {
  formatUploadFileError,
  humanizeUploadError,
  type UploadFailureItem,
} from "@/lib/upload-user-error";
import {
  isRateLimitStatus,
  parseRetryAfterSeconds,
} from "@/lib/upload-rate-limit";
import { useRateLimitAutoResume } from "@/hooks/use-rate-limit-auto-resume";
import {
  isStorageLimitErrorBody,
  type StorageLimitErrorBody,
} from "@/lib/plan-limit-ux";
import type { Locale } from "@/i18n/config";
import { cn, reportError } from "@/lib/utils";

type AccountLogoUploadProps = {
  currentLogoUrl?: string | null;
  disabled?: boolean;
  onUploadSuccess: (url: string) => void;
  onRemoveSuccess: () => void;
  className?: string;
};

export function AccountLogoUpload({
  currentLogoUrl,
  disabled = false,
  onUploadSuccess,
  onRemoveSuccess,
  className,
}: AccountLogoUploadProps) {
  const t = useTranslations("SettingsCustomization");
  const locale = useLocale() as Locale;
  const { usedBytes, limitMb } = useStorageUsage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentLogoUrl ?? null
  );
  const [failures, setFailures] = useState<UploadFailureItem[]>([]);
  const [storageLimitError, setStorageLimitError] =
    useState<StorageLimitErrorBody | null>(null);
  const pendingFileRef = useRef<File | null>(null);
  const uploadFileRef = useRef<(file: File) => Promise<void>>(
    async () => undefined
  );

  useEffect(() => {
    setPreviewUrl(currentLogoUrl ?? null);
  }, [currentLogoUrl]);

  const handleAutoResume = useCallback(() => {
    const file = pendingFileRef.current;
    if (!file) return;
    void uploadFileRef.current(file);
  }, []);

  const {
    isPaused,
    secondsLeft,
    startPause,
    cancel: cancelPause,
  } = useRateLimitAutoResume(handleAutoResume);

  const uploadFile = useCallback(
    async (file: File) => {
      setFailures([]);
      setStorageLimitError(null);
      const validation = validateImageFile(file, locale);
      if (!validation.valid) {
        setFailures([
          {
            fileName: file.name,
            message: validation.error,
          },
        ]);
        return;
      }

      setIsUploading(true);
      pendingFileRef.current = file;
      try {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch("/api/upload/account-logo", {
          method: "POST",
          body: formData,
        });
        const data = (await res.json().catch(() => ({}))) as {
          url?: string;
          error?: string;
          code?: string;
        };

        if (isRateLimitStatus(res.status)) {
          startPause(parseRetryAfterSeconds(res), 1);
          return;
        }

        if (!res.ok) {
          if (isStorageLimitErrorBody(data)) {
            setStorageLimitError(data);
            return;
          }
          setFailures([
            {
              fileName: file.name,
              message: humanizeUploadError(data.error ?? null, locale),
            },
          ]);
          return;
        }

        if (!data.url) {
          setFailures([
            {
              fileName: file.name,
              message: humanizeUploadError(null, locale),
            },
          ]);
          return;
        }

        pendingFileRef.current = null;
        setPreviewUrl(data.url);
        onUploadSuccess(data.url);
      } catch (err) {
        reportError(err, "account-logo upload:");
        const raw = err instanceof Error ? err.message : null;
        setFailures([
          {
            fileName: file.name,
            message: formatUploadFileError(
              humanizeUploadError(raw, locale),
              file.name,
              locale
            ),
          },
        ]);
      } finally {
        setIsUploading(false);
      }
    },
    [locale, onUploadSuccess, startPause]
  );

  useEffect(() => {
    uploadFileRef.current = uploadFile;
  }, [uploadFile]);

  async function handleRemove() {
    setIsRemoving(true);
    setFailures([]);
    try {
      const res = await fetch("/api/upload/account-logo", { method: "DELETE" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setFailures([
          {
            fileName: "logo",
            message: humanizeUploadError(data.error ?? null, locale),
          },
        ]);
        return;
      }
      setPreviewUrl(null);
      onRemoveSuccess();
    } catch (err) {
      reportError(err, "account-logo delete:");
      const raw = err instanceof Error ? err.message : null;
      setFailures([
        {
          fileName: "logo",
          message: formatUploadFileError(
            humanizeUploadError(raw, locale),
            "logo",
            locale
          ),
        },
      ]);
    } finally {
      setIsRemoving(false);
    }
  }

  const displayUrl = previewUrl ?? currentLogoUrl ?? null;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap items-center gap-4">
        <div className="border-border bg-muted/40 relative flex h-20 w-40 items-center justify-center overflow-hidden rounded-md border">
          {displayUrl ? (
            <Image
              src={displayUrl}
              alt={t("logoPreviewAlt")}
              fill
              className="object-contain p-2"
              unoptimized
            />
          ) : (
            <ImagePlus className="text-muted-foreground h-8 w-8" />
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || isUploading || isRemoving || isPaused}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("logoUploading")}
              </>
            ) : (
              t("logoUpload")
            )}
          </Button>
          {displayUrl ? (
            <Button
              type="button"
              variant="outline"
              disabled={disabled || isUploading || isRemoving || isPaused}
              onClick={() => void handleRemove()}
            >
              {isRemoving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              {t("logoRemove")}
            </Button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          disabled={disabled || isUploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) void uploadFile(file);
          }}
        />
      </div>
      {isPaused ? (
        <p className="text-muted-foreground text-xs">
          {t("logoRateLimited", { seconds: secondsLeft })}{" "}
          <button
            type="button"
            className="underline"
            onClick={() => cancelPause()}
          >
            {t("logoCancelWait")}
          </button>
        </p>
      ) : null}
      <StorageWarningBanner usedBytes={usedBytes} limitMb={limitMb} />
      {storageLimitError ? (
        <p className="text-destructive text-sm">{storageLimitError.error}</p>
      ) : null}
      <UploadErrorList items={failures} />
      <p className="text-muted-foreground text-xs">
        <span className="block">{t("logoHelpLead")}</span>
        <span className="block">{t("logoHelpDetail")}</span>
      </p>
    </div>
  );
}
