/**
 * Embed product thumbnails in the PDF as data URLs.
 * react-pdf fetches remote URLs from the browser and dies on CORS;
 * data URLs are inlined (same approach as the Veta logo).
 */

export function nextImageOptimizerUrl(
  imageUrl: string,
  origin: string
): string {
  const params = new URLSearchParams({
    url: imageUrl,
    w: "64",
    q: "75",
  });
  return `${origin}/_next/image?${params.toString()}`;
}

function isDataImageUrl(url: string): boolean {
  return url.startsWith("data:image/") && url.includes(",");
}

function isHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const mime = blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  return `data:${mime};base64,${btoa(binary)}`;
}

export async function fetchImageAsDataUrl(
  url: string,
  fetchImpl: typeof fetch = fetch,
  origin?: string
): Promise<string | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (isDataImageUrl(trimmed)) return trimmed;
  if (!isHttpUrl(trimmed)) return null;

  const candidates = [trimmed];
  if (origin) {
    candidates.push(nextImageOptimizerUrl(trimmed, origin));
  }

  for (const src of candidates) {
    try {
      const res = await fetchImpl(src);
      if (!res.ok) continue;
      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      if (isDataImageUrl(dataUrl)) return dataUrl;
    } catch {
      // Try the next candidate (direct URL often fails CORS; optimizer is same-origin).
    }
  }
  return null;
}

type PdfThumbItem = {
  image_url?: string | null;
  product?: { image_url?: string | null };
};

export function pdfItemSourceUrl(item: PdfThumbItem): string {
  return (item.image_url || item.product?.image_url || "").trim();
}

export async function attachPdfItemThumbnails<T extends PdfThumbItem>(
  items: T[],
  fetchImpl: typeof fetch = fetch,
  origin?: string
): Promise<T[]> {
  const inflight = new Map<string, Promise<string | null>>();

  const load = (src: string): Promise<string | null> => {
    if (!src) return Promise.resolve(null);
    const existing = inflight.get(src);
    if (existing) return existing;
    const pending = fetchImageAsDataUrl(src, fetchImpl, origin);
    inflight.set(src, pending);
    return pending;
  };

  return Promise.all(
    items.map(async (item) => {
      const dataUrl = await load(pdfItemSourceUrl(item));
      return { ...item, image_url: dataUrl ?? "" };
    })
  );
}
