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
import type { ProjectItem } from '@/pages/projects/project-budget';
import { useAuth } from '@/components/auth-provider';

const formSchema = z.object({
  product_id: z.string().optional(),
  space_id: z.string().optional(),
  supplier_id: z.string().optional(),
  name: z.string().min(2, "Nombre requerido"),
  description: z.string().optional(),
  reference_code: z.string().optional(),
  category: z.string().optional(),
  quantity: z.string().transform(v => parseFloat(v) || 1),
  unit_cost: z.string().transform(v => parseFloat(v) || 0),
  markup: z.string().transform(v => parseFloat(v) || 0),
  unit_price: z.string().transform(v => parseFloat(v) || 0),
  image_url: z.string().optional(),
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
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('catalog');
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const isEditing = !!item;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      product_id: "",
      space_id: "none",
      supplier_id: "none",
      name: "",
      description: "",
      reference_code: "",
      category: "",
      quantity: "1" as any,
      unit_cost: "0" as any,
      markup: "20" as any,
      unit_price: "0" as any,
      image_url: "",
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
        let productData = { description: "", reference_code: "", category: "" };
        if (item.product_id && pData) {
          const prod = pData.find(p => p.id === item.product_id);
          if (prod) {
            productData = {
              description: prod.description || "",
              reference_code: prod.reference_code || "",
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
          category: productData.category,
          quantity: item.quantity?.toString() || "1",
          unit_cost: item.unit_cost?.toString() || "0",
          markup: item.markup?.toString() || "20",
          unit_price: item.unit_price?.toString() || "0",
          image_url: item.image_url || "",
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
          category: "",
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
      form.setValue('category', '');
      form.setValue('image_url', '');
      form.setValue('supplier_id', 'none');
    } else {
      form.setValue('product_id', '');
      setSelectedProduct(null);
      // Limpiar campos de producto cuando vuelve a catálogo
      form.setValue('description', '');
      form.setValue('reference_code', '');
      form.setValue('category', '');
      form.setValue('image_url', '');
      form.setValue('supplier_id', 'none');
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
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

  const selectedProductId = form.watch('product_id');

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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                                }`}
                              >
                                <div className="aspect-square bg-gray-100 dark:bg-gray-700 relative">
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
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                      Sin imagen
                                    </div>
                                  )}
                                </div>
                                <div className="p-2">
                                  <div className="font-medium text-sm mb-1 line-clamp-2">{product.name}</div>
                                  <div className="text-xs text-gray-500">{product.supplier?.name || 'Sin proveedor'}</div>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8 border border-dashed rounded-md bg-background">
                            <p className="text-sm text-gray-500">
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
                      <FormLabel>Nombre del Producto</FormLabel>
                      <FormControl><Input {...field} className="bg-background" /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name="supplier_id" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Proveedor</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl><SelectTrigger className="bg-background"><SelectValue placeholder="Seleccionar proveedor (opcional)" /></SelectTrigger></FormControl>
                          <SelectContent>
                            <SelectItem value="none">-- Sin proveedor --</SelectItem>
                            {suppliers.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="reference_code" render={({ field }) => (
                      <FormItem><FormLabel>Referencia</FormLabel><FormControl><Input placeholder="Código o referencia" {...field} className="bg-background" /></FormControl></FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Descripción</FormLabel><FormControl><Textarea placeholder="Descripción del producto..." {...field} className="bg-background" /></FormControl></FormItem>
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

              <div className="grid grid-cols-4 gap-4">
                <FormField control={form.control} name="quantity" render={({ field }) => (
                  <FormItem><FormLabel>Cantidad</FormLabel><FormControl><Input type="number" {...field} className="bg-background" /></FormControl></FormItem>
                )} />
                <FormField control={form.control} name="unit_cost" render={({ field }) => (
                  <FormItem><FormLabel>Costo Unit.</FormLabel><FormControl><Input type="number" step="0.01" {...field} className="bg-background" /></FormControl></FormItem>
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
    </Dialog>
  );
}

