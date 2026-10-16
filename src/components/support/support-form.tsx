"use client";

import { useActionState, useEffect, useRef, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CardContent } from "@/components/ui/card";
import {
  submitSupportForm,
  type SupportFormState,
} from "@/app/actions/submit-support-form";
import {
  SUPPORT_REASONS,
  type SupportReason,
  DEFAULT_SUPPORT_REASON,
} from "@/lib/support/reasons";
import { cn } from "@/lib/utils";

const NAME_MAX = 50;
const EMAIL_MAX = 150;
const SUBJECT_MAX = 100;
const MESSAGE_MAX = 1000;

export type SupportFormProps = {
  defaultReason?: SupportReason;
  defaultName?: string;
  defaultEmail?: string;
  contextPath?: string;
  contextPlanCode?: string;
  /** marketing: GTM contact push; app: no GTM */
  variant?: "marketing" | "app";
  onSuccess?: () => void;
  className?: string;
  /** Wrap fields in CardContent (marketing contact page). */
  withCardContent?: boolean;
};

export function SupportForm({
  defaultReason = DEFAULT_SUPPORT_REASON,
  defaultName = "",
  defaultEmail = "",
  contextPath = "",
  contextPlanCode = "",
  variant = "marketing",
  onSuccess,
  className,
  withCardContent = false,
}: SupportFormProps) {
  const t = useTranslations("SupportForm");
  const locale = useLocale();
  const [formTimestamp] = useState(() => Date.now());
  const [state, formAction, isPending] = useActionState(
    submitSupportForm,
    null as SupportFormState | null
  );
  const lastReasonLabelRef = useRef(t(`reasons.${defaultReason}`));

  const formSchema = z.object({
    reason: z.enum(SUPPORT_REASONS),
    name: z.string().min(2, t("nameMin")).max(NAME_MAX, t("nameMax")),
    email: z.string().email(t("emailInvalid")).max(EMAIL_MAX, t("emailMax")),
    subject: z
      .string()
      .min(6, t("subjectMin"))
      .max(SUBJECT_MAX, t("subjectMax")),
    message: z
      .string()
      .min(10, t("messageMin"))
      .max(MESSAGE_MAX, t("messageMax")),
  });

  type FormValues = z.infer<typeof formSchema>;

  const initialSubject = t(`reasons.${defaultReason}`);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reason: defaultReason,
      name: defaultName,
      email: defaultEmail,
      subject: initialSubject,
      message: "",
    },
  });

  useEffect(() => {
    if (state?.success) {
      if (variant === "marketing") {
        pushContact({
          lead_source: "contact_form",
          lead_status: "Form submitted",
        });
      }
      toast.success(t("successToast"));
      form.reset({
        reason: defaultReason,
        name: defaultName,
        email: defaultEmail,
        subject: t(`reasons.${defaultReason}`),
        message: "",
      });
      lastReasonLabelRef.current = t(`reasons.${defaultReason}`);
      onSuccess?.();
    }
    if (state?.error) {
      toast.error(state.error);
    }
  }, [
    state,
    form,
    t,
    variant,
    onSuccess,
    defaultReason,
    defaultName,
    defaultEmail,
  ]);

  const fields = (
    <Form {...form}>
      <form action={formAction} className={cn("space-y-6", className)}>
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
        <input type="hidden" name="context_path" value={contextPath} />
        <input type="hidden" name="context_plan_code" value={contextPlanCode} />
        {/* Radix Select is not a native control — mirror reason into FormData. */}
        <input type="hidden" name="reason" value={form.watch("reason")} />

        <FormField
          control={form.control}
          name="reason"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("reasonLabel")}</FormLabel>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  const next = value as SupportReason;
                  const nextLabel = t(`reasons.${next}`);
                  const currentSubject = form.getValues("subject");
                  if (
                    !currentSubject.trim() ||
                    currentSubject === lastReasonLabelRef.current
                  ) {
                    form.setValue("subject", nextLabel);
                  }
                  lastReasonLabelRef.current = nextLabel;
                  field.onChange(next);
                }}
                disabled={isPending}
              >
                <FormControl>
                  <SelectTrigger aria-label={t("reasonLabel")}>
                    <SelectValue placeholder={t("reasonPlaceholder")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUPPORT_REASONS.map((code) => (
                    <SelectItem key={code} value={code}>
                      {t(`reasons.${code}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="support-name">{t("nameLabel")}</FormLabel>
                <FormControl>
                  <Input
                    id="support-name"
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
                <FormLabel htmlFor="support-email">{t("emailLabel")}</FormLabel>
                <FormControl>
                  <Input
                    id="support-email"
                    type="email"
                    placeholder="you@email.com"
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
              <FormLabel htmlFor="support-subject">
                {t("subjectLabel")}
              </FormLabel>
              <FormControl>
                <Input
                  id="support-subject"
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
                <FormLabel htmlFor="support-message">
                  {t("messageLabel")}
                </FormLabel>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {field.value.length} / {MESSAGE_MAX}
                </span>
              </div>
              <FormControl>
                <textarea
                  id="support-message"
                  rows={5}
                  placeholder={t("messagePlaceholder")}
                  className="border-input bg-background text-foreground ring-offset-background placeholder:text-placeholder-foreground focus-visible:ring-ring flex w-full resize-y rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  {...field}
                  disabled={isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full sm:w-auto"
          disabled={isPending}
        >
          {isPending ? t("submitting") : t("submit")}
        </Button>
      </form>
    </Form>
  );

  if (withCardContent) {
    return <CardContent className="pt-6">{fields}</CardContent>;
  }

  return fields;
}
