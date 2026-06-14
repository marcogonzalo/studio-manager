import type { Metadata } from "next";

export const MARKETING_OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Veta - Gestión de proyectos de diseño interior",
} as const;

export const MARKETING_OG_IMAGES = [MARKETING_OG_IMAGE];

type OpenGraphImage = {
  url: string | URL;
  width?: number;
  height?: number;
  alt?: string;
  type?: string;
};

type BuildMarketingOpenGraphParams = {
  title: string;
  description: string;
  url: string;
  type?: "website" | "article";
  publishedTime?: string;
  images?: OpenGraphImage[];
};

export function buildMarketingOpenGraph({
  title,
  description,
  url,
  type = "website",
  publishedTime,
  images,
}: BuildMarketingOpenGraphParams): NonNullable<Metadata["openGraph"]> {
  return {
    title,
    description,
    url,
    type,
    ...(publishedTime ? { publishedTime } : {}),
    images: images?.length ? images : MARKETING_OG_IMAGES,
  };
}

export function buildMarketingTwitter({
  title,
  description,
  images,
}: {
  title: string;
  description: string;
  images?: string[];
}): NonNullable<Metadata["twitter"]> {
  return {
    card: "summary_large_image",
    title,
    description,
    images: images?.length ? images : [MARKETING_OG_IMAGE.url],
  };
}
