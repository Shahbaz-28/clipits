/**
 * Optional test-only payout scaling. Remove or set VIEWS_TEST_MODE=false before production launch.
 *
 * When enabled, if gained views are between threshold and 999, we use 1000 for the earnings formula
 * so (rate_per_1k / 1000) * 1000 ≈ one full "per 1k" unit — enough to exercise wallet/UI without waiting for 1k real views.
 */
export function effectiveViewsGainedForPayout(viewsGained: number): number {
  const test =
    process.env.VIEWS_TEST_MODE === "true" ||
    process.env.VIEWS_TEST_MODE === "1"
  const threshold = Number(process.env.VIEWS_TEST_MIN_VIEWS ?? "10")
  if (!test || viewsGained < threshold) return viewsGained
  if (viewsGained < 1000) return 1000
  return viewsGained
}
