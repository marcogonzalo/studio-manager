import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import sharp from "sharp";
import { uploadSpaceImage } from "@/lib/backblaze";
import { validateImageFile } from "@/lib/image-validation";
import { getSupabaseUrl, getSupabaseServerKey } from "@/lib/supabase/keys";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DIMENSION = 1200;

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
    const projectId = formData.get("projectId") as string | null;
    const spaceId = formData.get("spaceId") as string | null;
    const imageId = formData.get("imageId") as string | null;

    if (!file || !projectId?.trim() || !spaceId?.trim() || !imageId?.trim()) {
      return NextResponse.json(
        { error: "Faltan archivo, projectId, spaceId o imageId" },
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

    const url = await uploadSpaceImage({
      buffer: arrayBuffer,
      mimeType: "image/webp",
      userId: user.id,
      projectId: projectId.trim(),
      spaceId: spaceId.trim(),
      imageId: imageId.trim(),
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al subir la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
