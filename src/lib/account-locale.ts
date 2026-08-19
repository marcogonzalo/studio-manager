import { defaultLocale, type Locale } from "@/i18n/config";
import { isAppLocale } from "@/lib/resolve-locale-from-accept-language";
import { createClient } from "@/lib/supabase/server";

export async function getAccountLocale(): Promise<Locale> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return defaultLocale;

  const { data: settings } = await supabase
    .from("account_settings")
    .select("lang")
    .eq("user_id", user.id)
    .maybeSingle();

  if (isAppLocale(settings?.lang)) return settings.lang;
  return defaultLocale;
}
