"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
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

type SignUpValues = {
  email: string;
  fullName?: string;
  acceptTerms: boolean;
};

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
  const t = useTranslations("SignUp");
  const locale = useLocale();
  const planFromUrl: PlanCode | null =
    planParam && VALID_PLAN_CODES.includes(planParam as PlanCode)
      ? (planParam as PlanCode)
      : null;

  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PlanCode>(
    planFromUrl ?? "BASE"
  );

  const signUpSchema = z.object({
    email: z.string().email(t("emailInvalid")),
    fullName: z.string().optional(),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: t("acceptTermsError"),
    }),
  });

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
      const callbackUrl = `${window.location.origin}/${locale}/callback?next=${encodeURIComponent(finalRedirect)}&type=signup`;

      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          emailRedirectTo: callbackUrl,
          lang: locale,
          data: {
            full_name: values.fullName,
            signup_plan: selectedPlan,
            ...(billingParam && { signup_billing: billingParam }),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to send confirmation email");
      }
      const billingPeriod =
        billingParam?.toLowerCase() === "annual" ? "annual" : "monthly";
      pushSignUp({
        method: "magic_link",
        plan_code: selectedPlan,
        billing_period: billingPeriod,
      });
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
    const fullName = form.getValues("fullName");
    if (!email) return;

    setLoading(true);
    try {
      const finalRedirect = redirectTo || appPath("/dashboard");
      const callbackUrl = `${window.location.origin}/${locale}/callback?next=${encodeURIComponent(finalRedirect)}&type=signup`;

      const response = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          emailRedirectTo: callbackUrl,
          lang: locale,
          data: {
            full_name: fullName,
            signup_plan: selectedPlan,
            ...(billingParam && { signup_billing: billingParam }),
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Failed to resend confirmation email"
        );
      }
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
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullNameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fullNamePlaceholder")} {...field} />
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
                      {t("acceptTermsPrefix")}{" "}
                      <Link
                        href="/legal"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary underline hover:no-underline"
                      >
                        {t("termsLink")}
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
              {loading ? t("submitting") : t("submit")}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        <Link
          href="/sign-in"
          className="text-muted-foreground hover:text-foreground text-center text-sm transition-colors"
        >
          {t("hasAccount")}
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
