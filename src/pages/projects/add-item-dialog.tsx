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
import { useEffect, useState } from 'react';
import type { Product, Space, Supplier } from '@/types';
import type { ProjectItem } from './project-budget';
import { useAuth } from '@/components/auth-provider';

const formSchema = z.object({
  product_id: z.string().optional(),
  space_id: z.string().optional(),
  supplier_id: z.string().optional(),
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  reference_code: z.string().optional(),
  category: z.string().optional(),
  quantity: z.string().transform(v => parseFloat(v) || 1),
  unit_cost: z.string().transform(v => parseFloat(v) || 0),
  markup: z.string().transform(v => parseFloat(v) || 0),
  unit_price: z.string().transform(v => parseFloat(v) || 0),
  image_url: z.string().optional(),
});

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
  item?: ProjectItem | null;
  spaceId?: string;
}

export function AddItemDialog({ open, onOpenChange, projectId, onSuccess, item, spaceId }: AddItemDialogProps) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const isEditing = !!item;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "custom",
      space_id: "none",
      supplier_id: "none",
      name: "",
      description: "",
      reference_code: "",
      category: "",
      quantity: "1" as any,
      unit_cost: "0" as any,
      markup: "20" as any,
      unit_price: "0" as any,
      image_url: "",
    },
  });

  // Auto-calculate price when cost or markup changes
  const unitCost = form.watch('unit_cost');
  const markup = form.watch('markup');
  
  useEffect(() => {
    if (unitCost && markup !== undefined) {
      // Price = Cost + (Cost * Markup / 100)
      // OR Price = Cost / (1 - Markup/100) ? Usually Markup is % of cost added.
      // Let's assume Markup is percentage added to cost.
      const cost = parseFloat(unitCost as any) || 0;
      const mark = parseFloat(markup as any) || 0;
      const price = cost * (1 + mark / 100);
      form.setValue('unit_price', price.toFixed(2) as any);
    }
  }, [unitCost, markup, form]);

  useEffect(() => {
    async function loadData() {
      const { data: rData } = await supabase.from('spaces').select('*').eq('project_id', projectId);
      setSpaces(rData || []);
      const { data: pData } = await supabase.from('products').select('*').order('name');
      setProducts(pData || []);
      const { data: sData } = await supabase.from('suppliers').select('*').order('name');
      setSuppliers(sData || []);
      
      // Load item data if editing (after products are loaded)
      if (item && open) {
        // Si tiene producto asociado, cargar sus datos
        let productData = { description: "", reference_code: "", category: "" };
        if (item.product_id && pData) {
          const prod = pData.find(p => p.id === item.product_id);
          if (prod) {
            productData = {
              description: prod.description || "",
              reference_code: prod.reference_code || "",
              category: prod.category || ""
            };
          }
        }
        
        form.reset({
          product_id: item.product_id || "custom",
          space_id: item.space_id || "none",
          supplier_id: item.supplier_id || "none",
          name: item.name || "",
          description: productData.description,
          reference_code: productData.reference_code,
          category: productData.category,
          quantity: item.quantity?.toString() || "1",
          unit_cost: item.unit_cost?.toString() || "0",
          markup: item.markup?.toString() || "20",
          unit_price: item.unit_price?.toString() || "0",
          image_url: item.image_url || "",
        });
        if (item.product_id && pData) {
          const prod = pData.find(p => p.id === item.product_id);
          if (prod) setSelectedProduct(prod);
        }
      } else if (open && !item) {
        form.reset({
          product_id: "custom",
          space_id: spaceId || "none",
          supplier_id: "none",
          name: "",
          description: "",
          reference_code: "",
          category: "",
          quantity: "1" as any,
          unit_cost: "0" as any,
          markup: "20" as any,
          unit_price: "0" as any,
          image_url: "",
        });
        setSelectedProduct(null);
      }
    }
    if (open) loadData();
  }, [open, projectId, item, spaceId, form]);

  const handleProductChange = (productId: string) => {
    form.setValue('product_id', productId);
    if (productId === 'custom') {
      setSelectedProduct(null);
      form.setValue('name', '');
      form.setValue('description', '');
      form.setValue('reference_code', '');
      form.setValue('category', '');
      form.setValue('unit_cost', '0' as any);
      form.setValue('image_url', '');
      form.setValue('supplier_id', 'none');
    } else {
      const prod = products.find(p => p.id === productId);
      if (prod) {
        setSelectedProduct(prod);
        form.setValue('name', prod.name);
        form.setValue('description', prod.description || '');
        form.setValue('reference_code', prod.reference_code || '');
        form.setValue('category', prod.category || '');
        form.setValue('unit_cost', prod.cost_price.toString() as any);
        form.setValue('image_url', prod.image_url || "");
        form.setValue('supplier_id', prod.supplier_id || 'none');
      }
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      let finalProductId = values.product_id === 'custom' ? null : values.product_id;

      // Si es un producto personalizado (no del catálogo), primero créalo en products
      if (values.product_id === 'custom' && !isEditing) {
        if (!user?.id) {
          toast.error('No se pudo identificar el usuario');
          return;
        }

        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([{
            name: values.name,
            description: values.description || '',
            reference_code: values.reference_code || '',
            category: values.category || '',
            cost_price: values.unit_cost,
            image_url: values.image_url || null,
            supplier_id: (values.supplier_id === 'none' || !values.supplier_id) ? null : values.supplier_id,
            user_id: user.id
          }])
          .select()
          .single();

        if (productError) throw productError;
        finalProductId = newProduct.id;
      }

      const data = {
        project_id: projectId,
        space_id: (values.space_id === 'none' || !values.space_id) ? null : values.space_id,
        product_id: finalProductId,
        name: values.name,
        quantity: values.quantity,
        unit_cost: values.unit_cost,
        markup: values.markup,
        unit_price: values.unit_price,
        image_url: values.image_url,
        ...(isEditing ? {} : { status: 'pending' })
      };
      
      if (isEditing && item?.id) {
        // Si estamos editando y el producto era custom, actualizar el producto también
        if (values.product_id === 'custom' && item.product_id) {
          await supabase
            .from('products')
            .update({
              name: values.name,
              description: values.description || '',
              reference_code: values.reference_code || '',
              category: values.category || '',
              cost_price: values.unit_cost,
              image_url: values.image_url || null,
              supplier_id: (values.supplier_id === 'none' || !values.supplier_id) ? null : values.supplier_id
            })
            .eq('id', item.product_id);
        }

        const { error } = await supabase
          .from('project_items')
          .update(data)
          .eq('id', item.id);
        if (error) throw error;
        toast.success('Ítem actualizado');
      } else {
      const { error } = await supabase.from('project_items').insert([data]);
      if (error) throw error;
      toast.success('Ítem añadido');
      }

      form.reset();
      onSuccess();
    } catch (error) {
      toast.error('Error al guardar');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader><DialogTitle>{isEditing ? 'Editar Ítem del Presupuesto' : 'Añadir Ítem al Presupuesto'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="space_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar espacio" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">General / Ninguno</SelectItem>
                      {spaces.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="product_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Producto (Catálogo)</FormLabel>
                  <Select onValueChange={handleProductChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar o Personalizado" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="custom">-- Personalizado --</SelectItem>
                      {products.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Nombre del Ítem</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="supplier_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Seleccionar proveedor (opcional)" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">-- Sin proveedor --</SelectItem>
                      {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
              <FormField control={form.control} name="reference_code" render={({ field }) => (
                <FormItem><FormLabel>Referencia</FormLabel><FormControl><Input placeholder="Código o referencia" {...field} /></FormControl></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Descripción del producto..." {...field} /></FormControl></FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input placeholder="Ej: Muebles, Iluminación, Textiles..." {...field} /></FormControl></FormItem>
            )} />

            <div className="grid grid-cols-4 gap-4">
              <FormField control={form.control} name="quantity" render={({ field }) => (
                <FormItem><FormLabel>Cant.</FormLabel><FormControl><Input type="number" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="unit_cost" render={({ field }) => (
                <FormItem><FormLabel>Costo</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="markup" render={({ field }) => (
                <FormItem><FormLabel>Margen %</FormLabel><FormControl><Input type="number" step="0.1" {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="unit_price" render={({ field }) => (
                <FormItem><FormLabel>Precio</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="image_url" render={({ field }) => (
              <FormItem><FormLabel>Imagen URL</FormLabel><FormControl><Input placeholder="http://..." {...field} /></FormControl></FormItem>
            )} />

            <DialogFooter><Button type="submit">{isEditing ? 'Guardar Cambios' : 'Añadir al Presupuesto'}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

