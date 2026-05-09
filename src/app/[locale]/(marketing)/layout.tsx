import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { VetaLogo } from "@/components/veta-logo";
import { MarketingHeader } from "@/components/layouts/marketing-header";
import { RedirectAuthenticatedToDashboard } from "@/components/redirect-authenticated-to-dashboard";
import { AnchorToHash } from "@/components/smooth-scroll-link";
import { CookieConsentBanner } from "@/components/consent";
import { GtmPageView } from "@/components/gtm";

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

async function Footer() {
  const t = await getTranslations("Footer");

  return (
    <footer className="border-border bg-muted/30 relative border-t">
      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />
      <div className="footer-pattern-container relative container mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center gap-2">
              <VetaLogo height={28} />
            </Link>
            <p className="text-muted-foreground text-sm">{t("description")}</p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("product")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <AnchorToHash
                  href="/#features"
                  className="hover:text-foreground transition-colors"
                >
                  {t("features")}
                </AnchorToHash>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-foreground transition-colors"
                >
                  {t("pricing")}
                </Link>
              </li>
              <li>
                <Link
                  href="/plan-base"
                  className="hover:text-foreground transition-colors"
                >
                  {t("basePlan")}
                </Link>
              </li>
              <li>
                <Link
                  href="/plan-pro"
                  className="hover:text-foreground transition-colors"
                >
                  {t("proPlan")}
                </Link>
              </li>
              <li>
                <Link
                  href="/plan-studio"
                  className="hover:text-foreground transition-colors"
                >
                  {t("studioPlan")}
                </Link>
              </li>
              <li>
                <Link
                  href="/demo"
                  className="hover:text-foreground transition-colors"
                >
                  {t("tryDemo")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("company")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  {t("about")}
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="hover:text-foreground transition-colors"
                >
                  {t("blog")}
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  {t("contact")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">{t("legal")}</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="/legal"
                  className="hover:text-foreground transition-colors"
                >
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
      <CookieConsentBanner />
      <GtmPageView />
      <a href="#main-content" className="skip-link">
        {tCommon("skipToContent")}
      </a>
      <RedirectAuthenticatedToDashboard />
      <MarketingHeader />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
