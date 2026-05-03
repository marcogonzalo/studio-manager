"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DocumentFileUpload } from "@/components/document-file-upload";
import { toast } from "sonner";
import { getDemoAccountMessage } from "@/lib/utils";

function buildFormSchema(t: ReturnType<typeof useTranslations>) {
  return z.object({
    name: z.string().min(1, t("validationNameRequired")),
    file_url: z.string().min(1, t("validationFileRequired")),
  });
}

type FormValues = {
  name: string;
  file_url: string;
};

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
  const t = useTranslations("DialogDocument");
  const formSchema = buildFormSchema(t);
  const [loading, setLoading] = useState(false);
  const uploadedFileUrlRef = useRef<string | null>(null);
  const uploadedFileSizeBytesRef = useRef<number | null>(null);
  const uploadedAssetIdRef = useRef<string | null>(null);
  /** True si ya creamos la fila en BD antes de subir (flujo subida de archivo). */
  const documentRowCreatedForUploadRef = useRef(false);
  const documentIdForUpload = useMemo(() => {
    if (open) return crypto.randomUUID();
    return "";
  }, [open]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: { name: "", file_url: "" },
  });

  const handleUploadSuccess = async (
    url: string,
    fileName?: string,
    fileSizeBytes?: number,
    assetId?: string
  ) => {
    uploadedFileUrlRef.current = url;
    uploadedFileSizeBytesRef.current = fileSizeBytes ?? null;
    uploadedAssetIdRef.current = assetId ?? null;
    form.setValue("file_url", url, { shouldValidate: true });
    const currentName = form.getValues("name");
    if (fileName && !currentName?.trim()) {
      form.setValue("name", fileNameToDisplayName(fileName), {
        shouldValidate: true,
      });
    }
    if (documentRowCreatedForUploadRef.current) {
      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();
      const update: Record<string, unknown> = {
        file_url: url,
        file_type: "link",
      };
      if (fileSizeBytes != null) update.file_size_bytes = fileSizeBytes;
      if (assetId != null) update.asset_id = assetId;
      await supabase
        .from("project_documents")
        .update(update)
        .eq("id", documentIdForUpload)
        .eq("project_id", projectId);
    }
    toast.success(t("toastUploaded"));
  };

  const cleanupOrphanUpload = async () => {
    const url = uploadedFileUrlRef.current;
    if (url) {
      uploadedFileUrlRef.current = null;
      await deleteUploadedDocument(url);
    }
  };

  const ensureDocumentRowBeforeUpload = useCallback(async () => {
    if (documentRowCreatedForUploadRef.current) return;
    const { getSupabaseClient } = await import("@/lib/supabase");
    const supabase = getSupabaseClient();
    const name = form.getValues("name")?.trim() || t("untitled");
    const { error } = await supabase.from("project_documents").insert([
      {
        id: documentIdForUpload,
        project_id: projectId,
        name,
        file_url: "",
        file_type: "link",
      },
    ]);
    if (error) throw error;
    documentRowCreatedForUploadRef.current = true;
  }, [documentIdForUpload, projectId, form, t]);

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      if (documentRowCreatedForUploadRef.current) {
        uploadedFileUrlRef.current = null;
        uploadedFileSizeBytesRef.current = null;
        uploadedAssetIdRef.current = null;
        documentRowCreatedForUploadRef.current = false;
        toast.success(t("toastAdded"));
        form.reset({ name: "", file_url: "" });
        onOpenChange(false);
        onSuccess();
        return;
      }

      const { getSupabaseClient } = await import("@/lib/supabase");
      const supabase = getSupabaseClient();
      const row: Record<string, unknown> = {
        id: documentIdForUpload,
        project_id: projectId,
        name: values.name.trim(),
        file_url: values.file_url.trim(),
        file_type: "link",
      };
      if (uploadedFileSizeBytesRef.current != null) {
        row.file_size_bytes = uploadedFileSizeBytesRef.current;
      }
      if (uploadedAssetIdRef.current) {
        row.asset_id = uploadedAssetIdRef.current;
      }
      const { error } = await supabase.from("project_documents").insert([row]);

      if (error) throw error;

      const savedUrl = values.file_url.trim();
      if (
        uploadedFileUrlRef.current &&
        uploadedFileUrlRef.current !== savedUrl
      ) {
        await deleteUploadedDocument(uploadedFileUrlRef.current);
      }
      uploadedFileUrlRef.current = null;
      uploadedFileSizeBytesRef.current = null;
      uploadedAssetIdRef.current = null;

      toast.success(t("toastAdded"));
      form.reset({ name: "", file_url: "" });
      onOpenChange(false);
      onSuccess();
    } catch (err: unknown) {
      const demoMsg = getDemoAccountMessage(err);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
        await cleanupOrphanUpload();
        return;
      }
      await cleanupOrphanUpload();
      toast.error(err instanceof Error ? err.message : t("toastAddError"));
    } finally {
      setLoading(false);
    }
  }

  const handleOpenChange = async (next: boolean) => {
    if (!next) {
      if (
        documentRowCreatedForUploadRef.current &&
        !uploadedFileUrlRef.current
      ) {
        const { getSupabaseClient } = await import("@/lib/supabase");
        const supabase = getSupabaseClient();
        await supabase
          .from("project_documents")
          .delete()
          .eq("id", documentIdForUpload)
          .eq("project_id", projectId);
        documentRowCreatedForUploadRef.current = false;
      }
      void cleanupOrphanUpload();
      form.reset({ name: "", file_url: "" });
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("nameLabel")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("namePlaceholder")} {...field} />
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
                  <FormLabel>{t("urlImageLabel")}</FormLabel>
                  <Tabs defaultValue="url" className="w-full">
                    <TabsList>
                      <TabsTrigger value="url">URL</TabsTrigger>
                      <TabsTrigger value="upload">
                        {t("uploadFile")}
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url">
                      <FormControl>
                        <Input
                          placeholder={t("urlPlaceholder")}
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
                          onBeforeUpload={ensureDocumentRowBeforeUpload}
                          onUploadSuccess={handleUploadSuccess}
                          onUploadError={(msg) => toast.error(msg)}
                          className="mt-2"
                        />
                      ) : (
                        <div className="mt-2 space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {t("add")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
