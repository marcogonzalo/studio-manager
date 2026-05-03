import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { getDemoAccountMessage } from "@/lib/utils";
import type { AdditionalCost } from "@/types";

function buildFormSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    cost_type: z.string().min(1, t("validationTypeRequired")),
    description: z.string().optional(),
    amount: z.string().transform((v) => parseFloat(v) || 0),
  });
}

interface AdditionalCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
  cost?: AdditionalCost | null;
}

const COST_TYPES = [
  { value: "shipping", label: "Envío" },
  { value: "packaging", label: "Embalaje" },
  { value: "installation", label: "Instalación" },
  { value: "assembly", label: "Montaje" },
  { value: "transport", label: "Transporte" },
  { value: "insurance", label: "Seguro" },
  { value: "customs", label: "Aduanas" },
  { value: "storage", label: "Almacenamiento" },
  { value: "handling", label: "Manejo" },
  { value: "other", label: "Otro" },
];

export function AdditionalCostDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
  cost,
}: AdditionalCostDialogProps) {
  const t = useTranslations("DialogAdditionalCost");
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const isEditing = !!cost;
  const formSchema = buildFormSchema(t);

  type FormValues = {
    cost_type: string;
    description?: string;
    amount: string;
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      cost_type: "",
      description: "",
      amount: "0",
    },
  });

  // Reset form when dialog opens/closes or cost changes
  useEffect(() => {
    if (open) {
      if (cost) {
        form.reset({
          cost_type: cost.cost_type,
          description: cost.description || "",
          amount: cost.amount.toString(),
        });
      } else {
        form.reset({
          cost_type: "",
          description: "",
          amount: "0",
        });
      }
    }
  }, [open, cost, form]);

  const onSubmit = async (values: z.infer<typeof formSchema> | FormValues) => {
    if (!user?.id) {
      toast.error(t("toastUserError"));
      return;
    }

    if (isEditing && cost) {
      // Update existing cost
      const { error } = await supabase
        .from("additional_project_costs")
        .update({
          cost_type: values.cost_type,
          description: values.description || null,
          amount: values.amount,
        })
        .eq("id", cost.id);

      if (error) {
        const demoMsg = getDemoAccountMessage(error);
        if (demoMsg) {
          toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
            duration: 5000,
          });
          return;
        }
        toast.error(t("toastUpdateError"));
      } else {
        toast.success(t("toastUpdated"));
        onSuccess();
        onOpenChange(false);
      }
    } else {
      // Create new cost
      const { error } = await supabase.from("additional_project_costs").insert([
        {
          project_id: projectId,
          cost_type: values.cost_type,
          description: values.description || null,
          amount: values.amount,
          user_id: user.id,
        },
      ]);

      if (error) {
        const demoMsg = getDemoAccountMessage(error);
        if (demoMsg) {
          toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
            duration: 5000,
          });
          return;
        }
        toast.error(t("toastCreateError"));
      } else {
        toast.success(t("toastCreated"));
        onSuccess();
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("titleEdit") : t("titleNew")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="cost_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("typeLabel")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("typePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COST_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("descriptionPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>{t("amountLabel")}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("amountPlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {t("cancel")}
              </Button>
              <Button type="submit">
                {isEditing ? t("update") : t("add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
