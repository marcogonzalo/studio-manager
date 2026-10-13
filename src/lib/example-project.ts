const USER_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ExampleProjectVisibilityRow {
  user_id?: string | null;
  is_example?: boolean | null;
  status?: string | null;
}

/** Own projects plus the shared read-only example. */
export function projectsVisibleToAuthenticatedUser<
  T extends ExampleProjectVisibilityRow,
>(rows: T[], userId: string): T[] {
  return rows.filter(
    (row) => row.is_example === true || row.user_id === userId
  );
}

/**
 * PostgREST `or` filter so list/dashboard queries keep the shared example
 * even when they also scope to the signed-in user.
 * Invalid ids match nothing owned, and still match the example.
 */
export function visibleProjectsOrFilter(userId: string): string {
  if (!USER_ID_PATTERN.test(userId)) {
    return "is_example.eq.true";
  }
  return `user_id.eq.${userId},is_example.eq.true`;
}

/** Active projects that consume the free-plan slot. The example never does. */
export function countsTowardFreeProjectLimit(
  project: ExampleProjectVisibilityRow
): boolean {
  return project.status === "active" && project.is_example !== true;
}
