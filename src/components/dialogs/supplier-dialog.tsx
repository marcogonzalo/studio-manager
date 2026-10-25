import type { Locale } from "@/i18n/config";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations, useLocale } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { trackUserEvent } from "@/app/actions/track-event";
import type { Supplier } from "@/types";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth-provider";
import { getDemoAccountMessage } from "@/lib/utils";
import {
  createOptionalEmailSchema,
  createOptionalPhoneSchema,
} from "@/lib/contact-validation";
import { PhoneInput } from "@/components/ui/phone-input";

function buildFormSchema(t: ReturnType<typeof useTranslations>, lang: Locale) {
  return z.object({
    name: z.string().min(2, t("validationNameRequired")),
    contact_name: z.string().optional(),
    email: createOptionalEmailSchema(lang),
    phone: createOptionalPhoneSchema(lang),
    website: z.string().optional(),
  });
}

type FormValues = z.infer<ReturnType<typeof buildFormSchema>>;

const emptyDefaults = (): FormValues => ({
  name: "",
  contact_name: "",
  email: "",
  phone: "",
  website: "",
});

export interface SupplierDialogSuccessMeta {
  addAnother?: boolean;
}

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSuccess: (supplierId?: string, meta?: SupplierDialogSuccessMeta) => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const t = useTranslations("DialogSupplier");
  const locale = useLocale() as Locale;
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const formSchema = buildFormSchema(t, locale);
  const addAnotherIntentRef = useRef(false);
  const isEditing = !!supplier;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyDefaults(),
  });

  useEffect(() => {
    if (supplier) form.reset(supplier);
    else form.reset(emptyDefaults());
  }, [supplier, open, form]);

  async function onSubmit(
    values: FormValues,
    options?: { addAnother?: boolean }
  ) {
    const addAnother = options?.addAnother === true && !isEditing;
    try {
      const data = { ...values, user_id: user?.id };
      if (supplier) {
        await supabase.from("suppliers").update(data).eq("id", supplier.id);

        toast.success(t("toastUpdated"));
        onSuccess();
      } else {
        const { data: newSupplier, error } = await supabase
          .from("suppliers")
          .insert([data])
          .select()
          .single();

        if (error) throw error;

        void trackUserEvent("supplier_created", {
          supplier_id: newSupplier.id,
        });

        toast.success(t("toastCreated"));
        if (addAnother) {
          form.reset(emptyDefaults());
          onSuccess(newSupplier.id, { addAnother: true });
          requestAnimationFrame(() => {
            form.setFocus("name");
          });
        } else {
          onSuccess(newSupplier.id);
        }
      }
    } catch (error: unknown) {
      const demoMsg = getDemoAccountMessage(error, locale);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
        return;
      }
      toast.error(t("toastSaveError"));
    } finally {
      addAnotherIntentRef.current = false;
    }
  }

  const submitWithIntent = (addAnother: boolean) => {
    addAnotherIntentRef.current = addAnother;
    void form.handleSubmit((vals) =>
      onSubmit(vals, { addAnother: addAnotherIntentRef.current })
    )();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? t("titleEdit") : t("titleNew")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Enter defaults to "create another" when creating (same as budget lines).
              submitWithIntent(!isEditing);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("companyLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("contactNameLabel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("emailLabel")}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("phoneLabel")}</FormLabel>
                    <FormControl>
                      <PhoneInput
                        value={field.value}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("websiteLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("websitePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="max-sm:flex-wrap">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              {isEditing ? (
                <Button type="submit">{t("save")}</Button>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => submitWithIntent(false)}
                  >
                    {t("save")}
                  </Button>
                  <Button type="submit">{t("saveAndCreateAnother")}</Button>
                </>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
