import type { Metadata } from "next";

export type LocaleAlternatesResult = {
  canonical: string;
  alternates: NonNullable<Metadata["alternates"]>;
};

/** ES default without prefix; EN with `/en` prefix. x-default = ES path. */
export function buildLocaleAlternates(
  esPath: string,
  enPath: string,
  locale: string
): LocaleAlternatesResult {
  const canonical = locale === "es" ? esPath : enPath;
  return {
    canonical,
    alternates: {
      canonical,
      languages: {
        es: esPath,
        en: enPath,
        "x-default": esPath,
      },
    },
  };
}
