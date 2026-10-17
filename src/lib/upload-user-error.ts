import type { Locale } from "@/i18n/config";
import { defaultLocale } from "@/i18n/config";
import { getAppUiCopy, interpolateAppCopy } from "@/lib/app-ui-copy";

/** Stable English phrase thrown by storage adapters; humanize localizes it. */
export const STORAGE_TRANSIENT_ERROR =
  "Service temporarily unavailable, please try again.";

/**
 * Map B2 / storage HTTP failures to a safe message (never leak incident ids).
 */
export function messageFromStorageProviderFailure(
  status: number,
  providerMessage: string | undefined,
  fallback: string
): string {
  const raw = providerMessage?.trim() ?? "";
  if (
    /incident\s*id/i.test(raw) ||
    /no\s+tomes?\s+available|no\s+tokens?\s+available/i.test(raw) ||
    status >= 500 ||
    status === 408 ||
    status === 429
  ) {
    return STORAGE_TRANSIENT_ERROR;
  }
  return raw || fallback;
}

/**
 * Strip opaque vendor noise (incident ids, request ids) and map known
 * infrastructure failures to user-facing copy.
 */
export function humanizeUploadError(
  raw: string | undefined | null,
  lang: Locale = defaultLocale
): string {
  const copy = getAppUiCopy(lang).errors;
  const fallback = copy.uploadFailed;
  if (!raw?.trim()) return fallback;

  const hadIncidentId = /incident\s*id/i.test(raw);

  const text = raw
    .replace(/\s*[—–-]?\s*incident\s*id\s*[:\s]*[\w-]+/gi, "")
    .replace(/\s*[—–-]?\s*request\s*id\s*[:\s]*[\w-]+/gi, "")
    .replace(/\s*[—–-]?\s*ray\s*id\s*[:\s]*[\w-]+/gi, "")
    .replace(/^[:\s—–-]+|[:\s—–-]+$/g, "")
    .trim();

  const lower = `${raw} ${text}`.toLowerCase();

  if (
    hadIncidentId ||
    /no\s+tomes?\s+available|no\s+tokens?\s+available|upload\s+token|authorizationtoken|expired\s+token|unauthorized/i.test(
      lower
    )
  ) {
    return copy.uploadTransient;
  }

  if (
    /temporarily unavailable|service unavailable|try again later|econnreset|econnrefused|fetch failed|networkerror|502|503|504/i.test(
      lower
    )
  ) {
    return copy.uploadTransient;
  }

  if (
    /b2[_ ]|backblaze|bucket|sharp|heic|ENOMEM|out of memory|internal server/i.test(
      lower
    )
  ) {
    return fallback;
  }

  // Leftover opaque id-only / empty after stripping
  if (!text || /^[\w-]{8,}$/i.test(text)) {
    return fallback;
  }

  return text;
}

/** Message first, filename last: "Cannot exceed 5MB — photo.jpg" */
export function formatUploadFileError(
  message: string,
  fileName: string,
  lang: Locale = defaultLocale
): string {
  const cleaned = humanizeUploadError(message, lang);
  if (!fileName.trim()) return cleaned;
  if (cleaned.includes(fileName)) {
    // Reorder "{fileName} …" → "… — {fileName}" when message starts with name
    if (cleaned.startsWith(fileName)) {
      const rest = cleaned.slice(fileName.length).replace(/^[:\s—–-]+/, "");
      if (rest) {
        const message = rest.charAt(0).toUpperCase() + rest.slice(1);
        return interpolateAppCopy(
          getAppUiCopy(lang).errors.uploadErrorWithFile,
          { message, fileName }
        );
      }
    }
    return cleaned;
  }
  return interpolateAppCopy(getAppUiCopy(lang).errors.uploadErrorWithFile, {
    message: cleaned,
    fileName,
  });
}

export type UploadFailureItem = {
  message: string;
  fileName?: string;
};

export function formatUploadFailureItem(
  item: UploadFailureItem,
  lang: Locale = defaultLocale
): string {
  if (item.fileName) {
    return formatUploadFileError(item.message, item.fileName, lang);
  }
  return humanizeUploadError(item.message, lang);
}
