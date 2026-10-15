import { beforeEach, describe, expect, it, vi } from "vitest";
import { pushSignUpConfirmed, pushLoginConfirmed } from "./gtm";

describe("gtm signup / login confirmed helpers", () => {
  beforeEach(() => {
    const dataLayer: unknown[] = [];
    vi.stubGlobal("window", {
      dataLayer,
      location: {
        href: "https://veta.pro/veta-app/dashboard?auth_confirmed=signup",
      },
    });
    // pushToDataLayer reads window from global; keep dataLayer on the stub
    (globalThis as { window: { dataLayer: unknown[] } }).window.dataLayer =
      dataLayer;
  });

  it("pushSignUpConfirmed pushes only sign_up_confirmed (no duplicate sign_up)", () => {
    pushSignUpConfirmed({
      method: "magic_link",
      plan_code: "PRO",
      billing_period: "monthly",
    });

    const events = (
      window as unknown as {
        dataLayer: Array<{ event?: string; confirmed?: boolean }>;
      }
    ).dataLayer.filter((e) => e && typeof e === "object" && "event" in e);

    const names = events.map((e) => e.event);
    expect(names).toContain("sign_up_confirmed");
    expect(names).not.toContain("sign_up");
    expect(events.some((e) => e.confirmed === true)).toBe(false);
  });

  it("pushLoginConfirmed pushes only login_confirmed (no duplicate login)", () => {
    pushLoginConfirmed();

    const events = (
      window as unknown as {
        dataLayer: Array<{ event?: string; confirmed?: boolean }>;
      }
    ).dataLayer.filter((e) => e && typeof e === "object" && "event" in e);

    const names = events.map((e) => e.event);
    expect(names).toContain("login_confirmed");
    expect(names).not.toContain("login");
  });
});
