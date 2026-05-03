"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
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
import {
  getOrCreateProjectShareLink,
  regenerateProjectShareToken,
  setProjectShareEnabled,
} from "@/lib/project-share-actions";
import type { ProjectShareLink } from "@/lib/project-share-types";

export function ProjectShareDialog({
  open,
  onOpenChange,
  projectId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}) {
  const t = useTranslations("DialogProjectShare");
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
      toast.success(t("toastCopied"));
    });
  }, [shareUrl, t]);

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
      toast.success(t("toastRegenerated"));
    }
  }, [projectId, t]);

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
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="text-muted-foreground py-6 text-center text-sm">
            {t("loading")}
          </div>
        ) : link ? (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                readOnly
                value={shareUrl}
                className="font-mono text-sm"
                onClick={handleCopy}
                aria-label={t("urlAria")}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label={t("copyAria")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-muted-foreground text-xs">{t("copyHint")}</p>
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
                {t("regenerate")}
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
                    {t("restrictAccess")}
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    {t("publishView")}
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
