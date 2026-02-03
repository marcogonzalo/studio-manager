/**
 * Validación de tipos de imagen permitidos (JPG, PNG, WebP).
 * Cliente y servidor - sin dependencias de Node.
 */

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;

export function isAllowedImageType(mimeType: string): boolean {
  return ALLOWED_TYPES.includes(mimeType as (typeof ALLOWED_TYPES)[number]);
}

export function getExtensionFromMime(mimeType: string): string {
  const map: Record<string, string> = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
  };
  return map[mimeType] ?? ".jpg";
}

export function validateImageFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return {
      valid: false,
      error: "Solo se permiten imágenes JPG, PNG o WebP",
    };
  }
  return { valid: true };
}
