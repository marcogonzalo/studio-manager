import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import type { CookieOptions } from "@supabase/ssr";
import { deleteAllFilesForUser } from "@/lib/backblaze";
import {
  getSupabaseUrl,
  getSupabaseServerKey,
  getSupabaseServiceRoleKey,
} from "@/lib/supabase/keys";

interface CookieToSet {
  name: string;
  value: string;
  options?: CookieOptions;
}

/**
 * DELETE account: requires body { email } matching current user.
 * Cascades: DB data (payments, orders, projects, clients, suppliers, products, plan_assignments, profile), B2 files, then auth user.
 * Does not delete plans (plan definitions).
 */
export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = getSupabaseUrl();
    const serverKey = getSupabaseServerKey();

    const supabase = createServerClient(supabaseUrl, serverKey, {
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

    let body: { email?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Cuerpo inválido" }, { status: 400 });
    }

    const confirmedEmail = (body.email ?? "").trim().toLowerCase();
    const userEmail = (user.email ?? "").trim().toLowerCase();
    if (confirmedEmail !== userEmail) {
      return NextResponse.json(
        { error: "El correo no coincide con el de la cuenta" },
        { status: 400 }
      );
    }

    const serviceRoleKey = getSupabaseServiceRoleKey();
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Operación no disponible" },
        { status: 503 }
      );
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const userId = user.id;

    // Delete in order to respect FKs. Plans table is not touched.
    const { data: projectIds } = await admin
      .from("projects")
      .select("id")
      .eq("user_id", userId);
    const ids = (projectIds ?? []).map((p) => p.id);

    await admin.from("payments").delete().eq("user_id", userId);
    await admin.from("purchase_orders").delete().eq("user_id", userId);
    if (ids.length > 0) {
      await admin.from("project_documents").delete().in("project_id", ids);
      await admin.from("project_items").delete().in("project_id", ids);
      await admin
        .from("additional_project_costs")
        .delete()
        .eq("user_id", userId);
      const { data: spaceRows } = await admin
        .from("spaces")
        .select("id")
        .in("project_id", ids);
      const spaceIds = (spaceRows ?? []).map((s) => s.id);
      if (spaceIds.length > 0) {
        await admin.from("space_images").delete().in("space_id", spaceIds);
      }
      await admin.from("spaces").delete().in("project_id", ids);
    }
    await admin.from("project_notes").delete().eq("user_id", userId);
    await admin.from("projects").delete().eq("user_id", userId);
    await admin.from("clients").delete().eq("user_id", userId);
    await admin.from("suppliers").delete().eq("user_id", userId);
    await admin.from("products").delete().eq("user_id", userId);
    await admin.from("plan_assignments").delete().eq("user_id", userId);
    await admin.from("profiles").delete().eq("id", userId);

    try {
      await deleteAllFilesForUser(userId);
    } catch (b2Err) {
      // Log but continue; account is already wiped in DB
      console.error("B2 deleteAllFilesForUser error:", b2Err);
    }

    const { error: deleteUserError } =
      await admin.auth.admin.deleteUser(userId);
    if (deleteUserError) {
      console.error("auth.admin.deleteUser error:", deleteUserError);
      return NextResponse.json(
        { error: "No se pudo eliminar la sesión de autenticación" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Account delete error:", err);
    const message =
      err instanceof Error ? err.message : "Error al eliminar la cuenta";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
