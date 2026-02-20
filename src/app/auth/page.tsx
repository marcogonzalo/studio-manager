"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { VetaLogo } from "@/components/veta-logo";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos de uso y privacidad",
  }),
});

const VALID_PLAN_CODES = ["BASE", "PRO", "STUDIO"] as const;
type PlanCode = (typeof VALID_PLAN_CODES)[number];

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const emailUpdated = searchParams.get("email_updated");
  const planParam = searchParams.get("plan");
  const planFromUrl: PlanCode | null =
    planParam && VALID_PLAN_CODES.includes(planParam as PlanCode)
      ? (planParam as PlanCode)
      : null;

  const [isLogin, setIsLogin] = useState(mode !== "signup");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(
    planFromUrl ?? "BASE"
  );

  // "Base" (BASE) si no hay query param `plan` o el valor no coincide con BASE/PRO/STUDIO
  useEffect(() => {
    if (planFromUrl) {
      setSelectedPlan(planFromUrl);
    } else {
      setSelectedPlan("BASE");
    }
  }, [planFromUrl]);

  const supabase = getSupabaseClient();

  // Show error from callback if present
  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);
  // After email change confirmation: sign out so they must log in with the new email (security)
  useEffect(() => {
    if (emailUpdated === "1") {
      supabase.auth.signOut().then(() => {
        toast.success(
          "El cambio de correo se ha realizado. Ya puedes iniciar sesión con tu nueva dirección."
        );
      });
    }
  }, [emailUpdated]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      fullName: "",
      acceptTerms: mode !== "signup",
    },
  });

  const watchedEmail = form.watch("email");
  const emailTrimmed = watchedEmail?.trim() ?? "";
  const isEmailValid =
    emailTrimmed.length > 0 &&
    z.string().email().safeParse(emailTrimmed).success;

  // Al cambiar entre login/signup, actualizar acceptTerms para que la validación sea correcta
  useEffect(() => {
    form.setValue("acceptTerms", isLogin);
  }, [isLogin]); // eslint-disable-line react-hooks/exhaustive-deps -- form ref is stable, only sync when isLogin toggles

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      // Redirect to callback route which will handle the session exchange
      // Use the full URL without double encoding
      const finalRedirect = redirectTo || "/dashboard";
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(finalRedirect)}`;

      const billingParam = searchParams.get("billing");
      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          emailRedirectTo: callbackUrl,
          ...(isLogin
            ? {}
            : {
                data: {
                  full_name: values.fullName,
                  signup_plan: selectedPlan,
                  ...(billingParam && {
                    signup_billing: billingParam,
                  }),
                },
              }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send magic link");
      }
      setEmailSent(true);
      toast.success(
        `Revisa tu correo electrónico. Te hemos enviado un enlace para ${
          isLogin ? "iniciar sesión" : "completar tu registro"
        }.`
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Ocurrió un error";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  const handleResend = async () => {
    const email = form.getValues("email");
    const fullName = form.getValues("fullName");
    if (!email) return;

    setLoading(true);
    try {
      const finalRedirect = redirectTo || "/dashboard";
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(finalRedirect)}`;

      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          emailRedirectTo: callbackUrl,
          ...(fullName && {
            data: {
              full_name: fullName,
            },
          }),
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
  };

  const handleBack = () => {
    setEmailSent(false);
    form.reset();
  };

  if (emailSent) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Revisa tu correo</CardTitle>
            <CardDescription>
              Te hemos enviado un enlace mágico a{" "}
              <strong>{form.getValues("email")}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Haz clic en el enlace del correo para{" "}
                {isLogin ? "iniciar sesión" : "completar tu registro"}. El
                enlace expirará en unos minutos.
              </p>
              <p className="text-muted-foreground text-sm">
                Si no recibes el correo, revisa tu carpeta de spam o intenta
                nuevamente.
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button variant="outline" className="w-full" onClick={handleBack}>
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
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-4 flex items-center gap-4">
            <Link
              href="/"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <VetaLogo height={28} />
            </Link>
          </div>
          <CardTitle>
            {isLogin ? "Ingresa a tu cuenta" : "Regístrate"}
          </CardTitle>
          <CardDescription>
            {redirectTo
              ? "Tu sesión ha caducado. Por favor, inicia sesión para continuar."
              : isLogin
                ? "Ingresa tu correo para enviarte el enlace de inicio de sesión"
                : "Ingresa tu correo y te enviaremos un enlace para crear tu cuenta."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {!isLogin && (
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Juan Pérez" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="tu@email.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="acceptTerms"
                render={({ field }) =>
                  isLogin ? (
                    <FormItem className="hidden">
                      <FormControl>
                        <Checkbox
                          checked={true}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  ) : (
                    <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal">
                          He leído y estoy conforme con los{" "}
                          <Link
                            href="/legal"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline hover:no-underline"
                          >
                            términos de uso y privacidad
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )
                }
              />
              <Button
                type="submit"
                className="w-full"
                disabled={
                  loading ||
                  !isEmailValid ||
                  (!isLogin && !form.watch("acceptTerms"))
                }
              >
                {loading
                  ? "Enviando..."
                  : isLogin
                    ? "Enviar enlace mágico"
                    : "Enviar enlace de registro"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="justify-center">
          <Button variant="link" onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "¿No tienes cuenta? Regístrate"
              : "¿Ya tienes cuenta? Inicia sesión"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-background flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-sm space-y-4">
            <Skeleton className="mx-auto h-10 w-32" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
