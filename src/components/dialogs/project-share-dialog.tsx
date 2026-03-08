"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
import type { ProjectShareLink } from "@/lib/project-share";
import {
  getOrCreateProjectShareLink,
  regenerateProjectShareToken,
  setProjectShareEnabled,
} from "@/lib/project-share";

export function ProjectShareDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const [link, setLink] = useState<ProjectShareLink | null>(null);
  const [loading, setLoading] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [toggling, setToggling] = useState(false);

  const shareUrl =
    typeof window !== "undefined" && link
      ? `${window.location.origin}/view-project/${link.token}`
      : "";

  const fetchLink = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    const { data, error } = await getOrCreateProjectShareLink(projectId);
    setLoading(false);
    if (error) {
      toast.error(error);
      return;
    }
    setLink(data);
  }, [projectId]);

  useEffect(() => {
    if (open && projectId) fetchLink();
  }, [open, projectId, fetchLink]);

  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    void navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success("Enlace copiado al portapapeles");
    });
  }, [shareUrl]);

  const handleRegenerate = useCallback(async () => {
    if (!projectId) return;
    setRegenerating(true);
    const { data, error } = await regenerateProjectShareToken(projectId);
    setRegenerating(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (data) {
      setLink(data);
      toast.success("Enlace renovado. El anterior deja de funcionar.");
    }
  }, [projectId]);

  const handleToggleEnabled = useCallback(async () => {
    if (!link) return;
    const next = !link.is_enabled;
    setToggling(true);
    const { data, error } = await setProjectShareEnabled(projectId, next);
    setToggling(false);
    if (error) {
      toast.error(error);
      return;
    }
    if (data) setLink(data);
  }, [link, projectId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir con el cliente</DialogTitle>
          <DialogDescription>
            Quien tenga este enlace podrá ver la información básica del proyecto
            sin iniciar sesión. Puedes renovar el enlace si crees que está
            comprometido, o restringir el acceso en cualquier momento.
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            Cargando…
          </div>
        ) : link ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-sm"
                onClick={handleCopy}
                aria-label="URL del enlace compartido"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="Copiar enlace"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">
              Haz clic en el campo o en el botón para copiar el enlace.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={regenerating}
              >
                <RefreshCw
                  className={`mr-2 h-4 w-4 ${regenerating ? "animate-spin" : ""}`}
                />
                Renovar enlace
              </Button>
              <Button
                type="button"
                variant={link.is_enabled ? "destructive" : "default"}
                size="sm"
                onClick={handleToggleEnabled}
                disabled={toggling}
              >
                {link.is_enabled ? (
                  <>
                    <EyeOff className="mr-2 h-4 w-4" />
                    Restringir acceso
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Publicar vista
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
