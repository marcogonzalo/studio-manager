import type { ReactNode } from "react";
import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import esMarketing from "@/i18n/messages/es/marketing.json";
import { DemoRequestForm } from "./demo-request-form";

vi.mock("@/lib/gtm", () => ({
  pushDemoRequest: vi.fn(),
}));

vi.mock("@/lib/attribution", () => ({
  loadAttributionCookie: vi.fn(() => null),
}));

vi.mock("@/i18n/routing", () => ({
  Link: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  }) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

function renderForm() {
  return render(
    <NextIntlClientProvider
      locale="es"
      messages={{ DemoRequestForm: esMarketing.DemoRequestForm }}
    >
      <DemoRequestForm />
    </NextIntlClientProvider>
  );
}

describe("DemoRequestForm acceptTerms", () => {
  beforeAll(() => {
    class ResizeObserverMock {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps submit disabled until terms checkbox is checked", async () => {
    const user = userEvent.setup();
    renderForm();

    const submit = screen.getByRole("button", {
      name: esMarketing.DemoRequestForm.submit,
    });
    expect(submit).toBeDisabled();

    await user.type(
      screen.getByLabelText(esMarketing.DemoRequestForm.emailLabel),
      "user@example.com"
    );
    expect(submit).toBeDisabled();

    const termsCheckbox = screen.getByRole("checkbox", {
      name: new RegExp(
        esMarketing.DemoRequestForm.acceptTermsPrefix.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        ),
        "i"
      ),
    });
    await user.click(termsCheckbox);
    expect(submit).toBeEnabled();
  });

  it("renders terms checkbox before marketing consent", () => {
    renderForm();
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes).toHaveLength(2);
    expect(checkboxes[0]).toHaveAccessibleName(
      new RegExp(esMarketing.DemoRequestForm.termsLink, "i")
    );
    expect(checkboxes[1]).toHaveAccessibleName(
      esMarketing.DemoRequestForm.marketingConsentLabel
    );
  });
});
