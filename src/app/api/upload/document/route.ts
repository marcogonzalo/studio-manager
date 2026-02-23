import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { uploadDocument, deleteProductImage } from "@/lib/backblaze";
import { createAsset, deleteAssetById, getAssetIdByOwner } from "@/lib/assets";
import {
  validateDocumentFile,
  getExtensionFromMime,
  getExtensionFromFileName,
} from "@/lib/document-validation";
import { checkStorageLimit } from "@/lib/storage-limit";
import {
  getSupabaseUrl,
  getSupabaseServerKey,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/keys";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

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
    const url = searchParams.get("url");

    if (!url?.trim()) {
      return NextResponse.json(
        { error: "Falta el parámetro url" },
        { status: 400 }
      );
    }

    // ✅ SECURITY: Verify that the document belongs to the user
    // Check if document exists in project_documents and belongs to user's project
    const { data: document, error: docError } = await supabase
      .from("project_documents")
      .select("id, project_id, projects!inner(user_id)")
      .eq("file_url", url.trim())
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: "Documento no encontrado" },
        { status: 404 }
      );
    }

    // Get project owner to verify ownership
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("user_id")
      .eq("id", document.project_id)
      .single();

    if (projectError || !project || project.user_id !== user.id) {
      return NextResponse.json(
        { error: "No autorizado para eliminar este documento" },
        { status: 403 }
      );
    }

    const serviceRoleKey = getSupabaseServiceRoleKey();
    const admin = serviceRoleKey
      ? createClient(supabaseUrl, serviceRoleKey)
      : null;
    if (admin) {
      const assetId = await getAssetIdByOwner(
        admin,
        "project_documents",
        document.id
      );
      if (assetId) await deleteAssetById(admin, assetId);
    }

    await deleteProductImage(url);

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al eliminar el documento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
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
    const documentId = formData.get("documentId") as string | null;
    const projectId = formData.get("projectId") as string | null;

    if (!file || !documentId?.trim() || !projectId?.trim()) {
      return NextResponse.json(
        { error: "Faltan archivo, documentId o projectId" },
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
        { error: "No autorizado para subir documentos a este proyecto" },
        { status: 403 }
      );
    }

    // No subir antes de tener registro en BD: evita contenido huérfano en B2
    const { data: docRow, error: docError } = await supabase
      .from("project_documents")
      .select("id")
      .eq("id", documentId.trim())
      .eq("project_id", projectId.trim())
      .single();

    if (docError || !docRow) {
      return NextResponse.json(
        {
          error:
            "El documento debe crearse antes de subir el archivo. Guarda el documento primero.",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "No se pueden subir archivos de más de 10Mb. Si lo tienes en Drive, OneDrive o iCloud, añádelo como URL.",
        },
        { status: 400 }
      );
    }

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
      file.size,
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

    const validation = validateDocumentFile(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const ext =
      getExtensionFromMime(file.type) ||
      getExtensionFromFileName(file.name) ||
      ".bin";

    const inputBuffer = Buffer.from(await file.arrayBuffer());
    const arrayBuffer = inputBuffer.buffer.slice(
      inputBuffer.byteOffset,
      inputBuffer.byteOffset + inputBuffer.byteLength
    );

    const { url, storagePath } = await uploadDocument({
      buffer: arrayBuffer,
      mimeType: file.type,
      userId: user.id,
      projectId: projectId.trim(),
      documentId: documentId.trim(),
      extension: ext,
    });

    let assetId: string | null = null;
    if (admin) {
      const existingAssetId = await getAssetIdByOwner(
        admin,
        "project_documents",
        documentId.trim()
      );
      if (existingAssetId) await deleteAssetById(admin, existingAssetId);
      assetId = await createAsset(admin, {
        userId: user.id,
        source: "b2",
        url,
        storagePath,
        bytes: file.size,
        mimeType: file.type,
        kind: "document",
        ownerTable: "project_documents",
        ownerId: documentId.trim(),
      });
    }

    return NextResponse.json({
      url,
      fileSizeBytes: file.size,
      assetId: assetId ?? undefined,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al subir el documento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
