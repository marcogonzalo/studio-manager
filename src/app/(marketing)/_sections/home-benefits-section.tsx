"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/ui/animated-section";
import { BenefitsList } from "@/app/(marketing)/benefits-list";
import { ProductMockup } from "@/components/product-mockup";
import { TrackedCtaLink } from "@/components/gtm";

const benefits = [
  "Interfaz pensada para arquitectos y diseñadores de interior",
  "Acceso en todo momento desde cualquier dispositivo",
  "Gestión de datos responsable y segura (normativa RGPD)",
  "Mejoras y actualizaciones constantes",
  "Escucha activa para responder a tus requerimientos",
  "Planes con precio fijo y adaptables a tus necesidades",
];

export function HomeBenefitsSection() {
  return (
    <section className="py-28">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <AnimatedSection direction="left" triggerOnMount={false}>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              ¿Por qué <strong className="text-primary">elegir Veta</strong>?
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Simplificamos la gestión de tu estudio de arquitectura e
              interiorismo para que puedas enfocarte en lo que mejor sabes
              hacer: diseñar espacios increíbles.
            </p>

            <BenefitsList benefits={benefits} />

            <div className="mt-10">
              <Button size="lg" asChild className="animate-glow">
                <TrackedCtaLink
                  href="/sign-up"
                  ctaLocation="benefits"
                  ctaText="Prueba Gratis"
                >
                  Prueba Gratis
                  <ArrowRight className="ml-2 h-4 w-4" />
                </TrackedCtaLink>
              </Button>
            </div>
          </AnimatedSection>

          <AnimatedSection direction="right" delay={0.2} triggerOnMount={false}>
            <ProductMockup />
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
