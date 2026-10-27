/**
 * Activation checklist (#213).
 * Primary (progress): create-project → add-supplier → add-budget-items → add-client.
 * Secondary (collapsed, plan-filtered): post-activation + polish.
 * Labels live in app-onboarding.json (ES/EN); no hard-coded Spanish here.
 */

import type { PlanCode } from "@/types";
import { appPath } from "@/lib/app-paths";

/** @deprecated Unscoped — use onboardingSessionSkipKey(userId). Kept for cleanup. */
export const ONBOARDING_SESSION_SKIP_KEY = "veta_onboarding_skipped_session";
/** @deprecated Unscoped — use onboardingWelcomeSeenKey(userId). Kept for cleanup. */
export const ONBOARDING_WELCOME_SEEN_SESSION_KEY =
  "veta_onboarding_welcome_seen_session";

/** Per-user session skip so one account's "Later" does not hide welcome for the next. */
export function onboardingSessionSkipKey(userId: string): string {
  return `${ONBOARDING_SESSION_SKIP_KEY}:${userId}`;
}

/** Per-user welcome-seen flag for this browser tab session. */
export function onboardingWelcomeSeenKey(userId: string): string {
  return `${ONBOARDING_WELCOME_SEEN_SESSION_KEY}:${userId}`;
}

/** Remove legacy unscoped keys that leaked across accounts in the same tab. */
export function clearLegacyOnboardingSessionKeys(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(ONBOARDING_SESSION_SKIP_KEY);
  window.sessionStorage.removeItem(ONBOARDING_WELCOME_SEEN_SESSION_KEY);
}

export type PrimaryStepId =
  "create-project" | "add-supplier" | "add-budget-items" | "add-client";

export type SecondaryStepId =
  | "publish-client-view"
  | "export-pdf"
  | "record-real-cost"
  | "public-profile"
  | "config"
  | "account";

export type OnboardingStepId = "welcome" | PrimaryStepId | SecondaryStepId;

export interface OnboardingStepDef {
  id: OnboardingStepId;
  href: string;
  /** If set, step only applies for these plans. */
  plans?: PlanCode[];
  /** Primary = activation progress; secondary = polish / post-activation. */
  group: "primary" | "secondary" | "welcome";
}

export interface OnboardingData {
  /** True when welcome should be skipped. */
  welcomeSeen: boolean;
  planCode: PlanCode;
  /** Non-sample (or reopened sample) projects. */
  projectsCount: number;
  /** Latest real project id for deep links (null if none). */
  targetProjectId: string | null;
  /** Seeded sample project id for "See an example" (null if deleted). */
  sampleProjectId: string | null;
  hasSupplier: boolean;
  /** Non-excluded items + budget lines across real projects. */
  budgetItemCount: number;
  hasClientOnProject: boolean;
  hasPublishedClientView: boolean;
  hasPdfExported: boolean;
  hasRealCost: boolean;
  publicName: string | null;
  defaultCurrency: string | null;
  defaultTaxRate: number | null;
  fullName: string | null;
  company: string | null;
}

export interface OnboardingStepStatus {
  id: OnboardingStepId;
  href: string;
  completed: boolean;
  group: "primary" | "secondary" | "welcome";
}

const PRIMARY_ORDER: PrimaryStepId[] = [
  "create-project",
  "add-supplier",
  "add-budget-items",
  "add-client",
];

const SECONDARY_ORDER: SecondaryStepId[] = [
  "publish-client-view",
  "export-pdf",
  "record-real-cost",
  "public-profile",
  "config",
  "account",
];

function projectHref(id: string | null, suffix = ""): string {
  if (!id) return appPath("/projects");
  return appPath(`/projects/${id}${suffix}`);
}

function hrefForStep(id: OnboardingStepId, data: OnboardingData): string {
  const pid = data.targetProjectId;
  switch (id) {
    case "welcome":
      return "";
    case "create-project":
      return `${appPath("/projects")}?onboarding=create-project`;
    case "add-supplier":
      return `${appPath("/suppliers")}?onboarding=add-supplier`;
    case "add-budget-items":
      return `${projectHref(pid, "/quotation")}?onboarding=add-budget-items`;
    case "add-client":
      return `${projectHref(pid)}?onboarding=add-client`;
    case "publish-client-view":
      return `${projectHref(pid)}?onboarding=publish-client-view`;
    case "export-pdf":
      return `${projectHref(pid, "/quotation")}?onboarding=export-pdf`;
    case "record-real-cost":
      return `${projectHref(pid, "/expenses")}?onboarding=record-real-cost`;
    case "public-profile":
      return appPath("/settings/customization");
    case "config":
      return `${appPath("/settings/customization")}#onboarding-customization-defaults`;
    case "account":
      return appPath("/settings/account");
    default:
      return appPath("/dashboard");
  }
}

