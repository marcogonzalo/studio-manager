import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-provider';
import type { Client, Project } from '@/types';

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente requerido"),
  status: z.string().default('draft'),
  start_date: z.string().optional(),
});

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  project?: Project | null;
}

export function ProjectDialog({ open, onOpenChange, onSuccess, project }: ProjectDialogProps) {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      client_id: "",
      status: "draft",
      start_date: new Date().toISOString().split('T')[0],
    },
  });

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from('clients').select('*').order('full_name');
      setClients(data || []);
    }
    if (open) loadClients();
  }, [open]);

  useEffect(() => {
    if (project && open) {
      const startDate = project.start_date 
        ? (project.start_date.includes('T') ? project.start_date.split('T')[0] : project.start_date)
        : new Date().toISOString().split('T')[0];
      
      form.reset({
        name: project.name || "",
        description: project.description || "",
        client_id: project.client_id || "",
        status: project.status || "draft",
        start_date: startDate,
      });
    } else if (!project && open) {
      form.reset({
        name: "",
        description: "",
        client_id: "",
        status: "draft",
        start_date: new Date().toISOString().split('T')[0],
      });
    }
  }, [project, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (project) {
        const { error } = await supabase
          .from('projects')
          .update(values)
          .eq('id', project.id);
        
        if (error) throw error;
        
        toast.success('Proyecto actualizado');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{
            ...values,
            user_id: user?.id,
          }]);
        
        if (error) throw error;
        
        toast.success('Proyecto creado');
        form.reset();
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.message || (project ? "Error al actualizar proyecto" : "Error al crear proyecto"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{project ? 'Editar' : 'Nuevo'} Proyecto</DialogTitle>
          <DialogDescription>
            {project ? 'Edita la información del proyecto.' : 'Crea un nuevo proyecto de diseño.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="Reforma Sala Principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="client_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
                    <Textarea placeholder="Detalles del proyecto..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Borrador</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit">{project ? 'Guardar Cambios' : 'Crear Proyecto'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

