import { describe, expect, it } from "vitest";
import {
  formatUploadFileError,
  humanizeUploadError,
} from "@/lib/upload-user-error";

describe("humanizeUploadError", () => {
  it("maps token/tome errors to transient copy", () => {
    expect(humanizeUploadError("no tomes available", "en")).toMatch(
      /try again/i
    );
    expect(humanizeUploadError("no tokens available", "en")).toMatch(
      /try again/i
    );
  });

  it("maps incident-id noise to transient copy", () => {
    const msg = humanizeUploadError(
      "incident id d0d1c7b2fc9a-aedb31f3745631bc",
      "en"
    );
    expect(msg.toLowerCase()).not.toContain("incident");
    expect(msg.toLowerCase()).not.toContain("d0d1c7b2");
    expect(msg).toMatch(/temporarily unavailable/i);
  });

  it("maps B2 incident responses via messageFromStorageProviderFailure", async () => {
    const { messageFromStorageProviderFailure, STORAGE_TRANSIENT_ERROR } =
      await import("@/lib/upload-user-error");
    expect(
      messageFromStorageProviderFailure(
        500,
        "incident id 3feeab915bbb-e5774c8667a475e2",
        "fallback"
      )
    ).toBe(STORAGE_TRANSIENT_ERROR);
  });

  it("keeps clear service-unavailable wording", () => {
    expect(
      humanizeUploadError(
        "Service temporarily unavailable, please try again.",
        "en"
      )
    ).toMatch(/try again/i);
  });
});

describe("formatUploadFileError", () => {
  it("puts message before filename", () => {
    expect(formatUploadFileError("Cannot exceed 5MB", "photo.png", "en")).toBe(
      "Cannot exceed 5MB — photo.png"
    );
  });

  it("reorders filename-first size messages", () => {
    expect(
      formatUploadFileError("huge.png cannot exceed 5MB", "huge.png", "en")
    ).toBe("Cannot exceed 5MB — huge.png");
  });
});
