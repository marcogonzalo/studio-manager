import { describe, it, expect, vi } from "vitest";
import { verifyTurnstileToken } from "./verify-turnstile-token";

describe("verifyTurnstileToken", () => {
  it("returns ok false when secret getter returns undefined", async () => {
    const fetchImpl = vi.fn();
    const result = await verifyTurnstileToken({
      getSecretKey: () => undefined,
      token: "tok",
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(result.errorCodes).toContain("missing-input-secret");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns ok true when siteverify reports success", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ success: true }),
    });
    const result = await verifyTurnstileToken({
      getSecretKey: () => "secret",
      token: "tok",
      remoteIp: "1.2.3.4",
      fetchImpl,
    });
    expect(result.ok).toBe(true);
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      expect.objectContaining({ method: "POST" })
    );
    const body = fetchImpl.mock.calls[0][1].body as URLSearchParams;
    expect(body.get("secret")).toBe("secret");
    expect(body.get("response")).toBe("tok");
    expect(body.get("remoteip")).toBe("1.2.3.4");
  });

  it("returns ok false when siteverify reports failure", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          success: false,
          "error-codes": ["invalid-input-response"],
        }),
    });
    const result = await verifyTurnstileToken({
      getSecretKey: () => "secret",
      token: "bad",
      fetchImpl,
    });
    expect(result.ok).toBe(false);
    expect(result.errorCodes).toContain("invalid-input-response");
  });
});
