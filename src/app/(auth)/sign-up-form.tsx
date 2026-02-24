"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { pushSignUp } from "@/lib/gtm";

const VALID_PLAN_CODES = ["BASE", "PRO", "STUDIO"] as const;
type PlanCode = (typeof VALID_PLAN_CODES)[number];

const signUpSchema = z.object({
  email: z.string().email("Email inválido"),
  fullName: z.string().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos de uso y privacidad",
  }),
});

type SignUpValues = z.infer<typeof signUpSchema>;

type SignUpFormProps = {
  redirectTo?: string | null;
  planParam?: string | null;
  billingParam?: string | null;
};

export function SignUpForm({
  redirectTo = null,
  planParam = null,
  billingParam = null,
}: SignUpFormProps) {
  const planFromUrl: PlanCode | null =
    planParam && VALID_PLAN_CODES.includes(planParam as PlanCode)
      ? (planParam as PlanCode)
      : null;

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(
    planFromUrl ?? "BASE"
  );

  useEffect(() => {
    if (planFromUrl) setSelectedPlan(planFromUrl);
  }, [planFromUrl]);

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      fullName: "",
      acceptTerms: false,
    },
  });

  const watchedEmail = form.watch("email");
  const emailTrimmed = watchedEmail?.trim() ?? "";
  const isEmailValid =
    emailTrimmed.length > 0 &&
    z.string().email().safeParse(emailTrimmed).success;

  async function onSubmit(values: SignUpValues) {
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
          data: {
            full_name: values.fullName,
            signup_plan: selectedPlan,
            ...(billingParam && { signup_billing: billingParam }),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send magic link");
      }
      pushSignUp({ method: "magic_link", plan_code: selectedPlan });
      setEmailSent(true);
      toast.success(
        "Revisa tu correo electrónico. Te hemos enviado un enlace para completar tu registro."
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
    const fullName = form.getValues("fullName");
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
          data: {
            full_name: fullName,
            signup_plan: selectedPlan,
            ...(billingParam && { signup_billing: billingParam }),
          },
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
              Haz clic en el enlace del correo para completar tu registro. El
              enlace expirará en unos minutos.
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
          Crea tu cuenta
        </h1>
        <CardDescription>
          Ingresa tu correo y te enviaremos un enlace para crear tu cuenta.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <FormField
              control={form.control}
              name="acceptTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
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
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !isEmailValid || !form.watch("acceptTerms")}
            >
              {loading ? "Enviando..." : "Enviar enlace de registro"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link
          href="/sign-in"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          ¿Ya tienes cuenta? Inicia sesión
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
