/**
 * Backblaze B2 Native API client for product image uploads.
 * Server-side only - never expose B2 keys to the client.
 *
 * Cuando no es producción, el prefijo del bucket es test-assets en lugar de assets
 * para no mezclar archivos de desarrollo/pruebas con los de producción.
 */

import {
  getExtensionFromMime,
  isAllowedImageType,
  validateImageFile,
} from "./image-validation";

export { validateImageFile };

const BUCKET_ASSETS_PREFIX =
  process.env.NODE_ENV === "production" ? "assets" : "test-assets";

interface B2AuthResponse {
  authorizationToken: string;
  apiUrl: string;
  downloadUrl: string;
  apiInfo?: {
    storageApi: {
      apiUrl: string;
      downloadUrl: string;
    };
  };
}

interface B2UploadUrlResponse {
  uploadUrl: string;
  authorizationToken: string;
}

interface B2UploadFileResponse {
  fileName: string;
  fileId: string;
}

async function b2Authorize(): Promise<B2AuthResponse> {
  const keyId = process.env.B2_APPLICATION_KEY_ID;
  const key = process.env.B2_APPLICATION_KEY;

  if (!keyId || !key) {
    throw new Error(
      "B2_APPLICATION_KEY_ID y B2_APPLICATION_KEY son requeridos"
    );
  }

  const credentials = Buffer.from(`${keyId}:${key}`).toString("base64");
  const res = await fetch(
    "https://api.backblazeb2.com/b2api/v2/b2_authorize_account",
    {
      headers: { Authorization: `Basic ${credentials}` },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `B2 authorize failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

function getApiUrls(auth: B2AuthResponse): {
  apiUrl: string;
  downloadUrl: string;
} {
  if (auth.apiInfo?.storageApi) {
    return auth.apiInfo.storageApi;
  }
  return { apiUrl: auth.apiUrl, downloadUrl: auth.downloadUrl };
}

async function getUploadUrl(
  auth: B2AuthResponse
): Promise<B2UploadUrlResponse> {
  const bucketId = process.env.B2_BUCKET_ID;
  if (!bucketId) {
    throw new Error("B2_BUCKET_ID es requerido");
  }

  const { apiUrl } = getApiUrls(auth);
  const res = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `B2 get upload URL failed: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

/**
 * Estructura: assets/{userId}/catalog/ y assets/{userId}/projects/{projectId}/img|doc/
 * - Catálogo: assets/{userId}/catalog/{productId}.webp
 * - Proyecto: assets/{userId}/projects/{projectId}/img/{productId}.webp
 */
export async function uploadProductImage(params: {
  buffer: ArrayBuffer;
  mimeType: string;
  userId: string;
  productId: string;
  projectId?: string;
}): Promise<string> {
  const { buffer, mimeType, userId, productId, projectId } = params;

  if (!isAllowedImageType(mimeType)) {
    throw new Error("Solo se permiten imágenes JPG, PNG o WebP");
  }

  const ext = getExtensionFromMime(mimeType);
  const fileName = projectId
    ? `${BUCKET_ASSETS_PREFIX}/${userId}/projects/${projectId}/img/${productId}${ext}`
    : `${BUCKET_ASSETS_PREFIX}/${userId}/catalog/${productId}${ext}`;
  const encodedFileName = encodeURIComponent(fileName);

  const auth = await b2Authorize();
  const { uploadUrl, authorizationToken } = await getUploadUrl(auth);

  const sha1 = await crypto.subtle.digest("SHA-1", buffer).then((h) =>
    Array.from(new Uint8Array(h))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "X-Bz-File-Name": encodedFileName,
      "Content-Type": mimeType,
      "Content-Length": String(buffer.byteLength),
      "X-Bz-Content-Sha1": sha1,
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `B2 upload failed: ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as B2UploadFileResponse;

  const bucketName = process.env.B2_BUCKET_NAME;
  const { downloadUrl } = getApiUrls(auth);

  if (!bucketName || !downloadUrl) {
    throw new Error("B2_BUCKET_NAME o downloadUrl no configurados");
  }

  return `${downloadUrl}/file/${bucketName}/${data.fileName}`;
}

/**
 * Estructura: assets/{userId}/projects/{projectId}/img/{imageId}.ext
 */
export async function uploadSpaceImage(params: {
  buffer: ArrayBuffer;
  mimeType: string;
  userId: string;
  projectId: string;
  spaceId: string;
  imageId: string;
}): Promise<string> {
  const { buffer, mimeType, userId, projectId, imageId } = params;

  if (!isAllowedImageType(mimeType)) {
    throw new Error("Solo se permiten imágenes JPG, PNG o WebP");
  }

  const ext = getExtensionFromMime(mimeType);
  const fileName = `${BUCKET_ASSETS_PREFIX}/${userId}/projects/${projectId}/img/${imageId}${ext}`;
  const encodedFileName = encodeURIComponent(fileName);

  const auth = await b2Authorize();
  const { uploadUrl, authorizationToken } = await getUploadUrl(auth);

  const sha1 = await crypto.subtle.digest("SHA-1", buffer).then((h) =>
    Array.from(new Uint8Array(h))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "X-Bz-File-Name": encodedFileName,
      "Content-Type": mimeType,
      "Content-Length": String(buffer.byteLength),
      "X-Bz-Content-Sha1": sha1,
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `B2 upload failed: ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as B2UploadFileResponse;

  const bucketName = process.env.B2_BUCKET_NAME;
  const { downloadUrl } = getApiUrls(auth);

  if (!bucketName || !downloadUrl) {
    throw new Error("B2_BUCKET_NAME o downloadUrl no configurados");
  }

  return `${downloadUrl}/file/${bucketName}/${data.fileName}`;
}

/**
 * Estructura: assets/{userId}/projects/{projectId}/doc/{documentId}.ext
 */
export async function uploadDocument(params: {
  buffer: ArrayBuffer;
  mimeType: string;
  userId: string;
  projectId: string;
  documentId: string;
  extension: string;
}): Promise<string> {
  const { buffer, mimeType, userId, projectId, documentId, extension } = params;

  const ext = extension.startsWith(".") ? extension : `.${extension}`;
  const fileName = `${BUCKET_ASSETS_PREFIX}/${userId}/projects/${projectId}/doc/${documentId}${ext}`;
  const encodedFileName = encodeURIComponent(fileName);

  const auth = await b2Authorize();
  const { uploadUrl, authorizationToken } = await getUploadUrl(auth);

  const sha1 = await crypto.subtle.digest("SHA-1", buffer).then((h) =>
    Array.from(new Uint8Array(h))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );

  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      Authorization: authorizationToken,
      "X-Bz-File-Name": encodedFileName,
      "Content-Type": mimeType,
      "Content-Length": String(buffer.byteLength),
      "X-Bz-Content-Sha1": sha1,
    },
    body: buffer,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      err.message || `B2 upload failed: ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as B2UploadFileResponse;

  const bucketName = process.env.B2_BUCKET_NAME;
  const { downloadUrl } = getApiUrls(auth);

  if (!bucketName || !downloadUrl) {
    throw new Error("B2_BUCKET_NAME o downloadUrl no configurados");
  }

  return `${downloadUrl}/file/${bucketName}/${data.fileName}`;
}

/**
 * Comprueba si una URL es de nuestro bucket B2.
 */
function isOurB2Url(imageUrl: string): boolean {
  const bucketName = process.env.B2_BUCKET_NAME;
  if (!bucketName || !imageUrl?.trim()) return false;
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    // Formato: /file/{bucketName}/{fileName}
    return (
      url.hostname.includes("backblazeb2.com") &&
      pathParts[0] === "file" &&
      pathParts[1] === bucketName &&
      pathParts.length >= 3
    );
  } catch {
    return false;
  }
}

/**
 * Extrae el fileName (path) de una URL B2 nuestra.
 * Formato URL: .../file/bucketName/userId/productId.ext
 */
function extractFileNameFromB2Url(imageUrl: string): string | null {
  const bucketName = process.env.B2_BUCKET_NAME;
  if (!bucketName || !imageUrl?.trim()) return null;
  try {
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/").filter(Boolean);
    if (pathParts[0] !== "file" || pathParts[1] !== bucketName) return null;
    return decodeURIComponent(pathParts.slice(2).join("/"));
  } catch {
    return null;
  }
}

/**
 * Elimina una imagen de B2 por su URL pública.
 * Solo elimina si la URL pertenece a nuestro bucket.
 */
export async function deleteProductImage(imageUrl: string): Promise<void> {
  if (!isOurB2Url(imageUrl)) return;

  const fileName = extractFileNameFromB2Url(imageUrl);
  if (!fileName) return;

  const auth = await b2Authorize();
  const bucketId = process.env.B2_BUCKET_ID;
  if (!bucketId) {
    throw new Error("B2_BUCKET_ID es requerido");
  }

  const { apiUrl } = getApiUrls(auth);

  const listRes = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucketId,
      prefix: fileName,
      maxFileCount: 1,
    }),
  });

  if (!listRes.ok) return;

  const listData = (await listRes.json()) as {
    files?: { fileId: string; fileName: string }[];
  };
  const files = listData.files ?? [];
  if (files.length === 0) return;

  const file = files[0];
  const deleteRes = await fetch(`${apiUrl}/b2api/v2/b2_delete_file_version`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileId: file.fileId,
      fileName: file.fileName,
    }),
  });

  if (!deleteRes.ok) {
    const err = await deleteRes.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ||
        `B2 delete failed: ${deleteRes.status} ${deleteRes.statusText}`
    );
  }
}

/** Max file count per B2 list request */
const B2_LIST_PAGE_SIZE = 1000;

/**
 * Lists all file names in B2 under a prefix, with pagination.
 */
async function b2ListFileNames(
  auth: B2AuthResponse,
  bucketId: string,
  prefix: string,
  startFileName: string | null
): Promise<{
  files: { fileId: string; fileName: string }[];
  nextFileName: string | null;
}> {
  const { apiUrl } = getApiUrls(auth);
  const res = await fetch(`${apiUrl}/b2api/v2/b2_list_file_names`, {
    method: "POST",
    headers: {
      Authorization: auth.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucketId,
      prefix,
      startFileName,
      maxFileCount: B2_LIST_PAGE_SIZE,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message ||
        `B2 list file names failed: ${res.status} ${res.statusText}`
    );
  }

  const data = (await res.json()) as {
    files?: { fileId: string; fileName: string }[];
    nextFileName?: string | null;
  };
  return {
    files: data.files ?? [],
    nextFileName: data.nextFileName ?? null,
  };
}

/**
 * Deletes all files in B2 under assets/{userId}/ (catalog and project images/documents).
 * Used when deleting a user account.
 */
export async function deleteAllFilesForUser(userId: string): Promise<void> {
  const auth = await b2Authorize();
  const bucketId = process.env.B2_BUCKET_ID;
  if (!bucketId) {
    throw new Error("B2_BUCKET_ID es requerido");
  }

  const prefix = `${BUCKET_ASSETS_PREFIX}/${userId}/`;
  let startFileName: string | null = null;
  const { apiUrl } = getApiUrls(auth);

  while (true) {
    const { files, nextFileName } = await b2ListFileNames(
      auth,
      bucketId,
      prefix,
      startFileName
    );

    for (const file of files) {
      const deleteRes = await fetch(
        `${apiUrl}/b2api/v2/b2_delete_file_version`,
        {
          method: "POST",
          headers: {
            Authorization: auth.authorizationToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileId: file.fileId,
            fileName: file.fileName,
          }),
        }
      );
      if (!deleteRes.ok) {
        const err = await deleteRes.json().catch(() => ({}));
        throw new Error(
          (err as { message?: string }).message ||
            `B2 delete file failed: ${deleteRes.status} ${deleteRes.statusText}`
        );
      }
    }

    if (nextFileName == null) break;
    startFileName = nextFileName;
  }
}
