"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { Locale } from "@/i18n/config";
import { getSupabaseClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { getDemoAccountMessage, getErrorMessage, cn } from "@/lib/utils";
import type { Space } from "@/types";

export type DeleteSpaceMode = "move" | "delete_lines";

interface DeleteSpaceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  space: Space | null;
  itemCount: number;
  onSuccess: () => void;
}

export function DeleteSpaceDialog({
  open,
  onOpenChange,
  space,
  itemCount,
  onSuccess,
}: DeleteSpaceDialogProps) {
  const t = useTranslations("DialogDeleteSpace");
  const locale = useLocale() as Locale;
  const supabase = getSupabaseClient();
  const [mode, setMode] = useState<DeleteSpaceMode>("move");
  const [loading, setLoading] = useState(false);

  const hasItems = itemCount > 0;

  async function handleConfirm() {
    if (!space) return;
    setLoading(true);
    try {
      const { error } = await supabase.rpc("delete_space", {
        p_space_id: space.id,
        p_mode: hasItems ? mode : "move",
      });
      if (error) {
        const msg = error.message || "";
        if (msg.includes("PO_LINKED") || error.code === "P0001") {
          toast.error(t("toastPoBlocked"));
          return;
        }
        throw error;
      }
      toast.success(t("toastDeleted"));
      onOpenChange(false);
      onSuccess();
    } catch (error: unknown) {
      const demoMsg = getDemoAccountMessage(error, locale);
      if (demoMsg) {
        toast.error(`${demoMsg.title}. ${demoMsg.description}`, {
          duration: 5000,
        });
        return;
      }
      toast.error(getErrorMessage(error, locale) || t("toastError"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{hasItems ? t("title") : t("titleEmpty")}</DialogTitle>
          <DialogDescription>
            {hasItems
              ? t("descriptionWithItems", { count: itemCount })
              : t("descriptionEmpty")}
          </DialogDescription>
        </DialogHeader>

        {hasItems && (
          <div className="flex flex-col gap-2" role="radiogroup">
            <button
              type="button"
              role="radio"
              aria-checked={mode === "move"}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                mode === "move"
                  ? "border-primary bg-primary/10"
                  : "hover:bg-accent"
              )}
              onClick={() => setMode("move")}
            >
              {t("moveOption")}
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={mode === "delete_lines"}
              className={cn(
                "rounded-md border px-3 py-2 text-left text-sm transition-colors",
                mode === "delete_lines"
                  ? "border-primary bg-primary/10"
                  : "hover:bg-accent"
              )}
              onClick={() => setMode("delete_lines")}
            >
              {t("deleteOption")}
            </button>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => void handleConfirm()}
            disabled={loading}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
