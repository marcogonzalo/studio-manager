"use client";

import { useEffect, useRef, useState } from "react";
import { useOnboardingHighlight } from "@/lib/use-onboarding-highlight";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { PageLoading } from "@/components/loaders/page-loading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import {
  Coins,
  FileSpreadsheet,
  Mail,
  Percent,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { toast } from "sonner";
import {
  getErrorMessage,
  reportError,
  CURRENCIES,
  INPUT_CONFIG_STANDARD_CLASS,
} from "@/lib/utils";
import type { Profile } from "@/types";
import {
  publicProfileFormSchema,
  defaultsFormSchema,
  type PublicProfileFormValues,
  type DefaultsFormValues,
} from "./schema";

export default function CustomizationPage() {
  const { user, effectivePlan } = useAuth();
  const isBasePlan = effectivePlan?.plan_code === "BASE";
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const defaultsCardRef = useRef<HTMLDivElement | null>(null);
  const [defaultsHighlight, setDefaultsHighlight] = useState(false);
  useOnboardingHighlight("config", !loading);
  useOnboardingHighlight("public-profile", !loading);

  const formPresupuesto = useForm<PublicProfileFormValues>({
    resolver: zodResolver(publicProfileFormSchema),
    defaultValues: { public_name: "" },
  });

  const formDefaults = useForm<DefaultsFormValues>({
    resolver: zodResolver(defaultsFormSchema),
    defaultValues: { default_tax_rate: "", default_currency: "EUR" },
  });

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      // Fetch profile for full_name and email
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch account settings for customization fields (email = profile.email)
      const { data: settingsData, error: settingsError } = await supabase
        .from("account_settings")
        .select("default_tax_rate, default_currency, public_name")
        .eq("user_id", user.id)
        .single();

      if (settingsError && settingsError.code === "PGRST116") {
        await supabase.from("account_settings").insert({
          user_id: user.id,
          default_tax_rate: null,
          default_currency: "EUR",
          public_name: null,
        });
      } else if (settingsError) {
        throw settingsError;
      }

      formPresupuesto.reset({
        public_name: settingsData?.public_name ?? "",
      });
      formDefaults.reset({
        default_tax_rate:
          settingsData?.default_tax_rate != null
            ? settingsData.default_tax_rate.toString()
            : "",
        default_currency: settingsData?.default_currency ?? "EUR",
      });
    } catch (err) {
      reportError(err, "Error fetching personalization:");
      toast.error("Error al cargar la personalización");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchProfile();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when user?.id changes only
  }, [user?.id]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const { hash } = window.location;
    const fromOnboarding =
      hash === "#onboarding-customization-defaults" ||
      window.sessionStorage.getItem("veta_onboarding_focus") ===
        "customization-defaults";
    if (!fromOnboarding) return;
    window.sessionStorage.removeItem("veta_onboarding_focus");
    const el = defaultsCardRef.current;
    if (!el) return;
    setTimeout(() => {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.focus();
      setDefaultsHighlight(true);
      const timeout = window.setTimeout(
        () => setDefaultsHighlight(false),
        2000
      );
      return () => window.clearTimeout(timeout);
    }, 50);
  }, []);

  async function onSubmitPresupuesto(values: PublicProfileFormValues) {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("account_settings")
        .update({
          public_name: values.public_name?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Presupuesto guardado");
      fetchProfile();
    } catch (e) {
      reportError(e, "Error saving public profile:");
      toast.error("Error al guardar: " + getErrorMessage(e));
    }
  }

  async function onSubmitDefaults(values: DefaultsFormValues) {
    if (!user?.id) return;
    try {
      const taxRate =
        values.default_tax_rate?.trim() !== ""
          ? parseFloat(values.default_tax_rate!)
          : null;
      const validTax = taxRate !== null && !isNaN(taxRate) ? taxRate : null;
      const { error } = await supabase
        .from("account_settings")
        .update({
          default_tax_rate: validTax,
          default_currency: values.default_currency ?? "EUR",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Valores por defecto guardados");
      fetchProfile();
    } catch (e) {
      reportError(e, "Error saving defaults:");
      toast.error("Error al guardar: " + getErrorMessage(e));
    }
  }

  if (loading) {
    return <PageLoading variant="form" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Personalización
        </h1>
        <p className="text-muted-foreground mt-1">
          Valores por defecto para adaptar tu espacio de trabajo
        </p>
      </div>

      <div className="flex flex-col gap-8">
        <Card data-onboarding-target="public-profile">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="text-primary h-5 w-5" />
              <CardTitle>Presupuesto</CardTitle>
            </div>
            <CardDescription>
              Personaliza la apariencia del PDF de presupuestos
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...formPresupuesto}>
              <form
                onSubmit={formPresupuesto.handleSubmit(onSubmitPresupuesto)}
                className="space-y-6"
              >
                <FormField
                  control={formPresupuesto.control}
                  name="public_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nombre público
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Ej. Estudio García Interiorismo"
                          className={INPUT_CONFIG_STANDARD_CLASS}
                          {...field}
                          value={field.value ?? ""}
                          disabled={isBasePlan}
                          onFocus={() => {
                            if (isBasePlan) return;
                            const current = (field.value ?? "").trim();
                            if (!current && profile?.full_name?.trim()) {
                              field.onChange(profile.full_name.trim());
                            }
                          }}
                        />
                      </FormControl>
                      {!isBasePlan && (
                        <p className="text-muted-foreground text-xs">
                          Este nombre aparecerá como &quot;Arquitecto/a&quot; en
                          los PDF de presupuestos
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Mail className="h-4 w-4" />
                    Correo público
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {profile?.email ?? "—"}
                  </p>
                  {!isBasePlan && (
                    <p className="text-muted-foreground text-xs">
                      Se usa el correo de tu perfil en los PDF de presupuestos
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={
                    formPresupuesto.formState.isSubmitting || isBasePlan
                  }
                >
                  {formPresupuesto.formState.isSubmitting
                    ? "Guardando…"
                    : "Guardar cambios"}
                </Button>
                {isBasePlan && (
                  <p className="text-muted-foreground text-xs">
                    Mejora tu plan para poder personalizar tus presupuestos.{" "}
                    <Link href="/pricing" className="font-medium underline">
                      Mejora tu plan
                    </Link>
                  </p>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card
          id="onboarding-customization-defaults"
          ref={defaultsCardRef}
          data-onboarding-target="config"
          tabIndex={-1}
          className={
            defaultsHighlight
              ? "ring-primary/60 ring-offset-background ring-2 ring-offset-2 transition-shadow"
              : "transition-shadow"
          }
        >
          <CardHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="text-primary h-5 w-5" />
              <CardTitle>Valores por defecto</CardTitle>
            </div>
            <CardDescription>
              Se aplicarán al crear nuevos proyectos o productos. Los elementos
              existentes con valores definidos no se modifican.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...formDefaults}>
              <form
                onSubmit={formDefaults.handleSubmit(onSubmitDefaults)}
                className="space-y-6"
              >
                <fieldset className="space-y-3">
                  <legend className="text-muted-foreground text-sm font-medium">
                    Valores sugeridos para nuevos proyectos y productos
                  </legend>
                  <div className="flex flex-wrap gap-4">
                    <FormField
                      control={formDefaults.control}
                      name="default_currency"
                      render={({ field }) => (
                        <FormItem className="w-[125px]">
                          <FormLabel className="flex items-center gap-2">
                            <Coins className="h-4 w-4" />
                            Moneda
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value ?? "EUR"}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 text-sm">
                                <SelectValue placeholder="Moneda" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.entries(CURRENCIES)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([code, label]) => (
                                  <SelectItem key={code} value={code}>
                                    {label}
                                  </SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={formDefaults.control}
                      name="default_tax_rate"
                      render={({ field }) => (
                        <FormItem className="w-[125px]">
                          <FormLabel className="flex items-center gap-2">
                            <Percent className="h-4 w-4" />
                            Impuesto
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="Ej: 21"
                              className="h-9 text-sm"
                              {...field}
                              value={field.value ?? ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <p className="text-muted-foreground text-xs">
                    Se sugieren al crear un proyecto o producto nuevo. También
                    para productos del catálogo sin moneda definida.
                  </p>
                </fieldset>

                <Button
                  type="submit"
                  disabled={formDefaults.formState.isSubmitting}
                >
                  {formDefaults.formState.isSubmitting
                    ? "Guardando…"
                    : "Guardar cambios"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
