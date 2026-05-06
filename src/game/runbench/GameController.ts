/**
 * RunBench GameController — Pixi mode.
 *
 * Creates the Pixi Application, layer hierarchy, ECS database,
 * PhysicsSystem, InputHandler, and bridges ECS to SolidJS signals.
 *
 * Destruction order is strict:
 *   1. GSAP.killTweensOf(stage + layers)
 *   2. app.destroy(true)
 *   3. cleanupObserve()
 *   4. setActiveDb(null)
 */

import { createSignal } from 'solid-js';
import { Application, Container } from 'pixi.js';
import { gsap } from 'gsap';
import { Database } from '~/core/systems/ecs';
import { setActiveDb } from '~/core/systems/ecs';
import type { GameController, GameControllerDeps, SetupGame } from '~/game/mygame-contract';
import { runBenchPlugin } from './state/RunBenchPlugin';
import type { RunBenchDatabase } from './state/RunBenchPlugin';
import { bridgeEcsToSignals } from './state/bridge';
import {
  createRunnerState,
  stepPhysics,
  GROUND_Y,
} from './systems/PhysicsSystem';
import type { RunnerState } from './systems/PhysicsSystem';
import { createInputHandler } from './input/InputHandler';
import type { InputHandlerInstance } from './input/InputHandler';
import { generateTutorialChunk, generateChunk } from './generation/ChunkFactory';
import { createPlatformRenderer } from './renderers/PlatformRenderer';
import { createObstacleRenderer } from './renderers/ObstacleRenderer';
import { createHudRenderer } from './renderers/HudRenderer';
import { createRunnerRenderer } from './renderers/RunnerRenderer';
import { checkCollision } from './systems/CollisionSystem';
import type { AABB } from './systems/CollisionSystem';
import { RUNNER_WIDTH, RUNNER_HEIGHT, CROUCH_HEIGHT_RATIO } from './systems/PhysicsSystem';
import { createPerfTracker } from './systems/PerfTracker';
import { loadRunCount, loadDeviceId, saveRun } from './storage/runStorage';
import { metersFromScrollPixels } from './state/scoring';
import { runnerScreenX } from './entities/Runner';

