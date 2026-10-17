/**
 * Helpers for signup sample projects (#233).
 */

export function countNonSampleProjects(
  projects: Array<{ is_sample?: boolean | null }> | null | undefined
): number {
  if (!projects?.length) return 0;
  return projects.filter((p) => !p.is_sample).length;
}

export function isSampleProject(
  project: { is_sample?: boolean | null } | null | undefined
): boolean {
  return project?.is_sample === true;
}
