import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Product } from '@/types';
import type { ProjectItem } from '@/modules/app/projects/project-budget';

interface ProductDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  projectItem?: ProjectItem | null;
}

export function ProductDetailModal({ open, onOpenChange, product, projectItem }: ProductDetailModalProps) {
  // Si hay projectItem, usar sus datos; si no, usar product
  const displayProduct = projectItem || product;
  
  if (!displayProduct) return null;

  const imageUrl = projectItem?.image_url || product?.image_url;
  const name = projectItem?.name || product?.name;
  const description = projectItem?.description || product?.description || '';
  const referenceCode = projectItem?.product?.reference_code || product?.reference_code || '';
  const referenceUrl = projectItem?.product?.reference_url || product?.reference_url || '';
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
              {referenceCode && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Referencia</h3>
                  <p className="text-sm font-mono">{referenceCode}</p>
                </div>
              )}

              {category && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Categoría</h3>
                  <p className="text-sm">{category}</p>
                </div>
              )}
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

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Proveedor</h3>
              <p className="text-sm">{supplierName}</p>
            </div>

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
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
