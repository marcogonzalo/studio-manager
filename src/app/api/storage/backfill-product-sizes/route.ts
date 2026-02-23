import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { getSupabaseUrl, getSupabaseServerKey } from "@/lib/supabase/keys";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * Backfill image_size_bytes for products that have image_url but null image_size_bytes.
 * Does a HEAD request to each image URL and updates the product. Then user_storage_usage
 * is updated by the DB trigger on product update.
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = getSupabaseUrl();
    const supabaseServerKey = getSupabaseServerKey();

    const supabase = createServerClient(supabaseUrl, supabaseServerKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) =>
            cookieStore.set(name, value)
          );
        },
      },
    });

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

    let updated = 0;
    for (const product of products) {
      const url = (product.image_url ?? "").trim();
      if (!url) continue;
      try {
        const res = await fetch(url, { method: "HEAD" });
        const contentLength = res.headers.get("content-length");
        if (contentLength != null) {
          const bytes = parseInt(contentLength, 10);
          if (!Number.isNaN(bytes) && bytes >= 0) {
            const { error: updateError } = await supabase
              .from("products")
              .update({ image_size_bytes: bytes })
              .eq("id", product.id)
              .eq("user_id", user.id);
            if (!updateError) updated += 1;
          }
        }
      } catch {
        // Skip this product if HEAD fails (CORS, network, etc.)
      }
    }

    return NextResponse.json({ updated });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Error en backfill de almacenamiento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
