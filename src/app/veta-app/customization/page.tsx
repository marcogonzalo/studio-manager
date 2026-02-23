"use client";

import { useEffect, useState } from "react";
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
import { FileSpreadsheet, SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, reportError, CURRENCIES } from "@/lib/utils";
import type { Profile } from "@/types";
import {
  customizationFormSchema,
  type CustomizationFormValues,
} from "./schema";

type FormValues = CustomizationFormValues;

export default function CustomizationPage() {
  const { user, effectivePlan } = useAuth();
  const isBasePlan = effectivePlan?.plan_code === "BASE";
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(customizationFormSchema),
    defaultValues: {
      default_tax_rate: "",
      default_currency: "EUR",
      public_name: "",
      email: "",
    },
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

      // Fetch account settings for customization fields
      const { data: settingsData, error: settingsError } = await supabase
        .from("account_settings")
        .select("default_tax_rate, default_currency, public_name")
        .eq("user_id", user.id)
        .single();

      // If no settings exist yet, create them
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

      form.reset({
        default_tax_rate:
          settingsData?.default_tax_rate != null
            ? settingsData.default_tax_rate.toString()
            : "",
        default_currency: settingsData?.default_currency ?? "EUR",
        public_name: settingsData?.public_name ?? "",
        email: profileData?.email ?? "",
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

  async function onSubmit(values: FormValues) {
    if (!user?.id) return;
    try {
      const taxRate =
        values.default_tax_rate?.trim() !== ""
          ? parseFloat(values.default_tax_rate!)
          : null;
      const validTax = taxRate !== null && !isNaN(taxRate) ? taxRate : null;

      // Update account_settings
      const { error: settingsError } = await supabase
        .from("account_settings")
        .upsert({
          user_id: user.id,
          default_tax_rate: validTax,
          default_currency: values.default_currency ?? "EUR",
          public_name: values.public_name?.trim() || null,
          updated_at: new Date().toISOString(),
        });

      if (settingsError) throw settingsError;

      // Update email in profiles if changed
      if (values.email?.trim() !== profile?.email) {
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            email: values.email?.trim() || null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (profileError) throw profileError;
      }

      toast.success("Personalización guardada");
      fetchProfile();
    } catch (err) {
      reportError(err, "Error saving personalization:");
      toast.error("Error al guardar: " + getErrorMessage(err));
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

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col gap-8"
        >
          <Card>
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
              <FormField
                control={form.control}
                name="public_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre público</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Estudio García Interiorismo"
                        className="h-9 text-sm"
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
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="correo@ejemplo.com"
                        className="h-9 text-sm"
                        autoComplete="email"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isBasePlan}
                      />
                    </FormControl>
                    {!isBasePlan && (
                      <p className="text-muted-foreground text-xs">
                        Se mostrará en los PDF de presupuestos
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || isBasePlan}
              >
                {form.formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
              {isBasePlan && (
                <p className="text-muted-foreground text-xs">
                  Mejora tu plan para poder personalizar tus presupuestos.{" "}
                  <Link href="/pricing" className="font-medium underline">
                    Mejora tu plan
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="text-primary h-5 w-5" />
                <CardTitle>Valores por defecto</CardTitle>
              </div>
              <CardDescription>
                Se aplicarán al crear nuevos proyectos o productos. Los
                elementos existentes con valores definidos no se modifican.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <fieldset className="space-y-3">
                <legend className="text-muted-foreground text-sm font-medium">
                  Valores sugeridos para nuevos proyectos y productos
                </legend>
                <div className="flex flex-wrap gap-4">
                  <FormField
                    control={form.control}
                    name="default_currency"
                    render={({ field }) => (
                      <FormItem className="w-[125px]">
                        <FormLabel>Moneda</FormLabel>
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
                    control={form.control}
                    name="default_tax_rate"
                    render={({ field }) => (
                      <FormItem className="w-[125px]">
                        <FormLabel>Impuesto (%)</FormLabel>
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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
