type SpaceImagesClient = {
  from: (table: string) => {
    delete: () => {
      eq: (column: string, value: string) => PromiseLike<{ error: unknown }>;
    };
  };
};

export type DeleteSpaceImageResult =
  | { ok: true }
  | { ok: false; error: unknown };

export async function deleteSpaceImage({
  id,
  url,
  supabase,
  fetchImpl = fetch,
}: {
  id: string;
  url?: string | null;
  supabase: SpaceImagesClient;
  fetchImpl?: typeof fetch;
}): Promise<DeleteSpaceImageResult> {
  const trimmedUrl = url?.trim() ?? "";

  if (trimmedUrl) {
    try {
      const res = await fetchImpl(
        `/api/upload/product-image?url=${encodeURIComponent(trimmedUrl)}`,
        { method: "DELETE" }
      );
      if (res.ok) return { ok: true };

      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        code?: string;
      };
      return {
        ok: false,
        error: {
          code: data.code,
          message: data.error ?? data.message ?? `HTTP ${res.status}`,
        },
      };
    } catch (error) {
      return { ok: false, error };
    }
  }

  const { error } = await supabase.from("space_images").delete().eq("id", id);
  if (error) return { ok: false, error };
  return { ok: true };
}
