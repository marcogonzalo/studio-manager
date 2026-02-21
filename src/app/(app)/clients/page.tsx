"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  MoreVertical,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ClientDialog } from "@/components/dialogs/client-dialog";
import { ConfirmDeleteDialog } from "@/components/confirm-delete-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useDebouncedState } from "@/lib/use-debounced-value";

import type { Client } from "@/types";

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, searchDebounced, setSearchInput] = useDebouncedState(
    "",
    500
  );
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const supabase = getSupabaseClient();

  const fetchClients = async () => {
    setLoading(true);
    let query = supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });

    if (searchDebounced) {
      query = query.ilike("full_name", `%${searchDebounced}%`);
    }

    const { data, error } = await query;
    if (error) {
      toast.error("Error al cargar clientes", { id: "clients-load" });
    } else {
      setClients(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when searchDebounced changes only
  }, [searchDebounced]);

  const handleDeleteClick = (client: Client) => {
    setDeleteTarget(client);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    setDeleteLoading(true);
    try {
      const { canDeleteClient } = await import("@/lib/validation");
      const canDelete = await canDeleteClient(id);
      if (!canDelete) {
        toast.error(
          "No se puede eliminar el cliente porque tiene proyectos asociados"
        );
        setDeleteTarget(null);
        return;
      }
      const { error } = await supabase.from("clients").delete().eq("id", id);
      if (error) {
        toast.error("Error al eliminar cliente");
        return;
      }
      toast.success("Cliente eliminado");
      setDeleteTarget(null);
      fetchClients();
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingClient(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="text-primary h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
          </Button>
        </div>
        <p className="text-muted-foreground text-sm">
          Gestiona los contactos y datos de tus clientes.
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative max-w-sm flex-1">
          <Search
            className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4"
            aria-hidden
          />
          <Input
            type="search"
            placeholder="Buscar clientes…"
            className="pl-8"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Buscar clientes"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="mb-2 h-5 w-3/4" />
                <Skeleton className="mb-1 h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : clients.length === 0 ? (
          <Card className="border-dashed sm:col-span-2 lg:col-span-3">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted rounded-full p-4">
                <Users className="text-muted-foreground h-8 w-8" />
              </div>
              <h3 className="text-foreground mt-4 font-medium">
                No se encontraron clientes
              </h3>
              <p className="text-muted-foreground mt-1 max-w-sm text-sm">
                Añade tu primer cliente para empezar a asociarlos a proyectos.
              </p>
              <Button onClick={handleCreate} className="mt-4">
                <Plus className="mr-2 h-4 w-4" /> Nuevo Cliente
              </Button>
            </CardContent>
          </Card>
        ) : (
          clients.map((client) => (
            <Card key={client.id} className="transition-shadow hover:shadow-md">
              <CardContent className="flex items-start justify-between gap-2 p-4">
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate font-medium">
                    {client.full_name}
                  </p>
                  {client.email && (
                    <p className="text-muted-foreground mt-0.5 truncate text-sm">
                      {client.email}
                    </p>
                  )}
                  {client.phone && (
                    <p className="text-muted-foreground truncate text-sm">
                      {client.phone}
                    </p>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Acciones del cliente"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(client)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteClick(client)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ClientDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        client={editingClient}
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchClients();
        }}
      />

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="¿Eliminar cliente?"
        description="Esta acción no se puede deshacer. Si el cliente tiene proyectos asociados no podrá eliminarse."
        onConfirm={handleConfirmDelete}
        loading={deleteLoading}
      />
    </div>
  );
}
