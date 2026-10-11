import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  captureAttribution,
  saveAttributionCookie,
  loadAttributionCookie,
  hasAttributionCookie,
  captureAndSaveAttribution,
  type AttributionData,
} from "./attribution";

describe("attribution", () => {
  beforeEach(() => {
    vi.stubGlobal("window", {
      location: {
        hostname: "veta.pro",
        pathname: "/demo",
        search: "?utm_source=google&utm_medium=cpc&utm_campaign=demo2024",
      },
    });
    vi.stubGlobal("document", {
      referrer: "https://google.com/search",
      cookie: "",
    });
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
      length: 0,
      key: vi.fn(),
    });
  });

  describe("captureAttribution", () => {
    it("captures UTM parameters from URL", () => {
      const data = captureAttribution();
      expect(data.utm_source).toBe("google");
      expect(data.utm_medium).toBe("cpc");
      expect(data.utm_campaign).toBe("demo2024");
    });

    it("captures referrer when external", () => {
      const data = captureAttribution();
      expect(data.referrer).toBe("https://google.com/search");
    });

    it("captures landing path", () => {
      const data = captureAttribution();
      expect(data.landing_path).toBe("/demo");
    });

    it("includes captured_at timestamp", () => {
      const data = captureAttribution();
      expect(data.captured_at).toBeDefined();
      expect(typeof data.captured_at).toBe("string");
    });

    it("does not capture referrer when same domain", () => {
      vi.stubGlobal("document", {
        referrer: "https://veta.pro/pricing",
      });
      const data = captureAttribution();
      expect(data.referrer).toBeUndefined();
    });
  });

  describe("saveAttributionCookie", () => {
    it("saves cookie when analytics consent granted", () => {
      const mockLocalStorage = {
        getItem: vi.fn(() =>
          JSON.stringify({ analytics: true, marketing: false })
        ),
      };
      vi.stubGlobal("localStorage", mockLocalStorage);

      const data: AttributionData = {
        utm_source: "google",
        captured_at: new Date().toISOString(),
      };

      const result = saveAttributionCookie(data);
      expect(result).toBe(true);
    });

    it("does not save cookie when analytics consent not granted", () => {
      const mockLocalStorage = {
        getItem: vi.fn(() =>
          JSON.stringify({ analytics: false, marketing: false })
        ),
      };
      vi.stubGlobal("localStorage", mockLocalStorage);

      const data: AttributionData = {
        utm_source: "google",
        captured_at: new Date().toISOString(),
      };

      const result = saveAttributionCookie(data);
      expect(result).toBe(false);
    });

    it("does not save cookie when no consent stored", () => {
      const mockLocalStorage = {
        getItem: vi.fn(() => null),
      };
      vi.stubGlobal("localStorage", mockLocalStorage);

      const data: AttributionData = {
        utm_source: "google",
        captured_at: new Date().toISOString(),
      };

      const result = saveAttributionCookie(data);
      expect(result).toBe(false);
    });
  });

  describe("loadAttributionCookie", () => {
    it("returns null when no cookie exists", () => {
      vi.stubGlobal("document", { cookie: "" });
      const result = loadAttributionCookie();
      expect(result).toBeNull();
    });

    it("parses attribution data from cookie", () => {
      const data: AttributionData = {
        utm_source: "google",
        utm_medium: "cpc",
        captured_at: "2024-01-01T00:00:00.000Z",
      };
      vi.stubGlobal("document", {
        cookie: `veta_attribution=${encodeURIComponent(JSON.stringify(data))}`,
      });

      const result = loadAttributionCookie();
      expect(result).toEqual(data);
    });

    it("returns null when cookie is malformed", () => {
      vi.stubGlobal("document", {
        cookie: "veta_attribution=invalid-json",
      });
      const result = loadAttributionCookie();
      expect(result).toBeNull();
    });
  });

  describe("hasAttributionCookie", () => {
    it("returns true when cookie exists", () => {
      const data: AttributionData = {
        utm_source: "google",
        captured_at: "2024-01-01T00:00:00.000Z",
      };
      vi.stubGlobal("document", {
        cookie: `veta_attribution=${encodeURIComponent(JSON.stringify(data))}`,
      });

      expect(hasAttributionCookie()).toBe(true);
    });

    it("returns false when cookie does not exist", () => {
      vi.stubGlobal("document", { cookie: "" });
      expect(hasAttributionCookie()).toBe(false);
    });
  });

  describe("captureAndSaveAttribution", () => {
    it("returns existing attribution when cookie exists", () => {
      const existingData: AttributionData = {
        utm_source: "facebook",
        captured_at: "2024-01-01T00:00:00.000Z",
      };
      vi.stubGlobal("document", {
        cookie: `veta_attribution=${encodeURIComponent(JSON.stringify(existingData))}`,
      });

      const result = captureAndSaveAttribution();
      expect(result).toEqual(existingData);
    });

    it("captures and saves new attribution when cookie does not exist and consent granted", () => {
      vi.stubGlobal("document", { cookie: "" });
      const mockLocalStorage = {
        getItem: vi.fn(() =>
          JSON.stringify({ analytics: true, marketing: false })
        ),
      };
      vi.stubGlobal("localStorage", mockLocalStorage);

      const result = captureAndSaveAttribution();
      expect(result).toBeDefined();
      expect(result?.utm_source).toBe("google");
    });

    it("returns null when cookie does not exist and consent not granted", () => {
      vi.stubGlobal("document", { cookie: "" });
      const mockLocalStorage = {
        getItem: vi.fn(() => null),
      };
      vi.stubGlobal("localStorage", mockLocalStorage);

      const result = captureAndSaveAttribution();
      expect(result).toBeNull();
    });
  });
});
