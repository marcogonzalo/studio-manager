import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProfileDefaults } from "@/lib/use-profile-defaults";
import { Plus } from "lucide-react";
import Link from "next/link";
import type { Client, Project, ProjectStatus } from "@/types";
import { ClientDialog } from "@/components/dialogs/client-dialog";
import { CURRENCIES, getPlanErrorMessage } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente requerido"),
  status: z.enum(["active", "completed", "cancelled"]).default("active"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
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
  tax_rate: z
    .string()
    .optional()
    .refine((val) => {
      if (!val || val.trim() === "") return true;
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0;
    }, "El impuesto debe ser mayor o igual a 0"),
  currency: z.string().optional(),
});

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  project?: Project | null;
}

export function ProjectDialog({
  open,
  onOpenChange,
  onSuccess,
  project,
}: ProjectDialogProps) {
  const { user, effectivePlan } = useAuth();
  const profileDefaults = useProfileDefaults();
  const supabase = getSupabaseClient();
  const [clients, setClients] = useState<Client[]>([]);
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);
  const [showStatusConfirmation, setShowStatusConfirmation] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(
    null
  );
  const [pendingFormValues, setPendingFormValues] = useState<z.input<
    typeof formSchema
  > | null>(null);

  const isBasePlan = effectivePlan?.plan_code === "BASE";
  const currencyDisabled = isBasePlan;
  const taxRateDisabled = isBasePlan;
  const defaultCurrency = profileDefaults?.default_currency ?? "EUR";
  const defaultTaxRateStr =
    profileDefaults?.default_tax_rate != null
      ? profileDefaults.default_tax_rate.toString()
      : "";

  const form = useForm<z.input<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      client_id: "",
      status: "active",
      start_date: new Date().toISOString().split("T")[0],
      end_date: "",
      address: "",
      tax_rate: "",
      currency: "EUR",
    },
  });

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase
        .from("clients")
        .select("*")
        .order("full_name");
      setClients(data || []);
    }
    if (open) loadClients();
  }, [open, supabase]);

  // Sincronizar el valor del cliente cuando la lista se actualiza y hay un cliente pendiente
  useEffect(() => {
    if (pendingClientId && clients.length > 0) {
      const clientExists = clients.some((c) => c.id === pendingClientId);
      if (clientExists) {
        form.setValue("client_id", pendingClientId, {
          shouldValidate: true,
          shouldDirty: true,
        });
        setPendingClientId(null);
      }
    }
  }, [clients, pendingClientId, form]);

  // Sugerir la dirección del cliente cuando se selecciona un cliente y el campo está vacío
  const clientId = form.watch("client_id");
  useEffect(() => {
    if (clientId && clients.length > 0) {
      const currentAddress = form.getValues("address");
      // Solo sugerir si el campo de dirección está vacío
      if (!currentAddress || currentAddress.trim() === "") {
        const selectedClient = clients.find((c) => c.id === clientId);
        if (selectedClient && selectedClient.address) {
          form.setValue("address", selectedClient.address, {
            shouldDirty: false,
          });
        }
      }
    }
  }, [clientId, clients, form]);

  useEffect(() => {
    if (open && isBasePlan && profileDefaults) {
      form.setValue("currency", profileDefaults.default_currency ?? "EUR");
      form.setValue(
        "tax_rate",
        profileDefaults.default_tax_rate != null
          ? profileDefaults.default_tax_rate.toString()
          : ""
      );
    }
  }, [open, isBasePlan, profileDefaults, form]);

  useEffect(() => {
    if (project && open) {
      const startDate = project.start_date
        ? project.start_date.includes("T")
          ? project.start_date.split("T")[0]
          : project.start_date
        : new Date().toISOString().split("T")[0];

      const endDate = project.end_date
        ? project.end_date.includes("T")
          ? project.end_date.split("T")[0]
          : project.end_date
        : "";

      form.reset({
        name: project.name || "",
        description: project.description || "",
        client_id: project.client_id || "",
        status: project.status || "active",
        start_date: startDate,
        end_date: endDate,
        address: project.address || "",
        phase: project.phase || undefined,
        tax_rate:
          project.tax_rate !== null && project.tax_rate !== undefined
            ? project.tax_rate.toString()
            : "",
        currency: project.currency ?? "EUR",
      });
    } else if (!project && open) {
      if (!user?.id) {
        form.reset({
          name: "",
          description: "",
          client_id: "",
          status: "active",
          start_date: new Date().toISOString().split("T")[0],
          end_date: "",
          address: "",
          phase: undefined,
          tax_rate: "",
          currency: "EUR",
        });
        return;
      }
      void (async () => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("default_tax_rate, default_currency")
            .eq("id", user.id)
            .single();
          form.reset({
            name: "",
            description: "",
            client_id: "",
            status: "active",
            start_date: new Date().toISOString().split("T")[0],
            end_date: "",
            address: "",
            phase: undefined,
            tax_rate:
              data?.default_tax_rate != null
                ? data.default_tax_rate.toString()
                : "",
            currency: data?.default_currency ?? "EUR",
          });
        } catch {
          form.reset({
            name: "",
            description: "",
            client_id: "",
            status: "active",
            start_date: new Date().toISOString().split("T")[0],
            end_date: "",
            address: "",
            phase: undefined,
            tax_rate: "",
            currency: "EUR",
          });
        }
      })();
    }
  }, [project, open, form, user?.id, supabase]);

  async function onSubmit(values: z.input<typeof formSchema>) {
    // Check if status is changing to completed or cancelled and needs confirmation
    const isChangingToCompleted =
      project &&
      project.status !== "completed" &&
      values.status === "completed";
    const isChangingToCancelled =
      project &&
      project.status !== "cancelled" &&
      values.status === "cancelled";

    if (
      (isChangingToCompleted || isChangingToCancelled) &&
      !pendingFormValues
    ) {
      // Show confirmation dialog
      setPendingStatus(values.status as ProjectStatus);
      setPendingFormValues(values);
      setShowStatusConfirmation(true);
      return;
    }

    try {
      // Transform tax_rate from string to number
      const taxRateTransformed = values.tax_rate
        ? values.tax_rate.trim() === ""
          ? undefined
          : parseFloat(values.tax_rate)
        : undefined;

      // Handle tax_rate: if empty, use last value (if editing) or 0 (if new)
      let taxRateValue: number | null = null;
      if (
        taxRateTransformed !== undefined &&
        taxRateTransformed !== null &&
        !isNaN(taxRateTransformed)
      ) {
        taxRateValue = taxRateTransformed;
      } else {
        // If empty and editing, use last known value
        if (
          project &&
          project.tax_rate !== null &&
          project.tax_rate !== undefined
        ) {
          taxRateValue = project.tax_rate;
        } else {
          // If new or no previous value, use 0
          taxRateValue = 0;
        }
      }

      // Convert empty strings to null for optional fields to avoid overwriting existing data
      const updateData: Record<string, unknown> = {
        name: values.name,
        client_id: values.client_id,
        status: values.status || "active",
        end_date: values.end_date || null,
        tax_rate: taxRateValue,
        currency: values.currency ?? "EUR",
      };

      // Only include optional fields if they have values
      if (values.description && values.description.trim()) {
        updateData.description = values.description;
      } else {
        updateData.description = null;
      }

      if (values.address && values.address.trim()) {
        updateData.address = values.address;
      } else {
        updateData.address = null;
      }

      if (values.start_date && values.start_date.trim()) {
        updateData.start_date = values.start_date;
      } else {
        updateData.start_date = null;
      }

      if (values.phase) {
        updateData.phase = values.phase;
      } else {
        updateData.phase = null;
      }

      // Si el estado cambia a "completed", establecer la fecha efectiva de finalización
      if (values.status === "completed") {
        // Solo establecer completed_date si el proyecto no estaba completado antes
        // Si ya estaba completado, mantener la fecha existente
        if (!project || project.status !== "completed") {
          updateData.completed_date = new Date().toISOString().split("T")[0];
        }
        // Si ya estaba completado, no incluir completed_date en el update para mantener el valor existente
      } else {
        // Si el estado cambia de "completed" a otro, limpiar la fecha efectiva
        if (project && project.status === "completed") {
          updateData.completed_date = null;
        }
      }

      if (project) {
        const { error } = await supabase
          .from("projects")
          .update(updateData)
          .eq("id", project.id);

        if (error) throw error;

        toast.success("Proyecto actualizado");
      } else {
        const { error } = await supabase.from("projects").insert([
          {
            ...updateData,
            user_id: user?.id,
          },
        ]);

        if (error) throw error;

        toast.success("Proyecto creado");
        form.reset();
      }

      // Reset pending state
      setPendingFormValues(null);
      setPendingStatus(null);

      onSuccess();
    } catch (error: unknown) {
      const planError = getPlanErrorMessage(error);
      if (planError) {
        toast.error(`${planError.title}. ${planError.description}`, {
          duration: 5000,
        });
        return;
      }
      const errorMessage =
        error instanceof Error
          ? error.message
          : project
            ? "Error al actualizar proyecto"
            : "Error al crear proyecto";
      toast.error(errorMessage);
    }
  }

  function handleConfirmStatusChange() {
    setShowStatusConfirmation(false);
    if (pendingFormValues) {
      void onSubmit(pendingFormValues);
    }
  }

  function handleCancelStatusChange() {
    setShowStatusConfirmation(false);
    setPendingFormValues(null);
    setPendingStatus(null);
  }

  return (
    <>
      <AlertDialog
        open={showStatusConfirmation}
        onOpenChange={setShowStatusConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingStatus === "completed"
                ? "Marcar proyecto como completado"
                : "Cancelar proyecto"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingStatus === "completed" ? (
                <>
                  Vas a marcar el proyecto como completado y pasará a modo de
                  solo lectura. Asegúrate de que has registrado todos los
                  cambios antes para garantizar que tu proyecto ha quedado a
                  punto por si necesitas consultarlo en el futuro.
                </>
              ) : (
                <>
                  Vas a cancelar un proyecto. Esta acción es irreversible y hará
                  que el proyecto pase a modo lectura y no podrás editarlo. ¿Es
                  lo que quieres hacer?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelStatusChange}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmStatusChange}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{project ? "Editar" : "Nuevo"} Proyecto</DialogTitle>
            <DialogDescription>
              {project
                ? "Edita la información del proyecto."
                : "Crea un nuevo proyecto de diseño."}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Primera línea: Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nombre del Proyecto</FormLabel>
                    <FormControl>
                      <Input placeholder="Reforma Sala Principal" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Segunda línea: Cliente */}
              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Cliente</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Selecciona un cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients.map((client) => (
                            <SelectItem key={client.id} value={client.id}>
                              {client.full_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsClientDialogOpen(true)}
                        title="Agregar nuevo cliente"
                        aria-label="Agregar nuevo cliente"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tercera línea: Dirección */}
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección</FormLabel>
                    <FormControl>
                      <Input placeholder="Dirección del proyecto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cuarta línea: Descripción */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descripción</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Detalles del proyecto..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quinta línea: Fase y Estado */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phase"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fase del Proyecto</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una fase" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="diagnosis">
                            1. Diagnóstico
                          </SelectItem>
                          <SelectItem value="design">2. Diseño</SelectItem>
                          <SelectItem value="executive">
                            3. Proyecto Ejecutivo
                          </SelectItem>
                          <SelectItem value="budget">
                            4. Presupuestos
                          </SelectItem>
                          <SelectItem value="construction">5. Obra</SelectItem>
                          <SelectItem value="delivery">6. Entrega</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Activo</SelectItem>
                          <SelectItem value="completed">Completado</SelectItem>
                          <SelectItem value="cancelled">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Quinta línea: Fechas */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Inicio</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha Estimada de Entrega</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Moneda e Impuesto (deshabilitados en plan BASE: solo perfil) */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Moneda</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={
                          currencyDisabled
                            ? defaultCurrency
                            : (field.value ?? "EUR")
                        }
                        disabled={currencyDisabled}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Moneda" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(CURRENCIES)
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([code, label]) => (
                              <SelectItem key={code} value={code}>
                                {label}
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
                  name="tax_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impuesto (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Ej: 21"
                          {...field}
                          value={
                            taxRateDisabled
                              ? defaultTaxRateStr
                              : field.value || ""
                          }
                          disabled={taxRateDisabled}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {(currencyDisabled || taxRateDisabled) && (
                  <p className="text-muted-foreground col-span-2 text-xs">
                    Moneda e impuesto definidos por tu perfil.{" "}
                    <Link href="/pricing" className="underline">
                      Mejora tu plan
                    </Link>{" "}
                    para definirlos por proyecto.
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button type="submit">
                  {project ? "Guardar Cambios" : "Crear Proyecto"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>

        <ClientDialog
          open={isClientDialogOpen}
          onOpenChange={setIsClientDialogOpen}
          client={null}
          onSuccess={async (clientId) => {
            if (clientId) {
              // Recargar la lista de clientes y seleccionar el nuevo
              const { data } = await supabase
                .from("clients")
                .select("*")
                .order("full_name");
              if (data) {
                setClients(data);
                setPendingClientId(clientId);
              }
              setIsClientDialogOpen(false);
              // La creación ya se confirma con un toast en ClientDialog
            }
          }}
        />
      </Dialog>
    </>
  );
}
