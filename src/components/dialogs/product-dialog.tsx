import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import type { Product, Supplier } from '@/types';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import { SupplierDialog } from './supplier-dialog';
import { Plus } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  reference_code: z.string().optional(),
  reference_url: z.string().optional(),
  description: z.string().optional(),
  cost_price: z.string().transform((val) => parseFloat(val) || 0),
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

export function ProductDialog({ open, onOpenChange, product, onSuccess }: ProductDialogProps) {
  const { user } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [pendingSupplierId, setPendingSupplierId] = useState<string | null>(null);

  type FormValues = {
    name: string;
    reference_code?: string;
    reference_url?: string;
    description?: string;
    cost_price: string;
    category?: string;
    supplier_id?: string;
    image_url?: string;
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      reference_code: "",
      reference_url: "",
      description: "",
      cost_price: 0 as any, // Form input uses string usually, handled by transform
      category: "",
      supplier_id: "",
      image_url: "",
    },
  });

  useEffect(() => {
    async function loadSuppliers() {
      const { data } = await supabase.from('suppliers').select('*').order('name');
      setSuppliers(data || []);
    }
    if (open) loadSuppliers();
  }, [open]);

  // Sincronizar el valor del proveedor cuando la lista se actualiza y hay un proveedor pendiente
  useEffect(() => {
    if (pendingSupplierId && suppliers.length > 0) {
      const supplierExists = suppliers.some(s => s.id === pendingSupplierId);
      if (supplierExists) {
        form.setValue('supplier_id', pendingSupplierId, { shouldValidate: true, shouldDirty: true });
        setPendingSupplierId(null);
      }
    }
  }, [suppliers, pendingSupplierId, form]);

  const handleSupplierCreated = async (newSupplierId: string) => {
    // Recargar la lista de proveedores
    const { data } = await supabase.from('suppliers').select('*').order('name');
    if (data) {
      setSuppliers(data);
      // Establecer el proveedor pendiente para que se seleccione cuando la lista se actualice
      setPendingSupplierId(newSupplierId);
    }
    setIsSupplierDialogOpen(false);
  };

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        reference_code: product.reference_code || "",
        reference_url: product.reference_url || "",
        description: product.description || "",
        cost_price: product.cost_price?.toString() as any,
        category: product.category || "",
        supplier_id: product.supplier_id || "",
        image_url: product.image_url || "",
      });
    } else {
      form.reset({
        name: "",
        reference_code: "",
        reference_url: "",
        description: "",
        cost_price: "0" as any,
        category: "",
        supplier_id: "",
        image_url: "",
      });
    }
  }, [product, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema> | FormValues) {
    try {
      // Convert empty strings to null for optional fields to avoid overwriting existing data
      const data: Record<string, unknown> = {
        name: values.name,
        cost_price: values.cost_price,
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
      } else {
        data.image_url = null;
      }
      
      if (product) {
        const { error } = await supabase.from('products').update(data).eq('id', product.id);
        if (error) throw error;
        toast.success('Producto actualizado');
      } else {
        const { error } = await supabase.from('products').insert([data]);
        if (error) throw error;
        toast.success('Producto creado');
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
      toast.error('Error al guardar');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>{product ? 'Editar' : 'Nuevo'} Producto</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel required>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reference_code" render={({ field }) => (
                <FormItem><FormLabel>Referencia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
            )} />

            <FormField control={form.control} name="reference_url" render={({ field }) => (
              <FormItem><FormLabel>URL de Referencia</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input placeholder="Muebles, Iluminación..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="cost_price" render={({ field }) => (
                <FormItem><FormLabel>Costo Base ($)</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="supplier_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                      <SelectContent>
                        {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setIsSupplierDialogOpen(true)}
                      title="Agregar nuevo proveedor"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="image_url" render={({ field }) => (
                <FormItem><FormLabel>Imagen URL</FormLabel><FormControl><Input placeholder="http://..." {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <SupplierDialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
        supplier={null}
        onSuccess={async (supplierId) => {
          if (supplierId) {
            await handleSupplierCreated(supplierId);
            toast.success('Proveedor creado y seleccionado');
          }
        }}
      />
    </Dialog>
  );
}
