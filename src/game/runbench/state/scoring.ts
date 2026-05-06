/**
 * Scoring helpers for RunBench.
 *
 * Distance: scrolled pixels / 240 (baseline scroll speed) = meters.
 * Score: accumulates as integral of scroll speed over distance — higher distance
 * means higher speed, yielding a super-linear (>=10x) spread between 100m and 1000m.
 *
 * Scroll speed formula: 240 + 10 * (distance / 100) px/s (from RunBenchPlugin.ts)
 * Score at d meters = integral from 0 to d of speed(t) dt
 *                   = 240d + 10*(d^2)/(2*100) = 240d + 0.05*d^2
 */

/** Baseline scroll speed (px/s) used for distance conversion. */
export const BASELINE_SCROLL_SPEED = 240;

/**
 * Convert scrolled pixels to meters traveled.
 * Uses baseline speed 240 px/s = 1 m/s (1 meter = 240 scroll-pixels).
 */
export const metersFromScrollPixels = (pixels: number): number =>
  pixels / BASELINE_SCROLL_SPEED;

/**
 * Compute score at a given distance in meters.
 * Integral of scroll speed from 0 to d:
 *   speed(d) = 240 + 10 * d / 100 = 240 + 0.1 * d
 *   score(d) = 240*d + 0.05*d^2
 *
 * At d=100:  24000 + 500   = 24500
 * At d=1000: 240000 + 50000 = 290000
 * Ratio: 290000 / 24500 ≈ 11.8x  (satisfies >=10x spread requirement)
 */
export const scoreAtDistance = (distanceM: number): number =>
  240 * distanceM + 0.05 * distanceM * distanceM;
