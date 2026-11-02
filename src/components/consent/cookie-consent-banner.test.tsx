import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import esMarketingShell from "@/i18n/messages/es/marketing/shell.json";
import { CONSENT_STORAGE_KEY } from "@/lib/consent";
import { CookieConsentBanner } from "./cookie-consent-banner";

vi.mock("@/lib/consent", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/consent")>();
  return {
    ...actual,
    pushConsentDefault: vi.fn(),
    pushConsentUpdate: vi.fn(),
  };
});

function renderBanner() {
  return render(
    <NextIntlClientProvider
      locale="es"
      messages={{ CookieConsent: esMarketingShell.CookieConsent }}
    >
      <CookieConsentBanner />
    </NextIntlClientProvider>
  );
}

describe("CookieConsentBanner", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("starts visible before storage is read", () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        personalization: false,
      })
    );
    const html = renderToString(
      <NextIntlClientProvider
        locale="es"
        messages={{ CookieConsent: esMarketingShell.CookieConsent }}
      >
        <CookieConsentBanner />
      </NextIntlClientProvider>
    );
    expect(html).toContain(esMarketingShell.CookieConsent.ariaLabel);
  });

  it("renders when no consent is stored", async () => {
    renderBanner();
    expect(
      await screen.findByRole("dialog", {
        name: esMarketingShell.CookieConsent.ariaLabel,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: esMarketingShell.CookieConsent.acceptAll,
      })
    ).toBeInTheDocument();
  });

  it("hides when consent already stored", async () => {
    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        personalization: false,
      })
    );
    renderBanner();
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", {
          name: esMarketingShell.CookieConsent.ariaLabel,
        })
      ).not.toBeInTheDocument();
    });
  });

  it("dispatches consent update and hides after accept", async () => {
    const user = userEvent.setup();
    const listener = vi.fn();
    window.addEventListener("veta:consent-update", listener);

    renderBanner();
    await screen.findByRole("dialog", {
      name: esMarketingShell.CookieConsent.ariaLabel,
    });

    await user.click(
      screen.getByRole("button", {
        name: esMarketingShell.CookieConsent.acceptAll,
      })
    );

    expect(listener).toHaveBeenCalled();
    expect(
      screen.queryByRole("dialog", {
        name: esMarketingShell.CookieConsent.ariaLabel,
      })
    ).not.toBeInTheDocument();

    window.removeEventListener("veta:consent-update", listener);
  });
});
