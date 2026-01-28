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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useEffect, useState, useMemo } from 'react';
import { Plus, Search } from 'lucide-react';
import { ProductDetailModal } from '@/components/product-detail-modal';
import type { Product, Space, Supplier } from '@/types';
import type { ProjectItem } from '@/modules/app/projects/project-budget';
import { useAuth } from '@/components/auth-provider';
import { SupplierDialog } from './supplier-dialog';
import { Checkbox } from '@/components/ui/checkbox';

const formSchema = z.object({
  product_id: z.string().optional(),
  space_id: z.string().optional(),
  supplier_id: z.string().optional(),
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  reference_code: z.string().optional(),
  reference_url: z.string().optional(),
  category: z.string().optional(),
  internal_reference: z.string().optional(),
  quantity: z.string()
    .transform(v => parseFloat(v) || 1)
    .refine(val => val > 0, "La cantidad debe ser mayor a 0"),
  unit_cost: z.string()
    .transform(v => parseFloat(v) || 0)
    .refine(val => val >= 0, "El costo unitario debe ser mayor o igual a 0"),
  markup: z.string().transform(v => parseFloat(v) || 0),
  unit_price: z.string().transform(v => parseFloat(v) || 0),
  image_url: z.string().optional(),
  is_excluded: z.boolean().optional(),
});

interface AddItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
  item?: ProjectItem | null;
  spaceId?: string;
}

