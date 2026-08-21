import type { Locale } from "@/i18n/config";
import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { Checkbox } from "@/components/ui/checkbox";
import Link from "next/link";
import { toast } from "sonner";
import { CircleHelp, Plus } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { SupplierDialog } from "./supplier-dialog";
import { usePlanCapability } from "@/lib/use-plan-capability";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getDemoAccountMessage,
  getErrorMessage,
  reportError,
  isCostCategory,
} from "@/lib/utils";
import {
  useCategoryOptions,
  usePhaseLabel,
  useSubcategoryOptions,
} from "@/lib/use-project-labels";
import { buildBudgetLineFormSchema } from "@/lib/budget-line-form-schema";
import type {
  ProjectBudgetLine,
  BudgetCategory,
  ProjectPhase,
  Supplier,
} from "@/types";

type FormValues = {
  category: string;
  subcategory: string;
  description?: string;
  estimated_amount: string;
  actual_amount: string;
  is_internal_cost: boolean;
  is_price_tbd?: boolean;
  tax_rate?: string;
  phase?: string | undefined;
  supplier_id?: string | undefined;
  notes?: string;
};

interface BudgetLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
  budgetLine?: ProjectBudgetLine | null;
}

const PROJECT_PHASES: ProjectPhase[] = [
  "diagnosis",
  "design",
  "executive",
  "budget",
  "construction",
  "delivery",
];

