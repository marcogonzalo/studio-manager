import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { Space } from '@/types';
import { Trash2 } from 'lucide-react';

interface Image {
  id: string;
  url: string;
  description: string;
}

export function SpaceImagesDialog({ open, onOpenChange, space }: { open: boolean, onOpenChange: (o: boolean) => void, space: Space }) {
  const [images, setImages] = useState<Image[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchImages = async () => {
    const { data } = await supabase.from('space_images').select('*').eq('space_id', space.id);
    setImages(data || []);
  };

  useEffect(() => {
    if (open) fetchImages();
  }, [open, space.id]);

  const handleAddImage = async () => {
    if (!newImageUrl) return;
    setLoading(true);
    const { error } = await supabase.from('space_images').insert([{
      space_id: space.id,
      url: newImageUrl,
      description: 'Render'
    }]);

    if (error) {
      toast.error('Error al añadir imagen');
    } else {
      toast.success('Imagen añadida');
      setNewImageUrl('');
      fetchImages();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('space_images').delete().eq('id', id);
    if (!error) {
      toast.success('Imagen eliminada');
      fetchImages();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Renders - {space.name}</DialogTitle>
          <DialogDescription>
            Visualizaciones del espacio.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex gap-2 mb-4">
          <Input 
            placeholder="URL de la imagen (http://...)" 
            value={newImageUrl} 
            onChange={(e) => setNewImageUrl(e.target.value)}
          />
          <Button onClick={handleAddImage} disabled={loading}>Añadir</Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group border rounded-md overflow-hidden aspect-video">
              <img src={img.url} alt={img.description} className="object-cover w-full h-full" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="destructive" size="icon" onClick={() => handleDelete(img.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {images.length === 0 && (
            <div className="col-span-full text-center py-10 text-muted-foreground">No hay imágenes.</div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
