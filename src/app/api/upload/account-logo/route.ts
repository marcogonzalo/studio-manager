import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { deleteProductImage, uploadAccountLogo } from "@/lib/backblaze";
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
import { requireAccountLogoPlan } from "./account-logo.utils";

const MAX_LOGO_WIDTH = 600;
const MAX_LOGO_HEIGHT = 200;

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

    const planGate = await requireAccountLogoPlan(supabase, user.id);
    if (!planGate.ok) return planGate.response;

    const { data: settings, error: settingsError } = await supabase
      .from("account_settings")
      .select("public_logo_url, public_logo_asset_id")
      .eq("user_id", user.id)
      .single();

    if (settingsError || !settings) {
      return NextResponse.json(
        { error: "Configuración no encontrada" },
        { status: 404 }
      );
    }

    const logoUrl = settings.public_logo_url?.trim() ?? "";
    if (!logoUrl) {
      return NextResponse.json({ ok: true });
    }

    const serviceRoleKey = getSupabaseServiceRoleKey();
    const admin = serviceRoleKey
      ? createServiceClient(getSupabaseUrl(), serviceRoleKey)
      : null;

    if (admin) {
      const assetId =
        settings.public_logo_asset_id ??
        (await getAssetIdByUrl(admin, logoUrl)) ??
        (await getAssetIdByOwner(admin, "account_settings", user.id));
      if (assetId) await deleteAssetById(admin, assetId);
    }

    const { error: clearError } = await supabase
      .from("account_settings")
      .update({
        public_logo_url: null,
        public_logo_asset_id: null,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (clearError) throw clearError;

    await deleteProductImage(logoUrl);

    return NextResponse.json({ ok: true });
  } catch (err) {
    reportError(err, "[upload/account-logo DELETE]");
    const message =
      err instanceof Error ? err.message : "Error al eliminar el logo";
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

    const planGate = await requireAccountLogoPlan(supabase, user.id);
    if (!planGate.ok) return planGate.response;

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "Falta el archivo" }, { status: 400 });
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
      .resize(MAX_LOGO_WIDTH, MAX_LOGO_HEIGHT, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .png()
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

    const { data: existingSettings } = await supabase
      .from("account_settings")
      .select("public_logo_url, public_logo_asset_id")
      .eq("user_id", user.id)
      .maybeSingle();

    const previousUrl = existingSettings?.public_logo_url?.trim() ?? "";

    const arrayBuffer = new ArrayBuffer(processedBuffer.length);
    new Uint8Array(arrayBuffer).set(processedBuffer);

    const { url, storagePath } = await uploadAccountLogo({
      buffer: arrayBuffer,
      userId: user.id,
    });

    let assetId: string | null = null;
    if (admin) {
      const existingAssetId =
        existingSettings?.public_logo_asset_id ??
        (await getAssetIdByOwner(admin, "account_settings", user.id));
      if (existingAssetId) await deleteAssetById(admin, existingAssetId);
      assetId = await createAsset(admin, {
        userId: user.id,
        source: "b2",
        url,
        storagePath,
        bytes: processedBuffer.length,
        mimeType: "image/png",
        kind: "account_logo",
        ownerTable: "account_settings",
        ownerId: user.id,
      });
    }

    const { error: updateError } = await supabase
      .from("account_settings")
      .update({
        public_logo_url: url,
        public_logo_asset_id: assetId,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    if (previousUrl && previousUrl !== url) {
      try {
        await deleteProductImage(previousUrl);
      } catch (err) {
        reportError(err, "[upload/account-logo] delete previous B2 file");
      }
    }

    return NextResponse.json({
      url,
      fileSizeBytes: processedBuffer.length,
      assetId: assetId ?? undefined,
    });
  } catch (err) {
    reportError(err, "[upload/account-logo POST]");
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
