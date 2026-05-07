import { describe, it, expect, vi, afterEach } from "vitest";
import { resolveMagicLinkAntiSpam } from "./resolve-magic-link-anti-spam";

const baseConfig = {
  enabled: true,
  captchaProvider: "turnstile" as const,
  getTurnstileSecretKey: () => "secret",
  riskThreshold: 0,
  actionOnSpam: "silent_block" as const,
};

describe("resolveMagicLinkAntiSpam", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("proceeds when anti-spam is disabled", async () => {
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      config: { ...baseConfig, enabled: false },
    });
    expect(result).toEqual({ action: "proceed" });
  });

  it("requires captcha for suspicious email when turnstile is configured", async () => {
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      config: baseConfig,
    });
    expect(result).toEqual({ action: "captcha_required" });
  });

  it("rejects invalid captcha token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            success: false,
            "error-codes": ["invalid-input-response"],
          }),
      })
    );
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      captchaToken: "bad",
      config: baseConfig,
    });
    expect(result).toMatchObject({
      action: "reject",
      code: "captcha_invalid",
    });
  });

  it("proceeds without captcha token when captchaBypassVerified", async () => {
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      captchaBypassVerified: true,
      config: baseConfig,
    });
    expect(result).toEqual({ action: "proceed" });
  });

  it("still rejects hard_block when captchaBypassVerified", async () => {
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      captchaBypassVerified: true,
      config: { ...baseConfig, actionOnSpam: "hard_block" },
    });
    expect(result).toMatchObject({
      action: "reject",
      code: "email_not_allowed",
    });
  });

  it("proceeds after valid captcha when action is silent_block with Turnstile", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })
    );
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      captchaToken: "ok-token",
      config: baseConfig,
    });
    expect(result).toEqual({ action: "proceed" });
  });

  it("fake_success for suspicious email when silent_block without Turnstile", async () => {
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      config: {
        ...baseConfig,
        captchaProvider: "none",
        getTurnstileSecretKey: () => undefined,
      },
    });
    expect(result).toEqual({ action: "fake_success" });
  });

  it("proceeds with metadata when action is flag_for_review", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        json: () => Promise.resolve({ success: true }),
      })
    );
    const result = await resolveMagicLinkAntiSpam({
      email: "b.a.rl.e.t.hh08.2@example.com",
      captchaToken: "ok-token",
      config: { ...baseConfig, actionOnSpam: "flag_for_review" },
    });
    expect(result.action).toBe("proceed");
    if (result.action === "proceed") {
      expect(result.metadataPatch?.signup_spam_review).toBe(true);
      expect(typeof result.metadataPatch?.signup_spam_score).toBe("number");
    }
  });
});
