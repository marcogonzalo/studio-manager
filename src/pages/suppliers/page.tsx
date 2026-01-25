import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, ExternalLink, MoreVertical, Truck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SupplierDialog } from '@/components/dialogs/supplier-dialog';
import { toast } from 'sonner';

import type { Supplier } from '@/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    let query = supabase.from('suppliers').select('*').order('name');
    if (search) query = query.ilike('name', `%${search}%`);

    const { data, error } = await query;
    if (!error) setSuppliers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchSuppliers(); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar proveedor?')) return;
    const { error } = await supabase.from('suppliers').delete().eq('id', id);
    if (error) toast.error('Error al eliminar');
    else {
      toast.success('Proveedor eliminado');
      fetchSuppliers();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <h2 className="text-3xl font-bold">Proveedores</h2>
        </div>
        <Button onClick={() => { setEditingSupplier(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Proveedor
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Buscar..." 
            className="pl-8" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <div className="border rounded-md bg-white dark:bg-gray-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Email / Teléfono</TableHead>
              <TableHead>Web</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {suppliers.map((s) => (
              <TableRow key={s.id} className="group">
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contact_name}</TableCell>
                <TableCell>
                  <div className="relative overflow-hidden max-w-[200px]">
                    <div className="text-sm whitespace-nowrap">{s.email}</div>
                    <div className="text-xs text-gray-500 whitespace-nowrap">{s.phone}</div>
                    <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 group-hover:from-muted/50 to-transparent pointer-events-none transition-colors"></span>
                  </div>
                </TableCell>
                <TableCell>
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline max-w-[200px]">
                      <span className="relative overflow-hidden whitespace-nowrap block flex-1 min-w-0">
                        <span className="block">
                          {new URL(s.website).hostname.replace('www.', '')}
                        </span>
                        <span className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 group-hover:from-muted/50 to-transparent pointer-events-none transition-colors"></span>
                      </span>
                      <ExternalLink className="h-3 w-3 flex-shrink-0" />
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => { setEditingSupplier(s); setIsDialogOpen(true); }}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDelete(s.id)}
                        className="text-red-600 dark:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {suppliers.length === 0 && (
              <TableRow><TableCell colSpan={5} className="text-center py-8">No hay proveedores.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <SupplierDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        supplier={editingSupplier}
        onSuccess={() => { setIsDialogOpen(false); fetchSuppliers(); }}
      />
    </div>
  );
}

