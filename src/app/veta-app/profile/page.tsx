"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { User, Building2 } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, reportError } from "@/lib/utils";
import type { Profile } from "@/types";

const formSchema = z.object({
  full_name: z.string().optional(),
  company: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function ProfilePage() {
  const { user, effectivePlan } = useAuth();
  const supabase = getSupabaseClient();
  const [, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      company: "",
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
    return <PageLoading variant="form" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
          Perfil
          {effectivePlan?.plan_code && (
            <span className="bg-muted text-muted-foreground rounded-full px-3 py-1 text-sm font-medium">
              {effectivePlan.plan_code === "BASE"
                ? "Base"
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
          <CardDescription>Nombre y empresa</CardDescription>
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

              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Guardando…" : "Guardar cambios"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
