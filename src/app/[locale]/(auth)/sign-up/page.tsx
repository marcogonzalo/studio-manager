import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
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
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: SearchParams;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const searchParamsData = await searchParams;
  return (
    <SignUpForm
      redirectTo={searchParamsData.redirect ?? null}
      planParam={searchParamsData.plan ?? null}
      billingParam={searchParamsData.billing ?? null}
    />
  );
}
