import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft, Shield, FileText, Scale, Cookie } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  const canonical = locale === "es" ? "/legal" : "/en/legal";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: "/legal",
        en: "/en/legal",
        "x-default": "/legal",
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonical,
    },
    twitter: {
      card: "summary_large_image",
      title: t("ogTitle"),
      description: t("twitterDescription"),
    },
  };
}

const sectionIds = [
  {
    id: "terminos",
    icon: FileText,
    titleKey: "termsTitle" as const,
    lastUpdatedKey: "termsLastUpdated" as const,
  },
  {
    id: "privacidad",
    icon: Shield,
    titleKey: "privacyTitle",
    lastUpdatedKey: "privacyLastUpdated",
  },
  {
    id: "cookies",
    icon: Cookie,
    titleKey: "cookiesTitle",
    lastUpdatedKey: "cookiesLastUpdated",
  },
  {
    id: "rgpd",
    icon: Scale,
    titleKey: "rgpdTitle",
    lastUpdatedKey: "rgpdLastUpdated",
  },
];

function buildLegalSectionsContent(t: (key: string) => string) {
  return [
    <>
      <p>{t("termsIntro")}</p>
      <h3 className="mt-6 font-semibold">{t("termsS1Title")}</h3>
      <p className="mt-2">{t("termsS1Content")}</p>
      <h3 className="mt-6 font-semibold">{t("termsS2Title")}</h3>
      <p className="mt-2">{t("termsS2Content")}</p>
      <h3 className="mt-6 font-semibold">{t("termsS3Title")}</h3>
      <p className="mt-2">{t("termsS3Content")}</p>
      <h3 className="mt-6 font-semibold">{t("termsS4Title")}</h3>
      <p className="mt-2">{t("termsS4Content")}</p>
    </>,
    <>
      <p>{t("privacyIntro")}</p>
      <h3 className="mt-6 font-semibold">{t("privacyDataTitle")}</h3>
      <p className="mt-2">{t("privacyDataContent")}</p>
      <h3 className="mt-6 font-semibold">{t("privacyPurposeTitle")}</h3>
      <p className="mt-2">{t("privacyPurposeContent")}</p>
      <h3 className="mt-6 font-semibold">{t("privacyShareTitle")}</h3>
      <p className="mt-2">{t("privacyShareContent")}</p>
      <h3 className="mt-6 font-semibold">{t("privacyRetentionTitle")}</h3>
      <p className="mt-2">{t("privacyRetentionContent")}</p>
    </>,
    <>
      <p>{t("cookiesIntro")}</p>
      <h3 className="mt-6 font-semibold">{t("cookiesNecessaryTitle")}</h3>
      <p className="mt-2">{t("cookiesNecessaryContent")}</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
        <li>{t("cookiesNecessaryItem1")}</li>
      </ul>
      <h3 className="mt-6 font-semibold">{t("cookiesStatsTitle")}</h3>
      <p className="mt-2">{t("cookiesStatsContent")}</p>
      <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
        <li>{t("cookiesStatsItem1")}</li>
        <li>{t("cookiesStatsItem2")}</li>
        <li>{t("cookiesStatsItem3")}</li>
      </ul>
      <h3 className="mt-6 font-semibold">{t("cookiesPersonalTitle")}</h3>
      <p className="mt-2">{t("cookiesPersonalContent")}</p>
      <h3 className="mt-6 font-semibold">{t("cookiesMarketingTitle")}</h3>
      <p className="mt-2">{t("cookiesMarketingContent")}</p>
      <h3 className="mt-6 font-semibold">{t("cookiesUnclassTitle")}</h3>
      <p className="mt-2">{t("cookiesUnclassContent")}</p>
      <p className="mt-6 text-sm">{t("cookiesPreferences")}</p>
    </>,
    <>
      <p>{t("rgpdIntro")}</p>
      <ul className="mt-4 list-inside list-disc space-y-2">
        <li>{t("rgpdAccess")}</li>
        <li>{t("rgpdRectification")}</li>
        <li>{t("rgpdErasure")}</li>
        <li>{t("rgpdPortability")}</li>
        <li>{t("rgpdObjection")}</li>
        <li>{t("rgpdRestriction")}</li>
        <li>{t("rgpdComplaint")}</li>
      </ul>
      <p className="mt-6">
        {t("rgpdContactIntro")}{" "}
        <Link
          href="/contact"
          className="text-primary underline hover:no-underline"
        >
          {t("contactPageLink")}
        </Link>
        .
      </p>
    </>,
  ];
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");
  const sectionsContent = buildLegalSectionsContent(t);

  const sections = sectionIds.map((sec, i) => ({
    ...sec,
    title: t(sec.titleKey),
    lastUpdated: t(sec.lastUpdatedKey),
    content: sectionsContent[i],
  }));

  return (
    <>
      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("backToHome")}
          </Link>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {t("pageTitle")}
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            {t("lastUpdated")}:{" "}
            {new Date().toLocaleDateString(
              locale === "es" ? "es-ES" : "en-GB",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              }
            )}
          </p>

          <nav className="bg-muted/30 mt-8 rounded-lg border p-4">
            <p className="mb-2 font-medium">{t("tableOfContents")}</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-primary hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-16">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <section.icon className="text-primary h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  {t("lastUpdated")}: {section.lastUpdated}
                </p>
                <div className="text-muted-foreground mt-6 space-y-4 leading-relaxed">
                  {section.content}
                </div>
              </article>
            ))}
          </div>

          <div className="bg-muted/20 mt-16 rounded-lg border p-6">
            <p className="text-sm">
              {t("contactPrompt")}{" "}
              <Link
                href="/contact"
                className="text-primary font-medium underline hover:no-underline"
              >
                {t("contactLink")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
