"use client";

import { useActionState, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useLocale, useTranslations } from "next-intl";
import { pushContact } from "@/lib/gtm";
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
import { CardContent } from "@/components/ui/card";
import { submitContactForm, type ContactFormState } from "./actions";

const NAME_MAX = 50;
const EMAIL_MAX = 150;
const SUBJECT_MAX = 100;
const MESSAGE_MAX = 1000;

export function ContactForm() {
  const t = useTranslations("ContactForm");
  const locale = useLocale();
  const [formTimestamp] = useState(() => Date.now());
  const [state, formAction, isPending] = useActionState(
    submitContactForm,
    null as ContactFormState | null
  );

  const formSchema = z.object({
    name: z.string().min(2, t("nameMin")).max(NAME_MAX, t("nameMax")),
    email: z.string().email(t("emailInvalid")).max(EMAIL_MAX, t("emailMax")),
    subject: z
      .string()
      .min(5, t("subjectMin"))
      .max(SUBJECT_MAX, t("subjectMax")),
    message: z
      .string()
      .min(10, t("messageMin"))
      .max(MESSAGE_MAX, t("messageMax")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  useEffect(() => {
    if (state?.success) {
      pushContact({
        lead_source: "contact_form",
        lead_status: "Form submitted",
      });
      toast.success(t("successToast"));
      form.reset();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [state, form, t]);

  return (
    <CardContent className="pt-6">
      <Form {...form}>
        <form action={formAction} className="space-y-6">
          <div
            className="absolute top-0 -left-[9999px] h-0 w-0 overflow-hidden"
            aria-hidden="true"
          >
            <label htmlFor="website">{t("honeypotLabel")}</label>
            <input
              id="website"
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
            />
          </div>
          <input type="hidden" name="_ts" value={formTimestamp} />
          <input type="hidden" name="form_locale" value={locale} />
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="name">{t("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      id="name"
                      placeholder={t("namePlaceholder")}
                      {...field}
                      disabled={isPending}
                    />
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
                  <FormLabel htmlFor="email">{t("emailLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="subject">{t("subjectLabel")}</FormLabel>
                <FormControl>
                  <Input
                    id="subject"
                    placeholder={t("subjectPlaceholder")}
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between gap-2">
                  <FormLabel htmlFor="message">{t("messageLabel")}</FormLabel>
                  <span className="text-muted-foreground text-xs tabular-nums">
                    {field.value.length} / {MESSAGE_MAX}
                  </span>
                </div>
                <FormControl>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder={t("messagePlaceholder")}
                    className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-y rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? t("submitting") : t("submit")}
          </Button>
        </form>
      </Form>
    </CardContent>
  );
}
