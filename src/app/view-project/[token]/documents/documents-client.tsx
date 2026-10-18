"use client";

import { FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

interface DocumentRow {
  id: string;
  name: string;
  file_url: string;
  file_type: string;
}

export function ViewProjectDocumentsClient({
  documents,
}: {
  documents: DocumentRow[];
}) {
  const t = useTranslations("ViewProject");

  if (documents.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title={t("noDocuments")}
        description={t("noDocumentsDescription")}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {documents.map((document) => (
        <a
          key={document.id}
          href={document.file_url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("viewDocumentAria", { name: document.name })}
        >
          <Card className="h-full transition-shadow hover:shadow-md">
            <CardContent className="flex h-full flex-col items-center justify-center gap-3 p-4 text-center">
              <FileText className="text-muted-foreground h-8 w-8" aria-hidden />
              <p className="line-clamp-2 text-sm font-medium">
                {document.name}
              </p>
            </CardContent>
          </Card>
        </a>
      ))}
    </div>
  );
}
