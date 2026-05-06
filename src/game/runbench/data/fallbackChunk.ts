/**
 * fallbackChunk — emitted when solvability check fails 10 consecutive times.
 *
 * A simple 3-platform ascending staircase. Always solvable with a single jump.
 * No obstacles, Normal platforms.
 */

import type { Chunk } from '../generation/ChunkFactory';

const BASE_Y = 600;
const STAIR_RISE = 60; // px per step (upward = lower Y value)
const PLATFORM_WIDTH = 128;
const PLATFORM_HEIGHT = 16;
const GAP = 60;

export const generateFallbackChunk = (): Chunk => ({
  width: (PLATFORM_WIDTH + GAP) * 3,
  platforms: [
    {
      id: -1,
      kind: 'normal',
      x: 0,
      y: BASE_Y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    },
    {
      id: -2,
      kind: 'normal',
      x: PLATFORM_WIDTH + GAP,
      y: BASE_Y - STAIR_RISE,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    },
    {
      id: -3,
      kind: 'normal',
      x: (PLATFORM_WIDTH + GAP) * 2,
      y: BASE_Y - STAIR_RISE * 2,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    },
  ],
  obstacles: [],
});
