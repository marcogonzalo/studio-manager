import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDocs = async () => {
    const { data } = await supabase.from('project_documents').select('*').eq('project_id', projectId).order('created_at', { ascending: false });
    setDocuments(data || []);
  };

  useEffect(() => { fetchDocs(); }, [projectId]);

  const handleAdd = async () => {
    if (!newName || !newUrl) return;
    setLoading(true);
    const { error } = await supabase.from('project_documents').insert([{
      project_id: projectId,
      name: newName,
      file_url: newUrl,
      file_type: 'link' // Default for now
    }]);

    if (error) toast.error('Error al añadir documento');
    else {
      toast.success('Documento añadido');
      setNewName('');
      setNewUrl('');
      fetchDocs();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar documento?')) return;
    await supabase.from('project_documents').delete().eq('id', id);
    fetchDocs();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Añadir Documento</CardTitle></CardHeader>
        <CardContent className="flex gap-4">
          <Input placeholder="Nombre (ej: Plano Planta)" value={newName} onChange={e => setNewName(e.target.value)} />
          <Input placeholder="URL (http://...)" value={newUrl} onChange={e => setNewUrl(e.target.value)} />
          <Button onClick={handleAdd} disabled={loading}>Añadir</Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map(doc => (
          <Card key={doc.id}>
            <CardContent className="pt-6 flex justify-between items-center">
              <div className="flex items-center">
                <FileText className="mr-3 h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-xs text-gray-500 truncate max-w-[200px]">{doc.file_url}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <a href={doc.file_url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4" /></a>
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDelete(doc.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {documents.length === 0 && <p className="text-center text-gray-500 col-span-2">No hay documentos.</p>}
      </div>
    </div>
  );
}
