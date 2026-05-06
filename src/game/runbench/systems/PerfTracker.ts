/**
 * PerfTracker — FPS sampling and run snapshot.
 *
 * Samples FPS each frame via Pixi ticker.deltaTime (fps = 60 / deltaTime).
 * Maintains a running mean. On run end, snapshot() writes finalDistance and
 * finalFpsAverage to the ECS database.
 *
 * Tier thresholds (resolved question Q-fps-tier-thresholds):
 *   Excellent >= 55 fps
 *   Good      >= 45 fps
 *   Fair      >= 30 fps
 *   Low        < 30 fps
 */

import type { RunBenchDatabase } from '../state/RunBenchPlugin';

// ── FPS tier thresholds (resolved: Excellent>=55, Good>=45, Fair>=30, Low<30) ──

export const FPS_TIER_EXCELLENT = 55;
export const FPS_TIER_GOOD = 45;
export const FPS_TIER_FAIR = 30;

export type FpsTierLabel = 'Excellent' | 'Good' | 'Fair' | 'Low';

/** Derive a performance tier label from an FPS average. */
export const fpsTier = (avg: number): FpsTierLabel => {
  if (avg >= FPS_TIER_EXCELLENT) return 'Excellent';
  if (avg >= FPS_TIER_GOOD) return 'Good';
  if (avg >= FPS_TIER_FAIR) return 'Fair';
  return 'Low';
};

// ── PerfTracker class ────────────────────────────────────────────────────────

export interface PerfTrackerOptions {
  db: RunBenchDatabase;
}

export const createPerfTracker = ({ db }: PerfTrackerOptions) => {
  let sampleCount = 0;
  let runningMean = 0;

  /**
   * Call every frame with ticker.deltaTime (Pixi units where 1 = 16.67ms at 60fps).
   * fps = 60 / deltaTime
   */
  const tick = (deltaTime: number): void => {
    const fps = deltaTime > 0 ? 60 / deltaTime : 60;
    sampleCount += 1;
    // Welford online mean
    runningMean += (fps - runningMean) / sampleCount;
    db.transactions.updateFps({ fps, runningMean });
  };

  /** Write final snapshot to ECS resources. Call when runner dies. */
  const snapshot = (): void => {
    db.transactions.snapshotRun();
  };

  /** Reset for a new run. */
  const reset = (): void => {
    sampleCount = 0;
    runningMean = 0;
  };

  return { tick, snapshot, reset };
};
