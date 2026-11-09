import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRpc = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    rpc: mockRpc,
  })),
}));

describe("loadViewProjectBranding", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns no account branding when RPC fails", async () => {
    mockRpc.mockResolvedValue({ data: null, error: { message: "fail" } });
    const { loadViewProjectBranding } = await import("./view-project-branding");
    await expect(loadViewProjectBranding("tok")).resolves.toEqual({
      accountBranding: false,
    });
  });

  it("strips brand fields when account_branding is false (downgrade)", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          account_branding: false,
          brand_logo_url: "https://cdn.example/ghost.png",
          brand_name: "Should Not Show",
        },
      ],
      error: null,
    });
    const { loadViewProjectBranding } = await import("./view-project-branding");
    await expect(loadViewProjectBranding("tok")).resolves.toEqual({
      accountBranding: false,
    });
  });

  it("returns logo and name when account_branding is true", async () => {
    mockRpc.mockResolvedValue({
      data: [
        {
          account_branding: true,
          brand_logo_url: " https://cdn.example/logo.png ",
          brand_name: " Estudio ",
        },
      ],
      error: null,
    });
    const { loadViewProjectBranding } = await import("./view-project-branding");
    await expect(loadViewProjectBranding("tok")).resolves.toEqual({
      accountBranding: true,
      brandLogoUrl: "https://cdn.example/logo.png",
      brandName: "Estudio",
    });
  });
});
