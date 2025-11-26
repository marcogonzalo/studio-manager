import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier?: { name: string };
  status: string;
  created_at: string;
  project_items: { id: string, name: string, quantity: number }[];
}

export function ProjectPurchases({ projectId }: { projectId: string }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('purchase_orders')
      .select('*, supplier:suppliers(name), project_items(id, name, quantity)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (!error) setOrders(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchOrders(); }, [projectId]);

  const generateOrders = async () => {
    // 1. Get pending items with suppliers
    const { data: items } = await supabase
      .from('project_items')
      .select('*, product:products(supplier_id)')
      .eq('project_id', projectId)
      .eq('status', 'pending'); // Only pending
    
    if (!items || items.length === 0) {
      toast.info('No hay ítems pendientes para ordenar.');
      return;
    }

    // 2. Group by supplier
    const bySupplier: Record<string, typeof items> = {};
    // const noSupplier = [];

    for (const item of items) {
      const suppId = item.product?.supplier_id; // Or item.supplier_id if added
      if (suppId) {
        if (!bySupplier[suppId]) bySupplier[suppId] = [];
        bySupplier[suppId].push(item);
      } 
      // else noSupplier.push(item);
    }

    if (Object.keys(bySupplier).length === 0) {
      toast.warning('Hay ítems pendientes pero no tienen proveedor asignado en el catálogo.');
      return;
    }

    // 3. Create POs
    let createdCount = 0;
    for (const [suppId, groupItems] of Object.entries(bySupplier)) {
      const { data: po, error: poError } = await supabase
        .from('purchase_orders')
        .insert([{
          project_id: projectId,
          supplier_id: suppId,
          status: 'draft',
          order_date: new Date().toISOString(),
          order_number: `PO-${Date.now()}-${suppId.slice(0,4)}`
        }])
        .select()
        .single();
      
      if (po && !poError) {
        // Link items to PO and update status
        await supabase
          .from('project_items')
          .update({ purchase_order_id: po.id, status: 'ordered' })
          .in('id', groupItems.map(i => i.id));
        createdCount++;
      }
    }

    if (createdCount > 0) {
        toast.success(`${createdCount} Órdenes de compra generadas.`);
        fetchOrders();
    } else {
        toast.error('No se pudieron generar las órdenes.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Órdenes de Compra</h3>
        <Button onClick={generateOrders} disabled={loading}>
          <ShoppingBag className="mr-2 h-4 w-4" /> Generar Órdenes (Pendientes)
        </Button>
      </div>

      <div className="grid gap-4">
        {orders.map((po) => (
          <Card key={po.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-base">{po.supplier?.name || 'Proveedor Desconocido'}</CardTitle>
                <span className="text-sm text-gray-500">{format(new Date(po.created_at), 'dd/MM/yyyy')}</span>
              </div>
              <div className="text-sm text-gray-500">Ref: {po.order_number} | Estado: <span className="capitalize font-medium text-black dark:text-white">{po.status}</span></div>
            </CardHeader>
            <CardContent>
              <div className="text-sm mt-2">
                <div className="font-medium mb-1">Ítems:</div>
                <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                  {po.project_items.map(item => (
                    <li key={item.id}>{item.quantity}x {item.name}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        ))}
        {orders.length === 0 && <p className="text-center py-8 text-gray-500">No hay órdenes de compra.</p>}
      </div>
    </div>
  );
}

