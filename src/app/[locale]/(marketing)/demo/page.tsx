import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { DemoRequestForm } from "./demo-request-form";
import { Link } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Demo" });
  const canonical = locale === "es" ? "/demo" : "/en/demo";
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical,
      languages: {
        es: "/demo",
        en: "/en/demo",
        "x-default": "/demo",
      },
    },
    openGraph: {
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonical,
    },
  };
}

export default async function DemoPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Demo");

  const demoListKeys = [
    "demoList1",
    "demoList2",
    "demoList3",
    "demoList4",
    "demoList5",
    "demoList6",
    "demoList7",
    "demoList8",
    "demoList9",
    "demoList10",
  ] as const;

  return (
    <>
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              {t("heroTitle")}{" "}
              <span className="text-primary">{t("heroTitleHighlight")}</span>!
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              {t("heroSubtitle")}
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent" />

      <section className="container mx-auto max-w-2xl px-4 py-16">
        <p className="text-muted-foreground mb-10 text-center text-lg md:text-xl">
          <strong>{t("introBold")}</strong> {t("introText")}
        </p>

        <StaggerContainer className="mt-10 space-y-8">
          <StaggerItem>
            <DemoRequestForm
              turnstileSiteKey={
                process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null
              }
            />
          </StaggerItem>
        </StaggerContainer>
        <div className="text-muted-foreground mt-10 space-y-3 px-4 text-sm">
          <p className="mt-4">{t("demoUsesTitle")}</p>
          <ul className="list-inside list-disc space-y-1">
            {demoListKeys.map((key) => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
          <p>{t("demoDisclaimer")}</p>
          <div className="space-y-2 text-center">
            <p>
              <strong>{t("wantOwnProject")}</strong>
            </p>
            <p className="mt-4 mb-4">
              <Link
                href="/sign-up"
                className="bg-primary hover:bg-primary/90 inline-block rounded-md px-4 py-2 font-medium text-white shadow transition"
              >
                {t("createAccountFree")}
              </Link>
            </p>
            <p>
              <strong>{t("haveQuestion")}</strong>
            </p>
            <p>
              <Link href="/contact" className="text-primary underline">
                {t("contactTeam")}
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
