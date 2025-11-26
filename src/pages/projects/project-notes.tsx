import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAuth } from '@/components/auth-provider';

interface Note {
  id: string;
  content: string;
  created_at: string;
  user: { full_name: string };
}

export function ProjectNotes({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from('project_notes')
      .select('*, user:profiles(full_name)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
    
    if (!error) setNotes(data || []);
  };

  useEffect(() => {
    fetchNotes();
  }, [projectId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);
    const { error } = await supabase.from('project_notes').insert([{
      project_id: projectId,
      content: newNote,
      user_id: user?.id
    }]);

    if (error) {
      toast.error('Error al añadir nota');
    } else {
      toast.success('Nota añadida');
      setNewNote('');
      fetchNotes();
    }
    setLoading(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Añadir Nota</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea 
            placeholder="Escribe una nota..." 
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            rows={5}
          />
          <Button onClick={handleAddNote} disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Nota'}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card key={note.id}>
            <CardContent className="pt-6">
              <p className="whitespace-pre-wrap mb-4">{note.content}</p>
              <div className="text-xs text-gray-500 flex justify-between">
                <span>{note.user?.full_name || 'Usuario'}</span>
                <span>{format(new Date(note.created_at), 'dd/MM/yyyy HH:mm')}</span>
              </div>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && <p className="text-gray-500 text-center">No hay notas.</p>}
      </div>
    </div>
  );
}

