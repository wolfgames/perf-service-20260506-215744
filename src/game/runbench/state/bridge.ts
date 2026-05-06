/**
 * bridgeEcsToSignals — wires ECS resource changes to SolidJS signals.
 *
 * Called once after ECS DB is created. Returns a cleanup function that
 * must be called before ECS DB is destroyed (in destroy order, after Pixi).
 *
 * RunBench is simple: the results screen reads directly from runStorage
 * (localStorage), not from ECS signals. So this bridge is a lightweight
 * placeholder that satisfies the lifecycle contract without heavy wiring.
 */

import type { RunBenchDatabase } from './RunBenchPlugin';

/** Wire ECS resources to SolidJS signals. Returns cleanup fn. */
export const bridgeEcsToSignals = (_db: RunBenchDatabase): (() => void) => {
  // RunBench reads from runStorage at results screen mount —
  // ECS resources (distance, fpsAverage) are snapshotted into localStorage
  // by runStorage.saveRun() during the death sequence.
  // No observe subscriptions needed for the core pass.
  return () => {
    // cleanup: no subscriptions to tear down
  };
};
