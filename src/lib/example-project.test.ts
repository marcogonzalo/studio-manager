import { describe, expect, it } from "vitest";
import {
  countsTowardFreeProjectLimit,
  projectsVisibleToAuthenticatedUser,
  visibleProjectsOrFilter,
} from "./example-project";

const DEMO_USER_ID = "11111111-1111-4111-8111-111111111111";
const EXAMPLE_OWNER_ID = "e1e10000-0000-4000-8000-000000000001";

const exampleProject = {
  id: "e1e10000-0000-4000-8000-000000000010",
  name: "Reforma integral de vivienda",
  user_id: EXAMPLE_OWNER_ID,
  is_example: true,
  status: "active" as const,
};

describe("shared example project", () => {
  it("new demo user sees the example project", () => {
    const visible = projectsVisibleToAuthenticatedUser(
      [exampleProject],
      DEMO_USER_ID
    );

    expect(visible).toEqual([exampleProject]);
    expect(visible.filter(countsTowardFreeProjectLimit)).toEqual([]);
    expect(visibleProjectsOrFilter(DEMO_USER_ID)).toBe(
      `user_id.eq.${DEMO_USER_ID},is_example.eq.true`
    );
  });

  it("counts the user's own active project and still shows the example", () => {
    const ownProject = {
      id: "own-project",
      user_id: DEMO_USER_ID,
      is_example: false,
      status: "active" as const,
    };
    const visible = projectsVisibleToAuthenticatedUser(
      [exampleProject, ownProject],
      DEMO_USER_ID
    );

    expect(visible.map((project) => project.id)).toEqual([
      exampleProject.id,
      ownProject.id,
    ]);
    expect(visible.filter(countsTowardFreeProjectLimit)).toEqual([ownProject]);
  });

  it("hides another user's private project", () => {
    const privateProject = {
      id: "private",
      user_id: "22222222-2222-4222-8222-222222222222",
      is_example: false,
      status: "active" as const,
    };

    expect(
      projectsVisibleToAuthenticatedUser(
        [privateProject, exampleProject],
        DEMO_USER_ID
      )
    ).toEqual([exampleProject]);
  });

  it("does not interpolate a non-uuid into the project filter", () => {
    expect(visibleProjectsOrFilter("not-a-uuid")).toBe("is_example.eq.true");
  });
});
