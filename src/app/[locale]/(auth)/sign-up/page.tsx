import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { buildLocaleAlternates } from "@/lib/locale-alternates";
import {
  buildMarketingOpenGraph,
  buildMarketingTwitter,
} from "@/lib/marketing-open-graph";
import { SignUpForm } from "../sign-up-form";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SignUp" });
  const title = t("metaTitle");
  const description = t("metaDescription");
  const { canonical, alternates } = buildLocaleAlternates(
    "/sign-up",
    "/en/sign-up",
    locale
  );
  return {
    title,
    description,
    alternates,
    openGraph: buildMarketingOpenGraph({
      title,
      description,
      url: canonical,
    }),
    twitter: buildMarketingTwitter({ title, description }),
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
