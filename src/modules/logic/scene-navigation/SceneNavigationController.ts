/**
 * Scene Navigation Controller - Manages ordered scene navigation with unlocking.
 *
 * Tracks which scenes are available, which are unlocked, and handles
 * transitions between them. Scenes can be gated behind item discovery
 * (unlockRequiredItemId) and optionally enforced in sequential order.
 */

import { SCENE_NAVIGATION_DEFAULTS } from './defaults';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Definition of a single scene. */
export interface SceneDef {
  /** Unique scene identifier */
  id: string;
  /** Human-readable label */
  label: string;
  /** Item that must be found to unlock this scene */
  unlockRequiredItemId?: string;
}

/** Configuration for createSceneNavigation. */
export interface SceneNavigationConfig {
  /** Ordered list of scenes */
  scenes: SceneDef[];
  /** Scene IDs unlocked at start (defaults to first scene only) */
  initialUnlocked?: string[];
  /** If true, scenes must be unlocked in order */
  sequentialMode?: boolean;
  /** Callback when the player navigates between scenes */
  onSceneChange: (fromId: string | null, toId: string) => void;
  /** Callback when a scene becomes unlocked */
  onSceneUnlocked: (sceneId: string) => void;
  /** Transition time between scenes (ms) */
  transitionDurationMs?: number;
}

/** Public controller interface returned by the factory. */
export interface SceneNavigationController {
  /** Navigate to a scene by ID. Returns false if the scene is locked or a transition is in progress. */
  goToScene(sceneId: string): boolean;
  /** ID of the currently active scene, or null if none. */
  readonly currentSceneId: string | null;
  /** Index of the current scene in the scenes array. */
  readonly currentSceneIndex: number;
  /** IDs of all unlocked scenes. */
  readonly unlockedSceneIds: ReadonlyArray<string>;
  /** The full ordered scene list. */
  readonly scenes: ReadonlyArray<SceneDef>;
  /** Manually unlock a scene by ID. */
  unlockScene(sceneId: string): void;
  /** Check whether a scene is unlocked. */
  isUnlocked(sceneId: string): boolean;
  /** Whether a scene transition is currently in progress. */
  readonly isTransitioning: boolean;
  /** Navigate to the next scene in order. Returns false if already at the last scene or locked. */
  goToNext(): boolean;
  /** Navigate to the previous scene in order. Returns false if already at the first scene or locked. */
  goToPrevious(): boolean;
  /** Reset the controller to its initial state. */
  reset(): void;
  /** Tear down the controller and cancel pending timers. */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create a scene navigation controller.
 */
export function createSceneNavigation(
  config: SceneNavigationConfig,
): SceneNavigationController {
  const { scenes, onSceneChange, onSceneUnlocked } = config;
  const sequentialMode =
    config.sequentialMode ?? SCENE_NAVIGATION_DEFAULTS.sequentialMode;
  const transitionDurationMs =
    config.transitionDurationMs ??
    SCENE_NAVIGATION_DEFAULTS.transitionDurationMs;

  // Build the set of valid scene IDs for fast lookup.
  const sceneIdSet = new Set(scenes.map((s) => s.id));

  // Resolve initial unlocked set, defaulting to the first scene.
  const resolveInitialUnlocked = (): Set<string> => {
    const ids = config.initialUnlocked ?? [scenes[0]?.id].filter(Boolean);
    // Validate that every provided ID exists in the scene list.
    for (const id of ids) {
      if (!sceneIdSet.has(id)) {
        console.warn(
          `[SceneNavigation] initialUnlocked ID "${id}" does not exist in scenes — ignoring.`,
        );
      }
    }
    return new Set(ids.filter((id) => sceneIdSet.has(id)));
  };

  // ---------------------------------------------------------------------------
  // Mutable state
  // ---------------------------------------------------------------------------

  let unlockedIds = resolveInitialUnlocked();
  let currentId: string | null = null;
  let transitioning = false;
  let transitionTimerId: number | null = null;

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  const clearTransitionTimer = (): void => {
    if (transitionTimerId !== null) {
      clearTimeout(transitionTimerId);
      transitionTimerId = null;
    }
  };

  const indexOfScene = (sceneId: string): number =>
    scenes.findIndex((s) => s.id === sceneId);

  // ---------------------------------------------------------------------------
  // Public methods
  // ---------------------------------------------------------------------------

  const goToScene = (sceneId: string): boolean => {
    if (transitioning) return false;
    if (!sceneIdSet.has(sceneId)) return false;
    if (!unlockedIds.has(sceneId)) return false;

    const fromId = currentId;

    // Already there — treat as no-op success.
    if (fromId === sceneId) return true;

    if (transitionDurationMs > 0) {
      transitioning = true;
      currentId = sceneId;
      onSceneChange(fromId, sceneId);

      transitionTimerId = window.setTimeout(() => {
        transitionTimerId = null;
        transitioning = false;
      }, transitionDurationMs);
    } else {
      currentId = sceneId;
      onSceneChange(fromId, sceneId);
    }

    return true;
  };

  const goToNext = (): boolean => {
    if (currentId === null) {
      // Navigate to the first unlocked scene.
      const first = scenes.find((s) => unlockedIds.has(s.id));
      return first ? goToScene(first.id) : false;
    }
    const idx = indexOfScene(currentId);
    if (idx === -1 || idx >= scenes.length - 1) return false;
    return goToScene(scenes[idx + 1].id);
  };

  const goToPrevious = (): boolean => {
    if (currentId === null) return false;
    const idx = indexOfScene(currentId);
    if (idx <= 0) return false;
    return goToScene(scenes[idx - 1].id);
  };

  const unlockScene = (sceneId: string): void => {
    if (!sceneIdSet.has(sceneId)) return;
    if (unlockedIds.has(sceneId)) return;

    if (sequentialMode) {
      // In sequential mode, only allow unlocking the next scene in order.
      const lastUnlockedIndex = scenes.reduce(
        (max, s, i) => (unlockedIds.has(s.id) ? Math.max(max, i) : max),
        -1,
      );
      const sceneIndex = indexOfScene(sceneId);
      if (sceneIndex !== lastUnlockedIndex + 1) return;
    }

    unlockedIds.add(sceneId);
    onSceneUnlocked(sceneId);
  };

  const isUnlocked = (sceneId: string): boolean => unlockedIds.has(sceneId);

  const reset = (): void => {
    clearTransitionTimer();
    transitioning = false;
    currentId = null;
    unlockedIds = resolveInitialUnlocked();
  };

  const destroy = (): void => {
    clearTransitionTimer();
    transitioning = false;
    currentId = null;
  };

  // ---------------------------------------------------------------------------
  // Frozen controller
  // ---------------------------------------------------------------------------

  return Object.freeze({
    goToScene,
    get currentSceneId() {
      return currentId;
    },
    get currentSceneIndex() {
      return currentId !== null ? indexOfScene(currentId) : -1;
    },
    get unlockedSceneIds(): ReadonlyArray<string> {
      return Array.from(unlockedIds);
    },
    get scenes(): ReadonlyArray<SceneDef> {
      return scenes;
    },
    unlockScene,
    isUnlocked,
    get isTransitioning() {
      return transitioning;
    },
    goToNext,
    goToPrevious,
    reset,
    destroy,
  });
}
