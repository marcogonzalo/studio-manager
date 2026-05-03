"use client";

import { useState } from "react";
import { ChevronDown, Image as ImageIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { formatCurrencyWithLang } from "@/lib/formatting";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

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

interface RenderRow {
  id: string;
  url: string;
  description: string;
  space_name: string;
}

export function ViewProjectSpacesClient({
  products,
  renders,
  currency,
  locale,
}: {
  products: ProductRow[];
  renders: RenderRow[];
  currency: string;
  locale: Locale;
}) {
  const t = useTranslations("ViewProject");
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState<string | null>(null);
  const [lightboxAlt, setLightboxAlt] = useState("");
  const [openSpaces, setOpenSpaces] = useState<Record<string, boolean>>({});

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

  const productsBySpace = products.reduce(
    (acc, p) => {
      const key = p.space_name?.trim() || GENERAL_SPACE_KEY;
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, ProductRow[]>
  );

  const rendersBySpace = renders.reduce(
    (acc, r) => {
      const key = r.space_name?.trim() || GENERAL_SPACE_KEY;
      if (!acc[key]) acc[key] = [];
      acc[key].push(r);
      return acc;
    },
    {} as Record<string, RenderRow[]>
  );

  const allSpaceNames = Array.from(
    new Set([...Object.keys(productsBySpace), ...Object.keys(rendersBySpace)])
  ).sort((a, b) =>
    a === GENERAL_SPACE_KEY
      ? 1
      : b === GENERAL_SPACE_KEY
        ? -1
        : a.localeCompare(b)
  );

  return (
    <>
      <div className="space-y-4">
        {allSpaceNames.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center">
              {t("spacesTabEmpty")}
            </CardContent>
          </Card>
        ) : (
          allSpaceNames.map((spaceName) => {
            const spaceProducts = productsBySpace[spaceName] ?? [];
            const spaceRenders = rendersBySpace[spaceName] ?? [];
            const spaceLabel =
              spaceName === GENERAL_SPACE_KEY ? t("spaceGeneral") : spaceName;
            const isOpen = openSpaces[spaceName] ?? true;
            const hasRenders = spaceRenders.length > 0;
            const hasProducts = spaceProducts.length > 0;

            return (
              <Collapsible
                key={spaceName}
                open={isOpen}
                onOpenChange={(open) =>
                  setOpenSpaces((prev) => ({ ...prev, [spaceName]: open }))
                }
              >
                <Card>
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between px-4 py-3 text-left"
                      aria-label={t("toggleSpaceAria", { name: spaceLabel })}
                    >
                      <h2 className="text-foreground text-lg font-semibold">
                        {spaceLabel}
                      </h2>
                      <ChevronDown
                        className={cn(
                          "text-muted-foreground h-5 w-5 transition-transform",
                          isOpen && "rotate-180"
                        )}
                        aria-hidden
                      />
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="space-y-6">
                      {hasRenders ? (
                        <section className="space-y-3">
                          <h3 className="text-sm font-semibold">
                            {t("rendersSectionTitle")}
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {spaceRenders.map((render) => (
                              <button
                                key={render.id}
                                type="button"
                                className="bg-muted focus-visible:ring-ring relative h-[100px] w-[100px] overflow-hidden rounded-md transition-opacity hover:opacity-90 focus-visible:ring-2"
                                onClick={() =>
                                  openLightbox(
                                    render.url,
                                    render.description || spaceLabel
                                  )
                                }
                                aria-label={t("viewImageAria", {
                                  name: render.description || spaceLabel,
                                })}
                                style={{
                                  backgroundImage: `url(${render.url})`,
                                  backgroundRepeat: "no-repeat",
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {hasProducts ? (
                        <section className="space-y-3">
                          <h3 className="text-sm font-semibold">
                            {t("productsSectionTitle")}
                          </h3>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            {spaceProducts.map((p) => (
                              <Card
                                key={p.id}
                                className="flex min-h-[10rem] flex-col"
                              >
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
                                        {t("productRefLabel")}{" "}
                                        {p.internal_reference}
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
                                    onClick={() =>
                                      openLightbox(p.image_url, p.name)
                                    }
                                    aria-label={t("viewImageAria", {
                                      name: p.name,
                                    })}
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
                      ) : null}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
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
