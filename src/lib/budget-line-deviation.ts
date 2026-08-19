export function isDeviationCalculable(
  estimated: number,
  actual: number
): boolean {
  return Number(estimated) > 0 && Number(actual) > 0;
}
