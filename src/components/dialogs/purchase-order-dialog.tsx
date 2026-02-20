import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
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
import { reportError } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Search } from "lucide-react";
import type { Supplier } from "@/types";

const formSchema = z.object({
  supplier_id: z.string().min(1, "Proveedor requerido"),
  order_number: z.string().min(1, "Número de orden requerido"),
  order_date: z.string().min(1, "Fecha requerida"),
  status: z.string().min(1, "Estado requerido"),
  notes: z.string().optional(),
  delivery_deadline: z.string().optional(),
  delivery_date: z.string().optional(),
});

interface ProjectItem {
  id: string;
  name: string;
  quantity: number;
  unit_cost: number;
  status: string;
  purchase_order_id: string | null;
  is_excluded?: boolean;
  product?: { supplier_id: string | null; supplier?: Supplier };
}

interface PurchaseOrder {
  id: string;
  supplier_id: string;
  order_number: string;
  order_date: string;
  status: string;
  notes: string | null;
  delivery_deadline?: string | null;
  delivery_date?: string | null;
  project_items?: { id: string }[];
}

interface PurchaseOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
  order?: PurchaseOrder | null;
}

const STATUS_OPTIONS = [
  { value: "draft", label: "Borrador" },
  { value: "sent", label: "Enviada" },
  { value: "confirmed", label: "Confirmada" },
  { value: "received", label: "Recibida" },
  { value: "cancelled", label: "Cancelada" },
];

const DELIVERY_DEADLINE_OPTIONS = [
  { value: "1w", label: "1 semana" },
  { value: "2w", label: "2 semanas" },
  { value: "3w", label: "3 semanas" },
  { value: "4w", label: "4 semanas" },
  { value: "6w", label: "6 semanas" },
  { value: "tbd", label: "A convenir" },
];

const PREDEFINED_DEADLINE_VALUES = new Set(
  DELIVERY_DEADLINE_OPTIONS.map((o) => o.value)
);

/** Item status from PO status: draft/sent → pending, confirmed → ordered, received → received. */
function getItemStatusForPO(poStatus: string): string {
  const s = poStatus?.toLowerCase();
  if (s === "confirmed") return "ordered";
  if (s === "received") return "received";
  return "pending"; // draft, sent
}

