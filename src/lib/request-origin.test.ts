import { describe, expect, it } from "vitest";
import { getPublicRequestOrigin, toPublicAppUrl } from "./request-origin";

function requestWith(init: {
  url?: string;
  host?: string | null;
  forwardedHost?: string | null;
  forwardedProto?: string | null;
}): Request {
  const headers = new Headers();
  if (init.host != null) headers.set("host", init.host);
  if (init.forwardedHost != null)
    headers.set("x-forwarded-host", init.forwardedHost);
  if (init.forwardedProto != null)
    headers.set("x-forwarded-proto", init.forwardedProto);
  return new Request(init.url ?? "http://0.0.0.0:3000/en/callback", {
    headers,
  });
}

describe("getPublicRequestOrigin", () => {
  it("prefers Host over listen address 0.0.0.0 in request URL", () => {
    expect(
      getPublicRequestOrigin(
        requestWith({
          url: "http://0.0.0.0:3000/en/callback?code=abc",
          host: "localhost:3000",
        })
      )
    ).toBe("http://localhost:3000");
  });

  it("rewrites Host 0.0.0.0 to localhost keeping port", () => {
    expect(
      getPublicRequestOrigin(
        requestWith({
          url: "http://0.0.0.0:3000/en/callback",
          host: "0.0.0.0:3000",
        })
      )
    ).toBe("http://localhost:3000");
  });

  it("uses x-forwarded-host and x-forwarded-proto when present", () => {
    expect(
      getPublicRequestOrigin(
        requestWith({
          url: "http://0.0.0.0:3000/en/callback",
          host: "0.0.0.0:3000",
          forwardedHost: "veta.pro",
          forwardedProto: "https",
        })
      )
    ).toBe("https://veta.pro");
  });

  it("falls back to localhost when only unbound URL is available", () => {
    expect(
      getPublicRequestOrigin(
        requestWith({
          url: "http://0.0.0.0:3000/en/callback",
        })
      )
    ).toBe("http://localhost:3000");
  });

  it("keeps a normal public host unchanged", () => {
    expect(
      getPublicRequestOrigin(
        requestWith({
          url: "https://veta.pro/en/callback",
          host: "veta.pro",
          forwardedProto: "https",
        })
      )
    ).toBe("https://veta.pro");
  });
});

describe("toPublicAppUrl", () => {
  it("rewrites 0.0.0.0 emailRedirectTo to localhost", () => {
    expect(
      toPublicAppUrl(
        "http://0.0.0.0:3000/en/callback?next=%2Fveta-app%2Fdashboard&type=signup"
      )
    ).toBe(
      "http://localhost:3000/en/callback?next=%2Fveta-app%2Fdashboard&type=signup"
    );
  });

  it("leaves localhost callback URLs unchanged", () => {
    const url =
      "http://localhost:3000/en/callback?next=%2Fveta-app%2Fdashboard&type=signup";
    expect(toPublicAppUrl(url)).toBe(url);
  });
});
