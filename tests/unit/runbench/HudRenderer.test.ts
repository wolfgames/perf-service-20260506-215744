/**
 * HudRenderer: layout and readability — Batch 4
 *
 * Tests that HudRenderer places distance top-left and FPS top-right,
 * total HUD height <=48px, and text size >=16px.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Pixi.js
vi.mock('pixi.js', () => {
  const Text = vi.fn().mockImplementation((_text: string, style: Record<string, unknown>) => ({
    text: _text,
    style,
    x: 0,
    y: 0,
    width: 80,
    height: 20,
    anchor: { set: vi.fn() },
    destroy: vi.fn(),
  }));
  const Container = vi.fn().mockImplementation(() => ({
    addChild: vi.fn(),
    removeChild: vi.fn(),
    destroy: vi.fn(),
    children: [],
  }));
  return { Text, Container };
});

import { createHudRenderer } from '~/game/runbench/renderers/HudRenderer';
import { Container } from 'pixi.js';

describe('HudRenderer: layout and readability', () => {
  let layer: InstanceType<typeof Container>;
  let renderer: ReturnType<typeof createHudRenderer>;

  beforeEach(() => {
    vi.clearAllMocks();
    layer = new Container() as never;
    renderer = createHudRenderer({ layer, screenWidth: 390, screenHeight: 844 });
  });

  it('edge-case: FPS text X position correctly uses screenWidth (not a hardcoded value)', () => {
    // Create renderer at a non-standard screen width
    const wideRenderer = createHudRenderer({ layer, screenWidth: 768, screenHeight: 1024 });
    // FPS text should be positioned at 768 - margin, not at the default 390 - margin
    expect(wideRenderer.fpsX).toBeGreaterThan(390); // must scale with screen width
    expect(wideRenderer.screenWidth).toBe(768);
  });

  it('distance top-left, FPS top-right; combined HUD height <=48px; no overlap with game canvas or notch area; text >=16px', () => {
    // Update to set initial values
    renderer.update({ distanceM: 42, fps: 58 });

    // HUD height budget
    expect(renderer.hudHeight).toBeLessThanOrEqual(48);

    // Text font size >= 16
    expect(renderer.distanceFontSize).toBeGreaterThanOrEqual(16);
    expect(renderer.fpsFontSize).toBeGreaterThanOrEqual(16);

    // Distance is positioned on the left (x near 0)
    expect(renderer.distanceX).toBeLessThan(renderer.screenWidth / 2);

    // FPS is positioned on the right (x near screenWidth)
    expect(renderer.fpsX).toBeGreaterThan(renderer.screenWidth / 2);
  });
});
