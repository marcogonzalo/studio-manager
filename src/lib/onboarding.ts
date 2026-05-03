/**
 * Onboarding steps and completion logic (issue #51).
 * Order: welcome (0), config (1), client (2), project (3), public-profile (4, PRO/STUDIO only).
 */

import type { PlanCode } from "@/types";

export const ONBOARDING_SESSION_SKIP_KEY = "veta_onboarding_skipped_session";
/** SessionStorage key: welcome step dismissed this session (no DB field). */
export const ONBOARDING_WELCOME_SEEN_SESSION_KEY =
  "veta_onboarding_welcome_seen_session";

export type OnboardingStepId =
  | "welcome"
  | "config"
  | "client"
  | "project"
  | "public-profile";

export interface OnboardingStepDef {
  id: OnboardingStepId;
  label: string;
  href: string;
  /** If set, step only applies for these plans. */
  plans?: PlanCode[];
}

export interface OnboardingData {
  fullName: string | null;
  defaultCurrency: string | null;
  defaultTaxRate: number | null;
  /** True when welcome should be skipped: any step completed or seen this session (sessionStorage). */
  welcomeSeen: boolean;
  publicName: string | null;
  clientsCount: number;
  projectsCount: number;
  planCode: PlanCode;
}

export interface OnboardingStepStatus {
  id: OnboardingStepId;
  label: string;
  href: string;
  completed: boolean;
}

const BASE_STEPS: Omit<OnboardingStepDef, "plans">[] = [
  {
    id: "config",
    label: "Configurar cuenta y personalización",
    href: "/veta-app/settings/account",
  },
  { id: "client", label: "Añadir un cliente", href: "/veta-app/clients" },
  { id: "project", label: "Crear un proyecto", href: "/veta-app/projects" },
];

const STEP_PUBLIC_PROFILE: OnboardingStepDef = {
  id: "public-profile",
  label: "Nombre público y correo público",
  href: "/veta-app/settings/customization",
  plans: ["PRO", "STUDIO"],
};

function isStepApplicableForPlan(
  step: OnboardingStepDef,
  planCode: PlanCode
): boolean {
  if (!step.plans) return true;
  return step.plans.includes(planCode);
}

function isStepCompleted(
  step: OnboardingStepDef,
  data: OnboardingData
): boolean {
  switch (step.id) {
    case "config":
      return (
        Boolean(data.fullName?.trim()) &&
        Boolean(data.defaultCurrency) &&
        data.defaultTaxRate != null
      );
    case "client":
      return data.clientsCount > 0;
    case "project":
      return data.projectsCount > 0;
    case "public-profile":
      return Boolean(data.publicName?.trim());
    default:
      return false;
  }
}

/** True if any step other than welcome is completed (so we can skip welcome without a DB flag). */
export function anyOnboardingStepCompleted(
  data: Omit<OnboardingData, "welcomeSeen">
): boolean {
  const d: OnboardingData = { ...data, welcomeSeen: false };
  for (const step of BASE_STEPS) {
    if (
      isStepApplicableForPlan(step, data.planCode) &&
      isStepCompleted(step, d)
    )
      return true;
  }
  if (
    isStepApplicableForPlan(STEP_PUBLIC_PROFILE, data.planCode) &&
    isStepCompleted(STEP_PUBLIC_PROFILE, d)
  )
    return true;
  return false;
}

/**
 * Returns applicable steps (including welcome when not seen) with completed status,
 * and the first pending step id (or null if all done).
 */
export function getOnboardingStepsStatus(data: OnboardingData): {
  steps: OnboardingStepStatus[];
  firstPendingStepId: OnboardingStepId | null;
  allComplete: boolean;
} {
  const applicableSteps: OnboardingStepDef[] = [];

  // Welcome is always first if not seen (no plan filter)
  if (!data.welcomeSeen) {
    applicableSteps.push({
      id: "welcome",
      label: "Bienvenida",
      href: "",
    });
  }

  for (const step of BASE_STEPS) {
    if (isStepApplicableForPlan(step, data.planCode)) {
      applicableSteps.push(step);
    }
  }
  if (isStepApplicableForPlan(STEP_PUBLIC_PROFILE, data.planCode)) {
    applicableSteps.push(STEP_PUBLIC_PROFILE);
  }

  const steps: OnboardingStepStatus[] = applicableSteps.map((def) => {
    const completed =
      def.id === "welcome" ? data.welcomeSeen : isStepCompleted(def, data);
    return {
      id: def.id,
      label: def.label,
      href: def.href,
      completed,
    };
  });

  const firstPending = steps.find((s) => !s.completed);
  const firstPendingStepId = firstPending?.id ?? null;
  const allComplete = firstPendingStepId === null;

  return { steps, firstPendingStepId, allComplete };
}

/** Path segments that identify the "target page" for each step (modal stays closed there). */
const STEP_TARGET_SEGMENTS: Record<
  Exclude<OnboardingStepId, "welcome">,
  string[]
> = {
  config: ["settings/account", "settings/customization"],
  client: ["clients"],
  project: ["projects"],
  "public-profile": ["settings/customization"],
};

/**
 * Returns true if pathname is one of the target pages for the given step.
 * Used to keep the onboarding modal closed while the user is on the step's action page.
 */
export function isOnOnboardingStepTargetPage(
  pathname: string,
  stepId: OnboardingStepId | null
): boolean {
  if (!stepId || stepId === "welcome") return false;
  const segments = STEP_TARGET_SEGMENTS[stepId];
  if (!segments) return false;
  return segments.some((seg) => pathname.includes(seg));
}
