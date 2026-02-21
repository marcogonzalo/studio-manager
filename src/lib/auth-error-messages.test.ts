import { describe, it, expect } from "vitest";
import { getFriendlyAuthErrorMessage } from "./auth-error-messages";

describe("getFriendlyAuthErrorMessage", () => {
  it("returns default message when technicalMessage is undefined", () => {
    expect(getFriendlyAuthErrorMessage(undefined)).toBe(
      "No se pudo completar el acceso. Por favor, intenta iniciar sesión de nuevo."
    );
  });

  it("returns default message when technicalMessage is empty string", () => {
    expect(getFriendlyAuthErrorMessage("")).toBe(
      "No se pudo completar el acceso. Por favor, intenta iniciar sesión de nuevo."
    );
  });

  it("maps PKCE-related errors to same-browser message", () => {
    const expected =
      "Intenta iniciar sesión con el mismo navegador en el que solicitaste tu enlace de ingreso.";
    expect(getFriendlyAuthErrorMessage("invalid request: PKCE failed")).toBe(
      expected
    );
    expect(
      getFriendlyAuthErrorMessage("code verifier should be non-empty")
    ).toBe(expected);
    expect(getFriendlyAuthErrorMessage("code challenge does not match")).toBe(
      expected
    );
    expect(getFriendlyAuthErrorMessage("code_verifier mismatch")).toBe(
      expected
    );
    // Exact message from Supabase when opening magic link in another browser
    expect(
      getFriendlyAuthErrorMessage(
        "invalid request: both auth code and code verifier should be non-empty"
      )
    ).toBe(expected);
    expect(getFriendlyAuthErrorMessage("some error", "invalid_grant")).toBe(
      expected
    );
  });

  it("maps expired/invalid code errors to request-new-link message", () => {
    const expected =
      "El enlace ha caducado o no es válido. Por favor, solicita un nuevo enlace de acceso.";
    expect(getFriendlyAuthErrorMessage("Auth code expired")).toBe(expected);
    expect(getFriendlyAuthErrorMessage("invalid code provided")).toBe(expected);
  });

  it("returns technical message unchanged when no mapping applies", () => {
    const msg = "Network error";
    expect(getFriendlyAuthErrorMessage(msg)).toBe(msg);
  });
});
