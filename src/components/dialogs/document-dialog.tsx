"use client";

import { useMemo, useRef, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentFileUpload } from "@/components/document-file-upload";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  file_url: z.string().min(1, "URL o archivo requerido"),
});

type FormValues = z.infer<typeof formSchema>;

interface DocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  onSuccess: () => void;
}

function fileNameToDisplayName(fileName: string): string {
  const lastDot = fileName.lastIndexOf(".");
  if (lastDot <= 0) return fileName;
  return fileName.slice(0, lastDot);
}

async function deleteUploadedDocument(url: string): Promise<void> {
  try {
    await fetch(`/api/upload/document?url=${encodeURIComponent(url)}`, {
      method: "DELETE",
    });
  } catch {
    // Fallo silencioso al eliminar huérfanos
  }
}

export function DocumentDialog({
  open,
  onOpenChange,
  projectId,
  onSuccess,
}: DocumentDialogProps) {
  const [loading, setLoading] = useState(false);
  const uploadedFileUrlRef = useRef<string | null>(null);
  const documentIdForUpload = useMemo(() => {
    if (open) return crypto.randomUUID();
    return "";
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: { name: "", file_url: "" },
  });

  const handleUploadSuccess = (url: string, fileName?: string) => {
    uploadedFileUrlRef.current = url;
    form.setValue("file_url", url, { shouldValidate: true });
    const currentName = form.getValues("name");
    if (fileName && !currentName?.trim()) {
      form.setValue("name", fileNameToDisplayName(fileName), {
        shouldValidate: true,
      });
    }
    toast.success("Documento subido");
  };

  const cleanupOrphanUpload = async () => {
    const url = uploadedFileUrlRef.current;
    if (url) {
      uploadedFileUrlRef.current = null;
      await deleteUploadedDocument(url);
    }
  };

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();
      const { error } = await supabase.from("project_documents").insert([
        {
          project_id: projectId,
          name: values.name.trim(),
          file_url: values.file_url.trim(),
          file_type: "link",
        },
      ]);

      if (error) throw error;

      const savedUrl = values.file_url.trim();
      if (
        uploadedFileUrlRef.current &&
        uploadedFileUrlRef.current !== savedUrl
      ) {
        await deleteUploadedDocument(uploadedFileUrlRef.current);
      }
      uploadedFileUrlRef.current = null;

      toast.success("Documento añadido");
      form.reset({ name: "", file_url: "" });
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      await cleanupOrphanUpload();
      toast.error(
        err instanceof Error ? err.message : "Error al añadir documento"
      );
    } finally {
      setLoading(false);
    }
  }

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      void cleanupOrphanUpload();
      form.reset({ name: "", file_url: "" });
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Añadir documento</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ej: Plano Planta, Informe..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="file_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL / Imagen</FormLabel>
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList>
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="upload">Subir archivo</TabsTrigger>
                    </TabsList>
                    <TabsContent value="url">
                      <FormControl>
                        <Input
                          placeholder="https://..."
                          {...field}
                          className="mt-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </TabsContent>
                    <TabsContent value="upload">
                      {documentIdForUpload ? (
                        <DocumentFileUpload
                          documentId={documentIdForUpload}
                          projectId={projectId}
                          currentFileUrl={field.value || undefined}
                          onUploadSuccess={handleUploadSuccess}
                          onUploadError={(msg) => toast.error(msg)}
                          className="mt-2"
                        />
                      ) : (
                        <p className="text-muted-foreground mt-2 text-sm">
                          Cargando…
                        </p>
                      )}
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                Añadir documento
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
