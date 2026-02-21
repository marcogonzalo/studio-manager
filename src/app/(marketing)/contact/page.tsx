import type { Metadata } from "next";
import { Mail, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AnimatedSection,
  StaggerContainer,
  StaggerItem,
} from "@/components/ui/animated-section";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Ponte en contacto con el equipo de Veta. Respuesta en menos de 24 horas.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contacto | Veta",
    description:
      "Ponte en contacto con el equipo de Veta. Estamos aquí para ayudarte.",
    url: "/contact",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contacto | Veta",
    description: "Ponte en contacto con el equipo de Veta.",
  },
};

const CONTACT_EMAIL = "hey@veta.pro";

const contactMethods = [
  {
    icon: Send,
    title: "Envíanos un mensaje",
    description:
      "Completa el formulario y te respondemos en menos de 24 horas.",
    value: "Ir al formulario",
    href: "#contacto-formulario",
  },
  {
    icon: Mail,
    title: "Email",
    description: "Envíanos un correo y te respondemos en menos de 24 horas.",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="hero-pattern-overlay relative overflow-hidden py-20 md:py-32">
        <div className="from-primary/5 absolute inset-0 bg-gradient-to-br via-transparent to-transparent" />
        <div className="bg-primary/5 absolute top-1/2 left-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
        <div className="noise-overlay" aria-hidden />

        <div className="relative container mx-auto max-w-7xl px-4">
          <AnimatedSection className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              ¿Cómo podemos <span className="text-primary">ayudarte</span>?
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Nuestro equipo está listo para responder tus preguntas y ayudarte
              a sacar el máximo provecho de Veta.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Franja decorativa (como la del footer) entre hero y contenido */}
      <div
        className="via-primary/40 h-1 w-full bg-gradient-to-r from-transparent to-transparent"
        aria-hidden
      />

      {/* Contact Methods */}
      <section className="py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <StaggerContainer
            className="mx-auto grid max-w-2xl gap-8 md:grid-cols-2"
            staggerDelay={0.1}
          >
            {contactMethods.map((method) => (
              <StaggerItem key={method.title}>
                <Card className="group border-none text-center shadow-md transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <CardHeader>
                    <div className="bg-primary/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110">
                      <method.icon className="text-primary h-6 w-6" />
                    </div>
                    <CardTitle>{method.title}</CardTitle>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={method.href}
                      className="text-primary text-lg font-medium hover:underline"
                    >
                      {method.value}
                    </a>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        id="contacto-formulario"
        className="bg-muted/30 scroll-mt-8 py-20"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <AnimatedSection className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Envíanos un mensaje
              </h2>
              <p className="text-muted-foreground mt-4 text-lg">
                Completa el formulario y nos pondremos en contacto contigo lo
                antes posible.
              </p>
            </AnimatedSection>

            <AnimatedSection>
              <Card className="border-none shadow-lg transition-shadow duration-300 hover:shadow-xl">
                <ContactForm />
              </Card>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </>
  );
}
