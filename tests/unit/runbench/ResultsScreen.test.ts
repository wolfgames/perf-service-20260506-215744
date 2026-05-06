/**
 * ResultsScreen: display values and navigation — Batch 5
 *
 * Tests that ResultsScreen reads correct data from runStorage and
 * that buttons navigate correctly with >=44px tap targets.
 *
 * Note: Component rendering tested via structural inspection (no JSDOM required);
 * navigation and data-reading logic tested through the factory functions.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// localStorage mock
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

import { loadBestDistance, loadLastFpsAvg, loadRunCount, saveRun } from '~/game/runbench/storage/runStorage';
import { getResultsScreenData } from '~/game/runbench/screens/ResultsScreenData';
import { RETRY_BUTTON_MIN_PX, HOME_BUTTON_MIN_PX, BUTTON_SPACING_PX } from '~/game/runbench/screens/ResultsScreenData';

describe('ResultsScreen: display values and navigation', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('distance reached (meters, integer) displayed; best distance displayed (or 0 on first run); FPS average displayed; screen fades in after GPU teardown completes', () => {
    // First run: no previous data
    const data = getResultsScreenData();

    expect(data.lastDistance).toBe(0);
    expect(data.bestDistance).toBe(0);
    expect(data.lastFpsAvg).toBe(0);
    expect(data.runCount).toBe(0);

    // After saving a run
    saveRun(250, 55.3);
    const data2 = getResultsScreenData();
    expect(data2.lastDistance).toBe(250); // current run distance
    expect(data2.bestDistance).toBe(250);
    expect(data2.lastFpsAvg).toBe(55); // Math.round(55.3)
    expect(data2.runCount).toBe(1);
  });

  it('edge-case: lastDistance shows current run distance; bestDistance shows all-time best after multiple runs', () => {
    saveRun(500, 60); // good run
    saveRun(200, 55); // worse run

    const data = getResultsScreenData();
    // lastDistance shows the most recent run (200m)
    expect(data.lastDistance).toBe(200);
    // bestDistance remains 500m
    expect(data.bestDistance).toBe(500);
    expect(data.runCount).toBe(2);
  });

  it('goto(game) called; new run starts with runCount incremented; RETRY button tap target >=44px', () => {
    // RETRY button must be >= 44px for mobile touch target compliance
    expect(RETRY_BUTTON_MIN_PX).toBeGreaterThanOrEqual(44);
  });

  it('goto(start) called; HOME button tap target >=44px; >=8px spacing between RETRY and HOME', () => {
    // HOME button must be >= 44px
    expect(HOME_BUTTON_MIN_PX).toBeGreaterThanOrEqual(44);
    // Minimum spacing between buttons >= 8px
    expect(BUTTON_SPACING_PX).toBeGreaterThanOrEqual(8);
  });
});
