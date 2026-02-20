"use client";

import { useEffect, useState } from "react";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyboardHint } from "@/components/ui/keyboard-hint";
import { toast } from "sonner";
import { format } from "date-fns";
import { useAuth } from "@/components/auth-provider";
import { Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Note {
  id: string;
  content: string;
  created_at: string;
  archived: boolean;
  user: { full_name: string };
}

export function ProjectNotes({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const supabase = getSupabaseClient();
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchNotes = async () => {
    const { data, error } = await supabase
      .from("project_notes")
      .select("*, user:profiles(full_name)")
      .eq("project_id", projectId)
      .order("archived", { ascending: true })
      .order("created_at", { ascending: false });

    if (!error) {
      // Separar notas archivadas y no archivadas, mostrar primero las no archivadas
      const nonArchived = (data || []).filter(
        (n: { archived?: boolean }) => !n.archived
      );
      const archived = (data || []).filter(
        (n: { archived?: boolean }) => n.archived
      );
      setNotes([...nonArchived, ...archived]);
    }
  };

  useEffect(() => {
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run when projectId changes only
  }, [projectId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setLoading(true);
    const { error } = await supabase.from("project_notes").insert([
      {
        project_id: projectId,
        content: newNote,
        user_id: user?.id,
        archived: false,
      },
    ]);

    if (error) {
      toast.error("Error al añadir nota");
    } else {
      toast.success("Nota añadida");
      setNewNote("");
      fetchNotes();
    }
    setLoading(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("¿Eliminar esta nota?")) return;
    const { error } = await supabase
      .from("project_notes")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error al eliminar nota");
    } else {
      toast.success("Nota eliminada");
      fetchNotes();
    }
  };

  const handleToggleArchive = async (id: string, currentArchived: boolean) => {
    const { error } = await supabase
      .from("project_notes")
      .update({ archived: !currentArchived })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar nota");
    } else {
      toast.success(currentArchived ? "Nota desarchivada" : "Nota archivada");
      fetchNotes();
    }
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
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                handleAddNote();
              }
            }}
            rows={5}
          />
          <div className="flex items-center gap-2">
            <Button onClick={handleAddNote} disabled={loading}>
              {loading ? "Guardando..." : "Guardar Nota"}
            </Button>
            <KeyboardHint keys="Ctrl/Cmd + Enter" description="para guardar" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {notes.map((note) => (
          <Card
            key={note.id}
            className={note.archived ? "bg-secondary/30/50 opacity-60" : ""}
          >
            <CardContent className="pt-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={note.archived}
                    onChange={() => handleToggleArchive(note.id, note.archived)}
                    className="border-border h-4 w-4 rounded"
                    title={note.archived ? "Desarchivar" : "Archivar"}
                  />
                  <label
                    className="text-muted-foreground cursor-pointer text-xs"
                    onClick={() => handleToggleArchive(note.id, note.archived)}
                  >
                    {note.archived ? "Archivada" : "Archivar"}
                  </label>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Acciones de la nota"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <p className="mb-4 whitespace-pre-wrap">{note.content}</p>
              <div className="text-muted-foreground flex justify-between text-xs">
                <span>{note.user?.full_name || "Usuario"}</span>
                <span>
                  {format(new Date(note.created_at), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && (
          <p className="text-muted-foreground text-center">No hay notas.</p>
        )}
      </div>
    </div>
  );
}