export function PurchaseOrderDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
  order,
}: PurchaseOrderDialogProps) {
  const { user } = useAuth();
  const isEditing = !!order;
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [availableItems, setAvailableItems] = useState<ProjectItem[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(
    new Set()
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingItems, setLoadingItems] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      supplier_id: "",
      order_number: "",
      order_date: new Date().toISOString().split("T")[0],
      status: "draft",
      notes: "",
      delivery_deadline: "",
      delivery_date: "",
    },
  });

  const supabase = getSupabaseClient();
  const selectedSupplierId = form.watch("supplier_id");

  // Define fetchAvailableItems before using it in useEffect
  const fetchAvailableItems = useCallback(
    async (supplierId: string) => {
      if (!supplierId) return;

      setLoadingItems(true);
      try {
        // Get all project items that:
        // 1. Don't have a purchase_order_id (or are in the current order if editing)
        // 2. Have a purchase_order_id but the order is cancelled (items from cancelled orders should be available)
        // 3. Have a product with this supplier_id OR are pending and can be assigned
        const orderId = order?.id;

        // Get all items for this project
        const { data: allProjectItems, error: itemsError } = await supabase
          .from("project_items")
          .select("*, product:products(supplier_id)")
          .eq("project_id", projectId);

        if (itemsError) {
          reportError(itemsError, "Error fetching items:");
          toast.error("Error al cargar los ítems", { id: "po-items-load" });
          setAvailableItems([]);
          setLoadingItems(false);
          return;
        }

        if (!allProjectItems) {
          setAvailableItems([]);
          setLoadingItems(false);
          return;
        }

        // Get cancelled order IDs
        const { data: cancelledOrders } = await supabase
          .from("purchase_orders")
          .select("id")
          .eq("project_id", projectId)
          .eq("status", "cancelled");

        const cancelledOrderIds = new Set(
          cancelledOrders?.map((po: { id: string }) => po.id) || []
        );

        // Filter items:
        // - Items without purchase_order_id
        // - Items in the current order (if editing)
        // - Items from cancelled orders (they should be available again)
        // - Items that match the supplier
        // - Exclude items marked as excluded (is_excluded === true)
        const filtered = allProjectItems.filter((item: ProjectItem) => {
          // Exclude products marked as excluded
          if (item.is_excluded) {
            return false;
          }

          const itemSupplierId = item.product?.supplier_id;
          const isFromCancelledOrder =
            item.purchase_order_id &&
            cancelledOrderIds.has(item.purchase_order_id);
          const isInCurrentOrder = item.purchase_order_id === orderId;
          const hasNoOrder = !item.purchase_order_id;

          // Include if: matches supplier AND (no order OR in current order OR from cancelled order)
          const isAvailable =
            (itemSupplierId === supplierId ||
              (!itemSupplierId &&
                (item.status === "pending" || isFromCancelledOrder))) &&
            (hasNoOrder || isInCurrentOrder || isFromCancelledOrder);

          return isAvailable;
        });

        setAvailableItems(filtered);

        // If editing, ensure items already in the order are selected
        if (
          isEditing &&
          order?.project_items &&
          order.project_items.length > 0
        ) {
          const existingIds = new Set(
            order.project_items.map((item: { id: string }) => item.id)
          );
          setSelectedItemIds((prev) => {
            const newSet = new Set(prev);
            filtered.forEach((item: ProjectItem) => {
              if (existingIds.has(item.id)) {
                newSet.add(item.id);
              }
            });
            return newSet;
          });
        }
      } catch (error) {
        reportError(error, "Error in fetchAvailableItems:");
        toast.error("Error al cargar los ítems", { id: "po-items-load" });
        setAvailableItems([]);
      } finally {
        setLoadingItems(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps -- order.project_items excluded to avoid refetch on every order change
    [projectId, isEditing, order?.id, supabase]
  );

  // Fetch suppliers that have products in the project budget
  useEffect(() => {
    if (open && projectId) {
      // Get all project items with their products and suppliers
      supabase
        .from("project_items")
        .select("product:products(supplier_id, supplier:suppliers(*))")
        .eq("project_id", projectId)
        .then(
          async (res: {
            data: Array<{ product?: { supplier?: Supplier } }> | null;
            error: unknown;
          }) => {
            const { data: items, error } = res;
            if (error) {
              reportError(error, "Error fetching project items:");
              setSuppliers([]);
              return;
            }

            // Extract unique suppliers from project items
            const supplierMap = new Map<string, Supplier>();

            items?.forEach((item) => {
              const supplier = item.product?.supplier;
              if (supplier && supplier.id) {
                supplierMap.set(supplier.id, supplier);
              }
            });

            // If editing, also include the supplier from the current order
            // (in case they no longer have items in the budget)
            if (isEditing && order?.supplier_id) {
              const { data: currentSupplier } = await supabase
                .from("suppliers")
                .select("*")
                .eq("id", order.supplier_id)
                .single();

              if (currentSupplier && !supplierMap.has(currentSupplier.id)) {
                supplierMap.set(currentSupplier.id, currentSupplier);
              }
            }

            // Convert map to array and sort by name
            const uniqueSuppliers = Array.from(supplierMap.values()).sort(
              (a, b) => a.name.localeCompare(b.name)
            );

            setSuppliers(uniqueSuppliers);
          }
        );
    }
  }, [open, projectId, isEditing, order?.supplier_id, supabase]);

  // Reset form and load data when dialog opens
  useEffect(() => {
    if (!open) {
      // Reset everything when dialog closes
      setAvailableItems([]);
      setSelectedItemIds(new Set());
      setSearchQuery("");
      return;
    }

    try {
      if (order) {
        // Format date properly (handle both date strings and Date objects)
        const orderDate = order.order_date
          ? typeof order.order_date === "string"
            ? order.order_date.split("T")[0]
            : new Date(order.order_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];

        const formValues = {
          supplier_id: order.supplier_id || "",
          order_number: order.order_number || "",
          order_date: orderDate,
          status: order.status || "draft",
          notes: order.notes || "",
          delivery_deadline: order.delivery_deadline || "",
          delivery_date: order.delivery_date
            ? typeof order.delivery_date === "string"
              ? order.delivery_date.split("T")[0]
              : new Date(order.delivery_date).toISOString().split("T")[0]
            : "",
        };

        form.reset(formValues);

        // Load items already in this order
        if (order.project_items && order.project_items.length > 0) {
          const itemIds = order.project_items.map((item) => item.id);
          setSelectedItemIds(new Set(itemIds));
        } else {
          setSelectedItemIds(new Set());
        }
      } else {
        form.reset({
          supplier_id: "",
          order_number: `PO-${Date.now()}`,
          order_date: new Date().toISOString().split("T")[0],
          status: "draft",
          notes: "",
        });
        setSelectedItemIds(new Set());
        setAvailableItems([]);
      }
      setSearchQuery("");
    } catch (error) {
      reportError(error, "Error resetting form:");
      toast.error("Error al cargar los datos de la orden", {
        id: "po-form-load",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order?.id]);

  // Fetch available items when supplier changes or when editing
  useEffect(() => {
    if (!open) return;

    if (selectedSupplierId) {
      // Small delay to ensure form is reset
      const timer = setTimeout(() => {
        fetchAvailableItems(selectedSupplierId);
      }, 100);
      return () => clearTimeout(timer);
    } else if (order?.supplier_id && !selectedSupplierId) {
      // If editing and we have supplier_id from order but form hasn't updated yet
      const timer = setTimeout(() => {
        if (order?.supplier_id) {
          fetchAvailableItems(order.supplier_id);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else if (!order) {
      // Only clear if not editing
      setAvailableItems([]);
      setSelectedItemIds(new Set());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- order intentionally excluded to avoid reset loops
  }, [
    open,
    selectedSupplierId,
    fetchAvailableItems,
    order?.supplier_id,
    order?.id,
  ]);

  const toggleItemSelection = React.useCallback((itemId: string) => {
    setSelectedItemIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const filteredItems = availableItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Early return if critical props are missing
  if (!projectId) {
    reportError(new Error("PurchaseOrderDialog: projectId is required"));
    return null;
  }

  // Prevent editing cancelled orders
  if (isEditing && order?.status === "cancelled") {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Orden Cancelada</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-muted-foreground mb-4">
              Esta orden de compra está cancelada y no puede ser editada.
            </p>
            <Button onClick={() => onOpenChange(false)} className="w-full">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast.error("No se pudo identificar el usuario");
      return;
    }

    if (selectedItemIds.size === 0) {
      toast.error("Debe seleccionar al menos un ítem para la orden");
      return;
    }

    // Prevent editing cancelled orders
    if (isEditing && order?.status === "cancelled") {
      toast.error("No se puede editar una orden cancelada");
      return;
    }

    try {
      if (isEditing && order) {
        const wasCancelled = order.status === "cancelled";
        const isNowCancelled = values.status === "cancelled";
        const wasNotCancelled = order.status !== "cancelled";

        // Update existing order
        const { error: updateError } = await supabase
          .from("purchase_orders")
          .update({
            supplier_id: values.supplier_id,
            order_number: values.order_number,
            order_date: values.order_date,
            status: values.status,
            notes: values.notes || null,
            delivery_deadline: values.delivery_deadline || null,
            delivery_date: values.delivery_date || null,
          })
          .eq("id", order.id);

        if (updateError) throw updateError;

        // Get current items in this order
        const { data: currentItems } = await supabase
          .from("project_items")
          .select("id")
          .eq("purchase_order_id", order.id);

        const currentItemIds = new Set(
          (currentItems || []).map((item: { id: string }) => item.id)
        );
        const newItemIds = selectedItemIds;

        // If order is being cancelled, handle item status updates
        if (isNowCancelled && wasNotCancelled) {
          // Get all non-cancelled orders (excluding this one)
          const { data: activeOrders } = await supabase
            .from("purchase_orders")
            .select("id")
            .eq("project_id", projectId)
            .neq("id", order.id)
            .neq("status", "cancelled");

          const activeOrderIds =
            activeOrders?.map((po: { id: string }) => po.id) || [];

          // For each item in this order, check if it's in another non-cancelled order
          for (const itemId of currentItemIds) {
            let hasOtherActiveOrder = false;

            if (activeOrderIds.length > 0) {
              // Check if this item is in any active order
              const { data: itemInOtherOrder, error: checkError } =
                await supabase
                  .from("project_items")
                  .select("id")
                  .eq("id", itemId)
                  .in("purchase_order_id", activeOrderIds)
                  .limit(1)
                  .maybeSingle();

              hasOtherActiveOrder = !checkError && !!itemInOtherOrder;
            }

            if (!hasOtherActiveOrder) {
              // No other active order, set to pending
              await supabase
                .from("project_items")
                .update({ status: "pending" })
                .eq("id", itemId);
            }
          }
        } else if (!isNowCancelled && wasCancelled) {
          // Order is being reactivated, set items to status derived from PO status
          await supabase
            .from("project_items")
            .update({ status: getItemStatusForPO(values.status) })
            .in("id", Array.from(currentItemIds));
        }

        // Remove items no longer selected
        const toRemove = (Array.from(currentItemIds) as string[]).filter(
          (id) => !newItemIds.has(id)
        );
        if (toRemove.length > 0) {
          // Get all non-cancelled orders (excluding this one)
          const { data: activeOrders } = await supabase
            .from("purchase_orders")
            .select("id")
            .eq("project_id", projectId)
            .neq("id", order.id)
            .neq("status", "cancelled");

          const activeOrderIds =
            activeOrders?.map((po: { id: string }) => po.id) || [];

          // Check if items are in other non-cancelled orders before setting to pending
          for (const itemId of toRemove) {
            let hasOtherActiveOrder = false;

            if (activeOrderIds.length > 0) {
              const { data: itemInOtherOrder, error: checkError } =
                await supabase
                  .from("project_items")
                  .select("id")
                  .eq("id", itemId)
                  .in("purchase_order_id", activeOrderIds)
                  .limit(1)
                  .maybeSingle();

              hasOtherActiveOrder = !checkError && !!itemInOtherOrder;
            }

            if (!hasOtherActiveOrder) {
              await supabase
                .from("project_items")
                .update({ purchase_order_id: null, status: "pending" })
                .eq("id", itemId);
            } else {
              // Just unlink from this order, keep status as ordered
              await supabase
                .from("project_items")
                .update({ purchase_order_id: null })
                .eq("id", itemId);
            }
          }
        }

        // Add newly selected items
        const toAdd = Array.from(newItemIds).filter(
          (id) => !currentItemIds.has(id)
        );
        if (toAdd.length > 0) {
          await supabase
            .from("project_items")
            .update({
              purchase_order_id: order.id,
              status: isNowCancelled
                ? "pending"
                : getItemStatusForPO(values.status),
            })
            .in("id", toAdd);
        }

        // Sync status of all items in this order to PO status (draft/sent → pending, confirmed → ordered, received → received)
        if (!isNowCancelled) {
          await supabase
            .from("project_items")
            .update({ status: getItemStatusForPO(values.status) })
            .eq("purchase_order_id", order.id);
        }

        toast.success("Orden de compra actualizada");
      } else {
        // Create new order
        const { data: newOrder, error: createError } = await supabase
          .from("purchase_orders")
          .insert([
            {
              project_id: projectId,
              supplier_id: values.supplier_id,
              order_number: values.order_number,
              order_date: values.order_date,
              status: values.status,
              notes: values.notes || null,
              delivery_deadline: values.delivery_deadline || null,
              delivery_date: values.delivery_date || null,
              user_id: user.id,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        // Link selected items to the order; item status follows PO status (draft/sent → pending, confirmed → ordered, received → received)
        await supabase
          .from("project_items")
          .update({
            purchase_order_id: newOrder.id,
            status: getItemStatusForPO(values.status),
          })
          .in("id", Array.from(selectedItemIds));

        toast.success("Orden de compra creada");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al guardar la orden de compra"
      );
    }
  };

  try {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Orden de Compra" : "Nueva Orden de Compra"}
              {order?.order_number && ` - ${order.order_number}`}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="order_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Número de Orden</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="PO-001" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="order_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Fecha</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="supplier_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Proveedor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona un proveedor" />
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

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {STATUS_OPTIONS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="delivery_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Plazo de Entrega</FormLabel>
                      <Select
                        value={
                          PREDEFINED_DEADLINE_VALUES.has(field.value ?? "")
                            ? (field.value ?? "")
                            : ""
                        }
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar plazo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {DELIVERY_DEADLINE_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
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
                  name="delivery_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fecha de Entrega</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
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
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales sobre la orden..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Items Selection */}
              {(selectedSupplierId || (order?.supplier_id && isEditing)) && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Ítems a Incluir{" "}
                      <span className="text-destructive ml-1">*</span>
                    </label>
                    <div className="relative w-64">
                      <Search className="text-muted-foreground absolute top-2.5 left-2 h-4 w-4" />
                      <Input
                        placeholder="Buscar ítems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>

                  {loadingItems ? (
                    <div className="text-muted-foreground py-8 text-center">
                      Cargando ítems...
                    </div>
                  ) : filteredItems.length === 0 ? (
                    <div className="text-muted-foreground py-8 text-center">
                      {availableItems.length === 0
                        ? "No hay ítems disponibles para este proveedor"
                        : "No se encontraron ítems con la búsqueda"}
                    </div>
                  ) : (
                    <div className="max-h-96 overflow-y-auto rounded-md border">
                      <div className="space-y-2 p-4">
                        {filteredItems.map((item) => (
                          <Card
                            key={item.id}
                            className="hover:bg-accent/50 cursor-pointer p-3 transition-colors"
                            onClick={(e) => {
                              // Don't handle click if it originated from the checkbox area
                              const target = e.target as HTMLElement;
                              if (
                                target.closest('button[role="checkbox"]') ||
                                target.closest("[data-checkbox-wrapper]")
                              ) {
                                return;
                              }
                              e.preventDefault();
                              e.stopPropagation();
                              toggleItemSelection(item.id);
                            }}
                          >
                            <div className="flex items-center space-x-3">
                              <div
                                data-checkbox-wrapper
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                }}
                              >
                                <Checkbox
                                  checked={selectedItemIds.has(item.id)}
                                  onCheckedChange={() => {
                                    toggleItemSelection(item.id);
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-muted-foreground text-sm">
                                  Cantidad: {item.quantity} | Costo: $
                                  {(item.unit_cost || 0).toFixed(2)} | Estado:{" "}
                                  {item.status}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItemIds.size > 0 && (
                    <div className="text-muted-foreground text-sm">
                      {selectedItemIds.size} ítem
                      {selectedItemIds.size !== 1 ? "s" : ""} seleccionado
                      {selectedItemIds.size !== 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              )}

              {!selectedSupplierId && !order?.supplier_id && (
                <div className="text-muted-foreground py-4 text-center text-sm">
                  Selecciona un proveedor para ver los ítems disponibles
                </div>
              )}

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    !(selectedSupplierId || order?.supplier_id) ||
                    selectedItemIds.size === 0
                  }
                >
                  {isEditing ? "Actualizar" : "Crear"} Orden
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  } catch (error) {
    reportError(error, "Error rendering PurchaseOrderDialog:");
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-destructive">
              Error al cargar el diálogo. Por favor, recarga la página.
            </p>
            <Button onClick={() => onOpenChange(false)} className="mt-4">
              Cerrar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
}