export function BudgetLineDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
  budgetLine,
}: BudgetLineDialogProps) {
  const t = useTranslations("DialogBudgetLine");
  const locale = useLocale() as Locale;
  const phaseLabel = usePhaseLabel();
  const categoryOptions = useCategoryOptions();
  const { user } = useAuth();
  const formSchema = buildBudgetLineFormSchema(t);
  const advancedCostLineOptionsEnabled = usePlanCapability("costs_management", {
    minModality: "plus",
  });
  const supabase = getSupabaseClient();
  const isEditing = !!budgetLine;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projectTaxRate, setProjectTaxRate] = useState(0);
  const [projectMultitax, setProjectMultitax] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [pendingSupplierId, setPendingSupplierId] = useState<string | null>(
    null
  );
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | "">(
    ""
  );
  const subcategoryOptions = useSubcategoryOptions(selectedCategory);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      category: "",
      subcategory: "",
      description: "",
      estimated_amount: "0",
      actual_amount: "0",
      is_internal_cost: false,
      is_price_tbd: false,
      tax_rate: "",
      phase: undefined,
      supplier_id: undefined,
      notes: "",
    },
  });

  const isPriceTbd = form.watch("is_price_tbd") === true;
  const lineTaxEditable = advancedCostLineOptionsEnabled && projectMultitax;

  useEffect(() => {
    async function loadProjectTax() {
      const { data } = await supabase
        .from("projects")
        .select("tax_rate, multitax")
        .eq("id", projectId)
        .single();
      const rate = Number(data?.tax_rate ?? 0);
      setProjectTaxRate(Number.isNaN(rate) ? 0 : rate);
      setProjectMultitax(data?.multitax === true);
    }
    if (open) void loadProjectTax();
  }, [open, projectId, supabase]);

  useEffect(() => {
    async function loadSuppliers() {
      const { data } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      setSuppliers(data || []);
    }
    if (open) void loadSuppliers();
  }, [open, supabase]);

  useEffect(() => {
    if (pendingSupplierId && suppliers.length > 0) {
      const supplierExists = suppliers.some((s) => s.id === pendingSupplierId);
      if (supplierExists) {
        form.setValue("supplier_id", pendingSupplierId, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setPendingSupplierId(null);
      }
    }
  }, [suppliers, pendingSupplierId, form]);

  const handleSupplierCreated = async (newSupplierId: string) => {
    const { data } = await supabase.from("suppliers").select("*").order("name");
    if (data) {
      setSuppliers(data);
      setPendingSupplierId(newSupplierId);
    }
    setIsSupplierDialogOpen(false);
  };

  // Reset form when dialog opens/closes or budgetLine changes
  useEffect(() => {
    if (open) {
      if (budgetLine) {
        const category = budgetLine.category as BudgetCategory;
        setSelectedCategory(category);
        form.reset({
          category: budgetLine.category,
          subcategory: budgetLine.subcategory,
          description: budgetLine.description || "",
          estimated_amount:
            budgetLine.is_price_tbd && !budgetLine.estimated_amount
              ? ""
              : budgetLine.estimated_amount.toString(),
          actual_amount:
            budgetLine.is_price_tbd && !budgetLine.actual_amount
              ? ""
              : budgetLine.actual_amount.toString(),
          is_internal_cost: budgetLine.is_internal_cost,
          is_price_tbd: budgetLine.is_price_tbd || false,
          tax_rate:
            budgetLine.tax_rate != null
              ? String(budgetLine.tax_rate)
              : projectTaxRate.toString(),
          phase: budgetLine.phase || undefined,
          supplier_id: budgetLine.supplier_id || undefined,
          notes: budgetLine.notes || "",
        });
      } else {
        setSelectedCategory("");
        form.reset({
          category: "",
          subcategory: "",
          description: "",
          estimated_amount: "0",
          actual_amount: "0",
          is_internal_cost: false,
          is_price_tbd: false,
          tax_rate: projectTaxRate.toString(),
          phase: undefined,
          supplier_id: undefined,
          notes: "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budgetLine, projectTaxRate]);

  // Update subcategory options when category changes
  const handleCategoryChange = (value: string) => {
    if (value && value !== "") {
      const category = value as BudgetCategory;
      setSelectedCategory(category);
      form.setValue("category", value);
      form.setValue("subcategory", ""); // Reset subcategory when category changes
      if (category === "own_fees") {
        // Honorarios: real = estimado (el real se rellena con el estimado)
        const estimated = form.getValues("estimated_amount");
        form.setValue("actual_amount", estimated);
      } else if (!isCostCategory(category)) {
        form.setValue("actual_amount", "0");
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema> | FormValues) => {
    try {
      if (!user?.id) {
        toast.error(t("toastUserError"));
        return;
      }

      const data = {
        project_id: projectId,
        category: values.category,
        subcategory: values.subcategory,
        description: values.description || null,
        estimated_amount: values.is_price_tbd
          ? 0
          : typeof values.estimated_amount === "string"
            ? parseFloat(values.estimated_amount) || 0
            : values.estimated_amount,
        actual_amount: values.is_price_tbd
          ? 0
          : values.category === "own_fees"
            ? typeof values.estimated_amount === "string"
              ? parseFloat(values.estimated_amount) || 0
              : values.estimated_amount
            : advancedCostLineOptionsEnabled
              ? typeof values.actual_amount === "string"
                ? parseFloat(values.actual_amount) || 0
                : values.actual_amount
              : 0,
        is_internal_cost: advancedCostLineOptionsEnabled
          ? values.is_internal_cost
          : false,
        is_price_tbd: values.is_price_tbd === true,
        tax_rate: lineTaxEditable
          ? typeof values.tax_rate === "number"
            ? values.tax_rate
            : projectTaxRate
          : projectTaxRate,
        phase: values.phase || null,
        supplier_id: values.supplier_id || null,
        notes: values.notes || null,
        user_id: user.id,
      };

      if (isEditing && budgetLine) {
        const { error } = await supabase
          .from("project_budget_lines")
          .update(data)
          .eq("id", budgetLine.id);

        if (error) {
          // Check if table doesn't exist
          if (
            error.code === "42P01" ||
            error.message?.includes("does not exist")
          ) {
            toast.error(t("toastTableMissing"));
          } else {
            toast.error(
              `${t("toastUpdateErrorPrefix")}${error.message || t("unknownError")}`
            );
          }
          reportError(error, "Error updating budget line:");
          return;
        }

        toast.success(t("toastUpdated"));
        onSuccess();
        onOpenChange(false);
      } else {
        const { error } = await supabase
          .from("project_budget_lines")
          .insert([data]);

        if (error) {
          // Check if table doesn't exist
          if (
            error.code === "42P01" ||
            error.message?.includes("does not exist")
          ) {
            toast.error(t("toastTableMissing"));
          } else {
            toast.error(
              `${t("toastCreateErrorPrefix")}${error.message || t("unknownError")}`
            );
          }
          reportError(error, "Error creating budget line:");
          return;
        }

        toast.success(t("toastCreated"));
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: unknown) {
      const demoMsg = getDemoAccountMessage(error, locale);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
        return;
      }
      reportError(error, "Unexpected error in onSubmit:");
      toast.error(
        `${t("toastUnexpectedErrorPrefix")}${getErrorMessage(error, locale)}`
      );
    }
  };

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("categoryLabel")}</FormLabel>
                    <Select
                      onValueChange={handleCategoryChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("categoryPlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>{t("subcategoryLabel")}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCategory}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("subcategoryPlaceholder")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subcategoryOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <div
              className={
                lineTaxEditable
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1.2fr)_minmax(0,0.7fr)]"
                  : "grid grid-cols-1 gap-4 sm:grid-cols-2"
              }
            >
              <FormField
                control={form.control}
                name="estimated_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("estimatedAmountLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={
                          isPriceTbd
                            ? t("priceTbdLabel")
                            : t("amountPlaceholder")
                        }
                        disabled={isPriceTbd}
                        {...field}
                        onChange={(e) => {
                          const v = e.target.value;
                          field.onChange(v);
                          if (selectedCategory === "own_fees" && !isPriceTbd) {
                            form.setValue("actual_amount", v);
                          }
                        }}
                      />
                    </FormControl>
                    {selectedCategory === "own_fees" && (
                      <p className="text-muted-foreground text-xs">
                        {t("feesHint")}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="actual_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("actualAmountLabel")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={
                          isPriceTbd
                            ? t("priceTbdLabel")
                            : t("amountPlaceholder")
                        }
                        {...field}
                        disabled={
                          isPriceTbd ||
                          !selectedCategory ||
                          !advancedCostLineOptionsEnabled ||
                          selectedCategory === "own_fees"
                        }
                      />
                    </FormControl>
                    {!advancedCostLineOptionsEnabled && (
                      <p className="text-muted-foreground text-xs">
                        <Link href="/pricing" className="underline">
                          {t("upgradePlan")}
                        </Link>{" "}
                        {t("upgradeCostsSuffix")}
                      </p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              {lineTaxEditable && (
                <FormField
                  control={form.control}
                  name="tax_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("taxLabel")}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder={t("taxPlaceholder")}
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="is_price_tbd"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value === true}
                      onCheckedChange={(checked) => {
                        field.onChange(checked === true);
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      {t("priceTbdLabel")}
                    </FormLabel>
                    <p className="text-muted-foreground text-xs">
                      {t("priceTbdDescription")}
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="phase"
                render={({ field }) => (
                  <FormItem className="sm:col-span-1">
                    <FormLabel className="flex items-center gap-1.5">
                      <span>{t("phaseLabel")}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              className="text-muted-foreground hover:text-foreground inline-flex items-center"
                              aria-label={t("phaseHelp")}
                            >
                              <CircleHelp className="h-3.5 w-3.5" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent
                            variant="tertiary"
                            className="max-w-56"
                          >
                            {t("phaseHelp")}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value || undefined)
                      }
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("phasePlaceholder")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_PHASES.map((phase) => (
                          <SelectItem key={phase} value={phase}>
                            {phaseLabel(phase)}
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
                name="supplier_id"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>{t("supplierLabel")}</FormLabel>
                    <div className="flex gap-2">
                      <div className="min-w-0 flex-1">
                        <Select
                          onValueChange={(value) =>
                            field.onChange(value || undefined)
                          }
                          value={field.value || undefined}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue
                                placeholder={t("supplierPlaceholder")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {suppliers.map((supplier) => (
                              <SelectItem key={supplier.id} value={supplier.id}>
                                {supplier.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsSupplierDialogOpen(true)}
                        title={t("addSupplier")}
                        aria-label={t("addSupplier")}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notesLabel")}</FormLabel>
                  <FormControl>
                    <Textarea placeholder={t("notesPlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_internal_cost"
              render={({ field }) => (
                <FormItem
                  className={`flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 ${
                    !advancedCostLineOptionsEnabled ? "opacity-60" : ""
                  }`}
                >
                  <FormControl>
                    <Checkbox
                      checked={
                        advancedCostLineOptionsEnabled ? field.value : false
                      }
                      onCheckedChange={(checked) =>
                        advancedCostLineOptionsEnabled &&
                        field.onChange(checked === true)
                      }
                      disabled={!advancedCostLineOptionsEnabled}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>{t("internalCostLabel")}</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      {t("internalCostDescription")}
                    </p>
                    {!advancedCostLineOptionsEnabled && (
                      <p className="text-muted-foreground mt-1 text-xs">
                        <Link href="/pricing" className="underline">
                          {t("upgradePlan")}
                        </Link>{" "}
                        {t("upgradeInternalCostsSuffix")}
                      </p>
                    )}
                  </div>
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

      <SupplierDialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
        supplier={null}
        onSuccess={async (supplierId) => {
          if (supplierId) await handleSupplierCreated(supplierId);
        }}
      />
    </Dialog>
  );
}