export function AddItemDialog({ open, onOpenChange, projectId, onSuccess, item, spaceId }: AddItemDialogProps) {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isSupplierDialogOpen, setIsSupplierDialogOpen] = useState(false);
  const [pendingSupplierId, setPendingSupplierId] = useState<string | null>(null);
  const isEditing = !!item;

  type FormValues = {
    product_id?: string;
    space_id?: string;
    supplier_id?: string;
    name: string;
    description?: string;
    reference_code?: string;
    reference_url?: string;
    category?: string;
    internal_reference?: string;
    quantity: string;
    unit_cost: string;
    markup: string;
    unit_price: string;
    image_url?: string;
    is_excluded?: boolean;
  };
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      product_id: "",
      space_id: "none",
      supplier_id: "none",
      name: "",
      description: "",
      reference_code: "",
      reference_url: "",
      category: "",
      internal_reference: "",
      quantity: "1" as any,
      unit_cost: "0" as any,
      markup: "20" as any,
      unit_price: "0" as any,
      image_url: "",
      is_excluded: false,
    },
  });

  // Filter products based on search query
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    const query = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(query) ||
      p.description?.toLowerCase().includes(query) ||
      p.reference_code?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // Auto-calculate price when cost or markup changes
  const unitCost = form.watch('unit_cost');
  const markup = form.watch('markup');
  
  useEffect(() => {
    if (unitCost && markup !== undefined) {
      // Price = Cost + (Cost * Markup / 100)
      // OR Price = Cost / (1 - Markup/100) ? Usually Markup is % of cost added.
      // Let's assume Markup is percentage added to cost.
      const cost = parseFloat(unitCost as any) || 0;
      const mark = parseFloat(markup as any) || 0;
      const price = cost * (1 + mark / 100);
      form.setValue('unit_price', price.toFixed(2) as any);
    }
  }, [unitCost, markup, form]);

  useEffect(() => {
    async function loadData() {
      const { data: rData } = await supabase.from('spaces').select('*').eq('project_id', projectId);
      setSpaces(rData || []);
      const { data: pData } = await supabase.from('products').select('*, supplier:suppliers(name)').order('name');
      setProducts(pData || []);
      const { data: sData } = await supabase.from('suppliers').select('*').order('name');
      setSuppliers(sData || []);
      
      // Load item data if editing (after products are loaded)
      if (item && open) {
        // Si tiene producto asociado, cargar sus datos
        let productData = { description: "", reference_code: "", reference_url: "", category: "" };
          if (item.product_id && pData) {
            const prod = pData.find(p => p.id === item.product_id);
            if (prod) {
              productData = {
                description: prod.description || "",
                reference_code: prod.reference_code || "",
                reference_url: prod.reference_url || "",
                category: prod.category || ""
              };
            }
          }
        
        form.reset({
          product_id: item.product_id || "custom",
          space_id: item.space_id || "none",
          supplier_id: item.supplier_id || "none",
          name: item.name || "",
          description: productData.description,
          reference_code: productData.reference_code,
          reference_url: productData.reference_url,
          category: productData.category,
          internal_reference: item.internal_reference || "",
          quantity: item.quantity?.toString() || "1",
          unit_cost: item.unit_cost?.toString() || "0",
          markup: item.markup?.toString() || "20",
          unit_price: item.unit_price?.toString() || "0",
          image_url: item.image_url || "",
          is_excluded: item.is_excluded || false,
        });
        if (item.product_id && pData) {
          const prod = pData.find(p => p.id === item.product_id);
          if (prod) {
            setSelectedProduct(prod);
            setActiveTab('catalog');
          } else {
            setActiveTab('new');
          }
        } else {
          setActiveTab('new');
        }
      } else if (open && !item) {
        form.reset({
          product_id: "",
          space_id: spaceId || "none",
          supplier_id: "none",
          name: "",
          description: "",
          reference_code: "",
          reference_url: "",
          category: "",
          internal_reference: "",
          quantity: "1" as any,
          unit_cost: "0" as any,
          markup: "20" as any,
          unit_price: "0" as any,
          image_url: "",
        });
        setSelectedProduct(null);
        setActiveTab('catalog');
        setSearchQuery('');
      }
    }
    if (open) loadData();
  }, [open, projectId, item, spaceId, form]);

  const handleProductSelect = (productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (prod) {
      form.setValue('product_id', productId);
      setSelectedProduct(prod);
      form.setValue('name', prod.name);
      form.setValue('description', prod.description || '');
      form.setValue('reference_code', prod.reference_code || '');
      form.setValue('reference_url', prod.reference_url || '');
      form.setValue('category', prod.category || '');
      form.setValue('unit_cost', prod.cost_price.toString() as any);
      form.setValue('image_url', prod.image_url || "");
      form.setValue('supplier_id', prod.supplier_id || 'none');
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchQuery('');
    if (value === 'new') {
      form.setValue('product_id', 'custom');
      setSelectedProduct(null);
      // Limpiar solo campos de producto, mantener campos de project_item si ya tienen valores
      form.setValue('description', '');
      form.setValue('reference_code', '');
      form.setValue('reference_url', '');
      form.setValue('category', '');
      form.setValue('image_url', '');
      form.setValue('supplier_id', 'none');
    } else {
      form.setValue('product_id', '');
      setSelectedProduct(null);
      // Limpiar campos de producto cuando vuelve a catálogo
      form.setValue('description', '');
      form.setValue('reference_code', '');
      form.setValue('reference_url', '');
      form.setValue('category', '');
      form.setValue('image_url', '');
      form.setValue('supplier_id', 'none');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema> | FormValues) {
    try {
      // Validar que el proveedor sea obligatorio cuando se crea un nuevo producto
      if (activeTab === 'new' && (!values.supplier_id || values.supplier_id === 'none')) {
        form.setError('supplier_id', { message: 'Proveedor requerido' });
        toast.error('El proveedor es obligatorio para nuevos productos');
        return;
      }

      // Validar que no se pueda marcar como excluido si está asociado a PO no cancelada
      if (values.is_excluded && item?.purchase_order_id) {
        // Verificar si la PO está cancelada
        const { data: poData } = await supabase
          .from('purchase_orders')
          .select('status')
          .eq('id', item.purchase_order_id)
          .single();
        
        if (poData && poData.status !== 'cancelled') {
          toast.error('No se puede excluir un producto asociado a una orden de compra activa. Cancela la orden primero.');
          form.setValue('is_excluded', false);
          return;
        }
      }

      let finalProductId = values.product_id === 'custom' || activeTab === 'new' ? null : values.product_id;

      // Si es un producto personalizado (no del catálogo), primero créalo en products
      if ((values.product_id === 'custom' || activeTab === 'new') && !isEditing) {
        if (!user?.id) {
          toast.error('No se pudo identificar el usuario');
          return;
        }

        const { data: newProduct, error: productError } = await supabase
          .from('products')
          .insert([{
            name: values.name,
            description: values.description || '',
            reference_code: values.reference_code || '',
            reference_url: values.reference_url || null,
            category: values.category || '',
            cost_price: values.unit_cost,
            image_url: values.image_url || null,
            supplier_id: (values.supplier_id === 'none' || !values.supplier_id) ? null : values.supplier_id,
            user_id: user.id
          }])
          .select()
          .single();

        if (productError) throw productError;
        finalProductId = newProduct.id;
      }

      const data = {
        project_id: projectId,
        space_id: (values.space_id === 'none' || !values.space_id) ? null : values.space_id,
        product_id: finalProductId,
        name: values.name,
        quantity: values.quantity,
        unit_cost: values.unit_cost,
        markup: values.markup,
        unit_price: values.unit_price,
        image_url: values.image_url,
        internal_reference: values.internal_reference || null,
        is_excluded: values.is_excluded || false,
        ...(isEditing ? {} : { status: 'pending' })
      };
      
      if (isEditing && item?.id) {
        // Si estamos editando y el producto era custom, actualizar el producto también
        if ((values.product_id === 'custom' || activeTab === 'new') && item.product_id) {
          await supabase
            .from('products')
            .update({
              name: values.name,
              description: values.description || '',
              reference_code: values.reference_code || '',
              reference_url: values.reference_url || null,
              category: values.category || '',
              cost_price: values.unit_cost,
              image_url: values.image_url || null,
              supplier_id: (values.supplier_id === 'none' || !values.supplier_id) ? null : values.supplier_id
            })
            .eq('id', item.product_id);
        }

        const { error } = await supabase
          .from('project_items')
          .update(data)
          .eq('id', item.id);
        if (error) throw error;
        toast.success('Ítem actualizado');
      } else {
      const { error } = await supabase.from('project_items').insert([data]);
      if (error) throw error;
      toast.success('Ítem añadido');
      }

      form.reset();
      onSuccess();
    } catch (error) {
      toast.error('Error al guardar');
    }
  }

  // const selectedProductId = form.watch('product_id'); // No usado actualmente

  // Sincronizar el valor del proveedor cuando la lista se actualiza y hay un proveedor pendiente
  useEffect(() => {
    if (pendingSupplierId && suppliers.length > 0) {
      const supplierExists = suppliers.some(s => s.id === pendingSupplierId);
      if (supplierExists) {
        form.setValue('supplier_id', pendingSupplierId, { shouldValidate: true, shouldDirty: true });
        setPendingSupplierId(null);
      }
    }
  }, [suppliers, pendingSupplierId, form]);

  const handleSupplierCreated = async (newSupplierId: string) => {
    // Recargar la lista de proveedores
    const { data } = await supabase.from('suppliers').select('*').order('name');
    if (data) {
      setSuppliers(data);
      // Establecer el proveedor pendiente para que se seleccione cuando la lista se actualice
      setPendingSupplierId(newSupplierId);
    }
    setIsSupplierDialogOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Editar Ítem del Presupuesto' : 'Añadir Ítem al Presupuesto'}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Tabs para seleccionar producto */}
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-b-none">
                <TabsTrigger value="catalog">Seleccionar del Catálogo</TabsTrigger>
                <TabsTrigger value="new">Nuevo Producto</TabsTrigger>
              </TabsList>

              {/* Pestaña: Seleccionar del catálogo */}
              <TabsContent value="catalog" className="mt-0">
                <div className="bg-muted rounded-b-lg rounded-t-none p-1 space-y-4">
                  <FormField 
                    control={form.control} 
                    name="product_id" 
                    render={({ field }) => (
                      <FormItem>
                        <div className="space-y-3">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              placeholder="Buscar por nombre, descripción o referencia..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-9 bg-background"
                            />
                          </div>
                          
                          {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[300px] overflow-y-auto p-2 border rounded-md bg-background">
                            {filteredProducts.map((product) => (
                              <button
                                key={product.id}
                                type="button"
                                onClick={() => {
                                  field.onChange(product.id);
                                  handleProductSelect(product.id);
                                }}
                                className={`border-2 rounded-lg overflow-hidden hover:shadow-md transition-all ${
                                  field.value === product.id 
                                    ? 'border-primary bg-primary/10' 
                                    : 'border-border bg-card'
                                }`}
                              >
                                <div className="aspect-square bg-secondary/30 dark:bg-muted relative">
                                  {product.image_url ? (
                                    <div className="relative w-full h-full group">
                                      <img 
                                        src={product.image_url} 
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                      />
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setPreviewProduct(product);
                                          setIsProductModalOpen(true);
                                        }}
                                        className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100"
                                        title="Ver detalles"
                                      >
                                        <Search className="h-6 w-6 text-white drop-shadow-lg" />
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                                      Sin imagen
                                    </div>
                                  )}
                                </div>
                                <div className="p-2">
                                  <div className="font-medium text-sm mb-1 line-clamp-2">{product.name}</div>
                                  <div className="text-xs text-muted-foreground">{product.supplier?.name || 'Sin proveedor'}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed rounded-md bg-background">
                            <p className="text-sm text-muted-foreground">
                              {searchQuery ? 'No se encontraron productos con esa búsqueda' : 'No hay productos en el catálogo'}
                            </p>
                          </div>
                        )}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              {/* Pestaña: Nuevo Producto */}
              <TabsContent value="new" className="mt-0">
                <div className="bg-muted rounded-b-lg rounded-t-none p-4 space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel required>Nombre del Producto</FormLabel>
                      <FormControl><Input {...field} className="bg-background" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="supplier_id" render={({ field }) => (
                      <FormItem>
                        <FormLabel required>Proveedor</FormLabel>
                        <div className="flex gap-2">
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar proveedor" /></SelectTrigger></FormControl>
                            <SelectContent>
                              {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => setIsSupplierDialogOpen(true)}
                            title="Agregar nuevo proveedor"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="reference_code" render={({ field }) => (
                      <FormItem><FormLabel>Referencia</FormLabel><FormControl><Input placeholder="Código o referencia" {...field} className="bg-background" /></FormControl></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Descripción del producto..." {...field} className="bg-background" /></FormControl></FormItem>
                  )} />

                  <FormField control={form.control} name="reference_url" render={({ field }) => (
                    <FormItem><FormLabel>URL de Referencia</FormLabel><FormControl><Input type="url" placeholder="https://..." {...field} className="bg-background" /></FormControl></FormItem>
                  )} />

                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Categoría</FormLabel><FormControl><Input placeholder="Ej: Muebles, Iluminación, Textiles..." {...field} className="bg-background" /></FormControl></FormItem>
                  )} />

                  <FormField control={form.control} name="image_url" render={({ field }) => (
                    <FormItem><FormLabel>Imagen URL</FormLabel><FormControl><Input placeholder="http://..." {...field} className="bg-background" /></FormControl></FormItem>
                  )} />
                </div>
              </TabsContent>
            </Tabs>

            {/* Campos de project_item - siempre visibles */}
            <div className="border-t pt-4 space-y-4">
              <FormField control={form.control} name="space_id" render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar espacio" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">General / Ninguno</SelectItem>
                      {spaces.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />

              <FormField control={form.control} name="internal_reference" render={({ field }) => (
                <FormItem>
                  <FormLabel>Código</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Clave para asociar con anotaciones en planos" 
                      {...field} 
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField
                control={form.control}
                name="is_excluded"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          field.onChange(checked);
                          // Validar si está asociado a PO no cancelada
                          if (checked && item?.purchase_order_id) {
                            supabase
                              .from('purchase_orders')
                              .select('status')
                              .eq('id', item.purchase_order_id)
                              .single()
                              .then(({ data: poData }) => {
                                if (poData && poData.status !== 'cancelled') {
                                  toast.error('No se puede excluir un producto asociado a una orden de compra activa. Cancela la orden primero.');
                                  field.onChange(false);
                                }
                              });
                          }
                        }}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="cursor-pointer">
                        Excluir del proyecto
                      </FormLabel>
                      <p className="text-xs text-muted-foreground">
                        Si está marcado, el producto no se incluirá en el presupuesto ni en los cálculos de costos.
                      </p>
                      {item?.purchase_order_id && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                          ⚠ No se puede excluir si está asociado a una orden de compra activa.
                        </p>
                      )}
                    </div>
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-4 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Cantidad</FormLabel><FormControl><Input type="number" min="0.01" step="0.01" {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="unit_cost" render={({ field }) => (
                  <FormItem><FormLabel>Costo Unit.</FormLabel><FormControl><Input type="number" min="0" step="0.01" {...field} className="bg-background" /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="markup" render={({ field }) => (
                  <FormItem><FormLabel>Margen %</FormLabel><FormControl><Input type="number" step="0.1" {...field} className="bg-background" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="unit_price" render={({ field }) => (
                  <FormItem><FormLabel>Precio Venta</FormLabel><FormControl><Input type="number" step="0.01" {...field} className="bg-background" /></FormControl></FormItem>
                )} />
              </div>
            </div>

            <DialogFooter><Button type="submit">{isEditing ? 'Guardar Cambios' : 'Añadir al Presupuesto'}</Button></DialogFooter>
          </form>
        </Form>
      </DialogContent>

      <ProductDetailModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        product={previewProduct}
      />

      <SupplierDialog
        open={isSupplierDialogOpen}
        onOpenChange={setIsSupplierDialogOpen}
        supplier={null}
        onSuccess={async (supplierId) => {
          if (supplierId) {
            await handleSupplierCreated(supplierId);
            toast.success('Proveedor creado y seleccionado');
          }
        }}
      />
    </Dialog>
  );
}

