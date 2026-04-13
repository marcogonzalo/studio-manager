import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
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
import type { Supplier } from "@/types";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { getDemoAccountMessage } from "@/lib/utils";
import {
  optionalEmailSchema,
  optionalPhoneSchema,
} from "@/lib/contact-validation";
import { PhoneInput } from "@/components/ui/phone-input";

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  contact_name: z.string().optional(),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  website: z.string().optional(),
});

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSuccess: (supplierId?: string) => void;
}

export function SupplierDialog({
  open,
  onOpenChange,
  supplier,
  onSuccess,
}: SupplierDialogProps) {
  const t = useTranslations("DialogSupplier");
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      contact_name: "",
      email: "",
      phone: "",
      website: "",
    },
  });

  useEffect(() => {
    if (supplier) form.reset(supplier);
    else
      form.reset({
        name: "",
        contact_name: "",
        email: "",
        phone: "",
        website: "",
      });
  }, [supplier, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
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
        toast.success(t("toastCreated"));
        onSuccess(newSupplier.id);
      }
    } catch (error: unknown) {
      const demoMsg = getDemoAccountMessage(error);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
        return;
      }
      toast.error(t("toastSaveError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? t("titleEdit") : t("titleNew")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
            <div className="grid grid-cols-2 gap-4">
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
            <DialogFooter>
              <Button type="submit">{t("save")}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
