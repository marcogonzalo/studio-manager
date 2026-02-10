import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { uploadDocument, deleteProductImage } from "@/lib/backblaze";
import {
  validateDocumentFile,
  getExtensionFromMime,
  getExtensionFromFileName,
} from "@/lib/document-validation";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
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

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error:
            "No se pueden subir archivos de más de 10Mb. Si lo tienes en Drive, OneDrive o iCloud, añádelo como URL.",
        },
        { status: 400 }
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

    const url = await uploadDocument({
      buffer: arrayBuffer,
      mimeType: file.type,
      userId: user.id,
      projectId: projectId.trim(),
      documentId: documentId.trim(),
      extension: ext,
    });

    return NextResponse.json({ url });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Error al subir el documento";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
