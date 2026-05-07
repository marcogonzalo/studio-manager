import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SignUpForm } from "../sign-up-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SignUp" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: { canonical: "/sign-up" },
    robots: { index: true, follow: true },
  };
}

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
      turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? null}
    />
  );
}