export const setupGame: SetupGame = (deps: GameControllerDeps): GameController => {
  const { goto } = deps;
  const [ariaText, setAriaText] = createSignal('RunBench loading...');

  let app: Application | null = null;
  let ecsDb: RunBenchDatabase | null = null;
  let cleanupObserve: (() => void) | null = null;

  // Layer containers
  let bgLayer: Container | null = null;
  let gameLayer: Container | null = null;
  let hudLayer: Container | null = null;
  let uiLayer: Container | null = null;

  // Physics + input state
  let runnerState: RunnerState | null = null;
  let inputHandler: InputHandlerInstance | null = null;

  // Queued input actions for the next physics step
  let pendingAction: import('./systems/PhysicsSystem').PhysicsAction = {};

  // Chunk / platform management
  let platformRenderer: ReturnType<typeof createPlatformRenderer> | null = null;
  let obstacleRenderer: ReturnType<typeof createObstacleRenderer> | null = null;
  let scrollOffset = 0; // px — total horizontal scroll since run start
  // Track obstacle bounds in world-space for collision (reset each chunk load)
  let activeObstacles: Array<{ id: number } & AABB> = [];

  // Runner visual
  let runnerRenderer: ReturnType<typeof createRunnerRenderer> | null = null;

  // HUD + perf tracking
  let hudRenderer: ReturnType<typeof createHudRenderer> | null = null;
  let perfTracker: ReturnType<typeof createPerfTracker> | null = null;

  // Forward reference for collision to call triggerDeath
  let triggerDeathFn: (() => void) | null = null;

  const controller: GameController = {
    gameMode: 'pixi',

    async init(container: HTMLDivElement) {
      setAriaText('RunBench');

      // ── ECS setup ─────────────────────────────────────────────────────
      ecsDb = Database.create(runBenchPlugin) as RunBenchDatabase;
      setActiveDb(ecsDb);
      cleanupObserve = bridgeEcsToSignals(ecsDb);

      // ── Pixi Application ──────────────────────────────────────────────
      app = new Application();
      await app.init({
        resizeTo: container,
        resolution: Math.min(globalThis.devicePixelRatio ?? 1, 2),
        background: '#0a0a0f',
        antialias: false,
      });

      container.appendChild(app.canvas as HTMLCanvasElement);

      // ── Layer hierarchy ───────────────────────────────────────────────
      app.stage.eventMode = 'static';

      bgLayer = new Container();
      bgLayer.eventMode = 'none';

      gameLayer = new Container();
      gameLayer.eventMode = 'passive';

      hudLayer = new Container();
      hudLayer.eventMode = 'passive';

      uiLayer = new Container();
      uiLayer.eventMode = 'passive';

      app.stage.addChild(bgLayer);
      app.stage.addChild(gameLayer);
      app.stage.addChild(hudLayer);
      app.stage.addChild(uiLayer);

      // ── Platform renderer ─────────────────────────────────────────────
      platformRenderer = createPlatformRenderer({ layer: gameLayer });

      // ── Obstacle renderer ─────────────────────────────────────────────
      obstacleRenderer = createObstacleRenderer({ layer: gameLayer });

      // ── HUD renderer ──────────────────────────────────────────────────
      hudRenderer = createHudRenderer({
        layer: hudLayer,
        screenWidth: app.screen.width,
        screenHeight: app.screen.height,
      });

      // ── Perf tracker ──────────────────────────────────────────────────
      perfTracker = createPerfTracker({ db: ecsDb });

      // Seed constants for chunk generation
      const runCount = loadRunCount();
      const deviceIdHash = loadDeviceId();

      // Load tutorial chunk on first run, procedural chunks thereafter
      const firstChunk = runCount === 0
        ? generateTutorialChunk()
        : generateChunk({ distanceM: 0, runNumber: runCount, deviceIdHash });

      for (const p of firstChunk.platforms) {
        platformRenderer.addPlatform(p);
      }
      for (const o of firstChunk.obstacles) {
        const id = Date.now() + Math.random();
        obstacleRenderer.addObstacle({ ...o, id });
        activeObstacles.push({ id, x: o.x, y: o.y, width: o.width, height: o.height });
      }

      // ── Runner physics state ──────────────────────────────────────────
      // Runner X locked to 30% of screen width per entities/Runner.ts contract
      const screenXForRunner = runnerScreenX(app.screen.width);
      runnerState = createRunnerState();
      runnerState = {
        ...runnerState,
        x: screenXForRunner,
        y: GROUND_Y,
        state: 'running',
      };

      // ── Runner renderer (labeled shape until atlas) ───────────────────
      // Runner lives in hudLayer so it stays at fixed screen-space X while
      // gameLayer scrolls leftward. The runner's Y is synced from physics each frame.
      // Using hudLayer is correct: it does not participate in the world scroll transform.
      runnerRenderer = createRunnerRenderer({
        layer: hudLayer,
        screenX: screenXForRunner,
      });
      runnerRenderer.update(GROUND_Y, 'running');

      // ── Input handler — registers pointer events on canvas ────────────
      const canvasEl = app.canvas as HTMLElement;
      inputHandler = createInputHandler({
        canvas: canvasEl,
        getPhase: () => ecsDb?.store?.resources?.phase ?? 'idle',
        onJump: () => { pendingAction = { action: 'jump' }; },
        onCrouchStart: () => { pendingAction = { action: 'crouch-start' }; },
        onCrouchEnd: () => { pendingAction = { action: 'crouch-end' }; },
      });
      inputHandler.mount();

      // ── Game loop ─────────────────────────────────────────────────────
      app.ticker.add((ticker) => {
        if (!runnerState || !ecsDb || !platformRenderer) return;

        const dt = ticker.deltaMS / 1000;

        // PerfTracker: sample FPS this frame (deltaTime=1 at 60fps in Pixi units)
        perfTracker?.tick(ticker.deltaTime);

        // Physics step
        const action = pendingAction;
        pendingAction = {};
        runnerState = stepPhysics(runnerState, action, dt);

        // Scroll: move game layer left to simulate forward movement
        const scrollSpeed = ecsDb.store?.resources?.scrollSpeed ?? 240;
        scrollOffset += scrollSpeed * dt;
        if (gameLayer) gameLayer.x = -scrollOffset;

        // Update distance in ECS (meters = total scrolled px / baseline speed)
        const distanceM = metersFromScrollPixels(scrollOffset);
        ecsDb.transactions.updateDistance(distanceM);

        // Update runner visual position and state (pass landEvent for squash animation)
        runnerRenderer?.update(runnerState.y, runnerState.state, runnerState.landEvent);

        // Collision detection: check runner AABB against active obstacles
        if (ecsDb.store?.resources?.phase === 'playing' && activeObstacles.length > 0) {
          const hitboxHeight = runnerState.state === 'crouching'
            ? RUNNER_HEIGHT * CROUCH_HEIGHT_RATIO
            : RUNNER_HEIGHT;
          const runnerAABB: AABB = {
            x: runnerState.x - RUNNER_WIDTH / 2,
            y: runnerState.y - hitboxHeight,
            width: RUNNER_WIDTH,
            height: hitboxHeight,
          };
          for (const obs of activeObstacles) {
            // Obstacle x is in world-space; adjust by scroll offset to get screen-space
            const obsScreen: AABB = {
              x: obs.x - scrollOffset,
              y: obs.y,
              width: obs.width,
              height: obs.height,
            };
            if (checkCollision(runnerAABB, obsScreen)) {
              // Trigger death on next microtask to avoid re-entrant mutation
              Promise.resolve().then(() => triggerDeathFn?.());
              break;
            }
          }
        }

        // Update HUD
        const fps = ecsDb.store?.resources?.fps ?? 0;
        hudRenderer?.update({ distanceM, fps });

        // Sync runner Y to ECS
        ecsDb.transactions.setRunnerPosition({
          x: runnerState.x,
          y: runnerState.y,
        });
        ecsDb.transactions.setRunnerState(runnerState.state);
        ecsDb.transactions.setRunnerJumpCount(runnerState.jumpCount);
      });

      // Transition to playing
      ecsDb.transactions.setPhase('playing');

      setAriaText('Running');
    },

    destroy() {
      // ── Destruction order: GSAP → Pixi → ECS bridge → setActiveDb(null) ──

      // 1. Kill all GSAP tweens before destroy
      if (app) gsap.killTweensOf(app.stage);
      if (bgLayer) gsap.killTweensOf(bgLayer);
      if (gameLayer) gsap.killTweensOf(gameLayer);
      if (hudLayer) gsap.killTweensOf(hudLayer);
      if (uiLayer) gsap.killTweensOf(uiLayer);
      // runnerRenderer's internal destroy() kills its own tweens; nothing extra needed here

      // 2. Destroy input handler, renderers
      inputHandler?.destroy();
      inputHandler = null;
      runnerRenderer?.destroy();
      runnerRenderer = null;
      platformRenderer?.destroy();
      platformRenderer = null;
      obstacleRenderer?.destroy();
      obstacleRenderer = null;
      activeObstacles = [];
      hudRenderer?.destroy();
      hudRenderer = null;
      perfTracker = null;
      scrollOffset = 0;

      // 3. Destroy Pixi app (GPU teardown)
      app?.destroy(true, { children: true });
      app = null;
      bgLayer = null;
      gameLayer = null;
      hudLayer = null;
      uiLayer = null;

      // 4. Stop ECS → signal bridge
      cleanupObserve?.();
      cleanupObserve = null;

      // 5. Release Inspector reference
      setActiveDb(null);
      ecsDb = null;
      runnerState = null;

      setAriaText('Game ended');
    },

    ariaText,

    /**
     * Trigger the death sequence:
     *   1. Set phase to 'dying' (blocks input)
     *   2. Snapshot perf tracker (finalDistance + fpsAverage → ECS)
     *   3. Save run to localStorage
     *   4. GSAP dissolve animation on gameLayer
     *   5. Navigate to results screen
     */
    triggerDeath() {
      if (!ecsDb) return;

      // 1. Block input immediately
      ecsDb.transactions.setPhase('dying');

      // 2. Snapshot perf metrics into ECS resources
      perfTracker?.snapshot();
      ecsDb.transactions.snapshotRun();

      // 3. Persist run data to localStorage
      const distance = ecsDb.store?.resources?.finalDistance ?? 0;
      const fpsAvg = ecsDb.store?.resources?.finalFpsAverage ?? 0;
      saveRun(distance, fpsAvg);

      // 4. GSAP dissolve: animate runner sprite, then fade scene layers, then navigate
      const doNavigate = () => {
        // Fade both gameLayer and hudLayer so the full canvas disappears before results
        const layers = [gameLayer, hudLayer].filter(Boolean) as Container[];
        if (layers.length > 0) {
          let completed = 0;
          const onDone = () => {
            completed += 1;
            if (completed === layers.length) goto?.('results');
          };
          for (const l of layers) {
            gsap.to(l, { alpha: 0, duration: 0.2, onComplete: onDone });
          }
        } else {
          goto?.('results');
        }
      };

      if (runnerRenderer) {
        // Per-sprite death animation (alpha 1→0 + scale shrink, 0.3s) then fade scene
        void runnerRenderer.playDeath().then(doNavigate);
      } else {
        doNavigate();
      }

      setAriaText('Run ended');
    },
  };

  // Wire forward reference so collision loop can call triggerDeath
  triggerDeathFn = () => controller.triggerDeath?.();

  return controller;
};
