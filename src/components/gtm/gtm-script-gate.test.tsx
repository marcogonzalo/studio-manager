import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CONSENT_STORAGE_KEY, CONSENT_UPDATE_EVENT } from "@/lib/consent";
import { GtmScriptGate } from "./gtm-script-gate";

vi.mock("@/components/gtm/gtm-script", () => ({
  GtmScript: () => <div data-testid="gtm-script" />,
}));

describe("GtmScriptGate", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("does not load GTM when analytics consent is missing", async () => {
    render(<GtmScriptGate />);
    await act(async () => {});
    expect(screen.queryByTestId("gtm-script")).not.toBeInTheDocument();
  });

  it("loads GTM after consent update grants analytics", async () => {
    render(<GtmScriptGate />);
    await act(async () => {});
    expect(screen.queryByTestId("gtm-script")).not.toBeInTheDocument();

    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: true,
        marketing: false,
        personalization: false,
      })
    );

    await act(async () => {
      window.dispatchEvent(new Event(CONSENT_UPDATE_EVENT));
    });

    expect(screen.getByTestId("gtm-script")).toBeInTheDocument();
  });

  it("keeps GTM off when consent update denies analytics", async () => {
    render(<GtmScriptGate />);
    await act(async () => {});

    localStorage.setItem(
      CONSENT_STORAGE_KEY,
      JSON.stringify({
        necessary: true,
        analytics: false,
        marketing: false,
        personalization: false,
      })
    );

    await act(async () => {
      window.dispatchEvent(new Event(CONSENT_UPDATE_EVENT));
    });

    expect(screen.queryByTestId("gtm-script")).not.toBeInTheDocument();
  });
});
