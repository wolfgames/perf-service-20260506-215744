/**
 * RunBench ECS Plugin — game state schema and mutations.
 *
 * Holds all resources and components for the RunBench endless-runner game.
 * Property order is enforced at runtime: extends → services → components →
 * resources → archetypes → transactions → actions → systems.
 */

import { Database } from '~/core/systems/ecs';
import { F32 } from '~/core/systems/ecs';

// ── Phase type ──────────────────────────────────────────────────────────────

export type RunPhase = 'idle' | 'playing' | 'dying';

// ── Runner state ────────────────────────────────────────────────────────────

export type RunnerState = 'idle' | 'running' | 'airborne' | 'crouching' | 'dying';

// ── Platform type ───────────────────────────────────────────────────────────

export type PlatformKind = 'normal' | 'moving' | 'crumbling';

// ── Obstacle type ───────────────────────────────────────────────────────────

export type ObstacleKind = 'low-wall' | 'overhead-beam';

// ── Plugin ──────────────────────────────────────────────────────────────────

export const runBenchPlugin = Database.Plugin.create({
  components: {
    // Runner
    posX: F32.schema,
    posY: F32.schema,
    velX: F32.schema,
    velY: F32.schema,
    jumpCount: { type: 'number', default: 0 } as const,

    // Runner state string
    runnerState: { type: 'string', default: 'idle' as RunnerState } as const,

    // Platform
    platX: F32.schema,
    platY: F32.schema,
    platWidth: F32.schema,
    platHeight: F32.schema,
    platKind: { type: 'string', default: 'normal' as PlatformKind } as const,
    platEntityId: { type: 'number', default: 0 } as const,

    // Obstacle
    obstX: F32.schema,
    obstY: F32.schema,
    obstWidth: F32.schema,
    obstHeight: F32.schema,
    obstKind: { type: 'string', default: 'low-wall' as ObstacleKind } as const,
  },

  resources: {
    // Game phase
    phase: { default: 'idle' as RunPhase },

    // Runner physics
    runnerX: { default: 0 as number },
    runnerY: { default: 0 as number },
    runnerVelX: { default: 0 as number },
    runnerVelY: { default: 0 as number },
    runnerJumpCount: { default: 0 as number },
    runnerState: { default: 'idle' as RunnerState },

    // Scoring / distance
    distance: { default: 0 as number },     // meters traveled
    scrollSpeed: { default: 240 as number }, // px/s, increases with distance
    runCount: { default: 0 as number },

    // FPS tracking
    fps: { default: 0 as number },
    fpsAverage: { default: 0 as number },
    fpsSampleCount: { default: 0 as number },

    // End-of-run snapshot (persisted after death)
    finalDistance: { default: 0 as number },
    finalFpsAverage: { default: 0 as number },
  },

  archetypes: {
    Runner: ['posX', 'posY', 'velX', 'velY', 'jumpCount', 'runnerState'],
    Platform: ['platX', 'platY', 'platWidth', 'platHeight', 'platKind', 'platEntityId'],
    Obstacle: ['obstX', 'obstY', 'obstWidth', 'obstHeight', 'obstKind'],
  },

  transactions: {
    setPhase(store, phase: RunPhase) {
      store.resources.phase = phase;
    },

    setRunnerState(store, state: RunnerState) {
      store.resources.runnerState = state;
    },

    setRunnerPosition(store, { x, y }: { x: number; y: number }) {
      store.resources.runnerX = x;
      store.resources.runnerY = y;
    },

    setRunnerVelocity(store, { vx, vy }: { vx: number; vy: number }) {
      store.resources.runnerVelX = vx;
      store.resources.runnerVelY = vy;
    },

    setRunnerJumpCount(store, count: number) {
      store.resources.runnerJumpCount = count;
    },

    updateDistance(store, meters: number) {
      store.resources.distance = meters;
      // Scroll speed: 240 + 10 * (distance / 100)
      store.resources.scrollSpeed = 240 + 10 * (meters / 100);
    },

    updateFps(store, { fps, runningMean }: { fps: number; runningMean: number }) {
      store.resources.fps = fps;
      store.resources.fpsAverage = runningMean;
      store.resources.fpsSampleCount = store.resources.fpsSampleCount + 1;
    },

    snapshotRun(store) {
      store.resources.finalDistance = store.resources.distance;
      store.resources.finalFpsAverage = store.resources.fpsAverage;
    },

    incrementRunCount(store) {
      store.resources.runCount = store.resources.runCount + 1;
    },

    resetForNewRun(store) {
      store.resources.phase = 'idle';
      store.resources.distance = 0;
      store.resources.scrollSpeed = 240;
      store.resources.fps = 0;
      store.resources.fpsAverage = 0;
      store.resources.fpsSampleCount = 0;
      store.resources.runnerJumpCount = 0;
      store.resources.runnerState = 'idle';
      store.resources.runnerVelX = 0;
      store.resources.runnerVelY = 0;
    },
  },
});

export type RunBenchPlugin = typeof runBenchPlugin;
export type RunBenchDatabase = Database.FromPlugin<RunBenchPlugin>;
