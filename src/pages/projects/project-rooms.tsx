import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { RoomDialog } from './room-dialog';
import { RoomImagesDialog } from './room-images-dialog';

import type { Room } from '@/types';

export function ProjectRooms({ projectId }: { projectId: string }) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isImagesOpen, setIsImagesOpen] = useState(false);

  const fetchRooms = async () => {
    const { data, error } = await supabase
      .from('rooms')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at');
    
    if (!error) setRooms(data || []);
  };

  useEffect(() => {
    fetchRooms();
  }, [projectId]);

  const openImages = (room: Room) => {
    setSelectedRoom(room);
    setIsImagesOpen(true);
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
        {rooms.map((room) => (
          <Card key={room.id}>
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">{room.description || "Sin descripción"}</p>
            </CardContent>
            <CardFooter>
              <Button variant="outline" size="sm" className="w-full" onClick={() => openImages(room)}>
                <ImageIcon className="mr-2 h-4 w-4" /> Ver Renders
              </Button>
            </CardFooter>
          </Card>
        ))}
        {rooms.length === 0 && (
          <div className="col-span-full text-center py-8 text-gray-500 border rounded-md border-dashed">
            No hay espacios registrados.
          </div>
        )}
      </div>

      <RoomDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        projectId={projectId}
        onSuccess={() => {
          setIsDialogOpen(false);
          fetchRooms();
        }}
      />

      {selectedRoom && (
        <RoomImagesDialog
          open={isImagesOpen}
          onOpenChange={setIsImagesOpen}
          room={selectedRoom}
        />
      )}
    </div>
  );
}

