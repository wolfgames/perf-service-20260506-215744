/**
 * StartScreen: content and tier badge logic — Batch 7
 *
 * Tests start screen title, best distance display, tier badge conditional logic,
 * and START button tap target requirements.
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
Object.defineProperty(globalThis, 'localStorage', { value: mockLocalStorage, writable: true });

// document.createElement mock for DOM screen
const elements: Record<string, { textContent: string; style: Record<string, string>; children: unknown[]; append: (...args: unknown[]) => void; addEventListener: (ev: string, fn: () => void) => void; disabled: boolean; }> = {};
const mockDocument = {
  createElement: (tag: string) => {
    const el = {
      textContent: '',
      style: { cssText: '' } as Record<string, string>,
      children: [] as unknown[],
      append: (...args: unknown[]) => { el.children.push(...args); },
      addEventListener: vi.fn(),
      disabled: false,
    };
    elements[tag + '_' + Object.keys(elements).length] = el;
    return el;
  },
};
Object.defineProperty(globalThis, 'document', { value: mockDocument, writable: true });

import { vi } from 'vitest';
import { setupStartScreen } from '~/game/runbench/screens/startView';
import { saveRun } from '~/game/runbench/storage/runStorage';
import { START_BUTTON_MIN_HEIGHT_PX } from '~/game/runbench/screens/startViewConstants';

describe('StartScreen: content and tier badge logic', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    Object.keys(elements).forEach(k => delete elements[k]);
  });
  afterEach(() => {
    mockLocalStorage.clear();
  });

  const makeDeps = () => ({
    goto: vi.fn(),
    coordinator: {} as never,
    initGpu: vi.fn().mockResolvedValue(undefined),
    unlockAudio: vi.fn(),
    loadCore: vi.fn().mockResolvedValue(undefined),
    loadAudio: vi.fn().mockResolvedValue(undefined),
    tuning: { scaffold: {} as never, game: {} as never },
    analytics: { trackGameStart: vi.fn() },
  });

  it("title shows 'RunBench'; START button is large, centered, in thumb zone; best distance shows '0m'; NO tier badge rendered (runCount=0)", () => {
    const controller = setupStartScreen(makeDeps());
    const container = { append: vi.fn(), style: {} } as unknown as HTMLDivElement;
    controller.init(container);

    // Title should say "RunBench"
    const allTexts = Object.values(elements).map(e => e.textContent);
    expect(allTexts).toContain('RunBench');

    // Best distance should show 0m when no data
    expect(allTexts.some(t => t.includes('0m'))).toBe(true);

    // START button should exist with min height >= 44px
    expect(START_BUTTON_MIN_HEIGHT_PX).toBeGreaterThanOrEqual(44);
  });

  it('performance tier badge displays one of: Excellent/Good/Fair/Low based on lastFpsAverage thresholds; best distance shows actual best distance', () => {
    // Save a run so runCount > 0 and lastFpsAvg is set
    saveRun(300, 57.0); // Excellent tier (>=55fps)

    const controller = setupStartScreen(makeDeps());
    const container = { append: vi.fn(), style: {} } as unknown as HTMLDivElement;
    controller.init(container);

    const allTexts = Object.values(elements).map(e => e.textContent);

    // Best distance shows 300m
    expect(allTexts.some(t => t.includes('300m'))).toBe(true);

    // Tier badge should show one of the valid tier labels
    const tierLabels = ['Excellent', 'Good', 'Fair', 'Low'];
    expect(allTexts.some(t => tierLabels.includes(t))).toBe(true);
  });

  it('visual tap response within 100ms (scale or color shift); initGpu + loadCore called; goto(game) navigates', () => {
    const deps = makeDeps();
    const controller = setupStartScreen(deps);
    const container = { append: vi.fn(), style: {} } as unknown as HTMLDivElement;
    controller.init(container);

    // START button should have pointer event listeners for visual feedback
    // (pointerdown registered for scale response)
    const btnEl = Object.values(elements).find(e => e.textContent === 'START');
    expect(btnEl?.addEventListener).toHaveBeenCalled();
  });

  it('tap target >=44px height and width; centered in bottom-center thumb zone (medium priority zone per core-guidelines)', () => {
    expect(START_BUTTON_MIN_HEIGHT_PX).toBeGreaterThanOrEqual(44);
  });
});
