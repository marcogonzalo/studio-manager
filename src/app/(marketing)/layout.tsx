import type { Metadata } from "next";
import Link from "next/link";
import { VetaLogo } from "@/components/veta-logo";
import { MarketingHeader } from "@/components/layouts/marketing-header";
import { RedirectAuthenticatedToDashboard } from "@/components/redirect-authenticated-to-dashboard";
import { AnchorToHash } from "@/components/smooth-scroll-link";

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

function Footer() {
  return (
    <footer className="border-border bg-muted/30 relative border-t">
      {/* Línea decorativa – acento primary sobre el footer */}
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
            <p className="text-muted-foreground text-sm">
              La plataforma para gestión de proyectos de arquitectura de diseño
              interior.
            </p>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Producto</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <AnchorToHash
                  href="/#features"
                  className="hover:text-foreground transition-colors"
                >
                  Características
                </AnchorToHash>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-foreground transition-colors"
                >
                  Precios
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Empresa</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="hover:text-foreground transition-colors"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-foreground transition-colors"
                >
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 font-semibold">Legal</h3>
            <ul className="text-muted-foreground space-y-2 text-sm">
              <li>
                <Link
                  href="/legal"
                  className="hover:text-foreground transition-colors"
                >
                  Términos y Privacidad
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-border text-muted-foreground mt-12 border-t pt-8 text-center text-sm">
          <p>
            &copy; {new Date().getFullYear()} Veta. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
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
