import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import type { Supplier } from '@/types';
import { useEffect } from 'react';
import { useAuth } from '@/components/auth-provider';

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  contact_name: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
});

interface SupplierDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplier: Supplier | null;
  onSuccess: (supplierId?: string) => void;
}

export function SupplierDialog({ open, onOpenChange, supplier, onSuccess }: SupplierDialogProps) {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: "", contact_name: "", email: "", phone: "", website: "" },
  });

  useEffect(() => {
    if (supplier) form.reset(supplier);
    else form.reset({ name: "", contact_name: "", email: "", phone: "", website: "" });
  }, [supplier, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const data = { ...values, user_id: user?.id };
      if (supplier) {
        await supabase.from('suppliers').update(data).eq('id', supplier.id);
        toast.success('Proveedor actualizado');
        onSuccess();
      } else {
        const { data: newSupplier, error } = await supabase
          .from('suppliers')
          .insert([data])
          .select()
          .single();
        
        if (error) throw error;
        toast.success('Proveedor creado');
        onSuccess(newSupplier.id);
      }
    } catch (error) {
      toast.error('Error al guardar');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>{supplier ? 'Editar' : 'Nuevo'} Proveedor</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel required>Empresa</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="contact_name" render={({ field }) => (
              <FormItem><FormLabel>Nombre Contacto</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Teléfono</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem><FormLabel>Sitio Web</FormLabel><FormControl><Input placeholder="https://..." {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <DialogFooter><Button type="submit">Guardar</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

