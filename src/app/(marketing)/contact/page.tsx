import type { Metadata } from "next";
import { Mail, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

const CONTACT_EMAIL = "hola@veta.pro";

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
      <section className="py-20 md:py-32">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              ¿Cómo podemos <span className="text-primary">ayudarte</span>?
            </h1>
            <p className="text-muted-foreground mt-6 text-lg md:text-xl">
              Nuestro equipo está listo para responder tus preguntas y ayudarte
              a sacar el máximo provecho de Veta.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="pb-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto grid max-w-2xl gap-8 md:grid-cols-2">
            {contactMethods.map((method) => (
              <Card
                key={method.title}
                className="border-none text-center shadow-md transition-shadow hover:shadow-lg"
              >
                <CardHeader>
                  <div className="bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full">
                    <method.icon className="text-primary h-7 w-7" />
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
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        id="contacto-formulario"
        className="bg-muted/30 scroll-mt-8 py-20"
      >
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-2xl">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Envíanos un mensaje
              </h2>
              <p className="text-muted-foreground mt-4">
                Completa el formulario y nos pondremos en contacto contigo lo
                antes posible.
              </p>
            </div>

            <Card className="border-none shadow-lg">
              <ContactForm />
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
