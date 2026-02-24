"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { AlertTriangle, Mail } from "lucide-react";
import { toast } from "sonner";
import { getErrorMessage, reportError } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const deleteAccountSchema = z.object({
  email: z.string().min(1, "Introduce tu correo electrónico"),
});

const changeEmailSchema = z.object({
  new_email: z
    .string()
    .min(1, "Introduce el nuevo correo")
    .email("Correo no válido"),
});

type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

export default function SettingsAccountPage() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const supabase = getSupabaseClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [changeEmailDialogOpen, setChangeEmailDialogOpen] = useState(false);
  const [dangerZoneOpen, setDangerZoneOpen] = useState(false);

  const deleteForm = useForm<DeleteAccountValues>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { email: "" },
  });

  const changeEmailForm = useForm<ChangeEmailValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { new_email: "" },
  });

  async function onChangeEmail(values: ChangeEmailValues) {
    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/sign-in?email_updated=1`
          : undefined;
      const { error } = await supabase.auth.updateUser(
        { email: values.new_email.trim().toLowerCase() },
        redirectTo ? { emailRedirectTo: redirectTo } : undefined
      );
      if (error) throw error;
      setChangeEmailDialogOpen(false);
      changeEmailForm.reset();
      toast.success(
        "Revisa tu nuevo correo y haz clic en el enlace para confirmar el cambio."
      );
    } catch (err) {
      reportError(err, "Change email:");
      toast.error("Error al cambiar el correo: " + getErrorMessage(err));
    }
  }

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
      router.push("/sign-in");
    } catch (err) {
      reportError(err, "Delete account:");
      toast.error("Error al eliminar la cuenta");
    }
  }

  if (!user) {
    return <PageLoading variant="form" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-foreground flex flex-wrap items-center gap-2 text-3xl font-bold tracking-tight">
          Cuenta
        </h1>
        <p className="text-muted-foreground mt-1">
          Correo de acceso y acciones sobre tu cuenta
        </p>
      </div>

      {user?.email && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="text-primary h-5 w-5" />
              <CardTitle>Email</CardTitle>
            </div>
            <CardDescription>
              Correo electrónico de la cuenta. Con este correo inicias sesión.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-muted-foreground text-sm">{user.email}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setChangeEmailDialogOpen(true)}
                className="shrink-0 gap-2"
              >
                <Mail className="h-4 w-4" />
                Cambiar correo electrónico
              </Button>
            </div>
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
                    {user?.email ?? ""}
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
                    ? "Eliminando…"
                    : "Eliminar cuenta"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={changeEmailDialogOpen}
        onOpenChange={(open) => {
          setChangeEmailDialogOpen(open);
          if (!open) changeEmailForm.reset();
        }}
      >
        <DialogContent
          className="sm:max-w-md"
          onPointerDownOutside={(e) =>
            changeEmailForm.formState.isSubmitting && e.preventDefault()
          }
        >
          <DialogHeader>
            <DialogTitle>Cambiar correo electrónico</DialogTitle>
            <DialogDescription>
              Introduce el nuevo correo. Recibirás un enlace de confirmación; el
              cambio se aplicará al hacer clic en él.
            </DialogDescription>
          </DialogHeader>
          <Form {...changeEmailForm}>
            <form
              onSubmit={changeEmailForm.handleSubmit(onChangeEmail)}
              className="space-y-4"
            >
              <FormField
                control={changeEmailForm.control}
                name="new_email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nuevo correo electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="nuevo@email.com"
                        autoComplete="email"
                        disabled={changeEmailForm.formState.isSubmitting}
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
                  onClick={() => setChangeEmailDialogOpen(false)}
                  disabled={changeEmailForm.formState.isSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={changeEmailForm.formState.isSubmitting}
                >
                  {changeEmailForm.formState.isSubmitting
                    ? "Enviando…"
                    : "Enviar enlace de confirmación"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
