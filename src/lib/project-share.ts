"use server";

import { randomBytes } from "crypto";
import { createClient } from "@/lib/supabase/server";

/** Token y estado de vista pública del proyecto (columnas en projects). */
export interface ProjectShareLink {
  token: string;
  is_enabled: boolean;
}

function generateToken(): string {
  return randomBytes(24).toString("hex");
}

/** Obtiene token y estado; si el proyecto no tiene token, lo genera y actualiza. */
export async function getOrCreateProjectShareLink(
  projectId: string
): Promise<{ data: ProjectShareLink | null; error: string | null }> {
  const supabase = await createClient();
  const { data: project, error: fetchError } = await supabase
    .from("projects")
    .select("token, is_public_enabled")
    .eq("id", projectId)
    .single();

  if (fetchError || !project)
    return {
      data: null,
      error: fetchError?.message ?? "Proyecto no encontrado",
    };

  if (project.token) {
    return {
      data: {
        token: project.token,
        is_enabled: project.is_public_enabled ?? false,
      },
      error: null,
    };
  }

  const token = generateToken();
  const { data: updated, error: updateError } = await supabase
    .from("projects")
    .update({ token })
    .eq("id", projectId)
    .select("token, is_public_enabled")
    .single();

  if (updateError) return { data: null, error: updateError.message };
  return {
    data: {
      token: updated.token,
      is_enabled: updated.is_public_enabled ?? false,
    },
    error: null,
  };
}

/** Regenera el token del proyecto (invalida el enlace anterior). */
export async function regenerateProjectShareToken(
  projectId: string
): Promise<{ data: ProjectShareLink | null; error: string | null }> {
  const supabase = await createClient();
  const token = generateToken();
  const { data, error } = await supabase
    .from("projects")
    .update({ token })
    .eq("id", projectId)
    .select("token, is_public_enabled")
    .single();

  if (error) return { data: null, error: error.message };
  return {
    data: { token: data.token, is_enabled: data.is_public_enabled ?? false },
    error: null,
  };
}

/** Activa o desactiva la vista pública del proyecto. */
export async function setProjectShareEnabled(
  projectId: string,
  isEnabled: boolean
): Promise<{ data: ProjectShareLink | null; error: string | null }> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ is_public_enabled: isEnabled })
    .eq("id", projectId)
    .select("token, is_public_enabled")
    .single();

  if (error) return { data: null, error: error.message };
  return {
    data: {
      token: data.token ?? "",
      is_enabled: data.is_public_enabled ?? false,
    },
    error: null,
  };
}
