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
