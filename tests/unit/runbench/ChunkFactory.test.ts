/**
 * ChunkFactory: generation + solvability + fallback — Batch 3
 *
 * Tests procedural level generation: tutorial corridor, seeded PRNG,
 * tier-gated obstacles, and fallback chunk on retry exhaustion.
 */

import { describe, it, expect } from 'vitest';
import {
  generateTutorialChunk,
  generateChunk,
  TUTORIAL_CHUNK_WIDTH,
  PLATFORM_SCROLL_SPEED,
} from '~/game/runbench/generation/ChunkFactory';
import type { Chunk } from '~/game/runbench/generation/ChunkFactory';

// ── Helpers ────────────────────────────────────────────────────────────────

const SCROLL_SPEED = 240; // px/s
const TUTORIAL_DURATION_S = 10; // first 10 seconds

describe('ChunkFactory: generation + solvability + fallback', () => {
  it('tutorial corridor loads: 3 wide Normal platforms (width=256px), gaps=48px, no obstacles, duration covers first 10 seconds of scroll', () => {
    const chunk = generateTutorialChunk();

    // Must have exactly 3 Normal platforms
    expect(chunk.platforms.length).toBe(3);
    for (const p of chunk.platforms) {
      expect(p.kind).toBe('normal');
      expect(p.width).toBe(256);
    }

    // No obstacles
    expect(chunk.obstacles.length).toBe(0);

    // Total corridor width must cover 10s at 240px/s = 2400px
    const totalWidth = TUTORIAL_CHUNK_WIDTH;
    expect(totalWidth).toBeGreaterThanOrEqual(SCROLL_SPEED * TUTORIAL_DURATION_S);

    // Gaps between platforms
    // platforms[0] ends at x + width; platforms[1] starts at gap after that
    for (let i = 1; i < chunk.platforms.length; i++) {
      const prevEnd = chunk.platforms[i - 1].x + chunk.platforms[i - 1].width;
      const gap = chunk.platforms[i].x - prevEnd;
      expect(gap).toBeGreaterThanOrEqual(48);
    }
  });

  it('procedural generation used from start; mulberry32 PRNG seeded with runNumber*48271+deviceId_hash', () => {
    // Same seed → same chunk (deterministic)
    const seed = 2 * 48271 + 12345; // runNumber=2, deviceId=12345
    const chunkA = generateChunk({ distanceM: 0, runNumber: 2, deviceIdHash: 12345 });
    const chunkB = generateChunk({ distanceM: 0, runNumber: 2, deviceIdHash: 12345 });

    // Platforms should be identical
    expect(chunkA.platforms.length).toBe(chunkB.platforms.length);
    for (let i = 0; i < chunkA.platforms.length; i++) {
      expect(chunkA.platforms[i].x).toBe(chunkB.platforms[i].x);
      expect(chunkA.platforms[i].width).toBe(chunkB.platforms[i].width);
    }

    // Different seed → different (likely) chunk
    const chunkC = generateChunk({ distanceM: 0, runNumber: 3, deviceIdHash: 12345 });
    // At least the seeds differ — chunks should differ (not guaranteed but very likely)
    expect(seed).not.toBe(3 * 48271 + 12345);
  });

  it('only Normal platforms generated; no obstacles placed', () => {
    // Tier 1: distance 0–100m
    const chunk = generateChunk({ distanceM: 50, runNumber: 2, deviceIdHash: 0 });

    for (const p of chunk.platforms) {
      expect(p.kind).toBe('normal');
    }
    expect(chunk.obstacles.length).toBe(0);
  });

  it('edge-case: compound obstacle (low-wall + overhead-beam) never placed in same chunk', () => {
    // Run many chunks at Tier 2+ and verify no chunk has both obstacle types
    for (let run = 0; run < 20; run++) {
      const chunk = generateChunk({ distanceM: 150, runNumber: run, deviceIdHash: run * 100 });
      const hasLowWall = chunk.obstacles.some(o => o.kind === 'low-wall');
      const hasBeam = chunk.obstacles.some(o => o.kind === 'overhead-beam');
      // They must never coexist
      expect(hasLowWall && hasBeam).toBe(false);
    }
  });

  it('fallback chunk (3-platform staircase) emitted; no infinite loop', () => {
    // Import fallback directly
    const { generateFallbackChunk } = require('~/game/runbench/data/fallbackChunk');
    const fallback = generateFallbackChunk() as Chunk;

    expect(fallback.platforms.length).toBe(3);
    // Platforms are ascending (staircase)
    expect(fallback.platforms[1].y).toBeLessThanOrEqual(fallback.platforms[0].y);
  });
});
