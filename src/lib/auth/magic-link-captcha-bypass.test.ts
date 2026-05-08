import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  issueMagicLinkCaptchaBypassValue,
  verifyMagicLinkCaptchaBypassValue,
} from "./magic-link-captcha-bypass";

describe("magic-link-captcha-bypass", () => {
  const prevBypass = process.env.MAGIC_LINK_CAPTCHA_BYPASS_SECRET;
  const prevTurnstile = process.env.TURNSTILE_SECRET_KEY;

  beforeEach(() => {
    delete process.env.MAGIC_LINK_CAPTCHA_BYPASS_SECRET;
    process.env.TURNSTILE_SECRET_KEY = "unit-test-turnstile-secret";
  });

  afterEach(() => {
    if (prevTurnstile === undefined) {
      delete process.env.TURNSTILE_SECRET_KEY;
    } else {
      process.env.TURNSTILE_SECRET_KEY = prevTurnstile;
    }
    if (prevBypass === undefined) {
      delete process.env.MAGIC_LINK_CAPTCHA_BYPASS_SECRET;
    } else {
      process.env.MAGIC_LINK_CAPTCHA_BYPASS_SECRET = prevBypass;
    }
  });

  it("issues and verifies a cookie value for the same email", () => {
    const raw = issueMagicLinkCaptchaBypassValue("User@Test.COM ");
    expect(raw).toBeTruthy();
    expect(verifyMagicLinkCaptchaBypassValue(raw!, "user@test.com")).toBe(true);
  });

  it("rejects when email does not match", () => {
    const raw = issueMagicLinkCaptchaBypassValue("a@example.com");
    expect(verifyMagicLinkCaptchaBypassValue(raw!, "b@example.com")).toBe(
      false
    );
  });

  it("returns null when no signing secret exists", () => {
    delete process.env.TURNSTILE_SECRET_KEY;
    delete process.env.MAGIC_LINK_CAPTCHA_BYPASS_SECRET;
    expect(issueMagicLinkCaptchaBypassValue("x@y.com")).toBeNull();
  });
});
