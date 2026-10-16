import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { uploadProductImage } from "@/lib/backblaze";
import {
  createAsset,
  deleteAssetById,
  getAssetIdByOwner,
  getAssetIdByUrl,
} from "@/lib/assets";
import { MAX_IMAGE_FILE_SIZE, validateImageFile } from "@/lib/image-validation";
import { checkStorageLimit } from "@/lib/storage-limit";
import { buildStorageLimitErrorBody } from "@/lib/plan-limit-ux";
import {
  getAppUiCopy,
  interpolateAppCopy,
  localeFromRequest,
} from "@/lib/app-ui-copy";
import { checkRateLimit, getRateLimitMessage } from "@/lib/rate-limit";
import { humanizeUploadError } from "@/lib/upload-user-error";
import { getSupabaseUrl, getSupabaseServiceRoleKey } from "@/lib/supabase/keys";
import { createClient } from "@/lib/supabase/server";
import { isDemoAccountEmail, reportError } from "@/lib/utils";

const MAX_DIMENSION = 1200;

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { allowed, resetAt } = checkRateLimit(`user:${user.id}`, "upload");
    if (!allowed) {
      return NextResponse.json(
        { error: getRateLimitMessage(localeFromRequest(request)) },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
            ),
          },
        }
      );
    }

    if (isDemoAccountEmail(user.email)) {
      return NextResponse.json(
        {
          code: "DEMO_ACCOUNT_READ_ONLY",
          message: "Las acciones están limitadas en la cuenta de demostración.",
        },
        { status: 403 }
      );
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

    let spaceImageId: string | null = null;

    if (productError || !product) {
      // Also check space_images for space images
      const { data: spaceImage, error: spaceImageError } = await supabase
        .from("space_images")
        .select("id, space_id")
        .eq("url", imageUrl.trim())
        .single();

      if (spaceImageError || !spaceImage) {
        return NextResponse.json(
          { error: "Imagen no encontrada" },
          { status: 404 }
        );
      }
      spaceImageId = spaceImage.id;

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
    const serviceRoleKey = getSupabaseServiceRoleKey();
    const admin = serviceRoleKey
      ? createServiceClient(getSupabaseUrl(), serviceRoleKey)
      : null;

    if (product && !productError) {
      if (admin) {
        const assetId = await getAssetIdByUrl(admin, imageUrl.trim());
        if (assetId) await deleteAssetById(admin, assetId);
      }
      await supabase
        .from("products")
        .update({ image_url: null, image_size_bytes: null, asset_id: null })
        .eq("id", product.id);
    } else if (spaceImageId) {
      if (admin) {
        const assetId = await getAssetIdByUrl(admin, imageUrl.trim());
        if (assetId) await deleteAssetById(admin, assetId);
      }
      await supabase.from("space_images").delete().eq("id", spaceImageId);
    }

    await deleteProductImage(imageUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar la imagen";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { allowed, resetAt } = checkRateLimit(`user:${user.id}`, "upload");
    if (!allowed) {
      return NextResponse.json(
        { error: getRateLimitMessage(localeFromRequest(request)) },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.max(1, Math.ceil((resetAt - Date.now()) / 1000))
            ),
          },
        }
      );
    }

    if (isDemoAccountEmail(user.email)) {
      return NextResponse.json(
        {
          code: "DEMO_ACCOUNT_READ_ONLY",
          message: "Las acciones están limitadas en la cuenta de demostración.",
        },
        { status: 403 }
      );
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

    const lang = localeFromRequest(request);
    if (file.size > MAX_IMAGE_FILE_SIZE) {
      return NextResponse.json(
        {
          error: interpolateAppCopy(
            getAppUiCopy(lang).validation.fileTooLarge5mb,
            { fileName: file.name }
          ),
        },
        { status: 400 }
      );
    }

    const validation = validateImageFile(file, lang);
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
      ? createServiceClient(getSupabaseUrl(), serviceRoleKey)
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
        buildStorageLimitErrorBody(storage.currentUsed, storage.limitMb),
        { status: 413 }
      );
    }

    const arrayBuffer = new ArrayBuffer(processedBuffer.length);
    new Uint8Array(arrayBuffer).set(processedBuffer);

    const { url, storagePath } = await uploadProductImage({
      buffer: arrayBuffer,
      mimeType: "image/webp",
      userId: user.id,
      productId: productId.trim(),
      projectId: projectId?.trim() || undefined,
    });

    let assetId: string | null = null;
    if (admin) {
      const existingAssetId = await getAssetIdByOwner(
        admin,
        "products",
        productId.trim()
      );
      if (existingAssetId) await deleteAssetById(admin, existingAssetId);
      assetId = await createAsset(admin, {
        userId: user.id,
        source: "b2",
        url,
        storagePath,
        bytes: processedBuffer.length,
        mimeType: "image/webp",
        kind: "product_image",
        ownerTable: "products",
        ownerId: productId.trim(),
      });
    }

    return NextResponse.json({
      url,
      fileSizeBytes: processedBuffer.length,
      assetId: assetId ?? undefined,
    });
  } catch (err) {
    reportError(err, "[upload/product-image]");
    const lang = localeFromRequest(request);
    const raw = err instanceof Error ? err.message : null;
    const message = humanizeUploadError(raw, lang);
    const transient = message === getAppUiCopy(lang).errors.uploadTransient;
    return NextResponse.json(
      { error: message },
      { status: transient ? 503 : 500 }
    );
  }
}
