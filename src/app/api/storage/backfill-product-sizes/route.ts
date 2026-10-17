import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isOurB2Url } from "@/lib/backblaze";
import { reportError } from "@/lib/utils";

const HEAD_CONCURRENCY = 5;

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function run(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  }

  const runners = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => run()
  );
  await Promise.all(runners);
  return results;
}

/**
 * Backfill image_size_bytes for products that have image_url but null image_size_bytes.
 * Does a HEAD request to each image URL and updates the product. Then user_storage_usage
 * is updated by the DB trigger on product update.
 */
export async function POST() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: products, error: fetchError } = await supabase
      .from("products")
      .select("id, image_url")
      .eq("user_id", user.id)
      .not("image_url", "is", null)
      .is("image_size_bytes", null);

    if (fetchError) {
      return NextResponse.json(
        { error: "Error al cargar productos" },
        { status: 500 }
      );
    }

    if (!products?.length) {
      return NextResponse.json({ updated: 0 });
    }

    const outcomes = await mapPool(
      products,
      HEAD_CONCURRENCY,
      async (product) => {
        const url = (product.image_url ?? "").trim();
        if (!url) return false;

        if (!isOurB2Url(url)) {
          reportError(
            new Error("Rejected non-B2 image URL for backfill"),
            `[backfill-product-sizes] product=${product.id}`
          );
          return false;
        }

        try {
          const res = await fetch(url, { method: "HEAD" });
          const contentLength = res.headers.get("content-length");
          if (contentLength == null) return false;
          const bytes = parseInt(contentLength, 10);
          if (Number.isNaN(bytes) || bytes < 0) return false;

          const { error: updateError } = await supabase
            .from("products")
            .update({ image_size_bytes: bytes })
            .eq("id", product.id)
            .eq("user_id", user.id);

          if (updateError) {
            reportError(
              updateError,
              `[backfill-product-sizes] update ${product.id}`
            );
            return false;
          }
          return true;
        } catch (err) {
          reportError(err, `[backfill-product-sizes] HEAD ${product.id}`);
          return false;
        }
      }
    );

    const updated = outcomes.filter(Boolean).length;
    return NextResponse.json({ updated });
  } catch (err) {
    reportError(err, "[backfill-product-sizes]");
    const message =
      err instanceof Error
        ? err.message
        : "Error en backfill de almacenamiento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
