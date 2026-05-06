/**
 * runStorage: read/write localStorage — Batch 5
 *
 * Tests that runStorage correctly reads/writes localStorage keys,
 * returns defaults on first run, and updates best distance correctly.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';

// We need a real localStorage for runStorage. Set up a simple mock.
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

describe('runStorage: read/write localStorage', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('edge-case: saveRun does NOT update bestDistance when new distance is lower than current best', () => {
    // Save a good run first
    saveRun(500, 60);
    expect(loadBestDistance()).toBe(500);

    // Save a worse run — best should stay at 500
    saveRun(200, 55);
    expect(loadBestDistance()).toBe(500);

    // Run count still increments
    expect(loadRunCount()).toBe(2);
  });

  it("localStorage keys 'runbench-best-distance', 'runbench-last-fps-avg', 'runbench-run-count' read correctly; first run shows best=0", () => {
    // On first run (no data), all should return zero
    expect(loadBestDistance()).toBe(0);
    expect(loadLastFpsAvg()).toBe(0);
    expect(loadRunCount()).toBe(0);

    // After saving a run
    saveRun(150, 58.5);

    expect(loadBestDistance()).toBe(150);
    expect(loadLastFpsAvg()).toBe(59); // Math.round(58.5)
    expect(loadRunCount()).toBe(1);
  });
});
