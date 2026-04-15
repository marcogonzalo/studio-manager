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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth-provider";
import type { Payment, PurchaseOrder, AdditionalCost } from "@/types";
import {
  getDemoAccountMessage,
  getCurrencySymbol,
  formatCurrency,
} from "@/lib/utils";

function buildFormSchema(t: ReturnType<typeof useTranslations>) {
  return z
    .object({
      amount: z.number().min(0.01, t("validationAmountPositive")),
      payment_date: z.string().min(1, t("validationDateRequired")),
      reference_number: z.string().optional(),
      description: z.string().optional(),
      payment_type: z.enum([
        "fees",
        "purchase_provision",
        "additional_cost",
        "other",
      ]),
      purchase_order_id: z.string().optional(),
      additional_cost_id: z.string().optional(),
      phase: z
        .enum([
          "diagnosis",
          "design",
          "executive",
          "budget",
          "construction",
          "delivery",
        ])
        .optional(),
    })
    .refine(
      () => {
        // Flexible: permite pagos sin asociación
        return true;
      },
      {
        message: t("validationAssociationOrType"),
      }
    );
}

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  projectId: string;
  payment?: Payment | null;
  defaultPurchaseOrderId?: string;
  defaultAdditionalCostId?: string;
  currency?: string;
}

export function PaymentDialog({
  open,
  onOpenChange,
  onSuccess,
  projectId,
  payment,
  defaultPurchaseOrderId,
  defaultAdditionalCostId,
  currency = "EUR",
}: PaymentDialogProps) {
  const t = useTranslations("DialogPayment");
  const formSchema = buildFormSchema(t);
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [additionalCosts, setAdditionalCosts] = useState<AdditionalCost[]>([]);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      payment_date: new Date().toISOString().split("T")[0],
      reference_number: "",
      description: "",
      payment_type: "fees",
      purchase_order_id: "",
      additional_cost_id: "",
      phase: undefined,
    },
  });

  const fetchPurchaseOrders = useCallback(async () => {
    const { data } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (data) setPurchaseOrders(data);
  }, [projectId, supabase]);

  const fetchAdditionalCosts = useCallback(async () => {
    const { data } = await supabase
      .from("additional_project_costs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (data) setAdditionalCosts(data);
  }, [projectId, supabase]);

  useEffect(() => {
    if (open) {
      fetchPurchaseOrders();
      fetchAdditionalCosts();
    }
  }, [open, fetchPurchaseOrders, fetchAdditionalCosts]);

  useEffect(() => {
    if (defaultPurchaseOrderId && open) {
      form.setValue("purchase_order_id", defaultPurchaseOrderId);
      form.setValue("payment_type", "purchase_provision");
    }
  }, [defaultPurchaseOrderId, open, form]);

  useEffect(() => {
    if (defaultAdditionalCostId && open) {
      form.setValue("additional_cost_id", defaultAdditionalCostId);
      form.setValue("payment_type", "additional_cost");
    }
  }, [defaultAdditionalCostId, open, form]);

  useEffect(() => {
    if (payment && open) {
      form.reset({
        amount: payment.amount,
        payment_date: payment.payment_date,
        reference_number: payment.reference_number || "",
        description: payment.description || "",
        payment_type: payment.payment_type,
        purchase_order_id: payment.purchase_order_id || "",
        additional_cost_id: payment.additional_cost_id || "",
        phase: payment.phase || undefined,
      });
    } else if (!payment && open) {
      form.reset({
        amount: 0,
        payment_date: new Date().toISOString().split("T")[0],
        reference_number: defaultPurchaseOrderId ? "" : "",
        description: "",
        payment_type: defaultPurchaseOrderId
          ? "purchase_provision"
          : defaultAdditionalCostId
            ? "additional_cost"
            : "fees",
        purchase_order_id: defaultPurchaseOrderId || "",
        additional_cost_id: defaultAdditionalCostId || "",
        phase: undefined,
      });
    }
  }, [payment, open, form, defaultPurchaseOrderId, defaultAdditionalCostId]);

  const paymentType = form.watch("payment_type");

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      const paymentData = {
        project_id: projectId,
        user_id: user?.id,
        amount: values.amount,
        payment_date: values.payment_date,
        reference_number: values.reference_number || null,
        description: values.description || null,
        payment_type: values.payment_type,
        purchase_order_id: values.purchase_order_id || null,
        additional_cost_id: values.additional_cost_id || null,
        phase: values.phase || null,
      };

      if (payment) {
        const { error } = await supabase
          .from("payments")
          .update(paymentData)
          .eq("id", payment.id);

        if (error) throw error;
        toast.success(t("toastUpdated"));
      } else {
        const { error } = await supabase.from("payments").insert([paymentData]);

        if (error) throw error;
        toast.success(t("toastCreated"));
      }

      form.reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      const demoMsg = getDemoAccountMessage(error);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
        return;
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : payment
            ? t("toastUpdateError")
            : t("toastCreateError");
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{payment ? t("titleEdit") : t("titleNew")}</DialogTitle>
          <DialogDescription>
            {payment ? t("descriptionEdit") : t("descriptionNew")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("amountLabel")} ({getCurrencySymbol(currency)})
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t("amountPlaceholder")}
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("paymentDateLabel")}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("referenceLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("referencePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("paymentTypeLabel")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={t("paymentTypePlaceholder")}
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fees">{t("typeFees")}</SelectItem>
                      <SelectItem value="purchase_provision">
                        {t("typePurchaseProvision")}
                      </SelectItem>
                      <SelectItem value="additional_cost">
                        {t("typeAdditionalCost")}
                      </SelectItem>
                      <SelectItem value="other">{t("typeOther")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {paymentType === "purchase_provision" && (
              <FormField
                control={form.control}
                name="purchase_order_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("purchaseOrderLabel")}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "__none__" ? "" : value)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("purchaseOrderPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">
                          {t("noneFemale")}
                        </SelectItem>
                        {purchaseOrders.map((po) => (
                          <SelectItem key={po.id} value={po.id}>
                            {po.order_number || `PO ${po.id.slice(0, 8)}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {paymentType === "additional_cost" && (
              <FormField
                control={form.control}
                name="additional_cost_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("additionalCostLabel")}</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value === "__none__" ? "" : value)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("additionalCostPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">
                          {t("noneMale")}
                        </SelectItem>
                        {additionalCosts.map((cost) => (
                          <SelectItem key={cost.id} value={cost.id}>
                            {cost.cost_type} -{" "}
                            {formatCurrency(Number(cost.amount), currency)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="phase"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phaseLabel")}</FormLabel>
                  <Select
                    onValueChange={(value) =>
                      field.onChange(value === "__none__" ? undefined : value)
                    }
                    value={field.value || "__none__"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("phasePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">
                        {t("noneFemale")}
                      </SelectItem>
                      <SelectItem value="diagnosis">
                        {t("phaseDiagnosis")}
                      </SelectItem>
                      <SelectItem value="design">{t("phaseDesign")}</SelectItem>
                      <SelectItem value="executive">
                        {t("phaseExecutive")}
                      </SelectItem>
                      <SelectItem value="budget">{t("phaseBudget")}</SelectItem>
                      <SelectItem value="construction">
                        {t("phaseConstruction")}
                      </SelectItem>
                      <SelectItem value="delivery">
                        {t("phaseDelivery")}
                      </SelectItem>
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

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {payment ? t("saveChanges") : t("registerPayment")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
