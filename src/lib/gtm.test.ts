import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  GTM_EVENTS,
  pushCtaClick,
  pushDemoAccess,
  pushLoginConfirmed,
  pushPageView,
  pushSelectPlan,
  pushSignUpConfirmed,
  pushViewPricing,
} from "./gtm";

function dataLayerEvents(): Array<{ event?: string }> {
  return (
    window as unknown as {
      dataLayer: Array<{ event?: string }>;
    }
  ).dataLayer.filter((e) => e && typeof e === "object" && "event" in e);
}

describe("gtm signup / login confirmed helpers", () => {
  beforeEach(() => {
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", {
      dataLayer,
      location: {
        href: "https://veta.pro/veta-app/dashboard?auth_confirmed=signup",
      },
    });
    (globalThis as { window: { dataLayer: unknown[] } }).window.dataLayer =
      dataLayer;
  });

  it("pushSignUpConfirmed pushes only sign_up_confirmed (no duplicate sign_up)", () => {
    pushSignUpConfirmed({
      method: "magic_link",
      plan_code: "PRO",
      billing_period: "monthly",
    });

    const names = dataLayerEvents().map((e) => e.event);
    expect(names).toContain("sign_up_confirmed");
    expect(names).not.toContain("sign_up");
  });

  it("pushLoginConfirmed pushes only login_confirmed (no duplicate login)", () => {
    pushLoginConfirmed();

    const names = dataLayerEvents().map((e) => e.event);
    expect(names).toContain("login_confirmed");
    expect(names).not.toContain("login");
  });
});

describe("gtm event names for GTM container alignment (#181)", () => {
  beforeEach(() => {
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", {
      dataLayer,
      location: { href: "https://veta.pro/precios" },
    });
    (globalThis as { window: { dataLayer: unknown[] } }).window.dataLayer =
      dataLayer;
  });

  it("exports stable event name constants GTM listens for", () => {
    expect(GTM_EVENTS.PAGE_VIEW).toBe("page_view");
    expect(GTM_EVENTS.VIEW_PRICING).toBe("view_pricing");
    expect(GTM_EVENTS.CTA_CLICK).toBe("cta_click");
    expect(GTM_EVENTS.DEMO_ACCESS).toBe("demo_access");
    expect(GTM_EVENTS.BEGIN_CHECKOUT).toBe("begin_checkout");
    expect(GTM_EVENTS.SELECT_PLAN).toBe("select_plan");
  });

  it("pushPageView emits page_view", () => {
    pushPageView({ path: "/precios", title: "Pricing" });
    expect(dataLayerEvents().map((e) => e.event)).toContain("page_view");
  });

  it("pushViewPricing emits view_pricing", () => {
    pushViewPricing();
    expect(dataLayerEvents().map((e) => e.event)).toContain("view_pricing");
  });

  it("pushCtaClick emits cta_click with location and text", () => {
    pushCtaClick({
      cta_location: "header",
      cta_text: "Start free",
      destination_url: "/sign-up",
    });
    const event = dataLayerEvents().find((e) => e.event === "cta_click") as {
      event: string;
      cta_location?: string;
      cta_text?: string;
    };
    expect(event).toMatchObject({
      event: "cta_click",
      cta_location: "header",
      cta_text: "Start free",
    });
  });

  it("pushDemoAccess emits demo_access", () => {
    pushDemoAccess();
    expect(dataLayerEvents().map((e) => e.event)).toContain("demo_access");
  });

  it("pushSelectPlan emits select_plan and begin_checkout (not sign_up)", () => {
    pushSelectPlan({
      plan_code: "PRO",
      billing_period: "monthly",
      plan_name: "Pro",
    });
    const names = dataLayerEvents().map((e) => e.event);
    expect(names).toEqual(
      expect.arrayContaining(["select_plan", "begin_checkout"])
    );
    expect(names).not.toContain("sign_up");
    expect(names).not.toContain("begin_signup");
  });
});
