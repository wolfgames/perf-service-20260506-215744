/**
 * runStorage — localStorage read/write helpers for RunBench run data.
 *
 * Keys:
 *   runbench-best-distance  — best distance in meters (integer)
 *   runbench-last-fps-avg   — FPS average of most recent run
 *   runbench-run-count      — total number of completed runs
 *   runbench-device-id      — random 32-bit device identifier (persisted on first visit)
 *
 * Reads/writes only happen in DOM lifecycle (screen shells, not ECS actions).
 * Pure helpers — no Pixi or ECS imports.
 */

const KEY_BEST_DISTANCE = 'runbench-best-distance';
const KEY_LAST_DISTANCE = 'runbench-last-distance';
const KEY_LAST_FPS_AVG = 'runbench-last-fps-avg';
const KEY_RUN_COUNT = 'runbench-run-count';
const KEY_DEVICE_ID = 'runbench-device-id';

const readNumber = (key: string, fallback: number): number => {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  } catch {
    return fallback;
  }
};

const writeNumber = (key: string, value: number): void => {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // localStorage unavailable — silently ignore
  }
};

export const loadBestDistance = (): number => readNumber(KEY_BEST_DISTANCE, 0);

export const loadLastDistance = (): number => readNumber(KEY_LAST_DISTANCE, 0);

export const loadLastFpsAvg = (): number => readNumber(KEY_LAST_FPS_AVG, 0);

export const loadRunCount = (): number => readNumber(KEY_RUN_COUNT, 0);

/** Persist a completed run. Updates best distance if improved; always records last run distance. */
export const saveRun = (distance: number, fpsAverage: number): void => {
  const prev = loadBestDistance();
  if (distance > prev) writeNumber(KEY_BEST_DISTANCE, Math.floor(distance));
  writeNumber(KEY_LAST_DISTANCE, Math.floor(distance));
  writeNumber(KEY_LAST_FPS_AVG, Math.round(fpsAverage));
  writeNumber(KEY_RUN_COUNT, loadRunCount() + 1);
};

/**
 * Returns (or creates) a stable 32-bit device identifier.
 * Used as deviceId_hash in the run seed formula: runNumber * 48271 + deviceId_hash.
 */
export const loadDeviceId = (): number => {
  const existing = readNumber(KEY_DEVICE_ID, -1);
  if (existing !== -1) return existing;
  // Generate random 32-bit int on first visit
  const id = Math.floor(Math.random() * 0xffffffff);
  writeNumber(KEY_DEVICE_ID, id);
  return id;
};
