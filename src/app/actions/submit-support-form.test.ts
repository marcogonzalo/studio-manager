import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitSupportForm } from "./submit-support-form";

const mockSendTransactionalEmail = vi.fn();
const mockGetContactFormToEmail = vi.fn();
const mockGetDefaultFrom = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/email/mailersend", () => ({
  sendTransactionalEmail: (...args: unknown[]) =>
    mockSendTransactionalEmail(...args),
  getContactFormToEmail: () => mockGetContactFormToEmail(),
  getDefaultFrom: () => mockGetDefaultFrom(),
}));

const mockCheckRateLimit = vi.fn();
const mockGetClientIpFromHeaders = vi.fn();
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
  getClientIpFromHeaders: (...args: unknown[]) =>
    mockGetClientIpFromHeaders(...args),
  RATE_LIMIT_MESSAGE: "Has excedido el límite de solicitudes.",
  getRateLimitMessage: () => "Has excedido el límite de solicitudes.",
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

function formData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.set("reason", overrides.reason ?? "need_help");
  data.set("name", overrides.name ?? "Jane Doe");
  data.set("email", overrides.email ?? "jane@example.com");
  data.set("subject", overrides.subject ?? "I need help");
  data.set(
    "message",
    overrides.message ?? "This is a test message with enough length."
  );
  if (overrides.context_path != null) {
    data.set("context_path", overrides.context_path);
  }
  if (overrides.context_plan_code != null) {
    data.set("context_plan_code", overrides.context_plan_code);
  }
  if (overrides.form_locale != null) {
    data.set("form_locale", overrides.form_locale);
  }
  return data;
}

describe("submitSupportForm", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    const { headers } = await import("next/headers");
    vi.mocked(headers).mockResolvedValue(
      new Headers({ "x-forwarded-for": "192.168.1.1" })
    );
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockGetClientIpFromHeaders.mockReturnValue("192.168.1.1");
    mockCheckRateLimit.mockReturnValue({
      allowed: true,
      remaining: 5,
      resetAt: Date.now() + 60000,
    });
    mockGetContactFormToEmail.mockReturnValue("veta.pro.pm@gmail.com");
    mockGetDefaultFrom.mockReturnValue({
      email: "noreply@veta.pro",
      name: "Veta Web",
    });
    mockSendTransactionalEmail.mockResolvedValue({ success: true });
  });

  it("returns error when name is too short", async () => {
    const result = await submitSupportForm(null, formData({ name: "A" }));
    expect(result.error).toContain("nombre");
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("returns error when reason is invalid", async () => {
    const result = await submitSupportForm(
      null,
      formData({ reason: "not_a_reason" })
    );
    expect(result.error).toBeTruthy();
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("sends email with Reply-To, Veta Web From, and markdown body", async () => {
    const result = await submitSupportForm(
      null,
      formData({
        form_locale: "en",
        context_path: "/veta-app/dashboard",
        context_plan_code: "BASE",
      })
    );
    expect(result.success).toBe(true);
    expect(mockSendTransactionalEmail).toHaveBeenCalledTimes(1);
    const call = mockSendTransactionalEmail.mock.calls[0][0];
    expect(call.subject).toBe("[Veta] Contact: (need_help) I need help");
    expect(call.replyTo).toEqual({
      email: "jane@example.com",
      name: "Jane Doe",
    });
    expect(call.fromName).toBe("Veta Web");
    expect(call.from).toBe("noreply@veta.pro");
    expect(call.text).toContain("# Veta contact from need_help (en)");
    expect(call.text).toContain("**Contact**: Jane Doe (jane@example.com)");
    expect(call.text).toContain("**Plan**: BASE");
    expect(call.text).toContain("**Path**: /veta-app/dashboard");
    expect(call.text).toContain("**Subject**: I need help");
  });

  it("blocks demo account", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "demo", email: "demo@veta.pro" } },
      error: null,
    });
    const result = await submitSupportForm(null, formData());
    expect(result.error).toMatch(/demo/i);
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("returns success without sending when honeypot is filled", async () => {
    const data = formData();
    data.set("website", "http://spam-bot.com");
    const result = await submitSupportForm(null, data);
    expect(result.success).toBe(true);
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("returns rate limit error when over limit", async () => {
    mockCheckRateLimit.mockReturnValueOnce({
      allowed: false,
      remaining: 0,
      resetAt: Date.now() + 30000,
    });
    const result = await submitSupportForm(null, formData());
    expect(result.error).toContain("límite de solicitudes");
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("rates limit by user id when authenticated", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-99", email: "a@b.com" } },
      error: null,
    });
    await submitSupportForm(null, formData());
    expect(mockCheckRateLimit).toHaveBeenCalledWith("user:user-99", "contact");
  });
});
