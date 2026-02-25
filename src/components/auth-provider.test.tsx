import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./auth-provider";
import { createMockUser, createMockSession } from "@/test/mocks/supabase";
import type { Session } from "@supabase/supabase-js";

// Mock the supabase module using hoisted mocks
const mockGetSession = vi.hoisted(() => vi.fn());
const mockOnAuthStateChange = vi.hoisted(() => vi.fn());
const mockSignOut = vi.hoisted(() => vi.fn());

const mockRpc = vi.hoisted(() =>
  vi.fn().mockResolvedValue({
    data: [{ plan_code: "BASE", config: {} }],
    error: null,
  })
);

const mockFrom = vi.hoisted(() =>
  vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      eq: vi.fn().mockReturnValue({
        single: vi
          .fn()
          .mockResolvedValue({ data: { full_name: null }, error: null }),
      }),
    }),
  })
);

vi.mock("@/lib/supabase", () => {
  const auth = {
    getSession: mockGetSession,
    onAuthStateChange: mockOnAuthStateChange,
    signOut: mockSignOut,
  };
  return {
    supabase: { auth, rpc: mockRpc, from: mockFrom },
    getSupabaseClient: () => ({ auth, rpc: mockRpc, from: mockFrom }),
  };
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

// Test component that uses the auth context
const TestComponent = () => {
  const { user, session, loading, signOut, profileFullName, effectivePlan } =
    useAuth();
  return (
    <div>
      <div data-testid="loading">{loading ? "loading" : "not-loading"}</div>
      <div data-testid="user-email">{user?.email || "no-user"}</div>
      <div data-testid="session">{session ? "has-session" : "no-session"}</div>
      <div data-testid="profile-full-name">
        {profileFullName ?? "no-profile-name"}
      </div>
      <div data-testid="effective-plan">
        {effectivePlan?.plan_code ?? "no-plan"}
      </div>
      <button onClick={signOut} data-testid="sign-out-button">
        Sign Out
      </button>
    </div>
  );
};

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetSession.mockResolvedValue({
      data: { session: null },
      error: null,
    });
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe: vi.fn(),
        },
      },
    });
    mockSignOut.mockResolvedValue({ error: null });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should provide loading state initially", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("loading");
  });

  it("should initialize with no session", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    expect(screen.getByTestId("user-email")).toHaveTextContent("no-user");
    expect(screen.getByTestId("session")).toHaveTextContent("no-session");
    expect(mockGetSession).toHaveBeenCalled();
  });

  it("should initialize with existing session", async () => {
    const mockUser = createMockUser({ email: "user@example.com" });
    const mockSession = createMockSession(mockUser);

    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    expect(screen.getByTestId("user-email")).toHaveTextContent(
      "user@example.com"
    );
    expect(screen.getByTestId("session")).toHaveTextContent("has-session");
  });

  it("should handle sign out", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    const signOutButton = screen.getByTestId("sign-out-button");
    signOutButton.click();

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalledTimes(1);
    });
  });

  it("should set up auth state change listener", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    const callback = mockOnAuthStateChange.mock.calls[0][0];
    expect(typeof callback).toBe("function");
  });

  it("should update state when auth changes", async () => {
    let authStateChangeCallback:
      | ((event: string, session: Session | null) => void)
      | null = null;

    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authStateChangeCallback).toBeTruthy();
    });

    const mockUser = createMockUser({ email: "newuser@example.com" });
    const mockSession = createMockSession(mockUser);

    if (authStateChangeCallback) {
      (
        authStateChangeCallback as (
          event: string,
          session: Session | null
        ) => void
      )("SIGNED_IN", mockSession);
    }

    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "newuser@example.com"
      );
      expect(screen.getByTestId("session")).toHaveTextContent("has-session");
    });
  });

  it("should clean up subscription on unmount", async () => {
    const unsubscribe = vi.fn();
    mockOnAuthStateChange.mockReturnValue({
      data: {
        subscription: {
          unsubscribe,
        },
      },
    });

    const { unmount } = render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled();
    });

    unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });

  it("should handle URL hash cleanup on SIGNED_IN event", async () => {
    const replaceStateSpy = vi.spyOn(window.history, "replaceState");
    const originalHash = window.location.hash;
    window.location.hash = "#access_token=test";

    let authStateChangeCallback:
      | ((event: string, session: Session | null) => void)
      | null = null;

    mockOnAuthStateChange.mockImplementation((callback) => {
      authStateChangeCallback = callback;
      return {
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authStateChangeCallback).toBeTruthy();
    });

    const mockUser = createMockUser();
    const mockSession = createMockSession(mockUser);

    if (authStateChangeCallback) {
      (
        authStateChangeCallback as (
          event: string,
          session: Session | null
        ) => void
      )("SIGNED_IN", mockSession);
    }

    await waitFor(() => {
      expect(replaceStateSpy).toHaveBeenCalled();
    });

    replaceStateSpy.mockRestore();
    window.location.hash = originalHash;
  });

  it("should set profileFullName from profiles when user is signed in", async () => {
    const mockUser = createMockUser({ email: "u@test.com" });
    const mockSession = createMockSession(mockUser);
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { full_name: "María García" },
            error: null,
          }),
        }),
      }),
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    await waitFor(() => {
      expect(screen.getByTestId("profile-full-name")).toHaveTextContent(
        "María García"
      );
    });
  });

  it("should set effectivePlan from get_effective_plan rpc when user is signed in", async () => {
    const mockUser = createMockUser({ email: "u@test.com" });
    const mockSession = createMockSession(mockUser);
    mockGetSession.mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });
    mockRpc.mockResolvedValue({
      data: [{ plan_code: "PRO", config: { pdf_export_mode: "full" } }],
      error: null,
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("not-loading");
    });

    await waitFor(() => {
      expect(screen.getByTestId("effective-plan")).toHaveTextContent("PRO");
    });
  });
});
