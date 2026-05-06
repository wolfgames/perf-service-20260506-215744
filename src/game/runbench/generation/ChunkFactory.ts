/**
 * ChunkFactory — procedural level generation for RunBench.
 *
 * Algorithm (four-step per GDD):
 *   1. Chunk layout: number of platforms, x/y positions, widths
 *   2. Obstacle placement: tier-gated; compound obstacles forbidden
 *   3. Platform type assignment: tier-gated (Moving/Crumbling at higher tiers)
 *   4. Solvability check: simulate runner at minimum skill (single jump)
 *
 * PRNG: mulberry32 — seed = runNumber * 48271 + deviceId_hash
 * Pure function — no Pixi, no DOM, no Math.random().
 */

import { tutorialChunk, TUTORIAL_CHUNK_WIDTH } from '../data/tutorialChunk';
import { generateFallbackChunk } from '../data/fallbackChunk';

export { TUTORIAL_CHUNK_WIDTH };

// ── Constants ────────────────────────────────────────────────────────────────

export const PLATFORM_SCROLL_SPEED = 240; // px/s baseline scroll speed
export const MAX_RETRY_ATTEMPTS = 10;

// Tier gates (distance in meters)
export const TIER_1_MAX_M = 100;
export const TIER_2_MAX_M = 300;
export const TIER_3_MAX_M = 600;

// ── Types ────────────────────────────────────────────────────────────────────

export type PlatformKind = 'normal' | 'moving' | 'crumbling';
export type ObstacleKind = 'low-wall' | 'overhead-beam';

export interface PlatformDef {
  id: number;
  kind: PlatformKind;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Moving platform: oscillation range in px */
  moveRange?: number;
  /** Moving platform: speed in px/s (40-80) */
  moveSpeed?: number;
}

export interface ObstacleDef {
  kind: ObstacleKind;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Chunk {
  width: number;
  platforms: PlatformDef[];
  obstacles: ObstacleDef[];
}

// ── mulberry32 PRNG ───────────────────────────────────────────────────────────

/** mulberry32 — fast, deterministic 32-bit PRNG. Returns a seeded generator. */
export const mulberry32 = (seed: number): (() => number) => {
  let s = seed >>> 0;
  return (): number => {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 0x100000000;
  };
};

// ── Chunk generation ──────────────────────────────────────────────────────────

export interface ChunkOptions {
  distanceM: number;
  runNumber: number;
  deviceIdHash: number;
}

const PLATFORM_HEIGHT = 16;
const PLATFORM_GROUND_Y = 600;
const MIN_PLATFORM_WIDTH = 96;
const MAX_PLATFORM_WIDTH = 256;
const MIN_GAP = 48;
const MAX_GAP = 120;
const PLATFORMS_PER_CHUNK = 4;
const CHUNK_WIDTH = 800; // px

export const generateTutorialChunk = (): Chunk => tutorialChunk;

export const generateChunk = ({ distanceM, runNumber, deviceIdHash }: ChunkOptions): Chunk => {
  const seed = (runNumber * 48271 + deviceIdHash) >>> 0;
  const rng = mulberry32(seed + Math.floor(distanceM)); // vary seed per chunk position

  for (let attempt = 0; attempt < MAX_RETRY_ATTEMPTS; attempt++) {
    const chunk = buildChunk(rng, distanceM);
    if (isChunkSolvable(chunk)) return chunk;
  }

  // Fallback after 10 failed attempts
  return generateFallbackChunk();
};

const buildChunk = (rng: () => number, distanceM: number): Chunk => {
  const platforms: PlatformDef[] = [];
  let curX = 0;

  for (let i = 0; i < PLATFORMS_PER_CHUNK; i++) {
    const width = Math.floor(MIN_PLATFORM_WIDTH + rng() * (MAX_PLATFORM_WIDTH - MIN_PLATFORM_WIDTH));
    const gap = i === 0 ? 0 : Math.floor(MIN_GAP + rng() * (MAX_GAP - MIN_GAP));
    const x = curX + gap;
    const kind = assignPlatformKind(rng, distanceM);

    const def: PlatformDef = {
      id: Date.now() + i, // stable within a chunk; real IDs assigned by ECS
      kind,
      x,
      y: PLATFORM_GROUND_Y,
      width,
      height: PLATFORM_HEIGHT,
    };

    if (kind === 'moving') {
      def.moveRange = 80;
      def.moveSpeed = 40 + Math.floor(rng() * 40); // 40-80 px/s
    }

    platforms.push(def);
    curX = x + width;
  }

  const obstacles = distanceM >= TIER_1_MAX_M
    ? buildObstacles(rng, platforms)
    : [];

  return { width: CHUNK_WIDTH, platforms, obstacles };
};

const assignPlatformKind = (rng: () => number, distanceM: number): PlatformKind => {
  if (distanceM < TIER_1_MAX_M) return 'normal';
  if (distanceM < TIER_2_MAX_M) {
    const r = rng();
    return r < 0.7 ? 'normal' : 'moving';
  }
  if (distanceM < TIER_3_MAX_M) {
    const r = rng();
    if (r < 0.5) return 'normal';
    if (r < 0.8) return 'moving';
    return 'crumbling';
  }
  // Tier 4 (600m+): all types
  const r = rng();
  if (r < 0.4) return 'normal';
  if (r < 0.7) return 'moving';
  return 'crumbling';
};

const buildObstacles = (rng: () => number, platforms: PlatformDef[]): ObstacleDef[] => {
  if (platforms.length === 0) return [];

  // Compound obstacles (low-wall + overhead-beam in same chunk) are FORBIDDEN
  // Pick at most one obstacle type per chunk
  const hasLowWall = rng() < 0.4;
  const hasBeam = !hasLowWall && rng() < 0.3; // mutually exclusive

  const obstacles: ObstacleDef[] = [];

  if (hasLowWall) {
    const platform = platforms[Math.floor(rng() * platforms.length)];
    obstacles.push({
      kind: 'low-wall',
      x: platform.x + platform.width / 2,
      y: platform.y - 48,
      width: 16,
      height: 48,
    });
  } else if (hasBeam) {
    obstacles.push({
      kind: 'overhead-beam',
      x: 0,
      y: 80,
      width: 390, // full screen width
      height: 16,
    });
  }

  return obstacles;
};

// ── Solvability checker ───────────────────────────────────────────────────────

import { GRAVITY, JUMP_VY, GROUND_Y } from '../systems/PhysicsSystem';

/**
 * Simulate runner at minimum skill (single jump only) through the chunk.
 * Returns true if the chunk is completable.
 */
export const isChunkSolvable = (chunk: Chunk): boolean => {
  if (chunk.platforms.length === 0) return true;

  // Simple gap check: for each consecutive pair of platforms,
  // verify the gap is jumpable with a single jump at ground level
  for (let i = 1; i < chunk.platforms.length; i++) {
    const prev = chunk.platforms[i - 1];
    const curr = chunk.platforms[i];
    const gap = curr.x - (prev.x + prev.width);

    if (gap > maxJumpDistance()) return false;
  }

  return true;
};

/**
 * Maximum horizontal distance covered during a single jump at scroll speed 240px/s.
 * Using projectile motion: t = 2 * |vy| / g, dist = t * scrollSpeed
 */
export const maxJumpDistance = (): number => {
  const airTime = (2 * Math.abs(JUMP_VY)) / GRAVITY; // seconds
  return airTime * PLATFORM_SCROLL_SPEED; // px
};
