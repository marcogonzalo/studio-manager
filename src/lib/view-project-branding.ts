import { createClient } from "@/lib/supabase/server";

export type ViewProjectBranding = {
  accountBranding: boolean;
  brandLogoUrl?: string;
  brandName?: string;
};

type ShareRow = {
  brand_logo_url?: string | null;
  brand_name?: string | null;
  account_branding?: boolean | null;
};

/**
 * Load plan-gated header branding for a public share token.
 * Relies on get_project_share_by_token which nulls brand fields on Base.
 */
export async function loadViewProjectBranding(
  token: string
): Promise<ViewProjectBranding> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_project_share_by_token", {
    share_token: token,
  });

  if (error || !data?.length) {
    return { accountBranding: false };
  }

  const row = data[0] as ShareRow;
  const accountBranding = row.account_branding === true;
  if (!accountBranding) {
    return { accountBranding: false };
  }

  return {
    accountBranding: true,
    brandLogoUrl: row.brand_logo_url?.trim() || undefined,
    brandName: row.brand_name?.trim() || undefined,
  };
}