function plansForStep(id: OnboardingStepId): PlanCode[] | undefined {
  if (id === "record-real-cost" || id === "public-profile") {
    return ["PRO", "STUDIO"];
  }
  return undefined;
}

function groupForStep(
  id: OnboardingStepId
): "primary" | "secondary" | "welcome" {
  if (id === "welcome") return "welcome";
  if ((PRIMARY_ORDER as string[]).includes(id)) return "primary";
  return "secondary";
}

function isStepApplicableForPlan(
  id: OnboardingStepId,
  planCode: PlanCode
): boolean {
  const plans = plansForStep(id);
  if (!plans) return true;
  return plans.includes(planCode);
}

function isStepCompleted(id: OnboardingStepId, data: OnboardingData): boolean {
  switch (id) {
    case "welcome":
      return data.welcomeSeen;
    case "create-project":
      return data.projectsCount > 0;
    case "add-supplier":
      return data.hasSupplier;
    case "add-budget-items":
      return data.budgetItemCount >= 3;
    case "add-client":
      return data.hasClientOnProject;
    case "publish-client-view":
      return data.hasPublishedClientView;
    case "export-pdf":
      return data.hasPdfExported;
    case "record-real-cost":
      return data.hasRealCost;
    case "public-profile":
      return Boolean(data.publicName?.trim());
    case "config":
      return Boolean(data.defaultCurrency) && data.defaultTaxRate != null;
    case "account":
      return Boolean(data.fullName?.trim()) && Boolean(data.company?.trim());
    default:
      return false;
  }
}

/** True if any primary activation step is completed. */
export function anyOnboardingStepCompleted(
  data: Omit<OnboardingData, "welcomeSeen">
): boolean {
  const d: OnboardingData = { ...data, welcomeSeen: false };
  return PRIMARY_ORDER.some(
    (id) => isStepApplicableForPlan(id, data.planCode) && isStepCompleted(id, d)
  );
}

function toStatus(
  id: OnboardingStepId,
  data: OnboardingData
): OnboardingStepStatus {
  return {
    id,
    href: hrefForStep(id, data),
    completed: id === "welcome" ? data.welcomeSeen : isStepCompleted(id, data),
    group: groupForStep(id),
  };
}

export interface OnboardingStepsResult {
  steps: OnboardingStepStatus[];
  primarySteps: OnboardingStepStatus[];
  secondarySteps: OnboardingStepStatus[];
  firstPendingStepId: OnboardingStepId | null;
  /** True when all 4 primary activation steps are done. */
  activationComplete: boolean;
  /** Alias of activationComplete for checklist hide / celebration. */
  allComplete: boolean;
}

/**
 * Returns applicable steps with completed status.
 * Progress / celebration use primary steps only.
 * firstPendingStepId prefers welcome, then first incomplete primary.
 */
export function getOnboardingStepsStatus(
  data: OnboardingData
): OnboardingStepsResult {
  const steps: OnboardingStepStatus[] = [];

  if (!data.welcomeSeen) {
    steps.push(toStatus("welcome", data));
  }

  for (const id of PRIMARY_ORDER) {
    if (isStepApplicableForPlan(id, data.planCode)) {
      steps.push(toStatus(id, data));
    }
  }

  for (const id of SECONDARY_ORDER) {
    if (isStepApplicableForPlan(id, data.planCode)) {
      steps.push(toStatus(id, data));
    }
  }

  const primarySteps = steps.filter((s) => s.group === "primary");
  const secondarySteps = steps.filter((s) => s.group === "secondary");
  const activationComplete = primarySteps.every((s) => s.completed);

  const firstPending =
    steps.find((s) => s.id === "welcome" && !s.completed) ??
    primarySteps.find((s) => !s.completed) ??
    null;

  return {
    steps,
    primarySteps,
    secondarySteps,
    firstPendingStepId: firstPending?.id ?? null,
    activationComplete,
    allComplete: activationComplete,
  };
}

/** Path segments that identify the target page for a step (modal stays closed there). */
const STEP_TARGET_SEGMENTS: Partial<Record<OnboardingStepId, string[]>> = {
  "create-project": ["projects"],
  "add-supplier": ["suppliers"],
  "add-budget-items": ["quotation", "projects"],
  "add-client": ["projects", "clients"],
  "publish-client-view": ["projects"],
  "export-pdf": ["quotation", "projects"],
  "record-real-cost": ["expenses", "projects"],
  "public-profile": ["settings/customization"],
  config: ["settings/customization"],
  account: ["settings/account"],
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

/** Sample projects that count as "real" for activation: non-sample, or sample reopened to active. */
export function isRealProjectForOnboarding(project: {
  is_sample?: boolean | null;
  status?: string | null;
}): boolean {
  if (!project.is_sample) return true;
  return project.status === "active";
}
