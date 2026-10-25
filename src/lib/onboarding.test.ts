import { describe, it, expect } from "vitest";
import {
  getOnboardingStepsStatus,
  anyOnboardingStepCompleted,
  isRealProjectForOnboarding,
  onboardingSessionSkipKey,
  onboardingWelcomeSeenKey,
  type OnboardingData,
} from "./onboarding";

function baseData(overrides: Partial<OnboardingData> = {}): OnboardingData {
  return {
    welcomeSeen: false,
    planCode: "BASE",
    projectsCount: 0,
    targetProjectId: null,
    sampleProjectId: null,
    hasSupplier: false,
    budgetItemCount: 0,
    hasClientOnProject: false,
    hasPublishedClientView: false,
    hasPdfExported: false,
    hasRealCost: false,
    publicName: null,
    defaultCurrency: null,
    defaultTaxRate: null,
    fullName: null,
    company: null,
    ...overrides,
  };
}

describe("getOnboardingStepsStatus", () => {
  it("returns welcome as first step when welcomeSeen is false", () => {
    const { steps, firstPendingStepId } = getOnboardingStepsStatus(baseData());
    expect(firstPendingStepId).toBe("welcome");
    expect(steps[0].id).toBe("welcome");
    expect(steps[0].completed).toBe(false);
  });

  it("returns create-project as first pending when welcome seen", () => {
    const { firstPendingStepId, primarySteps } = getOnboardingStepsStatus(
      baseData({ welcomeSeen: true })
    );
    expect(firstPendingStepId).toBe("create-project");
    expect(primarySteps.map((s) => s.id)).toEqual([
      "create-project",
      "add-supplier",
      "add-budget-items",
      "add-client",
    ]);
  });

  it("keeps welcome pending when hasSupplier is false (seeded suppliers ignored upstream)", () => {
    const { firstPendingStepId } = getOnboardingStepsStatus(
      baseData({
        welcomeSeen: false,
        hasSupplier: false,
        projectsCount: 0,
      })
    );
    expect(firstPendingStepId).toBe("welcome");
  });

  it("skips welcome when any primary step already completed", () => {
    expect(
      anyOnboardingStepCompleted(
        baseData({ hasSupplier: true, welcomeSeen: false })
      )
    ).toBe(true);
    const { firstPendingStepId } = getOnboardingStepsStatus(
      baseData({
        welcomeSeen: true,
        hasSupplier: true,
      })
    );
    expect(firstPendingStepId).not.toBe("welcome");
  });

  it("orders primary steps create-project → add-supplier → add-budget-items → add-client", () => {
    const { primarySteps } = getOnboardingStepsStatus(
      baseData({ welcomeSeen: true })
    );
    expect(primarySteps.map((s) => s.id)).toEqual([
      "create-project",
      "add-supplier",
      "add-budget-items",
      "add-client",
    ]);
  });

  it("marks create-project complete when projectsCount > 0", () => {
    const { primarySteps } = getOnboardingStepsStatus(
      baseData({ welcomeSeen: true, projectsCount: 1, targetProjectId: "p1" })
    );
    expect(primarySteps.find((s) => s.id === "create-project")?.completed).toBe(
      true
    );
  });

  it("marks add-budget-items complete when budgetItemCount >= 3", () => {
    const { primarySteps } = getOnboardingStepsStatus(
      baseData({
        welcomeSeen: true,
        projectsCount: 1,
        budgetItemCount: 3,
      })
    );
    expect(
      primarySteps.find((s) => s.id === "add-budget-items")?.completed
    ).toBe(true);
  });

  it("marks add-client complete when hasClientOnProject", () => {
    const { primarySteps } = getOnboardingStepsStatus(
      baseData({
        welcomeSeen: true,
        projectsCount: 1,
        hasClientOnProject: true,
      })
    );
    expect(primarySteps.find((s) => s.id === "add-client")?.completed).toBe(
      true
    );
  });

  it("activationComplete when all 4 primary steps done even if secondary incomplete", () => {
    const { activationComplete, allComplete, secondarySteps } =
      getOnboardingStepsStatus(
        baseData({
          welcomeSeen: true,
          projectsCount: 1,
          hasSupplier: true,
          budgetItemCount: 3,
          hasClientOnProject: true,
          planCode: "BASE",
        })
      );
    expect(activationComplete).toBe(true);
    expect(allComplete).toBe(true);
    expect(secondarySteps.some((s) => !s.completed)).toBe(true);
  });

  it("hides record-real-cost and public-profile for BASE", () => {
    const { secondarySteps } = getOnboardingStepsStatus(
      baseData({ welcomeSeen: true, planCode: "BASE" })
    );
    expect(secondarySteps.some((s) => s.id === "record-real-cost")).toBe(false);
    expect(secondarySteps.some((s) => s.id === "public-profile")).toBe(false);
    expect(secondarySteps.map((s) => s.id)).toEqual([
      "publish-client-view",
      "export-pdf",
      "config",
      "account",
    ]);
  });

  it("includes record-real-cost and public-profile for PRO and STUDIO", () => {
    for (const planCode of ["PRO", "STUDIO"] as const) {
      const { secondarySteps } = getOnboardingStepsStatus(
        baseData({ welcomeSeen: true, planCode })
      );
      expect(secondarySteps.map((s) => s.id)).toEqual([
        "publish-client-view",
        "export-pdf",
        "record-real-cost",
        "public-profile",
        "config",
        "account",
      ]);
    }
  });

  it("places account last in secondary and config before account", () => {
    const { secondarySteps } = getOnboardingStepsStatus(
      baseData({ welcomeSeen: true, planCode: "PRO" })
    );
    expect(secondarySteps.at(-1)?.id).toBe("account");
    expect(secondarySteps.at(-2)?.id).toBe("config");
  });

  it("builds deep links with target project id when present", () => {
    const { primarySteps } = getOnboardingStepsStatus(
      baseData({
        welcomeSeen: true,
        projectsCount: 1,
        targetProjectId: "abc",
      })
    );
    const budget = primarySteps.find((s) => s.id === "add-budget-items");
    expect(budget?.href).toContain("/projects/abc/quotation");
    expect(budget?.href).toContain("onboarding=add-budget-items");
  });
});

