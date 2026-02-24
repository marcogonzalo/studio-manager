import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { VetaLogo } from "@/components/veta-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center p-4">
      <a href="#main-content" className="skip-link">
        Saltar al contenido
      </a>
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="mb-4 flex w-full items-center gap-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Volver al inicio"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <Link href="/" className="flex items-center gap-2">
            <VetaLogo height={28} />
          </Link>
        </div>
        <main id="main-content" className="w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
