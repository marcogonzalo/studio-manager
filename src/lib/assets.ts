/**
 * Central registry for stored files (assets table).
 * Create/delete assets and keep owner_table/owner_id in sync with domain asset_id.
 */

import type { SupabaseClient } from "@supabase/supabase-js";

export type AssetKind = "product_image" | "space_image" | "document";

export interface CreateAssetParams {
  userId: string;
  source: "b2" | "external";
  url: string;
  storagePath?: string | null;
  bytes?: number | null;
  mimeType?: string | null;
  kind: AssetKind;
  ownerTable: "products" | "space_images" | "project_documents";
  ownerId: string;
}

/**
 * Inserts an asset row. Caller must use service role or ensure RLS allows insert.
 * Returns the created asset id.
 */
export async function createAsset(
  supabase: SupabaseClient,
  params: CreateAssetParams
): Promise<string> {
  const { data, error } = await supabase
    .from("assets")
    .insert({
      user_id: params.userId,
      source: params.source,
      url: params.url,
      storage_path: params.storagePath ?? null,
      bytes: params.bytes ?? null,
      mime_type: params.mimeType ?? null,
      kind: params.kind,
      owner_table: params.ownerTable,
      owner_id: params.ownerId,
    })
    .select("id")
    .single();

  if (error) throw error;
  if (!data?.id) throw new Error("Asset insert did not return id");
  return data.id;
}

/**
 * Deletes an asset by id. Used when replacing or removing a stored file.
 * Storage usage is updated by DB trigger.
 */
export async function deleteAssetById(
  supabase: SupabaseClient,
  assetId: string
): Promise<void> {
  const { error } = await supabase.from("assets").delete().eq("id", assetId);
  if (error) throw error;
}

/**
 * Finds asset id by owner. Useful to delete/replace when we only have owner_table and owner_id.
 */
export async function getAssetIdByOwner(
  supabase: SupabaseClient,
  ownerTable: CreateAssetParams["ownerTable"],
  ownerId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from("assets")
    .select("id")
    .eq("owner_table", ownerTable)
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw error;
  return data?.id ?? null;
}