describe("anyOnboardingStepCompleted", () => {
  it("is true when any primary step is done", () => {
    expect(
      anyOnboardingStepCompleted(
        baseData({ projectsCount: 1, welcomeSeen: true })
      )
    ).toBe(true);
  });

  it("is false when no primary progress", () => {
    expect(anyOnboardingStepCompleted(baseData({ welcomeSeen: true }))).toBe(
      false
    );
  });
});

describe("onboarding session keys", () => {
  it("scopes skip and welcome-seen keys by user id", () => {
    expect(onboardingSessionSkipKey("user-a")).toBe(
      "veta_onboarding_skipped_session:user-a"
    );
    expect(onboardingWelcomeSeenKey("user-b")).toBe(
      "veta_onboarding_welcome_seen_session:user-b"
    );
    expect(onboardingSessionSkipKey("user-a")).not.toBe(
      onboardingSessionSkipKey("user-b")
    );
  });
});

describe("isRealProjectForOnboarding", () => {
  it("counts non-sample projects", () => {
    expect(isRealProjectForOnboarding({ is_sample: false })).toBe(true);
    expect(isRealProjectForOnboarding({ is_sample: null })).toBe(true);
  });

  it("counts sample only when status is active (reopened)", () => {
    expect(
      isRealProjectForOnboarding({ is_sample: true, status: "completed" })
    ).toBe(false);
    expect(
      isRealProjectForOnboarding({ is_sample: true, status: "active" })
    ).toBe(true);
  });
});
