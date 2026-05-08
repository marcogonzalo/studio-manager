"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { pushDemoRequest } from "@/lib/gtm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CaptchaGuard } from "@/lib/anti-spam";
import { translateMagicLinkErrorCode } from "@/lib/auth/magic-link-error-i18n";

type DemoRequestFormProps = {
  turnstileSiteKey?: string | null;
};

export function DemoRequestForm({
  turnstileSiteKey: turnstileSiteKeyProp = null,
}: DemoRequestFormProps = {}) {
  const t = useTranslations("DemoRequestForm");
  const locale = useLocale();
  const [sent, setSent] = useState(false);
  const [needsCaptcha, setNeedsCaptcha] = useState(false);

  const formSchema = z.object({
    email: z.string().email(t("emailInvalid")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  const watchedEmail = form.watch("email");
  const emailTrimmed = watchedEmail?.trim() ?? "";
  const turnstileSiteKey =
    turnstileSiteKeyProp?.trim() ||
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() ||
    "";

  async function submitDemoRequest(
    values: FormValues,
    captchaToken?: string
  ): Promise<{ sent: boolean }> {
    const res = await fetch("/api/auth/demo-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: values.email.trim(),
        lang: locale,
        ...(captchaToken ? { captchaToken } : {}),
      }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      code?: string;
      success?: boolean;
    };
    if (!res.ok) {
      if (data.code === "captcha_required") {
        setNeedsCaptcha(true);
        toast.info(t("captchaRequired"));
        if (!turnstileSiteKey) {
          toast.error(t("captchaMisconfigured"));
        }
        return { sent: false };
      }
      const mapped = translateMagicLinkErrorCode(data.code, t);
      throw new Error(mapped ?? data.error ?? t("errorRequest"));
    }
    setNeedsCaptcha(false);
    return { sent: true };
  }

  async function onSubmit(values: FormValues) {
    try {
      const { sent } = await submitDemoRequest(values);
      if (!sent) return;
      pushDemoRequest();
      setSent(true);
      toast.success(t("successToast"));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("errorConnection");
      toast.error(message);
    }
  }

  async function onCaptchaVerify(token: string) {
    try {
      const { sent } = await submitDemoRequest(form.getValues(), token);
      if (!sent) return;
      pushDemoRequest();
      setSent(true);
      toast.success(t("successToast"));
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : t("errorConnection");
      toast.error(message);
    }
  }

  if (sent) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">{t("sentTitle")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <p className="text-muted-foreground text-sm">{t("subtitle")}</p>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="flex flex-col gap-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t("emailLabel")}</FormLabel>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-2">
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={t("emailPlaceholder")}
                        autoComplete="email"
                        className="sm:min-w-[200px]"
                        {...field}
                      />
                    </FormControl>
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="shrink-0"
                    >
                      {form.formState.isSubmitting
                        ? t("submitting")
                        : t("submit")}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {needsCaptcha ? (
              turnstileSiteKey ? (
                <div
                  className="border-primary/40 bg-muted/40 space-y-2 rounded-lg border p-3"
                  role="region"
                  aria-label={t("captchaRequired")}
                >
                  <p className="text-muted-foreground text-sm">
                    {t("captchaRequired")}
                  </p>
                  <CaptchaGuard
                    key={emailTrimmed}
                    provider="turnstile"
                    siteKey={turnstileSiteKey}
                    loadingLabel={t("captchaLoading")}
                    loadFailedLabel={t("captchaLoadFailed")}
                    onError={(err) => toast.error(err.message)}
                    onVerify={(token) => {
                      void onCaptchaVerify(token);
                    }}
                  />
                </div>
              ) : (
                <div
                  className="border-destructive/40 bg-destructive/5 rounded-lg border p-3"
                  role="alert"
                >
                  <p className="text-destructive text-sm font-medium">
                    {t("captchaMisconfigured")}
                  </p>
                </div>
              )
            ) : null}
          </form>
        </Form>
        <p className="text-muted-foreground mt-4 text-sm">{t("privacyNote")}</p>
      </CardContent>
    </Card>
  );
}
