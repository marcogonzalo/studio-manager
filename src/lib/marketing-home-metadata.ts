import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildLocaleAlternates } from "@/lib/locale-alternates";
import {
  buildMarketingOpenGraph,
  buildMarketingTwitter,
} from "@/lib/marketing-open-graph";

export async function buildHomeMetadata(locale: string): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: "HomePage" });
  const { canonical, alternates } = buildLocaleAlternates("/", "/en", locale);

  return {
    title: {
      absolute: t("metaTitle"),
    },
    description: t("metaDescription"),
    alternates,
    openGraph: buildMarketingOpenGraph({
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonical,
    }),
    twitter: buildMarketingTwitter({
      title: t("twitterTitle"),
      description: t("twitterDescription"),
    }),
  };
}
