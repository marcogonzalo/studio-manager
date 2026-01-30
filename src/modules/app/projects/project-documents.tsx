"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Trash2, Download, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  file_url: string;
  created_at: string;
}

export function ProjectDocuments({ projectId }: { projectId: string }) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [newName, setNewName] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchDocs = async () => {
    const { data } = await supabase
      .from("project_documents")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });
    setDocuments(data || []);
  };

  useEffect(() => {
    fetchDocs();
  }, [projectId]);

  const handleAdd = async () => {
    if (!newName || !newUrl) return;
    setLoading(true);
    const { error } = await supabase.from("project_documents").insert([
      {
        project_id: projectId,
        name: newName,
        file_url: newUrl,
        file_type: "link", // Default for now
      },
    ]);

    if (error) toast.error("Error al añadir documento");
    else {
      toast.success("Documento añadido");
      setNewName("");
      setNewUrl("");
      fetchDocs();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar documento?")) return;
    await supabase.from("project_documents").delete().eq("id", id);
    fetchDocs();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Añadir Documento</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Input
            placeholder="Nombre (ej: Plano Planta)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <Input
            placeholder="URL (http://...)"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
          />
          <Button onClick={handleAdd} disabled={loading}>
            Añadir
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((doc) => (
          <Card key={doc.id}>
            <CardContent className="flex items-center justify-between pt-6">
              <div className="flex items-center">
                <FileText className="mr-3 h-8 w-8 text-blue-500" />
                <div>
                  <div className="font-medium">{doc.name}</div>
                  <div className="text-muted-foreground max-w-[200px] truncate text-xs">
                    {doc.file_url}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" asChild>
                  <a
                    href={doc.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDelete(doc.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
        {documents.length === 0 && (
          <p className="text-muted-foreground col-span-2 text-center">
            No hay documentos.
          </p>
        )}
      </div>
    </div>
  );
}
