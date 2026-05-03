import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getOrCreateProjectShareLink,
  regenerateProjectShareToken,
  setProjectShareEnabled,
} from "./project-share-actions";

const mockFrom = vi.fn();
const mockSupabase = {
  from: mockFrom,
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabase)),
}));

const projectId = "project-123";
const existingProject = {
  token: "abc".repeat(16),
  is_public_enabled: true,
};

describe("project-share", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getOrCreateProjectShareLink", () => {
    it("returns token and state when project already has token", async () => {
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi
          .fn()
          .mockResolvedValue({ data: existingProject, error: null }),
      };
      mockFrom.mockReturnValue(selectChain);

      const result = await getOrCreateProjectShareLink(projectId);

      expect(result.error).toBeNull();
      expect(result.data).toEqual({
        token: existingProject.token,
        is_enabled: true,
      });
      expect(mockFrom).toHaveBeenCalledWith("projects");
    });

    it("generates token and updates project when token is null", async () => {
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { token: null, is_public_enabled: false },
          error: null,
        }),
      };
      const updated = { token: "new-token-hex", is_public_enabled: false };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      };
      mockFrom
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(updateChain);

      const result = await getOrCreateProjectShareLink(projectId);

      expect(result.error).toBeNull();
      expect(result.data?.token).toBe("new-token-hex");
      expect(mockFrom).toHaveBeenCalledTimes(2);
    });

    it("returns error when project not found", async () => {
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Project not found" },
        }),
      };
      mockFrom.mockReturnValue(selectChain);

      const result = await getOrCreateProjectShareLink(projectId);

      expect(result.data).toBeNull();
      expect(result.error).toBe("Project not found");
    });

    it("returns error when update fails after null token", async () => {
      const selectChain = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { token: null, is_public_enabled: false },
          error: null,
        }),
      };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Permission denied" },
        }),
      };
      mockFrom
        .mockReturnValueOnce(selectChain)
        .mockReturnValueOnce(updateChain);

      const result = await getOrCreateProjectShareLink(projectId);

      expect(result.data).toBeNull();
      expect(result.error).toBe("Permission denied");
    });
  });

  describe("regenerateProjectShareToken", () => {
    it("updates token and returns new state", async () => {
      const updated = {
        token: "new-regenerated-token",
        is_public_enabled: true,
      };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      };
      mockFrom.mockReturnValue(updateChain);

      const result = await regenerateProjectShareToken(projectId);

      expect(result.error).toBeNull();
      expect(result.data?.token).toBe("new-regenerated-token");
    });

    it("returns error when update fails", async () => {
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: null,
          error: { message: "Row not found" },
        }),
      };
      mockFrom.mockReturnValue(updateChain);

      const result = await regenerateProjectShareToken(projectId);

      expect(result.data).toBeNull();
      expect(result.error).toBe("Row not found");
    });
  });

  describe("setProjectShareEnabled", () => {
    it("sets is_public_enabled to true and returns state", async () => {
      const updated = { token: existingProject.token, is_public_enabled: true };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      };
      mockFrom.mockReturnValue(updateChain);

      const result = await setProjectShareEnabled(projectId, true);

      expect(result.error).toBeNull();
      expect(result.data?.is_enabled).toBe(true);
    });

    it("sets is_public_enabled to false", async () => {
      const updated = {
        token: existingProject.token,
        is_public_enabled: false,
      };
      const updateChain = {
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({ data: updated, error: null }),
      };
      mockFrom.mockReturnValue(updateChain);

      const result = await setProjectShareEnabled(projectId, false);

      expect(result.error).toBeNull();
      expect(result.data?.is_enabled).toBe(false);
    });
  });
});
