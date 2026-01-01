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
import { Plus } from 'lucide-react';
import type { Client, Project } from '@/types';
import { ClientDialog } from '@/components/dialogs/client-dialog';

const formSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  client_id: z.string().min(1, "Cliente requerido"),
  status: z.string().default('draft').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
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
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);
  const [pendingClientId, setPendingClientId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      client_id: "",
      status: "draft",
      start_date: new Date().toISOString().split('T')[0],
      end_date: "",
    },
  });

  useEffect(() => {
    async function loadClients() {
      const { data } = await supabase.from('clients').select('*').order('full_name');
      setClients(data || []);
    }
    if (open) loadClients();
  }, [open]);

  // Sincronizar el valor del cliente cuando la lista se actualiza y hay un cliente pendiente
  useEffect(() => {
    if (pendingClientId && clients.length > 0) {
      const clientExists = clients.some(c => c.id === pendingClientId);
      if (clientExists) {
        form.setValue('client_id', pendingClientId, { shouldValidate: true, shouldDirty: true });
        setPendingClientId(null);
      }
    }
  }, [clients, pendingClientId, form]);


  useEffect(() => {
    if (project && open) {
      const startDate = project.start_date 
        ? (project.start_date.includes('T') ? project.start_date.split('T')[0] : project.start_date)
        : new Date().toISOString().split('T')[0];
      
      const endDate = project.end_date 
        ? (project.end_date.includes('T') ? project.end_date.split('T')[0] : project.end_date)
        : "";
      
      form.reset({
        name: project.name || "",
        description: project.description || "",
        client_id: project.client_id || "",
        status: project.status || "draft",
        start_date: startDate,
        end_date: endDate,
      });
    } else if (!project && open) {
      form.reset({
        name: "",
        description: "",
        client_id: "",
        status: "draft",
        start_date: new Date().toISOString().split('T')[0],
        end_date: "",
      });
    }
  }, [project, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const updateData: Record<string, unknown> = {
        ...values,
        end_date: values.end_date || null,
        status: values.status || 'draft',
      };

      // Si el estado cambia a "completed", establecer la fecha efectiva de finalización
      if (values.status === 'completed') {
        // Solo establecer completed_date si el proyecto no estaba completado antes
        // Si ya estaba completado, mantener la fecha existente
        if (!project || project.status !== 'completed') {
          updateData.completed_date = new Date().toISOString().split('T')[0];
        }
        // Si ya estaba completado, no incluir completed_date en el update para mantener el valor existente
      } else {
        // Si el estado cambia de "completed" a otro, limpiar la fecha efectiva
        if (project && project.status === 'completed') {
          updateData.completed_date = null;
        }
      }

      if (project) {
        const { error } = await supabase
          .from('projects')
          .update(updateData)
          .eq('id', project.id);
        
        if (error) throw error;
        
        toast.success('Proyecto actualizado');
      } else {
        const { error } = await supabase
          .from('projects')
          .insert([{
            ...updateData,
            user_id: user?.id,
          }]);
        
        if (error) throw error;
        
        toast.success('Proyecto creado');
        form.reset();
      }
      onSuccess();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : (project ? "Error al actualizar proyecto" : "Error al crear proyecto");
      toast.error(errorMessage);
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
                  <FormLabel required>Nombre del Proyecto</FormLabel>
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
                  <FormLabel required>Cliente</FormLabel>
                  <div className="flex gap-2">
                    <Select onValueChange={field.onChange} value={field.value}>
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
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
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
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha Inicio</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} value={field.value || ""} />
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
                      <Input type="date" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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

            <DialogFooter>
              <Button type="submit">{project ? 'Guardar Cambios' : 'Crear Proyecto'}</Button>
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
            // Recargar la lista de clientes
            const { data } = await supabase.from('clients').select('*').order('full_name');
            if (data) {
              setClients(data);
              // Establecer el cliente pendiente para que se seleccione cuando la lista se actualice
              setPendingClientId(clientId);
            }
            setIsClientDialogOpen(false);
            toast.success('Cliente creado y seleccionado');
          }
        }}
      />
    </Dialog>
  );
}

