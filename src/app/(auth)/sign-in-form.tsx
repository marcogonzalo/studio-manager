"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { appPath } from "@/lib/app-paths";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

const signInSchema = z.object({
  email: z.string().email("Email inválido"),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const emailUpdated = searchParams.get("email_updated");

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  useEffect(() => {
    if (emailUpdated !== "1") return;
    const supabase = getSupabaseClient();
    supabase.auth.signOut().then(() => {
      toast.success(
        "El cambio de correo se ha realizado. Ya puedes iniciar sesión con tu nueva dirección."
      );
    });
  }, [emailUpdated]);

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    mode: "onTouched",
    defaultValues: { email: "" },
  });

  const watchedEmail = form.watch("email");
  const emailTrimmed = watchedEmail?.trim() ?? "";
  const isEmailValid =
    emailTrimmed.length > 0 &&
    z.string().email().safeParse(emailTrimmed).success;

  async function onSubmit(values: SignInValues) {
    setLoading(true);
    try {
      const finalRedirect = redirectTo || appPath("/dashboard");
      const callbackUrl = `${window.location.origin}/callback?next=${encodeURIComponent(finalRedirect)}`;

      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          emailRedirectTo: callbackUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send magic link");
      }
      setEmailSent(true);
      toast.success(
        "Revisa tu correo electrónico. Te hemos enviado un enlace para iniciar sesión."
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const email = form.getValues("email");
    if (!email) return;

    setLoading(true);
    try {
      const finalRedirect = redirectTo || appPath("/dashboard");
      const callbackUrl = `${window.location.origin}/callback?next=${encodeURIComponent(finalRedirect)}`;

      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          emailRedirectTo: callbackUrl,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to resend magic link");
      }
      toast.success("Enlace reenviado. Revisa tu correo nuevamente.");
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Error al reenviar el enlace";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl leading-none font-semibold tracking-tight">
            Revisa tu correo
          </h1>
          <CardDescription>
            Te hemos enviado un enlace mágico a{" "}
            <strong>{form.getValues("email")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              Haz clic en el enlace del correo para iniciar sesión. El enlace
              expirará en unos minutos.
            </p>
            <p className="text-muted-foreground text-sm">
              Si no recibes el correo, revisa tu carpeta de spam o intenta
              nuevamente.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setEmailSent(false);
              form.reset();
            }}
          >
            Volver
          </Button>
          <Button
            variant="link"
            className="w-full"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? "Reenviando..." : "Reenviar enlace"}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-2xl leading-none font-semibold tracking-tight">
          Inicia sesión
        </h1>
        <CardDescription>
          {redirectTo
            ? "Tu sesión ha caducado. Por favor, inicia sesión para continuar."
            : "Ingresa tu correo para enviarte el enlace de inicio de sesión."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isEmailValid}
            >
              {loading ? "Enviando..." : "Enviar enlace mágico"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link
          href="/sign-up"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          ¿No tienes cuenta? Regístrate
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          Volver al inicio
        </Link>
      </CardFooter>
    </Card>
  );
}
