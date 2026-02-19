"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Link from "next/link";
import { User, Building2, ChevronDown, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, reportError } from "@/lib/utils";
import type { Profile } from "@/types";

const formSchema = z.object({
  full_name: z.string().optional(),
  company: z.string().optional(),
  public_name: z.string().optional(),
});

const deleteAccountSchema = z.object({
  email: z.string().min(1, "Introduce tu correo electrónico"),
});

type FormValues = z.infer<typeof formSchema>;
type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;

export default function AccountPage() {
  const router = useRouter();
  const { user, effectivePlan, signOut } = useAuth();
  const isBasePlan = effectivePlan?.plan_code === "BASE";
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      company: "",
      public_name: "",
    },
  });

  const deleteForm = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { email: "" },
  });

  async function onDeleteAccount(values: DeleteAccountValues) {
    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        toast.error(data.error ?? "Error al eliminar la cuenta");
        return;
      }
      setDeleteDialogOpen(false);
      deleteForm.reset();
      toast.success("Cuenta eliminada");
      await signOut();
      router.push("/auth");
    } catch (err) {
      reportError(err, "Delete account:");
      toast.error("Error al eliminar la cuenta");
    }
  }

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

      <Collapsible open={dangerZoneOpen} onOpenChange={setDangerZoneOpen}>
        <Card className="border-destructive/50">
          <CollapsibleTrigger asChild>
            <CardHeader className="hover:bg-muted/50 cursor-pointer transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-destructive h-5 w-5" />
                  <CardTitle className="text-destructive">
                    Zona de peligro
                  </CardTitle>
                </div>
                <ChevronDown
                  className={`text-muted-foreground h-5 w-5 transition-transform ${dangerZoneOpen ? "rotate-180" : ""}`}
                />
              </div>
              <CardDescription>
                Acciones irreversibles sobre tu cuenta
              </CardDescription>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="border-destructive/20 border-t pt-6">
              <p className="text-muted-foreground mb-4 text-sm">
                Si eliminas tu cuenta se borrarán de forma permanente todos tus
                datos: perfil, proyectos, clientes, catálogo, imágenes y
                documentos.
              </p>
              <Button
                type="button"
                variant="destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                Eliminar cuenta
              </Button>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          setDeleteDialogOpen(open);
          if (!open) deleteForm.reset();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) =>
            deleteForm.formState.isSubmitting && e.preventDefault()
          }
        >
          <DialogHeader>
            <DialogTitle className="text-destructive">
              Eliminar cuenta
            </DialogTitle>
            <DialogDescription asChild>
              <div className="text-muted-foreground space-y-2 text-sm">
                <p>
                  Si eliminas tu cuenta se borrarán de forma permanente todos
                  tus datos: perfil, proyectos, clientes, catálogo, imágenes y
                  documentos.{" "}
                  <span className="font-semibold">
                    Esta acción no se puede deshacer.
                  </span>
                </p>
                <p>
                  Escribe tu correo electrónico{" "}
                  <span className="text-foreground font-semibold">
                    {profile?.email ?? ""}
                  </span>{" "}
                  para confirmar la eliminación.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          <Form {...deleteForm}>
            <form
              onSubmit={deleteForm.handleSubmit(onDeleteAccount)}
              className="space-y-4"
            >
              <FormField
                control={deleteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        autoComplete="email"
                        disabled={deleteForm.formState.isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={deleteForm.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={deleteForm.formState.isSubmitting}
                >
                  {deleteForm.formState.isSubmitting
                    ? "Eliminando..."
                    : "Eliminar cuenta"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
