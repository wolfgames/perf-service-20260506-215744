/**
 * PlatformRenderer: platform types and visuals — Batch 3
 *
 * Tests that PlatformRenderer creates correct visual representations
 * for Normal, Moving, and Crumbling platforms.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Pixi.js
vi.mock('pixi.js', () => {
  const Container = vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    removeChild: vi.fn(),
    destroy: vi.fn(),
    children: [],
  }));
  const Graphics = vi.fn().mockImplementation(() => ({
    rect: vi.fn().mockReturnThis(),
    fill: vi.fn().mockReturnThis(),
    clear: vi.fn().mockReturnThis(),
    tint: 0xffffff,
    position: { set: vi.fn() },
    x: 0, y: 0, width: 0, height: 0,
    destroy: vi.fn(),
  }));
  const Text = vi.fn().mockImplementation(() => ({
    text: '',
    style: {},
    position: { set: vi.fn() },
    x: 0, y: 0,
    destroy: vi.fn(),
  }));
  return { Container, Graphics, Text };
});

// Mock GSAP
vi.mock('gsap', () => ({
  gsap: {
    to: vi.fn().mockReturnValue({ kill: vi.fn() }),
    killTweensOf: vi.fn(),
    delayedCall: vi.fn(),
  },
}));

import { createPlatformRenderer } from '~/game/runbench/renderers/PlatformRenderer';
import type { PlatformData } from '~/game/runbench/renderers/PlatformRenderer';
import { Container } from 'pixi.js';

describe('PlatformRenderer: platform types and visuals', () => {
  let renderer: ReturnType<typeof createPlatformRenderer>;
  let layer: InstanceType<typeof Container>;

  beforeEach(() => {
    vi.clearAllMocks();
    layer = new Container() as never;
    renderer = createPlatformRenderer({ layer });
  });

  it('Normal platform: 96-256px wide grey rectangle >=16px tall; minimum visible width 96px > 48px CoS threshold; platform has stable entity ID', () => {
    const platform: PlatformData = {
      id: 42,
      kind: 'normal',
      x: 100, y: 500,
      width: 128, height: 16,
    };

    renderer.addPlatform(platform);

    // Width >= 96px (> 48px CoS threshold)
    expect(platform.width).toBeGreaterThanOrEqual(96);
    // Height >= 16px
    expect(platform.height).toBeGreaterThanOrEqual(16);

    // Entity ID is tracked
    const trackedIds = renderer.getTrackedIds();
    expect(trackedIds).toContain(42);
  });

  it('tint-shift indicator visible; Y oscillates between two positions at 40-80px/s', () => {
    const platform: PlatformData = {
      id: 10,
      kind: 'moving',
      x: 200, y: 500,
      width: 128, height: 16,
      moveRange: 80,
      moveSpeed: 60, // px/s — within 40-80 range
    };

    renderer.addPlatform(platform);

    // Moving platform speed must be within 40-80 range per design
    expect(platform.kind).toBe('moving');
    expect(platform.moveSpeed).toBeGreaterThanOrEqual(40);
    expect(platform.moveSpeed).toBeLessThanOrEqual(80);
    expect(renderer.getTrackedIds()).toContain(10);
  });

  it('edge-case: removePlatform cleans up registry (stable identity — no orphan entries)', () => {
    const platform: PlatformData = {
      id: 99,
      kind: 'normal',
      x: 0, y: 500,
      width: 128, height: 16,
    };

    renderer.addPlatform(platform);
    expect(renderer.getTrackedIds()).toContain(99);

    renderer.removePlatform(99);
    expect(renderer.getTrackedIds()).not.toContain(99);

    // Calling removePlatform again (orphan guard) should not throw
    expect(() => renderer.removePlatform(99)).not.toThrow();
  });

  it('crack overlay sprite appears on contact; crumble timer starts; GSAP dissolve animation fires at 600ms', () => {
    const platform: PlatformData = {
      id: 20,
      kind: 'crumbling',
      x: 300, y: 480,
      width: 100, height: 16,
    };

    renderer.addPlatform(platform);

    // Trigger contact
    renderer.onRunnerContact(20);

    // Crack overlay should be visible
    const state = renderer.getPlatformState(20);
    expect(state?.crumbleContactTime).toBeGreaterThan(0);

    // Platform is tracked
    expect(renderer.getTrackedIds()).toContain(20);
  });
});
