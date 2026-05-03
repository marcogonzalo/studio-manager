"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KeyboardHint } from "@/components/ui/keyboard-hint";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { Trash2, MoreVertical, StickyNote } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getDemoAccountMessage } from "@/lib/utils";
import { useAppFormatting } from "@/components/providers/app-formatting-provider";
import { ProjectTabContent, TabSectionHeader } from "./project-tab-content";

interface Note {
  id: string;
  content: string;
  created_at: string;
  archived: boolean;
  user: { full_name: string };
}

export function ProjectNotes({
  projectId,
  readOnly = false,
  disabled = false,
}: {
  projectId: string;
  readOnly?: boolean;
  disabled?: boolean;
}) {
  const t = useTranslations("ProjectModuleNotes");
  const { formatDate } = useAppFormatting();
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
      const demoMsg = getDemoAccountMessage(error);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
      } else {
        toast.error(t("toastAddError"));
      }
    } else {
      toast.success(t("toastAdded"));
      setNewNote("");
      fetchNotes();
    }
    setLoading(false);
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm(t("confirmDelete"))) return;
    const { error } = await supabase
      .from("project_notes")
      .delete()
      .eq("id", id);

    if (error) {
      const demoMsg = getDemoAccountMessage(error);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
      } else {
        toast.error(t("toastDeleteError"));
      }
    } else {
      toast.success(t("toastDeleted"));
      fetchNotes();
    }
  };

  const handleToggleArchive = async (id: string, currentArchived: boolean) => {
    const { error } = await supabase
      .from("project_notes")
      .update({ archived: !currentArchived })
      .eq("id", id);

    if (error) {
      const demoMsg = getDemoAccountMessage(error);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
      } else {
        toast.error(t("toastUpdateError"));
      }
    } else {
      toast.success(
        currentArchived ? t("toastUnarchived") : t("toastArchived")
      );
      fetchNotes();
    }
  };

  return (
    <ProjectTabContent
      disabled={disabled}
      disabledMessage={t("disabledMessage")}
    >
      <div className="space-y-6">
        <TabSectionHeader title={t("title")} />
        <div className="grid gap-6 md:grid-cols-2">
          {!readOnly && (
            <Card className="h-full">
              <CardHeader>
                <CardTitle>{t("addTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder={t("placeholder")}
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
                    {loading ? t("saving") : t("save")}
                  </Button>
                  <KeyboardHint
                    keys="Ctrl/Cmd + Enter"
                    description={t("shortcutDescription")}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {notes.length === 0 ? (
            <div
              className={
                readOnly ? "md:col-span-2" : "flex h-full min-h-0 flex-col"
              }
            >
              <Card className="flex h-full flex-col">
                <CardContent className="flex flex-1 flex-col justify-center py-12 text-center">
                  <StickyNote className="text-muted-foreground mx-auto mb-4 h-12 w-12" />
                  <p className="text-muted-foreground mb-4">{t("empty")}</p>
                  {!readOnly && (
                    <p className="text-muted-foreground text-sm">
                      {t("emptyHint")}
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <Card
                  key={note.id}
                  className={
                    note.archived ? "bg-secondary/30/50 opacity-60" : ""
                  }
                >
                  <CardContent className="pt-6">
                    <div className="mb-4 flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {!readOnly && (
                          <>
                            <input
                              type="checkbox"
                              checked={note.archived}
                              onChange={() =>
                                handleToggleArchive(note.id, note.archived)
                              }
                              className="border-border h-4 w-4 rounded"
                              title={
                                note.archived ? t("unarchive") : t("archive")
                              }
                            />
                            <label
                              className="text-muted-foreground cursor-pointer text-xs"
                              onClick={() =>
                                handleToggleArchive(note.id, note.archived)
                              }
                            >
                              {note.archived ? t("archived") : t("archive")}
                            </label>
                          </>
                        )}
                      </div>
                      {!readOnly && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={t("actionsAria")}
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
                              {t("delete")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                    <p className="mb-4 whitespace-pre-wrap">{note.content}</p>
                    <div className="text-muted-foreground flex justify-between text-xs">
                      <span>{note.user?.full_name || t("userFallback")}</span>
                      <span>
                        {formatDate(note.created_at, {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProjectTabContent>
  );
}
