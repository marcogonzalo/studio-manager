import type { Metadata } from "next";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { DemoRequestForm } from "./demo-request-form";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Probar demo | Veta",
  description:
    "Solicita un enlace para probar la demo de Veta. Accede a una cuenta de demostración con datos de ejemplo.",
  alternates: { canonical: "/demo" },
  openGraph: {
    title: "Probar demo - Veta",
    description:
      "Solicita un enlace para probar la demo de Veta con datos de ejemplo.",
    url: "/demo",
  },
};

export default function DemoPage() {
  return (
    <>
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              ¡Prueba la <span className="text-primary">demo de Veta</span>!
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Explora Veta con una cuenta de demostración que inlcuye proyectos,
              clientes, presupuestos y más, ya precargados. Sin registro ni
              tarjeta.
            </p>
          </AnimatedSection>
        </div>
      </section>

      <div className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent" />

      <section className="container mx-auto max-w-2xl px-4 py-16">
        <p className="text-muted-foreground mb-10 text-center text-lg md:text-xl">
          <strong>¡Prueba sin compromiso!</strong> Descubre si Veta es la
          herramienta que necesitas para tus proyectos de arquitectura e
          interiorismo.
        </p>

        <StaggerContainer className="mt-10 space-y-8">
          <StaggerItem>
            <DemoRequestForm />
          </StaggerItem>
        </StaggerContainer>
        <div className="text-muted-foreground mt-10 space-y-3 px-4 text-sm">
          <p className="mt-4">
            La demo usa una cuenta con <strong>plan Studio</strong> en la que
            podrás
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>listar clientes</li>
            <li>ver proveedores</li>
            <li>explorar proyectos activos y sus espacios</li>
            <li>ver proyectos archivados</li>
            <li>consultar el catálogo de productos</li>
            <li>ver y exportar presupuestos</li>
            <li>consultar órdenes de compra</li>
            <li>listar gastos adicionales</li>
            <li>ver pagos</li>
            <li>revisar notas de proyecto</li>
          </ul>
          <p>
            tal como en una cuenta real. La creación, edición y eliminación
            están desactivadas para que cualquiera pueda probar sin modificar
            los datos.
          </p>
          <div className="space-y-2 text-center">
            <p>
              <strong>¿Quieres usar Veta con tu propio proyecto?</strong>
            </p>
            <p className="mt-4 mb-4">
              <Link
                href="/sign-up"
                className="bg-primary hover:bg-primary/90 inline-block rounded-md px-4 py-2 font-medium text-white shadow transition"
              >
                Crea una cuenta gratis
              </Link>
            </p>
            <p>
              <strong>¿Tienes alguna pregunta?</strong>
            </p>
            <p>
              <Link href="/contact" className="text-primary underline">
                Contacta con nuestro equipo
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
