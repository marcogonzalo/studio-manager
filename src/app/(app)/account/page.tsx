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
import { User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, reportError } from "@/lib/utils";
import type { Profile } from "@/types";

const formSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  company: z.string().optional(),
  public_name: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function AccountPage() {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
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
        first_name: data?.first_name ?? "",
        last_name: data?.last_name ?? "",
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
  }, [user?.id]);

  async function onSubmit(values: FormValues) {
    if (!user?.id) return;
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: values.first_name?.trim() || null,
          last_name: values.last_name?.trim() || null,
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
        <h1 className="text-foreground text-3xl font-bold tracking-tight">
          Mi Cuenta
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
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="first_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
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
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tu apellido"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        onFocus={() => {
                          const current = (field.value ?? "").trim();
                          if (!current) {
                            const first =
                              form.getValues("first_name")?.trim() ?? "";
                            const last =
                              form.getValues("last_name")?.trim() ?? "";
                            const suggested = [first, last]
                              .filter(Boolean)
                              .join(" ");
                            if (suggested) field.onChange(suggested);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-muted-foreground text-xs">
                      Este nombre aparecerá como &quot;Arquitecto/a&quot; en los
                      PDF de presupuestos
                    </p>
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
