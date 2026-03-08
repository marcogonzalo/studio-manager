"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ImageLightbox } from "@/components/ui/image-lightbox";
import { formatCurrency } from "@/lib/utils";
import { Image as ImageIcon } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendiente",
  ordered: "Pedido",
  received: "Recibido",
};

interface ProductRow {
  id: string;
  name: string;
  description: string;
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
}: {
  products: ProductRow[];
  currency: string;
}) {
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

  const bySpace = products.reduce(
    (acc, p) => {
      const key = p.space_name?.trim() || "General";
      if (!acc[key]) acc[key] = [];
      acc[key].push(p);
      return acc;
    },
    {} as Record<string, ProductRow[]>
  );
  const spaceNames = Object.keys(bySpace).sort((a, b) =>
    a === "General" ? 1 : b === "General" ? -1 : a.localeCompare(b)
  );

  return (
    <>
      <div className="space-y-8">
        {products.length === 0 ? (
          <Card>
            <CardContent className="text-muted-foreground py-12 text-center">
              No hay productos visibles en este proyecto.
            </CardContent>
          </Card>
        ) : (
          spaceNames.map((spaceName) => {
            const spaceProducts = bySpace[spaceName];
            return (
              <section key={spaceName} className="space-y-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h2 className="text-foreground text-lg font-semibold">
                    {spaceName}
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {spaceProducts.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="flex gap-4 p-4">
                        <div className="min-w-0 flex-1">
                          <p className="text-foreground line-clamp-2 font-medium">
                            {p.name}
                          </p>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {(STATUS_LABELS[p.status] ?? p.status) || "—"}
                          </p>
                          <p className="text-foreground mt-4 text-sm font-semibold tabular-nums">
                            Cantidad: {p.quantity}
                          </p>
                          <p className="text-foreground mt-2 text-sm font-semibold tabular-nums">
                            Precio:{" "}
                            {formatCurrency(Number(p.unit_price), currency)}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="bg-muted focus-visible:ring-ring relative min-h-20 w-[30%] shrink-0 self-stretch overflow-hidden rounded-md transition-opacity hover:opacity-90 focus-visible:ring-2"
                          onClick={() => openLightbox(p.image_url, p.name)}
                          aria-label={`Ver imagen de ${p.name}`}
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
