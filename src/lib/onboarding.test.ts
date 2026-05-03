import { describe, it, expect } from "vitest";
import { getOnboardingStepsStatus } from "./onboarding";

describe("getOnboardingStepsStatus", () => {
  const baseData = {
    fullName: null,
    defaultCurrency: null,
    defaultTaxRate: null,
    welcomeSeen: false,
    publicName: null,
    clientsCount: 0,
    projectsCount: 0,
    planCode: "BASE" as const,
  };

  it("returns welcome as first step when welcomeSeen is false", () => {
    const { steps, firstPendingStepId } = getOnboardingStepsStatus(baseData);
    expect(firstPendingStepId).toBe("welcome");
    expect(steps[0].id).toBe("welcome");
    expect(steps[0].completed).toBe(false);
  });

  it("returns config as first pending step when welcome seen but config incomplete", () => {
    const data = { ...baseData, welcomeSeen: true };
    const { steps, firstPendingStepId } = getOnboardingStepsStatus(data);
    expect(firstPendingStepId).toBe("config");
    expect(steps.every((s) => s.id !== "welcome")).toBe(true);
  });

  it("marks config completed when fullName, defaultCurrency and defaultTaxRate are set", () => {
    const data = {
      ...baseData,
      welcomeSeen: true,
      fullName: "Jane",
      defaultCurrency: "EUR",
      defaultTaxRate: 21,
    };
    const { steps } = getOnboardingStepsStatus(data);
    const configStep = steps.find((s) => s.id === "config");
    expect(configStep?.completed).toBe(true);
  });

  it("marks client step completed when clientsCount > 0", () => {
    const data = {
      ...baseData,
      welcomeSeen: true,
      fullName: "J",
      defaultCurrency: "EUR",
      defaultTaxRate: 0,
      clientsCount: 1,
    };
    const { steps } = getOnboardingStepsStatus(data);
    const clientStep = steps.find((s) => s.id === "client");
    expect(clientStep?.completed).toBe(true);
  });

  it("includes public-profile step only for PRO and STUDIO", () => {
    const baseComplete = {
      ...baseData,
      welcomeSeen: true,
      fullName: "J",
      defaultCurrency: "EUR",
      defaultTaxRate: 0,
      clientsCount: 1,
      projectsCount: 1,
    };
    const { steps: baseSteps } = getOnboardingStepsStatus({
      ...baseComplete,
      planCode: "BASE",
    });
    expect(baseSteps.some((s) => s.id === "public-profile")).toBe(false);

    const { steps: proSteps } = getOnboardingStepsStatus({
      ...baseComplete,
      planCode: "PRO",
    });
    expect(proSteps.some((s) => s.id === "public-profile")).toBe(true);
  });

  it("returns allComplete when all applicable steps are completed", () => {
    const data = {
      ...baseData,
      welcomeSeen: true,
      fullName: "J",
      defaultCurrency: "EUR",
      defaultTaxRate: 0,
      clientsCount: 1,
      projectsCount: 1,
      planCode: "BASE" as const,
    };
    const { allComplete, firstPendingStepId } = getOnboardingStepsStatus(data);
    expect(allComplete).toBe(true);
    expect(firstPendingStepId).toBe(null);
  });
});
