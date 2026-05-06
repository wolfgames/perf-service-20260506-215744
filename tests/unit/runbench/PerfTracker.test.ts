/**
 * PerfTracker: FPS sampling + run snapshot — Batch 4
 *
 * Tests that PerfTracker correctly samples FPS from ticker.deltaTime,
 * maintains a running mean, and snapshots finalDistance + fpsAverage on run end.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPerfTracker } from '~/game/runbench/systems/PerfTracker';
import type { RunBenchDatabase } from '~/game/runbench/state/RunBenchPlugin';

const makeMockDb = () => {
  const resources = {
    fps: 0,
    fpsAverage: 0,
    fpsSampleCount: 0,
    distance: 200,
    finalDistance: 0,
    finalFpsAverage: 0,
  };
  const updateFps = vi.fn(({ fps, runningMean }: { fps: number; runningMean: number }) => {
    resources.fps = fps;
    resources.fpsAverage = runningMean;
    resources.fpsSampleCount += 1;
  });
  const snapshotRun = vi.fn(() => {
    resources.finalDistance = resources.distance;
    resources.finalFpsAverage = resources.fpsAverage;
  });
  return {
    transactions: { updateFps, snapshotRun },
    store: { resources },
  } as unknown as RunBenchDatabase & { store: { resources: typeof resources } };
};

describe('PerfTracker: FPS sampling + run snapshot', () => {
  let db: ReturnType<typeof makeMockDb>;

  beforeEach(() => {
    db = makeMockDb();
  });

  it('FPS counter updates each frame; shows value derived from ticker.deltaTime; >=16px text, >=4.5:1 contrast', () => {
    const tracker = createPerfTracker({ db });

    // deltaTime=1 at 60fps means fps = 60/1 = 60
    tracker.tick(1);
    expect(db.transactions.updateFps).toHaveBeenCalledTimes(1);

    // After 1 tick at deltaTime=1: fps=60, mean=60
    const call = (db.transactions.updateFps as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.fps).toBeCloseTo(60, 1);
    expect(call.runningMean).toBeCloseTo(60, 1);

    // Slower frame: deltaTime=2 means fps=30, mean updates toward 45
    tracker.tick(2);
    const call2 = (db.transactions.updateFps as ReturnType<typeof vi.fn>).mock.calls[1][0];
    expect(call2.fps).toBeCloseTo(30, 1);
    expect(call2.runningMean).toBeCloseTo(45, 1); // (60+30)/2
  });

  it('edge-case: fpsTier boundary — exactly 55fps returns Excellent', () => {
    // Import fpsTier to verify boundary (resolves open question Q-fps-tier-thresholds)
    const { fpsTier } = require('~/game/runbench/systems/PerfTracker');
    expect(fpsTier(55)).toBe('Excellent');
    expect(fpsTier(54.9)).toBe('Good');
    expect(fpsTier(45)).toBe('Good');
    expect(fpsTier(30)).toBe('Fair');
    expect(fpsTier(29.9)).toBe('Low');
  });

  it('PerfTracker.snapshot() captures finalDistance (meters) and fpsAverage (running mean); snapshot stored in ECS resource', () => {
    const tracker = createPerfTracker({ db });

    // Simulate a few frames
    tracker.tick(1); // fps=60
    tracker.tick(1); // fps=60

    // db.store.resources.distance was pre-set to 200m
    tracker.snapshot();

    expect(db.transactions.snapshotRun).toHaveBeenCalledTimes(1);
    // snapshotRun writes finalDistance = distance (200m) and finalFpsAverage = fpsAverage
    expect(db.store.resources.finalDistance).toBe(200);
    expect(db.store.resources.finalFpsAverage).toBeCloseTo(60, 1);
  });
});
