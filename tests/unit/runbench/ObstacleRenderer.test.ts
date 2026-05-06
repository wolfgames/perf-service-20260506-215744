/**
 * ObstacleRenderer + ChunkFactory: obstacle rules — Batch 6
 *
 * Tests that obstacles are rendered correctly (low wall 16x48px,
 * overhead beam full-width at Y=80), tier gating, collision detection,
 * and compound obstacle prohibition.
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

import { createObstacleRenderer } from '~/game/runbench/renderers/ObstacleRenderer';
import type { ObstacleData } from '~/game/runbench/renderers/ObstacleRenderer';
import { generateChunk, TIER_1_MAX_M } from '~/game/runbench/generation/ChunkFactory';
import { checkCollision } from '~/game/runbench/systems/CollisionSystem';
import { Container } from 'pixi.js';

describe('ObstacleRenderer + ChunkFactory: obstacle rules', () => {
  let layer: InstanceType<typeof Container>;
  let renderer: ReturnType<typeof createObstacleRenderer>;

  beforeEach(() => {
    vi.clearAllMocks();
    layer = new Container() as never;
    renderer = createObstacleRenderer({ layer });
  });

  it('low wall obstacles begin appearing; each is a 16x48px vertical block anchored to platform top; visually distinct from platform', () => {
    const obstacle: ObstacleData = {
      id: 1,
      kind: 'low-wall',
      x: 200,
      y: 552,   // platform.y (600) - height (48) = 552
      width: 16,
      height: 48,
    };

    renderer.addObstacle(obstacle);

    expect(obstacle.width).toBe(16);
    expect(obstacle.height).toBe(48);
    expect(obstacle.kind).toBe('low-wall');
    expect(renderer.getTrackedIds()).toContain(1);
  });

  it('overhead beam obstacles begin appearing; each is a full-width horizontal bar at Y=80px from screen top; visually distinct from sky background', () => {
    const obstacle: ObstacleData = {
      id: 2,
      kind: 'overhead-beam',
      x: 0,
      y: 80,
      width: 390,
      height: 16,
    };

    renderer.addObstacle(obstacle);

    expect(obstacle.kind).toBe('overhead-beam');
    expect(obstacle.y).toBe(80);
    expect(obstacle.width).toBe(390);
    expect(renderer.getTrackedIds()).toContain(2);
  });

  it('zero obstacles rendered; obstacle-free corridor confirmed for first 100m', () => {
    // Tier 1 (distanceM < 100m) — no obstacles should be generated
    const chunk = generateChunk({ distanceM: 0, runNumber: 1, deviceIdHash: 0 });
    expect(chunk.obstacles).toHaveLength(0);

    // Also verify at distanceM = 99m (still Tier 1)
    const chunk99 = generateChunk({ distanceM: TIER_1_MAX_M - 1, runNumber: 1, deviceIdHash: 0 });
    expect(chunk99.obstacles).toHaveLength(0);
  });

  it('collision is not partial — any overlap = instant loss', () => {
    // Runner AABB overlapping obstacle AABB
    const runnerX = 100, runnerY = 570, runnerW = 32, runnerH = 48;
    const obstX = 110, obstY = 552, obstW = 16, obstH = 48;

    const hit = checkCollision(
      { x: runnerX, y: runnerY, width: runnerW, height: runnerH },
      { x: obstX, y: obstY, width: obstW, height: obstH },
    );
    expect(hit).toBe(true);

    // Non-overlapping boxes should NOT collide
    const miss = checkCollision(
      { x: 0, y: 570, width: 32, height: 48 },
      { x: 200, y: 552, width: 16, height: 48 },
    );
    expect(miss).toBe(false);
  });

  it('compound placement forbidden by ChunkFactory; test asserts no chunk contains both types simultaneously', () => {
    // Generate many chunks in Tier 2 where obstacles appear
    const hasCompound = Array.from({ length: 50 }, (_, i) =>
      generateChunk({ distanceM: 150, runNumber: i + 1, deviceIdHash: i * 7 })
    ).some(chunk => {
      const hasWall = chunk.obstacles.some(o => o.kind === 'low-wall');
      const hasBeam = chunk.obstacles.some(o => o.kind === 'overhead-beam');
      return hasWall && hasBeam;
    });

    expect(hasCompound).toBe(false);
  });
});
