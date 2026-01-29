import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Pencil } from 'lucide-react';
import type { Product } from '@/types';
import type { ProjectItem } from '@/modules/app/projects/project-budget';

const PO_STATUS_LABELS: Record<string, string> = {
  draft: 'Borrador',
  sent: 'Enviada',
  confirmed: 'Confirmada',
  received: 'Recibida',
  cancelled: 'Cancelada',
};

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  projectItem?: ProjectItem | null;
  onEdit?: () => void;
  projectId?: string;
}

export function ProductDetailModal({ open, onOpenChange, product, projectItem, onEdit, projectId }: ProductDetailModalProps) {
  // Si hay projectItem, usar sus datos; si no, usar product
  const displayProduct = projectItem || product;
  
  if (!displayProduct) return null;

  const imageUrl = projectItem?.image_url || product?.image_url;
  const name = projectItem?.name || product?.name;
  const description = projectItem?.description || product?.description || '';
  const referenceCode = projectItem?.product?.reference_code || product?.reference_code || '';
  const referenceUrl = projectItem?.product?.reference_url || product?.reference_url || '';
  const internalReference = projectItem?.internal_reference || '';
  const category = projectItem?.product?.category || product?.category || '';
  const supplierName = projectItem?.product?.supplier?.name || product?.supplier?.name || 'Sin proveedor';
  const costPrice = projectItem ? projectItem.unit_cost : (product?.cost_price || 0);
  const unitPrice = projectItem?.unit_price || undefined;
  const quantity = projectItem?.quantity || undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{name}</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Imagen */}
          <div className="space-y-4">
            {imageUrl ? (
              <div className="relative aspect-square rounded-lg overflow-hidden bg-secondary/30 dark:bg-muted">
                <img
                  src={imageUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-square rounded-lg bg-secondary/30 dark:bg-muted flex items-center justify-center">
                <span className="text-muted-foreground">Sin imagen</span>
              </div>
            )}
          </div>

          {/* Detalles */}
          <div className="space-y-4">
            {description && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                <p className="text-sm whitespace-pre-wrap">{description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Proveedor</h3>
                <p className="text-sm">{supplierName}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Referencia</h3>
                <p className="text-sm font-mono">{referenceCode || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Categoría</h3>
                <p className="text-sm">{category || '-'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">Código</h3>
                <p className="text-sm font-mono">{internalReference || '-'}</p>
              </div>
            </div>

            {referenceUrl && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">URL de Referencia</h3>
                <a 
                  href={referenceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                >
                  {referenceUrl}
                </a>
              </div>
            )}

            <div className="border-t pt-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-muted-foreground">Costo Unitario</span>
                <span className="text-sm font-mono">${costPrice.toFixed(2)}</span>
              </div>

              {quantity && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Cantidad</span>
                  <span className="text-sm">{quantity}</span>
                </div>
              )}

              {unitPrice && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Precio de Venta</span>
                  <span className="text-sm font-mono">${unitPrice.toFixed(2)}</span>
                </div>
              )}

              {quantity && unitPrice && (
                <div className="flex justify-between border-t pt-3">
                  <span className="font-medium">Total</span>
                  <span className="font-bold text-lg">${(unitPrice * quantity).toFixed(2)}</span>
                </div>
              )}
            </div>

            {projectItem?.purchase_order && projectItem.purchase_order.status !== 'cancelled' && (
              <div className="border rounded-lg p-4 bg-muted/50 dark:bg-muted/20 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Orden de compra</h3>
                <div className="text-sm space-y-1">
                  <p><span className="text-muted-foreground">Ref:</span> <span className="font-medium">{projectItem.purchase_order.order_number}</span></p>
                  <p><span className="text-muted-foreground">Estado:</span> <span className="font-medium">{PO_STATUS_LABELS[projectItem.purchase_order.status] ?? projectItem.purchase_order.status}</span></p>
                  {projectItem.purchase_order.delivery_date && (
                    <p><span className="text-muted-foreground">Fecha de entrega:</span> <span className="font-medium">{new Date(projectItem.purchase_order.delivery_date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span></p>
                  )}
                  {!projectItem.purchase_order.delivery_date && projectItem.purchase_order.delivery_deadline && (
                    <p><span className="text-muted-foreground">Plazo de entrega:</span> <span className="font-medium">{projectItem.purchase_order.delivery_deadline}</span></p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          {projectItem && projectId && onEdit && (
            <Button onClick={onEdit} variant="default">
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          <Button onClick={() => onOpenChange(false)} variant="outline">
            Cerrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
