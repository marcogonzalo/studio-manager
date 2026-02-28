"use client";

import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";

const testimonials = [
  {
    quote:
      "La gestión de clientes, proveedores y catálogo en un solo sitio ha simplificado mucho el trabajo en los proyectos de diseño interior. Recomendable para independientes o estudios que quieren optimizar su gestión de proyectos.",
    author: "FH Interiorismo",
    role: "Estudio de arquitectura interior",
    url: "https://instagram.com/fh.interiorismo",
  },
  {
    quote:
      "Con Veta hemos dejado de perder horas en hojas de cálculo. Los presupuestos por espacios y el control de costes nos permiten organizarnos y enfocarnos en el diseño.",
    author: "EM Estilo Creativo",
    role: "Diseño de interiores y estilismo",
    url: "https://emestilocreativo.com/",
  },
];

export function HomeTestimonialsSection() {
  return (
    <section className="bg-muted/30 py-20">
      <div className="container mx-auto max-w-7xl px-4">
        <AnimatedSection
          className="mx-auto mb-12 max-w-2xl text-center"
          triggerOnMount={false}
        >
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Lo que dicen de <strong className="text-primary">Veta</strong>
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Estudios y profesionales de arquitectura y diseño interior que ya
            confían en Veta.
          </p>
        </AnimatedSection>

        <StaggerContainer
          className="mx-auto grid max-w-4xl gap-8 md:grid-cols-2 md:items-stretch"
          staggerDelay={0.2}
          triggerOnMount={false}
        >
          <StaggerItem
            key={testimonials[0].author}
            className="h-full md:col-span-2"
          >
            <Card className="flex h-full flex-col border-none shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl md:px-10 md:py-8">
              <CardContent className="flex flex-1 flex-col pt-6 md:pt-8">
                <Quote className="text-primary/60 mb-4 h-10 w-10 flex-shrink-0 md:h-12 md:w-12" />
                <p className="text-foreground mb-6 flex-1 text-base italic md:text-lg md:leading-relaxed">
                  &ldquo;{testimonials[0].quote}&rdquo;
                </p>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold md:h-14 md:w-14 md:text-xl">
                    {testimonials[0].author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold md:text-lg">
                      <a
                        href={testimonials[0].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline underline-offset-2 transition-colors"
                      >
                        {testimonials[0].author}
                      </a>
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonials[0].role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
          <StaggerItem
            key={testimonials[1].author}
            className="h-full md:col-span-2 md:ml-auto md:max-w-[90%]"
          >
            <Card className="flex h-full flex-col border-none shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <CardContent className="flex flex-1 flex-col pt-6">
                <Quote className="text-primary/60 mb-4 h-8 w-8 flex-shrink-0" />
                <p className="text-foreground mb-6 flex-1 italic">
                  &ldquo;{testimonials[1].quote}&rdquo;
                </p>
                <div className="flex flex-shrink-0 items-center gap-3">
                  <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-full text-base font-bold">
                    {testimonials[1].author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">
                      <a
                        href={testimonials[1].url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary underline underline-offset-2 transition-colors"
                      >
                        {testimonials[1].author}
                      </a>
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {testimonials[1].role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
