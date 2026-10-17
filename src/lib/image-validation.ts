/**
 * Validación de tipos de imagen permitidos (JPG, PNG, WebP, AVIF).
 * Cliente y servidor - sin dependencias de Node.
 */

import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { getAppUiCopy, interpolateAppCopy } from "@/lib/app-ui-copy";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

export const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function isAllowedImageType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType as (typeof ALLOWED_TYPES)[number]);
}

export function getExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/avif": ".avif",
  };
  return map[mimeType] ?? ".jpg";
}

export function validateImageFile(
  file: File,
  lang: Locale = defaultLocale
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return {
      valid: false,
      error: getAppUiCopy(lang).validation.imageType,
    };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return {
      valid: false,
      error: interpolateAppCopy(getAppUiCopy(lang).validation.fileTooLarge5mb, {
        fileName: file.name,
      }),
    };
  }
  return { valid: true };
}
