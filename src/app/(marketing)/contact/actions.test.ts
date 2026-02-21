import { describe, it, expect, vi, beforeEach } from "vitest";
import { submitContactForm } from "./actions";

const mockSendTransactionalEmail = vi.fn();
const mockGetContactFormToEmail = vi.fn();
const mockGetDefaultFrom = vi.fn();

vi.mock("@/lib/email/mailersend", () => ({
  sendTransactionalEmail: (...args: unknown[]) =>
    mockSendTransactionalEmail(...args),
  getContactFormToEmail: () => mockGetContactFormToEmail(),
  getDefaultFrom: () => mockGetDefaultFrom(),
}));

function formData(overrides: Record<string, string> = {}) {
  const data = new FormData();
  data.set("name", overrides.name ?? "Jane Doe");
  data.set("email", overrides.email ?? "jane@example.com");
  data.set("subject", overrides.subject ?? "Test subject here");
  data.set(
    "message",
    overrides.message ?? "This is a test message with enough length."
  );
  return data;
}

describe("submitContactForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetContactFormToEmail.mockReturnValue("veta.pro.pm@gmail.com");
    mockGetDefaultFrom.mockReturnValue({
      email: "noreply@veta.pro",
      name: "Veta Web",
    });
    mockSendTransactionalEmail.mockResolvedValue({ success: true });
  });

  it("returns error when name is too short", async () => {
    const result = await submitContactForm(null, formData({ name: "A" }));
    expect(result.error).toContain("nombre");
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("returns error when email is invalid", async () => {
    const result = await submitContactForm(
      null,
      formData({ email: "not-email" })
    );
    expect(result.error).toContain("Email");
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("returns error when subject is too short", async () => {
    const result = await submitContactForm(null, formData({ subject: "Hi" }));
    expect(result.error).toContain("asunto");
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("returns error when message is too short", async () => {
    const result = await submitContactForm(
      null,
      formData({ message: "Short" })
    );
    expect(result.error).toContain("mensaje");
    expect(mockSendTransactionalEmail).not.toHaveBeenCalled();
  });

  it("sends email via MailerSend and returns success", async () => {
    const result = await submitContactForm(null, formData());
    expect(result.success).toBe(true);
    expect(result.error).toBeUndefined();
    expect(mockSendTransactionalEmail).toHaveBeenCalledTimes(1);
    const call = mockSendTransactionalEmail.mock.calls[0][0];
    expect(call.to).toBe("veta.pro.pm@gmail.com");
    expect(call.from).toBe("noreply@veta.pro");
    expect(call.fromName).toBe("Veta Web");
    expect(call.replyTo).toEqual({
      email: "jane@example.com",
      name: "Jane Doe",
    });
    expect(call.subject).toContain("Veta Contacto");
    expect(call.subject).toContain("Test subject here");
    expect(call.text).toContain("Jane Doe");
    expect(call.text).toContain("jane@example.com");
    expect(call.html).toContain("Nuevo mensaje de contacto");
  });

  it("returns error when MailerSend returns failure", async () => {
    mockSendTransactionalEmail.mockResolvedValueOnce({
      success: false,
      error: "API quota exceeded",
    });
    const result = await submitContactForm(null, formData());
    expect(result.success).toBeUndefined();
    expect(result.error).toBe("API quota exceeded");
  });

  it("returns generic error when MailerSend returns failure without message", async () => {
    mockSendTransactionalEmail.mockResolvedValueOnce({
      success: false,
      error: "",
    });
    const result = await submitContactForm(null, formData());
    expect(result.error).toContain("No se pudo enviar");
  });

  it("returns config error when sendTransactionalEmail indicates no API key", async () => {
    mockSendTransactionalEmail.mockResolvedValueOnce({
      success: false,
      error:
        "El envío de correos no está configurado. Contacta por email directamente.",
    });
    const result = await submitContactForm(null, formData());
    expect(result.error).toContain("no está configurado");
  });

  it("escapes HTML in contact payload", async () => {
    await submitContactForm(
      null,
      formData({
        name: "Script <script>alert(1)</script>",
        message: "Hello & goodbye",
      })
    );
    const call = mockSendTransactionalEmail.mock.calls[0][0];
    expect(call.html).not.toContain("<script>");
    expect(call.html).toContain("&lt;script&gt;");
    expect(call.html).toContain("&amp;");
  });
});
