/** Catalog product currency when created or updated from a project budget item. */
export function catalogProductCurrencyFromProject(
  projectCurrency?: string | null,
  fallback = "EUR"
): string {
  const code = projectCurrency?.trim();
  return code || fallback;
}
