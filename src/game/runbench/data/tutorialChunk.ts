/**
 * tutorialChunk — hard-coded tutorial corridor.
 *
 * First 10 seconds of Run 1 only. Three wide Normal platforms (256px wide),
 * gaps = 48px, no obstacles. Covers 10s * 240px/s = 2400px scroll distance.
 *
 * Not procedurally generated — inline constant per plan specification.
 */

import type { Chunk } from '../generation/ChunkFactory';

/** Tutorial corridor total width in pixels (10s * 240px/s = 2400px) */
export const TUTORIAL_CHUNK_WIDTH = 2400;

const PLATFORM_HEIGHT = 16;
const PLATFORM_GROUND_Y = 600; // matches GROUND_Y in PhysicsSystem
const PLATFORM_WIDTH = 256;
const GAP = 48;

export const tutorialChunk: Chunk = {
  width: TUTORIAL_CHUNK_WIDTH,
  platforms: [
    {
      id: 1,
      kind: 'normal',
      x: 0,
      y: PLATFORM_GROUND_Y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    },
    {
      id: 2,
      kind: 'normal',
      x: PLATFORM_WIDTH + GAP,           // 256 + 48 = 304
      y: PLATFORM_GROUND_Y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    },
    {
      id: 3,
      kind: 'normal',
      x: (PLATFORM_WIDTH + GAP) * 2,     // 608
      y: PLATFORM_GROUND_Y,
      width: PLATFORM_WIDTH,
      height: PLATFORM_HEIGHT,
    },
  ],
  obstacles: [],
};
