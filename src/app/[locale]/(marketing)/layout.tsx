import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Facebook, Instagram, Linkedin } from "lucide-react";
import { Link } from "@/i18n/routing";
import { VetaLogo } from "@/components/veta-logo";
import { MarketingHeader } from "@/components/layouts/marketing-header";
import { RedirectAuthenticatedToDashboard } from "@/components/redirect-authenticated-to-dashboard";
import { AttributionCapture } from "@/components/attribution-capture";
import { GtmPageView } from "@/components/gtm";

const FOOTER_SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/company/veta-interior-design-project-management",
    labelKey: "socialLinkedin" as const,
    Icon: Linkedin,
  },
  {
    href: "https://www.instagram.com/veta.interiordesign",
    labelKey: "socialInstagram" as const,
    Icon: Instagram,
  },
  {
    href: "https://facebook.com/veta.interiordesign",
    labelKey: "socialFacebook" as const,
    Icon: Facebook,
  },
];

export const metadata: Metadata = {
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Veta - Gestión de proyectos de diseño interior",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/opengraph-image"],
  },
};

async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations("Footer");
  const clientViewHref =
    locale === "en"
      ? ({
          pathname: "/blog/[slug]" as const,
          params: { slug: "client-public-view-interior-design" },
        } as const)
      : ({
          pathname: "/blog/[slug]" as const,
          params: { slug: "vista-publica-cliente-interiorismo" },
        } as const);

  const linkClass = "hover:text-foreground transition-colors";

  return (
    <footer className="border-border bg-muted/30 relative border-t">
      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />
      <div className="footer-pattern-container relative container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2"
              aria-label="Veta"
            >
              <VetaLogo height={28} />
            </Link>
            <p className="text-muted-foreground text-sm">{t("description")}</p>
            <ul className="mt-4 flex items-center gap-3">
              {FOOTER_SOCIAL_LINKS.map(({ href, labelKey, Icon }) => (
                <li key={href}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={t(labelKey)}
                    className="text-primary hover:text-primary/80 inline-flex transition-colors"
                  >
                    <Icon className="h-5 w-5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("product")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/feature/presupuestos" className={linkClass}>
                  {t("budgets")}
                </Link>
              </li>
              <li>
                <Link href="/feature/plantilla-pdf" className={linkClass}>
                  {t("budgetPdfTemplate")}
                </Link>
              </li>
              <li>
                <Link href="/feature/control-costes" className={linkClass}>
                  {t("costControl")}
                </Link>
              </li>
              <li>
                <Link href="/feature/pedidos" className={linkClass}>
                  {t("purchaseOrders")}
                </Link>
              </li>
              <li>
                <Link href={clientViewHref} className={linkClass}>
                  {t("clientView")}
                </Link>
              </li>
              <li>
                <Link href="/feature/funcionalidades" className={linkClass}>
                  {t("allFeatures")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("audience")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="/feature/empiezas-por-tu-cuenta"
                  className={linkClass}
                >
                  {t("startingOut")}
                </Link>
              </li>
              <li>
                <Link href="/feature/app-freelance" className={linkClass}>
                  {t("freelanceIndependents")}
                </Link>
              </li>
              <li>
                <Link href="/feature/estudios-con-equipo" className={linkClass}>
                  {t("studiosWithTeam")}
                </Link>
              </li>
            </ul>
            <h3 className="mt-6 mb-3 font-semibold">{t("specialty")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/software-interior-design" className={linkClass}>
                  {t("interiorDesign")}
                </Link>
              </li>
              <li>
                <Link href="/software-architecture" className={linkClass}>
                  {t("architecture")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("plans")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/pricing" className={linkClass}>
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link href="/plan-base" className={linkClass}>
                  {t("basePlan")}
                </Link>
              </li>
              <li>
                <Link href="/plan-pro" className={linkClass}>
                  {t("proPlan")}
                </Link>
              </li>
              <li>
                <Link href="/plan-studio" className={linkClass}>
                  {t("studioPlan")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("resources")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/demo" className={linkClass}>
                  {t("tryDemo")}
                </Link>
              </li>
              <li>
                <Link href="/blog" className={linkClass}>
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link href="/feature/alternativas-excel" className={linkClass}>
                  {t("excelAlternatives")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("company")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link href="/about" className={linkClass}>
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className={linkClass}>
                  {t("contact")}
                </Link>
              </li>
              <li>
                <Link href="/legal" className={linkClass}>
                  {t("termsAndPrivacy")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Veta. {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const tCommon = await getTranslations("Common");

  return (
    <div className="flex min-h-screen flex-col">
      <AttributionCapture />
      <GtmPageView />
      <a href="#main-content" className="skip-link">
        {tCommon("skipToContent")}
      </a>
      <RedirectAuthenticatedToDashboard />
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer locale={locale} />
    </div>
  );
}
