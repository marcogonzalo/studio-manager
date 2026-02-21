import type { Metadata } from "next";
import { AuthContentWithSuspense } from "./auth-content";

const VALID_PLAN_CODES = ["BASE", "PRO", "STUDIO"] as const;

function getAuthTitle(searchParams: {
  mode?: string | null;
  plan?: string | null;
}): string {
  const isSignup = searchParams.mode === "signup";
  const plan = searchParams.plan;
  const validPlan =
    plan && VALID_PLAN_CODES.includes(plan as (typeof VALID_PLAN_CODES)[number])
      ? (plan as (typeof VALID_PLAN_CODES)[number])
      : null;

  if (!isSignup) return "Ingresa a tu cuenta";
  if (validPlan) {
    const label =
      validPlan === "STUDIO" ? "Studio" : validPlan === "PRO" ? "Pro" : "Base";
    return `Crea tu cuenta con el plan ${label}`;
  }
  return "Crea tu cuenta";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string; plan?: string }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const title = getAuthTitle(params);
  return {
    title,
    description:
      "Inicia sesión en Veta o crea tu cuenta. Plataforma de gestión de proyectos de diseño interior.",
    alternates: { canonical: "/auth" },
    robots: { index: true, follow: true },
  };
}

export default function AuthPage() {
  return <AuthContentWithSuspense />;
}
