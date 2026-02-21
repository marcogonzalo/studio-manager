import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, FileText, Scale } from "lucide-react";

export const metadata: Metadata = {
  title: "Términos de uso y privacidad",
  description:
    "Términos de uso, política de privacidad y derechos RGPD de Veta. Cómo tratamos tus datos en la plataforma de gestión de proyectos de diseño interior.",
  alternates: { canonical: "/legal" },
  openGraph: {
    title: "Términos y Privacidad | Veta",
    description:
      "Términos de uso, política de privacidad y cumplimiento RGPD de Veta.",
    url: "/legal",
  },
  twitter: {
    card: "summary_large_image",
    title: "Términos y Privacidad | Veta",
    description: "Términos de uso y política de privacidad de Veta.",
  },
};

const sections = [
  {
    id: "terminos",
    icon: FileText,
    title: "Términos de Uso",
    lastUpdated: "11 de febrero de 2025",
    content: (
      <>
        <p>
          Al utilizar Veta («la Plataforma»), aceptas los siguientes términos.
          Si no estás de acuerdo, no utilices el servicio.
        </p>
        <h3 className="mt-6 font-semibold">1. Descripción del Servicio</h3>
        <p className="mt-2">
          Veta es una plataforma de gestión de proyectos de diseño interior que
          permite a los usuarios administrar clientes, proyectos, presupuestos,
          proveedores y catálogos de productos.
        </p>
        <h3 className="mt-6 font-semibold">2. Uso Aceptable</h3>
        <p className="mt-2">
          Te comprometes a utilizar la Plataforma de forma lícita y de acuerdo
          con estos términos. No debes utilizar el servicio para actividades
          ilegales, abusivas o que vulneren derechos de terceros.
        </p>
        <h3 className="mt-6 font-semibold">3. Cuenta de Usuario</h3>
        <p className="mt-2">
          Eres responsable de mantener la confidencialidad de tu cuenta y
          contraseña. Todas las actividades realizadas bajo tu cuenta son de tu
          responsabilidad.
        </p>
        <h3 className="mt-6 font-semibold">4. Propiedad Intelectual</h3>
        <p className="mt-2">
          El software, diseño y contenidos de la Plataforma son propiedad de
          Veta o sus licenciantes. Los datos que introduces siguen siendo de tu
          propiedad.
        </p>
      </>
    ),
  },
  {
    id: "privacidad",
    icon: Shield,
    title: "Política de Privacidad",
    lastUpdated: "11 de febrero de 2025",
    content: (
      <>
        <p>
          Respetamos tu privacidad y nos comprometemos a proteger tus datos
          personales de acuerdo con la normativa aplicable.
        </p>
        <h3 className="mt-6 font-semibold">Datos que Recogemos</h3>
        <p className="mt-2">
          Recopilamos la información que nos proporcionas al registrarte (correo
          electrónico, nombre) y los datos que introduces en la Plataforma para
          gestionar tus proyectos (clientes, proveedores, presupuestos, etc.).
        </p>
        <h3 className="mt-6 font-semibold">Finalidad del Tratamiento</h3>
        <p className="mt-2">
          Utilizamos tus datos para prestar el servicio, gestionar tu cuenta,
          enviar comunicaciones necesarias (por ejemplo, enlaces de inicio de
          sesión) y mejorar la Plataforma.
        </p>
        <h3 className="mt-6 font-semibold">Compartición de Datos</h3>
        <p className="mt-2">
          No vendemos tus datos personales. Utilizamos proveedores de servicios
          (como Supabase) para el alojamiento y la autenticación, que actúan
          como encargados del tratamiento bajo contrato.
        </p>
        <h3 className="mt-6 font-semibold">Conservación</h3>
        <p className="mt-2">
          Conservamos tus datos mientras mantengas una cuenta activa. Puedes
          solicitar la eliminación de tu cuenta y datos en cualquier momento.
        </p>
      </>
    ),
  },
  {
    id: "rgpd",
    icon: Scale,
    title: "Tus Derechos según el RGPD",
    lastUpdated: "11 de febrero de 2025",
    content: (
      <>
        <p>
          Si resides en el Espacio Económico Europeo o Reino Unido, tienes
          derechos específicos en virtud del Reglamento General de Protección de
          Datos (RGPD):
        </p>
        <ul className="mt-4 list-inside list-disc space-y-2">
          <li>
            <strong>Derecho de acceso:</strong> Puedes solicitar una copia de
            los datos personales que conservamos sobre ti.
          </li>
          <li>
            <strong>Derecho de rectificación:</strong> Puedes solicitar la
            corrección de datos inexactos o incompletos.
          </li>
          <li>
            <strong>Derecho de supresión:</strong> Puedes solicitar la
            eliminación de tus datos personales («derecho al olvido»).
          </li>
          <li>
            <strong>Derecho a la portabilidad:</strong> Puedes solicitar recibir
            tus datos en un formato estructurado y de uso común.
          </li>
          <li>
            <strong>Derecho de oposición:</strong> Puedes oponerte al
            tratamiento de tus datos en determinadas circunstancias.
          </li>
          <li>
            <strong>Derecho a la limitación:</strong> Puedes solicitar que
            limitemos el tratamiento de tus datos en ciertos supuestos.
          </li>
          <li>
            <strong>Derecho a presentar una reclamación:</strong> Tienes derecho
            a presentar una reclamación ante la autoridad de protección de datos
            competente de tu país.
          </li>
        </ul>
        <p className="mt-6">
          Para ejercer cualquiera de estos derechos, contacta con nosotros a
          través de la{" "}
          <Link
            href="/contact"
            className="text-primary underline hover:no-underline"
          >
            página de contacto
          </Link>
          .
        </p>
      </>
    ),
  },
];

export default function LegalPage() {
  return (
    <>
      <section className="py-12 md:py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
          </Link>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Términos de Uso y Política de Privacidad
          </h1>
          <p className="text-muted-foreground mt-4 text-lg">
            Última actualización:{" "}
            {new Date().toLocaleDateString("es-ES", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>

          <nav className="bg-muted/30 mt-8 rounded-lg border p-4">
            <p className="mb-2 font-medium">Contenido:</p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-primary hover:underline">
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-12 space-y-16">
            {sections.map((section) => (
              <article
                key={section.id}
                id={section.id}
                className="scroll-mt-24"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 flex h-10 w-10 items-center justify-center rounded-lg">
                    <section.icon className="text-primary h-5 w-5" />
                  </div>
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                </div>
                <p className="text-muted-foreground mt-2 text-sm">
                  Última actualización: {section.lastUpdated}
                </p>
                <div className="text-muted-foreground mt-6 space-y-4 leading-relaxed">
                  {section.content}
                </div>
              </article>
            ))}
          </div>

          <div className="bg-muted/20 mt-16 rounded-lg border p-6">
            <p className="text-sm">
              Si tienes preguntas sobre estos términos o nuestra política de
              privacidad, no dudes en{" "}
              <Link
                href="/contact"
                className="text-primary font-medium underline hover:no-underline"
              >
                contactarnos
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
