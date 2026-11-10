"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import type { Locale } from "@/i18n/config";
import { getSupabaseClient } from "@/lib/supabase";
import { useAuth } from "@/components/auth-provider";
import { useProfileDefaults } from "@/lib/use-profile-defaults";
import { usePlanCapability } from "@/lib/use-plan-capability";
import { trackUserEvent } from "@/app/actions/track-event";
import { appPath } from "@/lib/app-paths";
import {
  getErrorMessage,
  getProjectLimitMessage,
  isPlanLimitExceeded,
  reportError,
} from "@/lib/utils";
import { isAtActiveProjectLimit } from "@/lib/plan-limit-ux";
import type { Client } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ClientDialog } from "@/components/dialogs/client-dialog";
import { ImportFlow } from "@/modules/app/projects/budget-import/import-flow";
import { ChevronDown } from "lucide-react";

function buildWizardSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    name: z.string().min(2, t("validationNameRequired")),
    description: z.string().optional(),
    address: z.string().optional(),
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
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    tax_rate: z
      .string()
      .min(1, t("validationTaxRequired"))
      .refine((val) => {
        const num = parseFloat(val);
        return !Number.isNaN(num) && num >= 0;
      }, t("validationTaxNonNegative")),
    currency: z.string().min(1, t("validationCurrencyRequired")),
    multitax: z.boolean().optional(),
    client_id: z.string().optional(),
  });
}

type Step = 1 | 2 | 3 | 4;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onPlanLimitExceeded?: () => void;
};

