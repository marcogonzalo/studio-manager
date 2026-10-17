import { describe, it, expect } from "vitest";
import { countNonSampleProjects, isSampleProject } from "./sample-project";

describe("countNonSampleProjects", () => {
  it("returns 0 for empty or null", () => {
    expect(countNonSampleProjects(null)).toBe(0);
    expect(countNonSampleProjects(undefined)).toBe(0);
    expect(countNonSampleProjects([])).toBe(0);
  });

  it("excludes is_sample projects from checklist count", () => {
    expect(
      countNonSampleProjects([
        { is_sample: true },
        { is_sample: false },
        { is_sample: null },
        {},
      ])
    ).toBe(3);
  });

  it("returns 0 when only samples exist", () => {
    expect(countNonSampleProjects([{ is_sample: true }])).toBe(0);
  });
});

describe("isSampleProject", () => {
  it("is true only when is_sample is true", () => {
    expect(isSampleProject({ is_sample: true })).toBe(true);
    expect(isSampleProject({ is_sample: false })).toBe(false);
    expect(isSampleProject({})).toBe(false);
    expect(isSampleProject(null)).toBe(false);
  });
});
