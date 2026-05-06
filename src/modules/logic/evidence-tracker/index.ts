import { EVIDENCE_TRACKER_DEFAULTS } from './defaults';

export { EVIDENCE_TRACKER_DEFAULTS } from './defaults';
export { evidenceTrackerTuning } from './tuning';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EvidenceTrackerSceneConfig {
  sceneId: string;
  items: string[];
}

export interface EvidenceTrackerConfig {
  /** Scene IDs with their item lists */
  scenes: EvidenceTrackerSceneConfig[];
  /** Maximum active clues shown at once */
  maxActiveClues?: number;
  /** Callback when an item is found */
  onFind: (itemId: string, sceneId: string) => void;
  /** Callback when all items in a scene are found */
  onSceneComplete: (sceneId: string) => void;
  /** Callback when all items across all scenes are found */
  onAllComplete: () => void;
}

export interface EvidenceTrackerController {
  /** Mark an item as found. Returns true if the item was valid and unfound. */
  markFound(itemId: string): boolean;
  /** Get current active clue item IDs (limited by maxActiveClues). */
  getActiveClues(): string[];
  /** Get all found item IDs. */
  getFoundItems(): string[];
  /** Get unfound items for a scene. */
  getUnfoundItems(sceneId: string): string[];
  /** Check whether all items in a scene have been found. */
  isSceneComplete(sceneId: string): boolean;
  /** Whether all items across all scenes have been found. */
  readonly isAllComplete: boolean;
  /** Reset tracker to initial state. */
  reset(): void;
  /** Clean up resources. */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Create an evidence tracker controller.
 *
 * Manages a set of findable items across multiple scenes, rotates active
 * clues, and emits callbacks on item-found / scene-complete / all-complete.
 */
export function createEvidenceTracker(
  config: EvidenceTrackerConfig,
): EvidenceTrackerController {
  const { scenes, onFind, onSceneComplete, onAllComplete } = config;
  const maxActiveClues =
    config.maxActiveClues ?? EVIDENCE_TRACKER_DEFAULTS.maxActiveClues;

  // -- Validation -----------------------------------------------------------
  if (scenes.length === 0) {
    throw new Error('createEvidenceTracker: scenes must not be empty');
  }
  for (const scene of scenes) {
    if (scene.items.length === 0) {
      throw new Error(
        `createEvidenceTracker: scene "${scene.sceneId}" must have at least one item`,
      );
    }
  }

  // -- Derived lookups (immutable) ------------------------------------------
  /** Map from itemId -> sceneId for O(1) scene lookup */
  const itemToScene = new Map<string, string>();
  /** Map from sceneId -> Set of all itemIds in that scene */
  const sceneItemSets = new Map<string, Set<string>>();

  for (const scene of scenes) {
    const itemSet = new Set<string>();
    for (const itemId of scene.items) {
      itemToScene.set(itemId, scene.sceneId);
      itemSet.add(itemId);
    }
    sceneItemSets.set(scene.sceneId, itemSet);
  }

  /** Ordered list of all item IDs (preserves insertion order for clue rotation) */
  const allItemIds: string[] = scenes.flatMap((s) => s.items);

  // -- Mutable state --------------------------------------------------------
  let foundItems: Set<string>;
  let activeClues: string[];

  /** Initialise / re-initialise mutable state */
  const initState = (): void => {
    foundItems = new Set<string>();
    // Seed active clues with the first N unfound items
    activeClues = allItemIds.slice(0, maxActiveClues);
  };

  initState();

  // -- Helpers --------------------------------------------------------------

  /**
   * After an item is found, rotate a new unfound item into the active clues
   * list (if any remain).
   */
  const rotateClue = (removedItemId: string): void => {
    const idx = activeClues.indexOf(removedItemId);
    if (idx === -1) return;

    // Find the next unfound item that is not already an active clue
    const activeSet = new Set(activeClues);
    const replacement = allItemIds.find(
      (id) => !foundItems.has(id) && !activeSet.has(id),
    );

    if (replacement) {
      activeClues[idx] = replacement;
    } else {
      // No replacement available — shrink the active list
      activeClues.splice(idx, 1);
    }
  };

  // -- Controller methods ---------------------------------------------------

  const markFound = (itemId: string): boolean => {
    const sceneId = itemToScene.get(itemId);
    if (!sceneId || foundItems.has(itemId)) return false;

    foundItems.add(itemId);
    rotateClue(itemId);
    onFind(itemId, sceneId);

    // Check scene completion
    const sceneItems = sceneItemSets.get(sceneId)!;
    const sceneComplete = [...sceneItems].every((id) => foundItems.has(id));
    if (sceneComplete) {
      onSceneComplete(sceneId);
    }

    // Check all-complete
    if (foundItems.size === allItemIds.length) {
      onAllComplete();
    }

    return true;
  };

  const getActiveClues = (): string[] => [...activeClues];

  const getFoundItems = (): string[] => [...foundItems];

  const getUnfoundItems = (sceneId: string): string[] => {
    const sceneItems = sceneItemSets.get(sceneId);
    if (!sceneItems) return [];
    return [...sceneItems].filter((id) => !foundItems.has(id));
  };

  const isSceneComplete = (sceneId: string): boolean => {
    const sceneItems = sceneItemSets.get(sceneId);
    if (!sceneItems) return false;
    return [...sceneItems].every((id) => foundItems.has(id));
  };

  const reset = (): void => {
    initState();
  };

  const destroy = (): void => {
    initState();
  };

  // -- Public interface (frozen) --------------------------------------------
  return Object.freeze({
    markFound,
    getActiveClues,
    getFoundItems,
    getUnfoundItems,
    isSceneComplete,
    get isAllComplete() {
      return foundItems.size === allItemIds.length;
    },
    reset,
    destroy,
  });
}
