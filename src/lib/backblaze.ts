/**
 * Backblaze B2 Native API client for product image uploads.
 * Server-side only - never expose B2 keys to the client.
 */

import {
  getExtensionFromMime,
  isAllowedImageType,
  validateImageFile,
} from "./image-validation";

export { validateImageFile };

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
 * Uploads a file buffer to B2 with path: <userId>/<productId>.<ext>
 * Returns the public download URL.
 */
export async function uploadProductImage(params: {
  buffer: ArrayBuffer;
  mimeType: string;
  userId: string;
  productId: string;
}): Promise<string> {
  const { buffer, mimeType, userId, productId } = params;

  if (!isAllowedImageType(mimeType)) {
    throw new Error("Solo se permiten imágenes JPG, PNG o WebP");
  }

  const ext = getExtensionFromMime(mimeType);
  const fileName = `${userId}/${productId}${ext}`;
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
