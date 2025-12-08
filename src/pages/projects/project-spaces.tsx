import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Image as ImageIcon, Package } from 'lucide-react';
import { SpaceDialog } from './space-dialog';
import { SpaceImagesDialog } from './space-images-dialog';
import { SpaceProductsDialog } from './space-products-dialog';

import type { Space } from '@/types';

export function ProjectSpaces({ projectId }: { projectId: string }) {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isImagesOpen, setIsImagesOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);

  const fetchSpaces = async () => {
    const { data, error } = await supabase
      .from('spaces')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    
    if (!error) setSpaces(data || []);
  };

  useEffect(() => {
    fetchSpaces();
  }, [projectId]);

  const openImages = (space: Space) => {
    setSelectedSpace(space);
    setIsImagesOpen(true);
  };

  const openProducts = (space: Space) => {
    setSelectedSpace(space);
    setIsProductsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Espacios del Proyecto</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" /> Nuevo Espacio
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {spaces.map((space) => (
          <Card key={space.id}>
            <CardHeader>
              <CardTitle>{space.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{space.description || "Sin descripción"}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => openProducts(space)}>
                <Package className="mr-2 h-4 w-4" /> Productos
              </Button>
              <Button variant="outline" size="sm" className="flex-1" onClick={() => openImages(space)}>
                <ImageIcon className="mr-2 h-4 w-4" /> Renders
              </Button>
            </CardFooter>
          </Card>
        ))}
        {spaces.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 border rounded-md border-dashed">
            No hay espacios registrados.
          </div>
        )}
      </div>

      <SpaceDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        projectId={projectId}
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchSpaces();
        }}
      />

      {selectedSpace && (
        <>
          <SpaceImagesDialog
            open={isImagesOpen}
            onOpenChange={setIsImagesOpen}
            space={selectedSpace}
          />
          <SpaceProductsDialog
            open={isProductsOpen}
            onOpenChange={setIsProductsOpen}
            space={selectedSpace}
            projectId={projectId}
          />
        </>
      )}
    </div>
  );
}
