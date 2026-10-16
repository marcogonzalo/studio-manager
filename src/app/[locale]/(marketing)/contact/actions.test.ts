import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitContactForm } from "./actions";

/**
 * Thin re-export smoke test — full coverage lives in submit-support-form.test.ts.
 */
const mockSendTransactionalEmail = vi.fn();
const mockGetUser = vi.fn();

vi.mock("@/lib/email/mailersend", () => ({
  sendTransactionalEmail: (...args: unknown[]) =>
    mockSendTransactionalEmail(...args),
  getContactFormToEmail: () => "veta.pro.pm@gmail.com",
  getDefaultFrom: () => ({ email: "noreply@veta.pro", name: "Veta Web" }),
}));

vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: () => ({
    allowed: true,
    remaining: 5,
    resetAt: Date.now() + 60000,
  }),
  getClientIpFromHeaders: () => "127.0.0.1",
  getRateLimitMessage: () => "rate limited",
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: mockGetUser },
  })),
}));

describe("submitContactForm (alias)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockSendTransactionalEmail.mockResolvedValue({ success: true });
  });

  it("delegates to shared support submit", async () => {
    const data = new FormData();
    data.set("reason", "other");
    data.set("name", "Jane Doe");
    data.set("email", "jane@example.com");
    data.set("subject", "Other question here");
    data.set("message", "This is a test message with enough length.");
    data.set("form_locale", "en");

    const result = await submitContactForm(null, data);
    expect(result.success).toBe(true);
    expect(mockSendTransactionalEmail).toHaveBeenCalled();
    expect(mockSendTransactionalEmail.mock.calls[0][0].subject).toContain(
      "(other)"
    );
  });
});
