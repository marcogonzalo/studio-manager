/**
 * Resolves display name for the current user: profile full_name (first word),
 * then user_metadata.full_name, then email local part, then "Usuario".
 */
export function getDisplayName(
  user: { user_metadata?: { full_name?: string }; email?: string } | null,
  profileFullName: string | null
): string {
  const fullName =
    (profileFullName?.trim() || user?.user_metadata?.full_name?.trim()) ?? "";
  const first = fullName.split(/\s+/)[0];
  if (first) return first;
  const beforeAt = (user?.email ?? "").trim().split("@")[0];
  if (beforeAt) return beforeAt;
  return "Usuario";
}
