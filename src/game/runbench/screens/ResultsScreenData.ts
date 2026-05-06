/**
 * ResultsScreenData — pure data helpers for the RunBench results screen.
 *
 * Reads completed-run data from localStorage via runStorage.
 * No Pixi or ECS imports — safe to use in DOM screen components.
 */

import { loadBestDistance, loadLastDistance, loadLastFpsAvg, loadRunCount } from '../storage/runStorage';

/** Minimum tap target size in pixels (mobile accessibility floor = 44px). */
export const RETRY_BUTTON_MIN_PX = 44;
export const HOME_BUTTON_MIN_PX = 44;

/** Minimum spacing in pixels between RETRY and HOME buttons. */
export const BUTTON_SPACING_PX = 8;

export interface ResultsData {
  lastDistance: number;   // meters (integer, distance reached this run)
  bestDistance: number;   // meters (integer, best all-time)
  lastFpsAvg: number;     // fps average from most recent run (rounded)
  runCount: number;       // total runs completed
}

/**
 * Read results data for display from localStorage.
 * Safe to call at component mount time (DOM lifecycle).
 */
export const getResultsScreenData = (): ResultsData => ({
  lastDistance: loadLastDistance(),
  bestDistance: loadBestDistance(),
  lastFpsAvg: loadLastFpsAvg(),
  runCount: loadRunCount(),
});
