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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import type { Client } from "@/types";
import { useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import {
  getDemoAccountMessage,
  getErrorMessage,
  reportError,
} from "@/lib/utils";
import {
  optionalEmailSchema,
  optionalPhoneSchema,
} from "@/lib/contact-validation";
import { PhoneInput } from "@/components/ui/phone-input";

const formSchema = z.object({
  full_name: z.string().min(2, "Nombre requerido"),
  email: optionalEmailSchema,
  phone: optionalPhoneSchema,
  address: z.string().optional(),
});

interface ClientDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: Client | null;
  onSuccess: (clientId?: string) => void;
}

export function ClientDialog({
  open,
  onOpenChange,
  client,
  onSuccess,
}: ClientDialogProps) {
  const t = useTranslations("DialogClient");
  const { user } = useAuth();
  const supabase = getSupabaseClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      full_name: "",
      email: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (client) {
      form.reset({
        full_name: client.full_name,
        email: client.email || "",
        phone: client.phone || "",
        address: client.address || "",
      });
    } else {
      form.reset({
        full_name: "",
        email: "",
        phone: "",
        address: "",
      });
    }
  }, [client, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      // Convert empty strings to null for optional fields to avoid overwriting existing data
      const clientData: Record<string, unknown> = {
        full_name: values.full_name,
        user_id: user?.id,
      };

      // Only include optional fields if they have values
      if (values.email && values.email.trim()) {
        clientData.email = values.email;
      } else {
        clientData.email = null;
      }

      if (values.phone && values.phone.trim()) {
        clientData.phone = values.phone;
      } else {
        clientData.phone = null;
      }

      if (values.address && values.address.trim()) {
        clientData.address = values.address;
      } else {
        clientData.address = null;
      }

      if (client) {
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", client.id);
        if (error) throw error;
        toast.success(t("toastUpdated"));
        onSuccess();
      } else {
        const { data: newClient, error } = await supabase
          .from("clients")
          .insert([clientData])
          .select()
          .single();
        if (error) throw error;
        toast.success(t("toastCreated"));
        onSuccess(newClient.id);
      }
    } catch (error: unknown) {
      const demoMsg = getDemoAccountMessage(error);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
        return;
      }
      reportError(error, "Error saving client:");
      toast.error(getErrorMessage(error) || t("toastSaveError"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{client ? t("titleEdit") : t("titleNew")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("fullNameLabel")}</FormLabel>
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
                    <Input placeholder={t("emailPlaceholder")} {...field} />
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
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("addressLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("addressPlaceholder")} {...field} />
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
