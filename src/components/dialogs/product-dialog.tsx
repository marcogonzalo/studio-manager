import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
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
import { reportError, CURRENCIES } from "@/lib/utils";
import type { Product, Supplier } from "@/types";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { useProfileDefaults } from "@/lib/use-profile-defaults";
import { SupplierDialog } from "./supplier-dialog";
import { ProductImageUpload } from "@/components/product-image-upload";
import { Plus } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  reference_code: z.string().optional(),
  reference_url: z.string().optional(),
  description: z.string().optional(),
  cost_price: z.string().transform((val) => parseFloat(val) || 0),
  currency: z.string().optional(),
  category: z.string().optional(),
  supplier_id: z.string().optional(),
  image_url: z.string().optional(),
});

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  onSuccess: () => void;
}

export function ProductDialog({
  open,
  onOpenChange,
  product,
  onSuccess,
}: ProductDialogProps) {
  const { user, effectivePlan } = useAuth();
  const profileDefaults = useProfileDefaults();
  const supabase = getSupabaseClient();
  const isBasePlan = effectivePlan?.plan_code === "BASE";
  const currencyDisabled = isBasePlan;
  const defaultCurrency = profileDefaults?.default_currency ?? "EUR";
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [pendingSupplierId, setPendingSupplierId] = useState<string | null>(
    null
  );
  /** File selected for new product; uploaded only after product is created */
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  /** Size of image just uploaded (edit mode); included in next update so trigger can account for it */
  const uploadedImageSizeBytesRef = useRef<number | null>(null);
  /** Asset id from last upload (edit mode); linked in products.asset_id */
  const uploadedAssetIdRef = useRef<string | null>(null);

  const productIdForUpload = product?.id ?? "";

  type FormValues = {
    name: string;
    reference_code?: string;
    reference_url?: string;
    description?: string;
    cost_price: string;
    currency?: string;
    category?: string;
    supplier_id?: string;
    image_url?: string;
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: "",
      reference_code: "",
      reference_url: "",
      description: "",
      cost_price: "0",
      currency: "EUR",
      category: "",
      supplier_id: "",
      image_url: "",
    },
  });

  useEffect(() => {
    async function loadSuppliers() {
      const { data } = await supabase
        .from("suppliers")
        .select("*")
        .order("name");
      setSuppliers(data || []);
    }
    if (open) loadSuppliers();
  }, [open, supabase]);

  // Sincronizar el valor del proveedor cuando la lista se actualiza y hay un proveedor pendiente
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
    // Recargar la lista de proveedores
    const { data } = await supabase.from("suppliers").select("*").order("name");
    if (data) {
      setSuppliers(data);
      // Establecer el proveedor pendiente para que se seleccione cuando la lista se actualice
      setPendingSupplierId(newSupplierId);
    }
    setIsSupplierDialogOpen(false);
  };

  useEffect(() => {
    if (product) {
      setPendingImageFile(null);
      form.reset({
        name: product.name,
        reference_code: product.reference_code || "",
        reference_url: product.reference_url || "",
        description: product.description || "",
        cost_price: product.cost_price?.toString() ?? "0",
        currency: currencyDisabled
          ? defaultCurrency
          : (product.currency ?? "EUR"),
        category: product.category || "",
        supplier_id: product.supplier_id || "",
        image_url: product.image_url || "",
      });
    } else if (open) {
      setPendingImageFile(null);
      form.reset({
        name: "",
        reference_code: "",
        reference_url: "",
        description: "",
        cost_price: "0",
        currency: defaultCurrency,
        category: "",
        supplier_id: "",
        image_url: "",
      });
    }
  }, [product, open, form, defaultCurrency, currencyDisabled]);

  async function onSubmit(values: z.infer<typeof formSchema> | FormValues) {
    try {
      // Convert empty strings to null for optional fields to avoid overwriting existing data
      const data: Record<string, unknown> = {
        name: values.name,
        cost_price: values.cost_price,
        currency: values.currency ?? "EUR",
        user_id: user?.id,
      };

      // Only include optional fields if they have values
      if (values.reference_code && values.reference_code.trim()) {
        data.reference_code = values.reference_code;
      } else {
        data.reference_code = null;
      }

      if (values.reference_url && values.reference_url.trim()) {
        data.reference_url = values.reference_url;
      } else {
        data.reference_url = null;
      }

      if (values.description && values.description.trim()) {
        data.description = values.description;
      } else {
        data.description = null;
      }

      if (values.category && values.category.trim()) {
        data.category = values.category;
      } else {
        data.category = null;
      }

      if (values.supplier_id && values.supplier_id.trim()) {
        data.supplier_id = values.supplier_id;
      } else {
        data.supplier_id = null;
      }

      if (values.image_url && values.image_url.trim()) {
        data.image_url = values.image_url;
        if (uploadedImageSizeBytesRef.current != null) {
          data.image_size_bytes = uploadedImageSizeBytesRef.current;
        }
        if (uploadedAssetIdRef.current) {
          data.asset_id = uploadedAssetIdRef.current;
        }
      } else {
        data.image_url = null;
        data.image_size_bytes = null;
        data.asset_id = null;
      }

      if (product) {
        const prevUrl = (product.image_url || "").trim();
        const newUrl = (values.image_url || "").trim();
        if (prevUrl && prevUrl !== newUrl) {
          try {
            await fetch(
              `/api/upload/product-image?url=${encodeURIComponent(prevUrl)}`,
              { method: "DELETE" }
            );
          } catch (err) {
            reportError(err, "Error deleting previous image:");
          }
        }

        const { error } = await supabase
          .from("products")
          .update(data)
          .eq("id", product.id);
        if (error) throw error;
        uploadedImageSizeBytesRef.current = null;
        uploadedAssetIdRef.current = null;
        toast.success("Producto actualizado");
      } else {
        // New product: insert first (no image_url if we have a pending file to upload)
        const insertData = { ...data };
        if (pendingImageFile) {
          insertData.image_url = null;
        }
        const { data: created, error: insertError } = await supabase
          .from("products")
          .insert([insertData])
          .select("id")
          .single();
        if (insertError) throw insertError;
        const newId = created.id;

        if (pendingImageFile) {
          const formData = new FormData();
          formData.append("file", pendingImageFile);
          formData.append("productId", newId);
          const res = await fetch("/api/upload/product-image", {
            method: "POST",
            body: formData,
          });
          const uploadJson = (await res.json()) as {
            url?: string;
            error?: string;
            fileSizeBytes?: number;
            assetId?: string;
          };
          if (!res.ok) {
            await supabase.from("products").delete().eq("id", newId);
            reportError(
              new Error(uploadJson.error ?? "Error al subir la imagen")
            );
            toast.error(uploadJson.error ?? "Error al subir la imagen");
            setPendingImageFile(null);
            return;
          }
          if (uploadJson.url) {
            const updatePayload: {
              image_url: string;
              image_size_bytes?: number;
              asset_id?: string | null;
            } = {
              image_url: uploadJson.url,
            };
            if (uploadJson.fileSizeBytes != null)
              updatePayload.image_size_bytes = uploadJson.fileSizeBytes;
            if (uploadJson.assetId != null)
              updatePayload.asset_id = uploadJson.assetId;
            const { error: updateError } = await supabase
              .from("products")
              .update(updatePayload)
              .eq("id", newId);
            if (updateError)
              reportError(updateError, "Error updating image_url:");
          }
        }
        setPendingImageFile(null);
        toast.success("Producto creado");
      }
      onSuccess();
    } catch (error: unknown) {
      reportError(error, "Error saving product:");
      toast.error(error instanceof Error ? error.message : "Error al guardar");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar" : "Nuevo"} Producto</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reference_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Referencia</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                    <Textarea {...field} rows={2} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reference_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de Referencia</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoría</FormLabel>
                    <FormControl>
                      <Input placeholder="Muebles, Iluminación..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="cost_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Costo Base</FormLabel>
                    <div className="border-input flex overflow-hidden rounded-md border shadow-sm">
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          className="rounded-none border-0 border-r focus-visible:ring-0 focus-visible:ring-offset-0"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormField
                        control={form.control}
                        name="currency"
                        render={({ field: currencyField }) => (
                          <FormItem className="mt-0 mb-0 w-[110px] shrink-0 space-y-0">
                            <FormControl>
                              <Select
                                onValueChange={currencyField.onChange}
                                value={
                                  currencyDisabled
                                    ? defaultCurrency
                                    : (currencyField.value ?? "EUR")
                                }
                                disabled={currencyDisabled}
                              >
                                <SelectTrigger className="bg-muted/30 h-full rounded-none border-0 focus:ring-0 focus:ring-offset-0">
                                  <SelectValue />
                                </SelectTrigger>
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
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
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
                    <FormLabel>Proveedor</FormLabel>
                    <div className="flex gap-2">
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsSupplierDialogOpen(true)}
                        title="Agregar nuevo proveedor"
                        aria-label="Agregar nuevo proveedor"
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
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen del producto</FormLabel>
                  {user?.id ? (
                    product ? (
                      <ProductImageUpload
                        productId={productIdForUpload}
                        currentImageUrl={field.value || undefined}
                        onUploadSuccess={(url, fileSizeBytes, assetId) => {
                          field.onChange(url);
                          uploadedImageSizeBytesRef.current =
                            fileSizeBytes ?? null;
                          uploadedAssetIdRef.current = assetId ?? null;
                          toast.success("Imagen subida");
                        }}
                        onUploadError={(msg) => toast.error(msg)}
                        className="mt-2"
                      />
                    ) : (
                      <ProductImageUpload
                        productId=""
                        currentImageUrl={field.value || undefined}
                        deferUpload
                        onFileSelect={setPendingImageFile}
                        pendingFile={pendingImageFile}
                        onUploadSuccess={(url) => field.onChange(url)}
                        onUploadError={(msg) => toast.error(msg)}
                        className="mt-2"
                      />
                    )
                  ) : (
                    <div className="mt-2 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit">Guardar</Button>
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
