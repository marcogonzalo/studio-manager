import type { Metadata } from "next";
import { Mail, MessageSquare, Send } from "lucide-react";
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

const CONTACT_EMAIL = "hola@veta.app";

const contactMethods = [
  {
    icon: Send,
    title: "Envíanos un mensaje",
    description:
      "Completa el formulario y te respondemos en menos de 24 horas.",
    value: "Ir al formulario",
    href: "#contacto-formulario",
    disabled: false,
  },
  {
    icon: MessageSquare,
    title: "Chat en Vivo",
    description: "Habla con nuestro equipo de soporte en tiempo real.",
    value: "Disponible L-V, 9am-6pm",
    href: "#chat",
    disabled: true,
  },
  {
    icon: Mail,
    title: "Email",
    description: "Envíanos un correo y te respondemos en menos de 24 horas.",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    disabled: false,
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
          <div className="grid gap-8 md:grid-cols-3">
            {contactMethods.map((method) => (
              <Card
                key={method.title}
                className={
                  method.disabled
                    ? "pointer-events-none border-none text-center opacity-60"
                    : "border-none text-center shadow-md transition-shadow hover:shadow-lg"
                }
              >
                <CardHeader>
                  <div
                    className={
                      method.disabled
                        ? "bg-muted mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                        : "bg-primary/10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                    }
                  >
                    <method.icon
                      className={
                        method.disabled
                          ? "text-muted-foreground h-7 w-7"
                          : "text-primary h-7 w-7"
                      }
                    />
                  </div>
                  <CardTitle>{method.title}</CardTitle>
                  <CardDescription>{method.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {method.disabled ? (
                    <span className="text-muted-foreground text-lg">
                      {method.value}
                    </span>
                  ) : (
                    <a
                      href={method.href}
                      className="text-primary text-lg font-medium hover:underline"
                    >
                      {method.value}
                    </a>
                  )}
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
