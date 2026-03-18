"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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
import { pushLogin } from "@/lib/gtm";

type SignInValues = { email: string };

export function SignInForm() {
  const t = useTranslations("SignIn");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect");
  const errorParam = searchParams.get("error");
  const emailUpdated = searchParams.get("email_updated");

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const signInSchema = z.object({
    email: z.string().email(t("emailInvalid")),
  });

  useEffect(() => {
    if (errorParam) {
      toast.error(decodeURIComponent(errorParam));
    }
  }, [errorParam]);

  useEffect(() => {
    if (emailUpdated !== "1") return;
    const supabase = getSupabaseClient();
    supabase.auth.signOut().then(() => {
      toast.success(t("toastEmailUpdated"));
    });
  }, [emailUpdated, t]);

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
      const callbackUrl = `${window.location.origin}/${locale}/callback?next=${encodeURIComponent(finalRedirect)}&type=login`;

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
      pushLogin({ method: "magic_link" });
      setEmailSent(true);
      toast.success(t("toastSuccess"));
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : t("toastError");
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
      const callbackUrl = `${window.location.origin}/${locale}/callback?next=${encodeURIComponent(finalRedirect)}&type=login`;

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
      pushLogin({ method: "magic_link" });
      toast.success(t("toastResend"));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("toastResendError");
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
            {t("emailSentTitle")}
          </h1>
          <CardDescription>
            {t("emailSentDescription")}{" "}
            <strong>{form.getValues("email")}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
              {t("emailSentClick")}
            </p>
            <p className="text-muted-foreground text-sm">
              {t("emailSentNoEmail")}
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
            {t("back")}
          </Button>
          <Button
            variant="link"
            className="w-full"
            onClick={handleResend}
            disabled={loading}
          >
            {loading ? t("resending") : t("resend")}
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h1 className="text-2xl leading-none font-semibold tracking-tight">
          {t("title")}
        </h1>
        <CardDescription>
          {redirectTo ? t("descriptionSessionExpired") : t("description")}
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
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      {...field}
                    />
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
              {loading ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link
          href="/sign-up"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          {t("noAccount")}
        </Link>
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          {t("backToHome")}
        </Link>
      </CardFooter>
    </Card>
  );
}
