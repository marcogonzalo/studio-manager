import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, Search, Image as ImageIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ProductDialog } from '@/components/dialogs/product-dialog';
import { ProductDetailModal } from '@/components/product-detail-modal';
import { toast } from 'sonner';

import type { Product } from '@/types';

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    let query = supabase.from('products').select('*, supplier:suppliers(name)').order('name');
    if (search) query = query.or(`name.ilike.%${search}%,reference_code.ilike.%${search}%`);

    const { data, error } = await query;
    if (!error) setProducts(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar producto?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Error al eliminar');
    else {
      toast.success('Producto eliminado');
      fetchProducts();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Catálogo de Productos</h2>
        <Button onClick={() => { setEditingProduct(null); setIsDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" /> Nuevo Producto
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Buscar por nombre o referencia..." 
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
              <TableHead className="w-[80px]">Img</TableHead>
              <TableHead>Referencia</TableHead>
              <TableHead>Producto</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Proveedor</TableHead>
              <TableHead className="text-right">Costo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((p) => (
              <TableRow key={p.id}>
                <TableCell>
                  {p.image_url ? (
                    <img 
                      src={p.image_url} 
                      alt={p.name} 
                      className="w-10 h-10 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => {
                        setSelectedProduct(p);
                        setIsProductModalOpen(true);
                      }}
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs">{p.reference_code}</TableCell>
                <TableCell className="font-medium">
                  <div>{p.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{p.description}</div>
                </TableCell>
                <TableCell>{p.category}</TableCell>
                <TableCell>{p.supplier?.name}</TableCell>
                <TableCell className="text-right font-mono">
                  {p.cost_price ? `$${p.cost_price.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => { setEditingProduct(p); setIsDialogOpen(true); }}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {products.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-center py-8">No hay productos.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ProductDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        product={editingProduct}
        onSuccess={() => { setIsDialogOpen(false); fetchProducts(); }}
      />

      <ProductDetailModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={selectedProduct}
      />
    </div>
  );
}

