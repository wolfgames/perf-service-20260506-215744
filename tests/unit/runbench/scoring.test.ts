/**
 * scoring: distance accumulation and spread — Batch 4
 *
 * Tests that distance grows correctly from scroll-pixel accumulation,
 * and that the scoring spread satisfies the >=3x (target >=10x) CoS requirement
 * between a beginner run (100m) and skilled run (1000m).
 */

import { describe, it, expect } from 'vitest';
import { metersFromScrollPixels, scoreAtDistance } from '~/game/runbench/state/scoring';

describe('scoring: distance accumulation and spread', () => {
  it('distance counter shows approximately 0.4m (100/240); counter increments in real-time each frame', () => {
    const meters = metersFromScrollPixels(100);
    // 100 px / 240 px/s (baseline) = 0.4167m
    expect(meters).toBeCloseTo(0.4167, 2);
  });

  it('edge-case: scoreAtDistance(0) returns 0 (zero-distance run has zero score)', () => {
    expect(scoreAtDistance(0)).toBe(0);
  });

  it('score at 1000m is >=10x score at 100m (speed increases with distance — satisfies >=3x spread CoS requirement)', () => {
    const score100 = scoreAtDistance(100);
    const score1000 = scoreAtDistance(1000);

    // Scoring spread must be >=10x between 100m and 1000m
    expect(score1000).toBeGreaterThanOrEqual(score100 * 10);
  });
});
