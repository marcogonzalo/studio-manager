import { describe, it, expect, vi, beforeEach } from "vitest";
import { getAccountLocale } from "./account-locale";
import { createClient } from "@/lib/supabase/server";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

const mockCreateClient = vi.mocked(createClient);

function mockClient(opts: {
  user: { id: string } | null;
  lang?: string | null;
}) {
  const maybeSingle = vi.fn().mockResolvedValue({
    data: opts.lang === undefined ? null : { lang: opts.lang },
    error: null,
  });
  const eq = vi.fn().mockReturnValue({ maybeSingle });
  const select = vi.fn().mockReturnValue({ eq });
  const from = vi.fn().mockReturnValue({ select });
  mockCreateClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: opts.user },
      }),
    },
    from,
  } as never);
  return { from, eq, select };
}

describe("getAccountLocale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns default locale when there is no user", async () => {
    mockClient({ user: null });
    await expect(getAccountLocale()).resolves.toBe("es");
  });

  it("returns account lang when it is a supported locale", async () => {
    const { from, eq } = mockClient({
      user: { id: "user-1" },
      lang: "en",
    });
    await expect(getAccountLocale()).resolves.toBe("en");
    expect(from).toHaveBeenCalledWith("account_settings");
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("returns default locale when settings lang is missing or invalid", async () => {
    mockClient({ user: { id: "user-1" }, lang: "fr" });
    await expect(getAccountLocale()).resolves.toBe("es");

    mockClient({ user: { id: "user-1" } });
    await expect(getAccountLocale()).resolves.toBe("es");
  });
});
