import type { Metadata } from "next";
import { SignUpForm } from "../sign-up-form";

export const metadata: Metadata = {
  title: "Crea tu cuenta",
  description:
    "Regístrate en Veta. Plataforma de gestión de proyectos de diseño interior. Prueba gratis.",
  alternates: { canonical: "/sign-up" },
  robots: { index: true, follow: true },
};

type SearchParams = Promise<{
  redirect?: string;
  plan?: string;
  billing?: string;
}>;

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  return (
    <SignUpForm
      redirectTo={params.redirect ?? null}
      planParam={params.plan ?? null}
      billingParam={params.billing ?? null}
    />
  );
}
