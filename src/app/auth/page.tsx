"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Info } from "lucide-react";
import { VetaLogo } from "@/components/veta-logo";

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos de uso y privacidad",
  }),
});

const VALID_PLAN_CODES = ["BASE", "PRO", "STUDIO"] as const;
const PLAN_DISPLAY_NAMES: Record<(typeof VALID_PLAN_CODES)[number], string> = {
  BASE: "Prueba",
  PRO: "Pro",
  STUDIO: "Studio",
};

type PlanCode = (typeof VALID_PLAN_CODES)[number];

function AuthContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
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

  // "Prueba" (BASE) si no hay query param `plan` o el valor no coincide con BASE/PRO/STUDIO
  useEffect(() => {
    if (planFromUrl) {
      setSelectedPlan(planFromUrl);
    } else {
      setSelectedPlan("BASE");
    }
  }, [planFromUrl]);

  const handlePlanChange = (value: string) => {
    const plan = value as PlanCode;
    setSelectedPlan(plan);
    const next = new URLSearchParams(searchParams.toString());
    next.set("plan", plan);
    router.replace(`/auth?${next.toString()}`, { scroll: false });
  };

  const supabase = getSupabaseClient();

  // Show error from callback if present
  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

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

      if (isLogin) {
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: callbackUrl,
          },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: values.email,
          options: {
            emailRedirectTo: callbackUrl,
            data: {
              full_name: values.fullName,
            },
          },
        });
        if (error) throw error;
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

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: callbackUrl,
          ...(fullName && {
            data: {
              full_name: fullName,
            },
          }),
        },
      });
      if (error) throw error;
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
          {!isLogin && !selectedPlan && (
            <p className="text-muted-foreground mt-2 text-sm">
              Se te asignará el plan{" "}
              <span className="text-foreground font-medium">Prueba</span> por
              defecto.
            </p>
          )}
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
              {!isLogin && (
                <div className="text-muted-foreground space-y-1 text-sm">
                  <p className="flex flex-wrap items-center gap-1.5">
                    Te registrarás con el plan{" "}
                    <span className="inline-flex items-center gap-0.5">
                      <Select
                        value={selectedPlan}
                        onValueChange={handlePlanChange}
                      >
                        <SelectTrigger
                          aria-label="Cambiar plan"
                          className="text-foreground hover:bg-muted/50 inline-flex h-8 w-auto min-w-0 border-0 bg-transparent px-1.5 py-0 shadow-none focus:ring-1 focus:ring-offset-0 [&>svg]:h-3.5 [&>svg]:w-3.5"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent align="start">
                          {VALID_PLAN_CODES.map((code) => (
                            <SelectItem key={code} value={code}>
                              {PLAN_DISPLAY_NAMES[code]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Link
                        href="/pricing"
                        title="Ver detalle de los planes"
                        className="text-muted-foreground hover:text-foreground inline-flex shrink-0"
                        aria-label="Ver detalle de los planes"
                      >
                        <Info className="h-4 w-4" />
                      </Link>
                    </span>
                  </p>
                  {selectedPlan !== "BASE" && (
                    <p>Tendrás 30 días para disfrutarlo sin coste.</p>
                  )}
                </div>
              )}
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
        <div className="bg-background flex min-h-screen items-center justify-center">
          <div className="text-muted-foreground animate-pulse">Cargando...</div>
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}
