import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { isAccountLogoBrandingAvailable } from "@/lib/plan-capability";
import type { PlanConfig } from "@/types";

export async function requireAccountLogoPlan(
  supabase: SupabaseClient,
  userId: string
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const { data, error } = await supabase.rpc("get_effective_plan", {
    p_user_id: userId,
  });
  if (error) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "No se pudo verificar el plan" },
        { status: 500 }
      ),
    };
  }
  const row = Array.isArray(data) ? data[0] : data;
  const config = (row?.config ?? null) as PlanConfig | null;
  if (!isAccountLogoBrandingAvailable(config)) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          code: "PLAN_CAPABILITY_REQUIRED",
          error: "Tu plan no incluye logo de empresa en presupuestos",
        },
        { status: 403 }
      ),
    };
  }
  return { ok: true };
}