export function ProjectCreateWizard({
  open,
  onOpenChange,
  onSuccess,
  onPlanLimitExceeded,
}: Props) {
  const t = useTranslations("DialogProject");
  const tBudget = useTranslations("ProjectModuleBudget");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const supabase = getSupabaseClient();
  const { user, effectivePlan } = useAuth();
  const profileDefaults = useProfileDefaults();
  const multitaxEnabled = usePlanCapability("costs_management", {
    minModality: "plus",
  });

  const schema = useMemo(() => buildWizardSchema(t), [t]);
  const form = useForm<z.input<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      phase: "diagnosis",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      tax_rate: "",
      currency: "EUR",
      multitax: false,
      client_id: "",
    },
  });

  const [step, setStep] = useState<Step>(1);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [importCounts, setImportCounts] = useState<{
    created: number;
    skipped: number;
  } | null>(null);
  const [optionalOpen, setOptionalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep(1);
    setProjectId(null);
    setImportCounts(null);
    const currency = profileDefaults?.default_currency ?? "EUR";
    const tax =
      profileDefaults?.default_tax_rate != null
        ? String(profileDefaults.default_tax_rate)
        : "21";
    form.reset({
      name: "",
      description: "",
      address: "",
      phase: "diagnosis",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      tax_rate: tax,
      currency,
      multitax: false,
      client_id: "",
    });
  }, [open, form, profileDefaults]);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("full_name");
      setClients(data ?? []);
    })();
  }, [open, supabase]);

  const createProject = async (values: z.input<typeof schema>) => {
    if (!user) return;
    setSaving(true);
    try {
      const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("status", "active");
      if (isAtActiveProjectLimit(count ?? 0, effectivePlan?.config)) {
        const projectLimit = getProjectLimitMessage(locale);
        toast.error(`${projectLimit.title}. ${projectLimit.description}`, {
          duration: 8000,
        });
        onPlanLimitExceeded?.();
        return;
      }
      const { data, error } = await supabase
        .from("projects")
        .insert([
          {
            name: values.name,
            description: values.description || null,
            address: values.address || null,
            phase: values.phase || "diagnosis",
            start_date: values.start_date || null,
            end_date: values.end_date || null,
            status: "active",
            currency: values.currency,
            tax_rate: parseFloat(values.tax_rate),
            multitax: multitaxEnabled ? values.multitax === true : false,
            client_id: values.client_id || null,
            user_id: user.id,
          },
        ])
        .select("id")
        .single();
      if (error) {
        if (isPlanLimitExceeded(error)) {
          const projectLimit = getProjectLimitMessage(locale);
          toast.error(`${projectLimit.title}. ${projectLimit.description}`, {
            duration: 8000,
          });
          onPlanLimitExceeded?.();
          return;
        }
        throw error;
      }
      setProjectId(data.id);
      void trackUserEvent("project_created", {
        project_id: data.id,
        source: "wizard",
      });
      if (values.client_id) {
        void trackUserEvent("project_client_assigned", {
          project_id: data.id,
          client_id: values.client_id,
        });
      }
      setStep(2);
    } catch (err) {
      reportError(err, "ProjectCreateWizard create");
      toast.error(getErrorMessage(err, locale));
    } finally {
      setSaving(false);
    }
  };

  const assignClient = async () => {
    if (!projectId) return;
    const clientId = form.getValues("client_id");
    if (clientId) {
      await supabase
        .from("projects")
        .update({ client_id: clientId })
        .eq("id", projectId);
      void trackUserEvent("project_client_assigned", {
        project_id: projectId,
        client_id: clientId,
      });
    }
    setStep(3);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("titleNew")} · {step}/4
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            {step === 1 && (
              <form
                className="space-y-4"
                onSubmit={form.handleSubmit(
                  (values) => void createProject(values)
                )}
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("nameLabel")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("currencyLabel")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="EUR">EUR</SelectItem>
                            <SelectItem value="USD">USD</SelectItem>
                            <SelectItem value="GBP">GBP</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tax_rate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("taxLabel")}</FormLabel>
                        <FormControl>
                          <Input {...field} inputMode="decimal" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="multitax"
                  render={({ field }) => (
                    <FormItem
                      className={`flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4 ${
                        !multitaxEnabled ? "opacity-60" : ""
                      }`}
                    >
                      <FormControl>
                        <Checkbox
                          checked={
                            multitaxEnabled ? field.value === true : false
                          }
                          onCheckedChange={(checked) => {
                            if (!multitaxEnabled) return;
                            field.onChange(checked === true);
                          }}
                          disabled={!multitaxEnabled}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="cursor-pointer">
                          {t("multitaxLabel")}
                        </FormLabel>
                        <FormDescription>
                          {multitaxEnabled
                            ? t("multitaxDescription")
                            : t("multitaxUpgradeHint")}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Collapsible open={optionalOpen} onOpenChange={setOptionalOpen}>
                  <CollapsibleTrigger asChild>
                    <Button type="button" variant="ghost" className="px-0">
                      {t("optionalDetails")}
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 pt-2">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("addressLabel")}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
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
                            <Textarea {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </CollapsibleContent>
                </Collapsible>

                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                  >
                    {t("cancel")}
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {t("next")}
                  </Button>
                </div>
              </form>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="client_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("clientLabel")}</FormLabel>
                      <Select
                        value={field.value || undefined}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t("clientPlaceholder")} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsClientDialogOpen(true)}
                >
                  {t("createClient")}
                </Button>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(3)}
                  >
                    {t("skip")}
                  </Button>
                  <Button type="button" onClick={() => void assignClient()}>
                    {t("next")}
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && projectId && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-sm">
                  {tBudget("importFromFile")}
                </p>
                <ImportFlow
                  projectId={projectId}
                  spaces={[]}
                  suppliers={[]}
                  taxAppliesToProject={
                    multitaxEnabled && form.getValues("multitax") === true
                  }
                  onDone={(counts) => {
                    setImportCounts({
                      created: counts.created,
                      skipped: counts.skipped,
                    });
                    setStep(4);
                  }}
                  onCancel={() => setStep(4)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep(4)}
                >
                  {t("skip")}
                </Button>
              </div>
            )}

            {step === 4 && projectId && (
              <div className="space-y-4">
                <p className="text-sm">
                  {form.getValues("name")}
                  {importCounts
                    ? ` · ${tBudget("importSuccess", {
                        created: importCounts.created,
                        skipped: importCounts.skipped,
                      })}`
                    : ""}
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onSuccess();
                      router.push(appPath(`/projects/${projectId}`));
                    }}
                  >
                    {t("goToProject")}
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </DialogContent>
      </Dialog>

      <ClientDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        client={null}
        onSuccess={(clientId) => {
          if (clientId) {
            form.setValue("client_id", clientId);
            void (async () => {
              const { data } = await supabase
                .from("clients")
                .select("*")
                .order("full_name");
              setClients(data ?? []);
            })();
          }
          setIsClientDialogOpen(false);
        }}
      />
    </>
  );
}
