import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SupplierDialog } from './supplier-dialog';
import { toast } from 'sonner';

import type { Supplier } from '@/types';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
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
        <h2 className="text-3xl font-bold">Proveedores</h2>
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
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.name}</TableCell>
                <TableCell>{s.contact_name}</TableCell>
                <TableCell>
                  <div className="text-sm">{s.email}</div>
                  <div className="text-xs text-gray-500">{s.phone}</div>
                </TableCell>
                <TableCell>
                  {s.website && (
                    <a href={s.website} target="_blank" rel="noopener noreferrer" className="flex items-center text-blue-600 hover:underline">
                      Web <ExternalLink className="ml-1 h-3 w-3" />
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingSupplier(s); setIsDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(s.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
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

