"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { formatCurrencyWithLang } from "@/lib/formatting";
import type { Locale } from "@/i18n/config";
import { Image as ImageIcon } from "lucide-react";

const GENERAL_SPACE_KEY = "__general_space__";

interface ProductRow {
  id: string;
  name: string;
  description: string;
  internal_reference: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  status: string;
  image_url: string | null;
  space_name: string;
}

export function ViewProjectProductsClient({
  products,
  currency,
  locale,
}: {
  products: ProductRow[];
  currency: string;
  locale: Locale;
}) {
  const t = useTranslations("ViewProject");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");

  const openLightbox = (src: string | null, alt: string) => {
    if (src?.trim()) {
      setLightboxSrc(src);
      setLightboxAlt(alt);
      setLightboxOpen(true);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return t("productStatusPending");
      case "ordered":
        return t("productStatusOrdered");
      case "received":
        return t("productStatusReceived");
      default:
        return status;
    }
  };

  const bySpace = products.reduce(
    (acc, p) => {
      const key = p.space_name?.trim() || GENERAL_SPACE_KEY;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, ProductRow[]>
  );
  const spaceNames = Object.keys(bySpace).sort((a, b) =>
    a === GENERAL_SPACE_KEY
      ? 1
      : b === GENERAL_SPACE_KEY
        ? -1
        : a.localeCompare(b)
  );

  return (
    <>
      <div className="space-y-8">
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center">
              {t("noProductsVisible")}
            </CardContent>
          </Card>
        ) : (
          spaceNames.map((spaceName) => {
            const spaceProducts = bySpace[spaceName];
            const spaceLabel =
              spaceName === GENERAL_SPACE_KEY ? t("spaceGeneral") : spaceName;
            return (
              <section key={spaceName} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-foreground text-lg font-semibold">
                    {spaceLabel}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {spaceProducts.map((p) => (
                    <Card key={p.id} className="flex min-h-[10rem] flex-col">
                      <CardContent className="flex flex-1 gap-4 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground line-clamp-2 font-medium">
                            {p.name}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {getStatusLabel(p.status) || "—"}
                          </p>
                          {p.internal_reference && (
                            <p className="text-muted-foreground mt-1 font-mono text-xs">
                              {t("productRefLabel")} {p.internal_reference}
                            </p>
                          )}
                          <p className="text-foreground mt-4 text-sm font-semibold tabular-nums">
                            {t("productQuantityLabel")} {p.quantity}
                          </p>
                          <p className="text-foreground mt-2 text-sm font-semibold tabular-nums">
                            {t("productPriceLabel")}{" "}
                            {formatCurrencyWithLang(
                              Number(p.unit_price),
                              currency,
                              locale
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="bg-muted focus-visible:ring-ring relative h-full w-[30%] shrink-0 overflow-hidden rounded-md transition-opacity hover:opacity-90 focus-visible:ring-2"
                          onClick={() => openLightbox(p.image_url, p.name)}
                          aria-label={t("viewImageAria", { name: p.name })}
                          style={
                            p.image_url
                              ? {
                                  backgroundImage: `url(${p.image_url})`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }
                              : undefined
                          }
                        >
                          {!p.image_url && (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon
                                className="text-muted-foreground h-6 w-6"
                                aria-hidden
                              />
                            </div>
                          )}
                        </button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            );
          })
        )}
      </div>
      <ImageLightbox
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
        src={lightboxSrc}
        alt={lightboxAlt}
      />
    </>
  );
}
