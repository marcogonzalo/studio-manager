import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import sharp from "sharp";
import { uploadProductImage } from "@/lib/backblaze";
import { validateImageFile } from "@/lib/image-validation";
import { getSupabaseUrl, getSupabaseServerKey } from "@/lib/supabase/keys";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1200;

export async function DELETE(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("url");

    if (!imageUrl?.trim()) {
      return NextResponse.json(
        { error: "Falta el parámetro url" },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Verify that the image belongs to the user
    // Check if image exists in products table and belongs to user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, user_id")
      .eq("image_url", imageUrl.trim())
      .single();

    if (productError || !product) {
      // Also check space_images for space images
      const { data: spaceImage, error: spaceImageError } = await supabase
        .from("space_images")
        .select("id, space_id")
        .eq("image_url", imageUrl.trim())
        .single();

      if (spaceImageError || !spaceImage) {
        return NextResponse.json(
          { error: "Imagen no encontrada" },
          { status: 404 }
        );
      }

      // Get space and project owner to verify ownership
      const { data: space, error: spaceError } = await supabase
        .from("spaces")
        .select("project_id")
        .eq("id", spaceImage.space_id)
        .single();

      if (spaceError || !space) {
        return NextResponse.json(
          { error: "Espacio no encontrado" },
          { status: 404 }
        );
      }

      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("user_id")
        .eq("id", space.project_id)
        .single();

      if (projectError || !project || project.user_id !== user.id) {
        return NextResponse.json(
          { error: "No autorizado para eliminar esta imagen" },
          { status: 403 }
        );
      }
    } else {
      // Verify ownership for product image
      if (product.user_id !== user.id) {
        return NextResponse.json(
          { error: "No autorizado para eliminar esta imagen" },
          { status: 403 }
        );
      }
    }

    const { deleteProductImage } = await import("@/lib/backblaze");
    await deleteProductImage(imageUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function POST(request: Request) {
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

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string | null;
    const projectId = (formData.get("projectId") as string | null) || undefined;

    if (!file || !productId?.trim()) {
      return NextResponse.json(
        { error: "Faltan archivo o productId" },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Upload only when product exists (image is uploaded after product creation)
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, user_id")
      .eq("id", productId.trim())
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: "Producto no encontrado" },
        { status: 404 }
      );
    }

    if (product.user_id !== user.id) {
      return NextResponse.json(
        { error: "No autorizado para subir imágenes a este producto" },
        { status: 403 }
      );
    }

    // ✅ SECURITY: If projectId is provided, verify ownership
    if (projectId?.trim()) {
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .select("id, user_id")
        .eq("id", projectId.trim())
        .single();

      if (projectError || !project) {
        return NextResponse.json(
          { error: "Proyecto no encontrado" },
          { status: 404 }
        );
      }

      if (project.user_id !== user.id) {
        return NextResponse.json(
          { error: "No autorizado para asociar imágenes a este proyecto" },
          { status: 403 }
        );
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "El archivo no puede superar 5MB" },
        { status: 400 }
      );
    }

    const validation = validateImageFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const processedBuffer = await sharp(inputBuffer)
      .resize(MAX_DIMENSION, MAX_DIMENSION, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 100 })
      .toBuffer();

    const arrayBuffer = new ArrayBuffer(processedBuffer.length);
    new Uint8Array(arrayBuffer).set(processedBuffer);

    const url = await uploadProductImage({
      buffer: arrayBuffer,
      mimeType: "image/webp",
      userId: user.id,
      productId: productId.trim(),
      projectId: projectId?.trim() || undefined,
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al subir la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
