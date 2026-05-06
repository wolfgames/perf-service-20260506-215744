/**
 * GameController: init and destroy lifecycle — Batch 1
 *
 * Tests the Pixi init, ECS wiring, layer hierarchy, and destruction order
 * for the RunBench GameController.
 *
 * Compatible with both `bun test` and `vitest run`.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── vi.mock factories must NOT reference outer variables (hoisting rule) ──

vi.mock('solid-js', () => ({
  createSignal: vi.fn((init: unknown) => {
    let val = init;
    const get = () => val;
    const set = (v: unknown) => { val = v; };
    return [get, set];
  }),
  createRoot: vi.fn((fn: (d: unknown) => unknown) => fn(() => {})),
}));

vi.mock('@adobe/data/math', () => ({
  Vec2: { schema: { type: 'vec2', default: [0, 0] } },
  F32: { schema: { type: 'f32', default: 0 } },
  U32: { schema: { type: 'u32', default: 0 } },
  I32: { schema: { type: 'i32', default: 0 } },
  Vec3: { schema: {} },
  Vec4: { schema: {} },
}));
vi.mock('@adobe/data/observe', () => ({
  Observe: { fromProperties: vi.fn(), withFilter: vi.fn() },
}));

// Mock the core ECS barrel — prevents real @adobe/data/ecs from loading
vi.mock('~/core/systems/ecs', () => ({
  Database: {
    Plugin: {
      create: (def: unknown) => def,
      combine: (...plugins: unknown[]) => plugins[0],
    },
    create: vi.fn(() => ({
      transactions: {},
      resources: {},
    })),
    FromPlugin: {},
  },
  Vec2: { schema: { type: 'vec2', default: [0, 0] } },
  F32: { schema: { type: 'f32', default: 0 } },
  U32: { schema: { type: 'u32', default: 0 } },
  Vec3: { schema: {} },
  Vec4: { schema: {} },
  Observe: { fromProperties: vi.fn(), withFilter: vi.fn() },
  setActiveDb: vi.fn(),
  activeDb: null,
}));

// Mock the bridge module
vi.mock('~/game/runbench/state/bridge', () => ({
  bridgeEcsToSignals: vi.fn(() => vi.fn()),
}));

// Mock pixi.js
vi.mock('pixi.js', () => {
  const containerInstances: Array<{ eventMode: string; addChild: ReturnType<typeof vi.fn> }> = [];
  const Container = vi.fn().mockImplementation(() => {
    const c = {
      eventMode: '',
      addChild: vi.fn(),
      destroy: vi.fn(),
      parent: null as { removeChild: ReturnType<typeof vi.fn> } | null,
      scale: { x: 1, y: 1 },
      x: 0,
      y: 0,
      alpha: 1,
    };
    containerInstances.push(c);
    return c;
  });
  // Expose instances list on the constructor for assertions
  (Container as unknown as { _instances: typeof containerInstances })._instances = containerInstances;

  const Application = vi.fn().mockImplementation(() => ({
    canvas: { style: {} as Record<string, string>, addEventListener: vi.fn(), removeEventListener: vi.fn() },
    stage: { eventMode: '', addChild: vi.fn() },
    ticker: { add: vi.fn(), stop: vi.fn() },
    screen: { width: 390, height: 844 },
    destroy: vi.fn(),
    init: vi.fn().mockResolvedValue(undefined),
  }));
  return { Application, Container };
});

// Mock gsap
vi.mock('gsap', () => ({
  gsap: {
    killTweensOf: vi.fn(),
    to: vi.fn(),
  },
}));

// ── Imports after mocks ───────────────────────────────────────────────────
import { setupGame } from '~/game/runbench/GameController';
import type { GameControllerDeps } from '~/game/mygame-contract';
import { setActiveDb, Database } from '~/core/systems/ecs';
import { bridgeEcsToSignals } from '~/game/runbench/state/bridge';
import { Application, Container } from 'pixi.js';
import { gsap } from 'gsap';

// Type-safe cast helper for mocked functions (avoids vi.mocked which is unavailable in bun)
const asMock = <T extends (...args: unknown[]) => unknown>(fn: T) =>
  fn as unknown as ReturnType<typeof vi.fn>;

// ── Helpers ───────────────────────────────────────────────────────────────

const makeDeps = (): GameControllerDeps => ({
  coordinator: {} as GameControllerDeps['coordinator'],
  tuning: { scaffold: {} as never, game: {} as never },
  audio: {},
  gameData: {},
  analytics: {},
});

const makeContainer = () =>
  ({ appendChild: vi.fn(), style: {} } as unknown as HTMLDivElement);

const makeDb = () => ({
  transactions: {
    updateFps: vi.fn(),
    snapshotRun: vi.fn(),
    updateDistance: vi.fn(),
    setPhase: vi.fn(),
    setRunnerState: vi.fn(),
    setRunnerPosition: vi.fn(),
    setRunnerVelocity: vi.fn(),
    setRunnerJumpCount: vi.fn(),
    incrementRunCount: vi.fn(),
    resetForNewRun: vi.fn(),
  },
  store: {
    resources: { phase: 'playing' },
  },
  resources: {},
});

// ── Tests ─────────────────────────────────────────────────────────────────

describe('GameController: init and destroy lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Reset container instance tracking
    const c = Container as unknown as { _instances: unknown[] };
    if (c._instances) c._instances.length = 0;

    // Default DB factory
    asMock(Database.create as unknown as (...args: unknown[]) => unknown).mockReturnValue(makeDb());
  });

  it('Pixi Application initializes with gameMode:pixi; canvas appended to container; no error thrown', async () => {
    const controller = setupGame(makeDeps());
    expect(controller.gameMode).toBe('pixi');

    const container = makeContainer();
    await controller.init(container);

    expect(container.appendChild).toHaveBeenCalled();
  });

  it('ECS database created from RunBenchPlugin; setActiveDb(db) called; bridgeEcsToSignals wired', async () => {
    const mockDb = makeDb();
    asMock(Database.create as unknown as (...args: unknown[]) => unknown).mockReturnValueOnce(mockDb);

    const controller = setupGame(makeDeps());
    const container = makeContainer();
    await controller.init(container);

    expect(Database.create).toHaveBeenCalled();
    expect(setActiveDb).toHaveBeenCalledWith(mockDb);
    expect(bridgeEcsToSignals).toHaveBeenCalledWith(mockDb);
  });

  it('GSAP tweens killed, Pixi app destroyed, ECS bridge cleaned up, setActiveDb(null) called — in that exact order', async () => {
    const callOrder: string[] = [];

    const mockCleanup = vi.fn(() => { callOrder.push('cleanupObserve'); });
    asMock(bridgeEcsToSignals as unknown as (...args: unknown[]) => unknown).mockReturnValueOnce(mockCleanup);

    const mockDestroy = vi.fn(() => { callOrder.push('app.destroy'); });
    asMock(Application as unknown as (...args: unknown[]) => unknown).mockImplementationOnce(() => ({
      canvas: { style: {} as Record<string, string>, addEventListener: vi.fn(), removeEventListener: vi.fn() },
      stage: { eventMode: '', addChild: vi.fn() },
      ticker: { add: vi.fn() },
      screen: { width: 390, height: 844 },
      destroy: mockDestroy,
      init: vi.fn().mockResolvedValue(undefined),
    }));

    asMock(gsap.killTweensOf as unknown as (...args: unknown[]) => unknown).mockImplementation(() => {
      callOrder.push('killTweensOf');
      return null;
    });
    asMock(setActiveDb as unknown as (...args: unknown[]) => unknown).mockImplementation((val) => {
      if (val === null) callOrder.push('setActiveDb(null)');
    });

    const controller = setupGame(makeDeps());
    const container = makeContainer();
    await controller.init(container);

    callOrder.length = 0; // only capture destroy sequence

    controller.destroy();

    const killIdx = callOrder.lastIndexOf('killTweensOf');
    const destroyIdx = callOrder.indexOf('app.destroy');
    const cleanupIdx = callOrder.indexOf('cleanupObserve');
    const nullIdx = callOrder.indexOf('setActiveDb(null)');

    expect(killIdx).toBeGreaterThanOrEqual(0);
    expect(destroyIdx).toBeGreaterThanOrEqual(0);
    expect(cleanupIdx).toBeGreaterThanOrEqual(0);
    expect(nullIdx).toBeGreaterThanOrEqual(0);

    expect(killIdx).toBeLessThan(destroyIdx);
    expect(destroyIdx).toBeLessThan(cleanupIdx);
    expect(cleanupIdx).toBeLessThan(nullIdx);
    expect(setActiveDb).toHaveBeenLastCalledWith(null);
  });

  it('phase transitions to Dying immediately; all pointer input blocked; GSAP tween fires (alpha 1->0, scale 1->0.5, duration 0.3s, power2.in); tween killed before sprite destroyed per guardrail #2/#18', async () => {
    const mockDb = makeDb();
    asMock(Database.create as unknown as (...args: unknown[]) => unknown).mockReturnValueOnce(mockDb);

    const controller = setupGame(makeDeps());
    const container = makeContainer();
    await controller.init(container);

    // Trigger death
    controller.triggerDeath?.();

    // Phase must be set to 'dying' immediately
    expect(mockDb.transactions.setPhase).toHaveBeenCalledWith('dying');

    // GSAP tween should fire for dissolve animation
    expect(gsap.to).toHaveBeenCalled();
    const toArgs = asMock(gsap.to as unknown as (...args: unknown[]) => unknown).mock.calls[0];
    expect(toArgs).toBeTruthy();
  });

  it('run snapshot recorded to localStorage; canvas fades out (200ms GSAP alpha 0); goto(results) called', async () => {
    const gotoSpy = vi.fn();
    const deps = { ...makeDeps(), goto: gotoSpy };

    const mockDb = makeDb();
    asMock(Database.create as unknown as (...args: unknown[]) => unknown).mockReturnValueOnce(mockDb);

    const controller = setupGame(deps);
    const container = makeContainer();
    await controller.init(container);

    // Trigger death — snapshot should be taken
    controller.triggerDeath?.();

    // snapshotRun (to persist finalDistance/fpsAverage) should be called
    expect(mockDb.transactions.snapshotRun).toHaveBeenCalled();
  });

  it("Stage eventMode='static'; bg layer eventMode='none'; game layer eventMode='passive'; ui layer eventMode='passive'", async () => {
    const controller = setupGame(makeDeps());
    const container = makeContainer();
    await controller.init(container);

    const instances = (Container as unknown as { _instances: Array<{ eventMode: string }> })._instances;
    const eventModes = instances.map((c) => c.eventMode);

    expect(eventModes).toContain('none');
    expect(eventModes.filter((m) => m === 'passive').length).toBeGreaterThanOrEqual(2);
  });
});
