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

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  reference_code: z.string().optional(),
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

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      reference_code: "",
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

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        reference_code: product.reference_code || "",
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
        description: "",
        cost_price: "0" as any,
        category: "",
        supplier_id: "",
        image_url: "",
      });
    }
  }, [product, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = { ...values, user_id: user?.id };
      if (product) {
        await supabase.from('products').update(data).eq('id', product.id);
        toast.success('Producto actualizado');
      } else {
        await supabase.from('products').insert([data]);
        toast.success('Producto creado');
      }
      onSuccess();
    } catch (error) {
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
                <FormItem><FormLabel>Nombre</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="reference_code" render={({ field }) => (
                <FormItem><FormLabel>Referencia</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea {...field} rows={2} /></FormControl><FormMessage /></FormItem>
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
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
    </Dialog>
  );
}
