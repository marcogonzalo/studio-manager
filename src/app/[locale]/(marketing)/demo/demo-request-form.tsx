"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
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

export function DemoRequestForm() {
  const t = useTranslations("DemoRequestForm");
  const [sent, setSent] = useState(false);

  const formSchema = z.object({
    email: z.string().email(t("emailInvalid")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: FormValues) {
    try {
      const res = await fetch("/api/auth/demo-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: values.email.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        success?: boolean;
      };
      if (!res.ok) {
        toast.error(data.error ?? t("errorRequest"));
        return;
      }
      pushDemoRequest();
      setSent(true);
      toast.success(t("successToast"));
    } catch {
      toast.error(t("errorConnection"));
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
            onSubmit={form.handleSubmit(onSubmit)}
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
          </form>
        </Form>
        <p className="text-muted-foreground mt-4 text-sm">{t("privacyNote")}</p>
      </CardContent>
    </Card>
  );
}
