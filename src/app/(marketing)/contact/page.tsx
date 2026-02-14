import type { Metadata } from "next";
import { Mail, MessageSquare, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Ponte en contacto con el equipo de Veta. Estamos aquí para ayudarte.",
};

const contactMethods = [
  {
    icon: Mail,
    title: "Email",
    description: "Envíanos un correo y te respondemos en menos de 24 horas.",
    value: "hola@studiomanager.app",
    href: "mailto:hola@studiomanager.app",
  },
  {
    icon: MessageSquare,
    title: "Chat en Vivo",
    description: "Habla con nuestro equipo de soporte en tiempo real.",
    value: "Disponible L-V, 9am-6pm",
    href: "#chat",
  },
  {
    icon: MapPin,
    title: "Oficina",
    description: "Visítanos en nuestra oficina en Madrid.",
    value: "Madrid, España",
    href: "#",
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
      <section className="bg-muted/30 py-20">
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
              <CardContent className="pt-6">
                <form className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label
                        htmlFor="name"
                        className="text-sm leading-none font-medium"
                      >
                        Nombre
                      </label>
                      <input
                        id="name"
                        type="text"
                        placeholder="Tu nombre"
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm leading-none font-medium"
                      >
                        Email
                      </label>
                      <input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm leading-none font-medium"
                    >
                      Asunto
                    </label>
                    <input
                      id="subject"
                      type="text"
                      placeholder="¿En qué podemos ayudarte?"
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm leading-none font-medium"
                    >
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Cuéntanos más detalles..."
                      className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex w-full resize-none rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-ring inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium shadow focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  >
                    Enviar Mensaje
                  </button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
