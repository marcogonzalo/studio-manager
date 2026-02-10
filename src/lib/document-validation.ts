/**
 * Validación de tipos de documento permitidos para project_documents.
 * Restringido a: PDF, hojas de cálculo, presentaciones, TXT y
 * documentos de texto/presupuestos/documentos a cliente en arquitectura.
 */

const ALLOWED_MIMES = [
  "application/pdf",
  "text/plain",
  "text/csv",
  "application/msword", // .doc
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/vnd.ms-excel", // .xls
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
  "application/vnd.apple.numbers",
  "application/x-iwork-numbers-sffnumbers",
  "application/vnd.ms-powerpoint", // .ppt
  "application/vnd.openxmlformats-officedocument.presentationml.presentation", // .pptx
  "application/vnd.apple.keynote",
  "application/x-iwork-keynote-sffkey",
  "application/rtf",
  "text/rtf",
  "application/vnd.oasis.opendocument.text", // .odt
  "application/vnd.oasis.opendocument.spreadsheet", // .ods
  "application/vnd.oasis.opendocument.presentation", // .odp
] as const;

const EXTENSION_FROM_MIME: Record<string, string> = {
  "application/pdf": ".pdf",
  "text/plain": ".txt",
  "text/csv": ".csv",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.apple.numbers": ".numbers",
  "application/x-iwork-numbers-sffnumbers": ".numbers",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
  "application/vnd.apple.keynote": ".key",
  "application/x-iwork-keynote-sffkey": ".key",
  "application/rtf": ".rtf",
  "text/rtf": ".rtf",
  "application/vnd.oasis.opendocument.text": ".odt",
  "application/vnd.oasis.opendocument.spreadsheet": ".ods",
  "application/vnd.oasis.opendocument.presentation": ".odp",
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function isAllowedDocumentType(mimeType: string): boolean {
  return ALLOWED_MIMES.includes(mimeType as (typeof ALLOWED_MIMES)[number]);
}

export function getExtensionFromMime(mimeType: string): string {
  return EXTENSION_FROM_MIME[mimeType] ?? ".bin";
}

/**
 * Obtiene la extensión del nombre de archivo si no hay mime conocido.
 */
export function getExtensionFromFileName(fileName: string): string {
  const idx = fileName.lastIndexOf(".");
  if (idx === -1 || idx === fileName.length - 1) return "";
  return fileName.slice(idx);
}

export function validateDocumentFile(
  file: File
): { valid: true } | { valid: false; error: string } {
  if (!isAllowedDocumentType(file.type)) {
    return {
      valid: false,
      error:
        "Tipo no permitido. Use PDFs, docs, hojas de cálculo, presentaciones, texto u otros documentos relacionados.",
    };
  }
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      error:
        "No se pueden subir archivos de más de 10Mb. Si lo tienes en Drive, OneDrive o iCloud, añádelo como URL.",
    };
  }
  return { valid: true };
}
