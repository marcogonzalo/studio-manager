import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import sharp from "sharp";
import { uploadSpaceImage } from "@/lib/backblaze";
import { createAsset, getAssetIdByOwner } from "@/lib/assets";
import { validateImageFile } from "@/lib/image-validation";
import { checkStorageLimit } from "@/lib/storage-limit";
import {
  getSupabaseUrl,
  getSupabaseServerKey,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/keys";

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

    // ✅ SECURITY: Verify that the project belongs to the user
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
        { error: "No autorizado para subir imágenes a este proyecto" },
        { status: 403 }
      );
    }

    // ✅ SECURITY: Verify that the space belongs to the project
    const { data: space, error: spaceError } = await supabase
      .from("spaces")
      .select("id, project_id")
      .eq("id", spaceId.trim())
      .single();

    if (spaceError || !space || space.project_id !== projectId.trim()) {
      return NextResponse.json(
        { error: "Espacio no encontrado o no pertenece al proyecto" },
        { status: 404 }
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

    let currentUsedOverride: number | undefined;
    const serviceRoleKey = getSupabaseServiceRoleKey();
    const admin = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : null;
    if (admin) {
      const { data: usageRow } = await admin
        .from("user_storage_usage")
        .select("bytes_used")
        .eq("user_id", user.id)
        .single();
      currentUsedOverride = Number(usageRow?.bytes_used ?? 0);
    }
    const storage = await checkStorageLimit(
      supabase,
      user.id,
      processedBuffer.length,
      currentUsedOverride
    );
    if (!storage.allowed) {
      return NextResponse.json(
        {
          error: `Límite de almacenamiento alcanzado (${Math.round(storage.currentUsed / 1024 / 1024)} MB / ${storage.limitMb} MB). Mejora tu plan para que puedas subir más archivos.`,
        },
        { status: 413 }
      );
    }

    const arrayBuffer = new ArrayBuffer(processedBuffer.length);
    new Uint8Array(arrayBuffer).set(processedBuffer);

    const { url, storagePath } = await uploadSpaceImage({
      buffer: arrayBuffer,
      mimeType: "image/webp",
      userId: user.id,
      projectId: projectId.trim(),
      spaceId: spaceId.trim(),
      imageId: imageId.trim(),
    });

    let assetId: string | null = null;
    if (admin) {
      const { deleteAssetById } = await import("@/lib/assets");
      const existingAssetId = await getAssetIdByOwner(
        admin,
        "space_images",
        imageId.trim()
      );
      if (existingAssetId) await deleteAssetById(admin, existingAssetId);
      assetId = await createAsset(admin, {
        userId: user.id,
        source: "b2",
        url,
        storagePath,
        bytes: processedBuffer.length,
        mimeType: "image/webp",
        kind: "space_image",
        ownerTable: "space_images",
        ownerId: imageId.trim(),
      });
    }

    return NextResponse.json({
      url,
      fileSizeBytes: processedBuffer.length,
      assetId: assetId ?? undefined,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al subir la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
