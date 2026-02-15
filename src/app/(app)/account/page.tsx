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
import Link from "next/link";
import { User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, reportError } from "@/lib/utils";
import type { Profile } from "@/types";

const formSchema = z.object({
  full_name: z.string().optional(),
  company: z.string().optional(),
  public_name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccountPage() {
  const { user, effectivePlan } = useAuth();
  const isBasePlan = effectivePlan?.plan_code === "BASE";
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      company: "",
      public_name: "",
    },
  });

  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
      form.reset({
        full_name: data?.full_name ?? "",
        company: data?.company ?? "",
        public_name: data?.public_name ?? "",
      });
    } catch (err) {
      reportError(err, "Error fetching profile:");
      toast.error("Error al cargar el perfil");
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
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: values.full_name?.trim() || null,
          company: values.company?.trim() || null,
          public_name: values.public_name?.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Perfil actualizado correctamente");
      fetchProfile();
    } catch (err) {
      reportError(err, "Error updating profile:");
      toast.error("Error al guardar: " + getErrorMessage(err));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground animate-pulse">
          Cargando perfil...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
          Mi Cuenta
          {effectivePlan?.plan_code && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
              {effectivePlan.plan_code === "BASE"
                ? "Prueba"
                : effectivePlan.plan_code === "PRO"
                  ? "Pro"
                  : "Studio"}
            </span>
          )}
        </h1>
        <p className="text-muted-foreground mt-1">
          Gestiona tu perfil y la información que aparece en los presupuestos
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="text-primary h-5 w-5" />
            <CardTitle>Mi perfil</CardTitle>
          </div>
          <CardDescription>
            Nombre, empresa y nombre público (visible en presupuestos)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="max-w-xl space-y-6"
            >
              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Tu nombre"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Empresa
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre de tu empresa o estudio"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="public_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre público (en presupuestos)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej. Estudio García Interiorismo"
                        {...field}
                        value={field.value ?? ""}
                        disabled={isBasePlan}
                        onFocus={() => {
                          if (isBasePlan) return;
                          const current = (field.value ?? "").trim();
                          if (!current) {
                            const suggested =
                              form.getValues("full_name")?.trim() ?? "";
                            if (suggested) field.onChange(suggested);
                          }
                        }}
                      />
                    </FormControl>
                    {isBasePlan && (
                      <p className="text-muted-foreground text-xs">
                        Mejora tu plan para poder personalizar tus presupuestos.{" "}
                        <Link href="/pricing" className="font-medium underline">
                          Mejora tu plan
                        </Link>
                      </p>
                    )}
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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Guardando..."
                  : "Guardar cambios"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {profile?.email && (
        <Card>
          <CardHeader>
            <CardTitle>Email</CardTitle>
            <CardDescription>
              Correo electrónico de la cuenta (no editable desde aquí)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">{profile.email}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
