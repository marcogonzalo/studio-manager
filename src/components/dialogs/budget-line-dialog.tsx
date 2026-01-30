import { useEffect, useState } from "react";
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
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import {
  getCategoryOptions,
  getSubcategoryOptions,
  getPhaseLabel,
  getErrorMessage,
  isCostCategory,
} from "@/lib/utils";
import type {
  ProjectBudgetLine,
  BudgetCategory,
  ProjectPhase,
  Supplier,
} from "@/types";

const formSchema = z.object({
  category: z.string().min(1, "Categoría requerida"),
  subcategory: z.string().min(1, "Subcategoría requerida"),
  description: z.string().optional(),
  estimated_amount: z.string().transform((v) => parseFloat(v) || 0),
  actual_amount: z.string().transform((v) => parseFloat(v) || 0),
  is_internal_cost: z.boolean().default(false),
  phase: z.string().optional(),
  supplier_id: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = {
  category: string;
  subcategory: string;
  description?: string;
  estimated_amount: string;
  actual_amount: string;
  is_internal_cost: boolean;
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
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const isEditing = !!budgetLine;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BudgetCategory | "">(
    ""
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      category: "",
      subcategory: "",
      description: "",
      estimated_amount: "0",
      actual_amount: "0",
      is_internal_cost: false,
      phase: undefined,
      supplier_id: undefined,
      notes: "",
    },
  });

  // Fetch suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      const { data } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      if (data) setSuppliers(data);
    };
    fetchSuppliers();
  }, []);

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
          estimated_amount: budgetLine.estimated_amount.toString(),
          actual_amount: budgetLine.actual_amount.toString(),
          is_internal_cost: budgetLine.is_internal_cost,
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
          phase: undefined,
          supplier_id: undefined,
          notes: "",
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, budgetLine]);

  // Update subcategory options when category changes
  const handleCategoryChange = (value: string) => {
    if (value && value !== "") {
      const category = value as BudgetCategory;
      setSelectedCategory(category);
      form.setValue("category", value);
      form.setValue("subcategory", ""); // Reset subcategory when category changes
      // Reset actual_amount to 0 if the category is not a cost category (e.g., own_fees)
      if (!isCostCategory(category)) {
        form.setValue("actual_amount", "0");
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema> | FormValues) => {
    try {
      if (!user?.id) {
        toast.error("No se pudo identificar el usuario");
        return;
      }

      const data = {
        project_id: projectId,
        category: values.category,
        subcategory: values.subcategory,
        description: values.description || null,
        estimated_amount:
          typeof values.estimated_amount === "string"
            ? parseFloat(values.estimated_amount) || 0
            : values.estimated_amount,
        actual_amount:
          typeof values.actual_amount === "string"
            ? parseFloat(values.actual_amount) || 0
            : values.actual_amount,
        is_internal_cost: values.is_internal_cost,
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
            toast.error(
              "La tabla project_budget_lines no existe. Por favor, ejecuta las migraciones primero."
            );
          } else {
            toast.error(
              "Error al actualizar la partida: " +
                (error.message || "Error desconocido")
            );
          }
          console.error("Error updating budget line:", error);
          return;
        }

        toast.success("Partida actualizada");
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
            toast.error(
              "La tabla project_budget_lines no existe. Por favor, ejecuta las migraciones primero."
            );
          } else {
            toast.error(
              "Error al crear la partida: " +
                (error.message || "Error desconocido")
            );
          }
          console.error("Error creating budget line:", error);
          return;
        }

        toast.success("Partida añadida");
        onSuccess();
        onOpenChange(false);
      }
    } catch (error: unknown) {
      console.error("Unexpected error in onSubmit:", error);
      toast.error("Error inesperado: " + getErrorMessage(error));
    }
  };

  let categoryOptions: { value: BudgetCategory; label: string }[] = [];
  let subcategoryOptions: { value: string; label: string }[] = [];

  try {
    categoryOptions = getCategoryOptions();
    if (selectedCategory) {
      subcategoryOptions = getSubcategoryOptions(selectedCategory);
    }
  } catch (error) {
    console.error("Error getting category options:", error);
    // Fallback to empty arrays
  }

  if (!open) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Partida" : "Nueva Partida"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Categoría</FormLabel>
                    <Select
                      onValueChange={handleCategoryChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
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
                    <FormLabel required>Subcategoría</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!selectedCategory}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar subcategoría" />
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
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción detallada de la partida"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div
              className={`grid gap-4 ${selectedCategory && isCostCategory(selectedCategory) ? "grid-cols-2" : "grid-cols-1"}`}
            >
              <FormField
                control={form.control}
                name="estimated_amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Importe Estimado</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {selectedCategory && isCostCategory(selectedCategory) ? (
                <FormField
                  control={form.control}
                  name="actual_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Importe Real</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : selectedCategory === "own_fees" ? (
                <div className="flex items-center">
                  <p className="text-muted-foreground text-sm">
                    Los honorarios son ingresos y no requieren importe real de
                    coste.
                  </p>
                </div>
              ) : null}
            </div>

            <FormField
              control={form.control}
              name="is_internal_cost"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-y-0 space-x-3 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) =>
                        field.onChange(checked === true)
                      }
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Coste interno</FormLabel>
                    <p className="text-muted-foreground text-sm">
                      Si está marcado, esta partida NO aparecerá en el
                      presupuesto del cliente ni en el PDF
                    </p>
                  </div>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phase"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fase (opcional)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value || undefined)
                      }
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar fase" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PROJECT_PHASES.map((phase) => (
                          <SelectItem key={phase} value={phase}>
                            {getPhaseLabel(phase)}
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
                  <FormItem>
                    <FormLabel>Proveedor (opcional)</FormLabel>
                    <Select
                      onValueChange={(value) =>
                        field.onChange(value || undefined)
                      }
                      value={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar proveedor" />
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
                  <FormLabel>Notas (opcional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Notas adicionales..." {...field} />
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
                Cancelar
              </Button>
              <Button type="submit">
                {isEditing ? "Actualizar" : "Añadir"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
