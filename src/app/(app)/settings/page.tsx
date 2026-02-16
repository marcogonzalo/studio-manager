"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
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
import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, reportError, CURRENCIES } from "@/lib/utils";
import type { Profile } from "@/types";

const formSchema = z.object({
  default_tax_rate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "Debe ser mayor o igual a 0"),
  default_currency: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function SettingsPage() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      default_tax_rate: "",
      default_currency: "EUR",
    },
  });

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("default_tax_rate, default_currency")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      form.reset({
        default_tax_rate:
          data?.default_tax_rate != null
            ? data.default_tax_rate.toString()
            : "",
        default_currency: data?.default_currency ?? "EUR",
      });
    } catch (err) {
      reportError(err, "Error fetching settings:");
      toast.error("Error al cargar la configuración");
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

      const { error } = await supabase
        .from("profiles")
        .update({
          default_tax_rate: validTax,
          default_currency: values.default_currency ?? "EUR",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Configuración guardada");
      fetchProfile();
    } catch (err) {
      reportError(err, "Error saving settings:");
      toast.error("Error al guardar: " + getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground animate-pulse">
          Cargando configuración...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Configuración
        </h1>
        <p className="text-muted-foreground mt-1">
          Valores por defecto para nuevos proyectos y productos
        </p>
      </div>

      <Card>
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
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar configuración"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
