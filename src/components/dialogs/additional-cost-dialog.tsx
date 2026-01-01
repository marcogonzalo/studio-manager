import { useEffect } from 'react';
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
import { useAuth } from '@/components/auth-provider';
import type { AdditionalCost } from '@/types';

const formSchema = z.object({
  cost_type: z.string().min(1, "Tipo de coste requerido"),
  description: z.string().optional(),
  amount: z.string().transform(v => parseFloat(v) || 0),
});

interface AdditionalCostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
  cost?: AdditionalCost | null;
}

const COST_TYPES = [
  { value: 'shipping', label: 'Envío' },
  { value: 'packaging', label: 'Embalaje' },
  { value: 'installation', label: 'Instalación' },
  { value: 'assembly', label: 'Montaje' },
  { value: 'transport', label: 'Transporte' },
  { value: 'insurance', label: 'Seguro' },
  { value: 'customs', label: 'Aduanas' },
  { value: 'storage', label: 'Almacenamiento' },
  { value: 'handling', label: 'Manejo' },
  { value: 'other', label: 'Otro' },
];

export function AdditionalCostDialog({ open, onOpenChange, projectId, onSuccess, cost }: AdditionalCostDialogProps) {
  const { user } = useAuth();
  const isEditing = !!cost;

  type FormValues = {
    cost_type: string;
    description?: string;
    amount: string;
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      cost_type: "",
      description: "",
      amount: "0" as any,
    },
  });

  // Reset form when dialog opens/closes or cost changes
  useEffect(() => {
    if (open) {
      if (cost) {
        form.reset({
          cost_type: cost.cost_type,
          description: cost.description || "",
          amount: cost.amount.toString() as any,
        });
      } else {
        form.reset({
          cost_type: "",
          description: "",
          amount: "0" as any,
        });
      }
    }
  }, [open, cost, form]);

  const onSubmit = async (values: z.infer<typeof formSchema> | FormValues) => {
    if (!user?.id) {
      toast.error('No se pudo identificar el usuario');
      return;
    }

    if (isEditing && cost) {
      // Update existing cost
      const { error } = await supabase
        .from('additional_project_costs')
        .update({
          cost_type: values.cost_type,
          description: values.description || null,
          amount: values.amount,
        })
        .eq('id', cost.id);

      if (error) {
        toast.error('Error al actualizar coste adicional');
      } else {
        toast.success('Coste adicional actualizado');
        onSuccess();
        onOpenChange(false);
      }
    } else {
      // Create new cost
      const { error } = await supabase
        .from('additional_project_costs')
        .insert([{
          project_id: projectId,
          cost_type: values.cost_type,
          description: values.description || null,
          amount: values.amount,
          user_id: user.id,
        }]);

      if (error) {
        toast.error('Error al crear coste adicional');
      } else {
        toast.success('Coste adicional añadido');
        onSuccess();
        onOpenChange(false);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Coste Adicional' : 'Añadir Coste Adicional'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="cost_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Tipo de Coste</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un tipo de coste" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COST_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
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
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descripción detallada del coste (opcional)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel required>Importe</FormLabel>
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

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit">{isEditing ? 'Actualizar' : 'Añadir'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

