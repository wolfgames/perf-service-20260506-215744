/**
 * Popup Queue Controller - Priority-based FIFO queue for sequential popup display.
 *
 * Manages a queue of popups with priority ordering (high > normal > low),
 * optional auto-dismiss via tick-based timers, and capacity limits.
 *
 * Generic `T` is the popup data type, allowing game-specific payloads.
 */

import { POPUP_QUEUE_DEFAULTS } from './defaults';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PopupPriority = 'low' | 'normal' | 'high';

export interface QueuedPopup<T> {
  /** Unique identifier (auto-generated) */
  id: string;
  /** Game-specific popup payload */
  data: T;
  /** Display priority — high-priority popups jump ahead in the queue */
  priority: PopupPriority;
  /** Per-popup auto-dismiss duration in milliseconds (0 = manual only) */
  durationMs: number;
}

export interface PopupQueueConfig<T> {
  /** Maximum number of queued popups (default: 3) */
  maxStacked?: number;
  /** Default auto-dismiss duration in milliseconds; 0 = manual dismiss only (default: 3000) */
  defaultDurationMs?: number;
  /** Callback fired when a popup becomes the active (visible) popup */
  onShow: (popup: QueuedPopup<T>) => void;
  /** Callback fired when a popup is dismissed */
  onDismiss: (popup: QueuedPopup<T>) => void;
}

export interface PopupQueueController<T> {
  /**
   * Add a popup to the queue. Returns its auto-generated ID.
   * If the queue is at capacity, the lowest-priority item is dropped
   * (or the enqueue is rejected if the new item is the lowest).
   */
  enqueue(
    data: T,
    options?: { priority?: PopupPriority; durationMs?: number },
  ): string;

  /** Dismiss the current popup and immediately show the next one. */
  processNext(): void;

  /** Dismiss the current popup without auto-advancing to the next. */
  dismissCurrent(): void;

  /** Dismiss a specific popup by ID (current or pending). */
  dismiss(id: string): void;

  /** Clear the entire queue and dismiss the current popup. */
  clear(): void;

  /** The currently displayed popup, or null if none. */
  readonly current: QueuedPopup<T> | null;

  /** Read-only view of the pending (not yet shown) popups. */
  readonly pending: ReadonlyArray<QueuedPopup<T>>;

  /** Total number of popups (current + pending). */
  readonly size: number;

  /**
   * Advance the auto-dismiss timer by `deltaMs`.
   * Call this from your game loop / requestAnimationFrame.
   * When the active popup's remaining time reaches zero it is
   * auto-dismissed and the next popup is shown.
   */
  tick(deltaMs: number): void;

  /** Tear down the controller and release all references. */
  destroy(): void;
}

// ---------------------------------------------------------------------------
// Priority helpers
// ---------------------------------------------------------------------------

const PRIORITY_WEIGHT: Record<PopupPriority, number> = {
  high: 2,
  normal: 1,
  low: 0,
};

/**
 * Compare two popups for descending priority order.
 * Among equal priorities the original insertion order is preserved
 * because Array.prototype.sort is stable in all modern engines.
 */
function comparePriority<T>(a: QueuedPopup<T>, b: QueuedPopup<T>): number {
  return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let nextId = 0;

function generateId(): string {
  return `popup_${++nextId}`;
}

/**
 * Create a popup queue controller.
 */
export function createPopupQueue<T>(
  config: PopupQueueConfig<T>,
): PopupQueueController<T> {
  const maxStacked = config.maxStacked ?? POPUP_QUEUE_DEFAULTS.maxStacked;
  const defaultDurationMs =
    config.defaultDurationMs ?? POPUP_QUEUE_DEFAULTS.defaultDurationMs;

  // -----------------------------------------------------------------------
  // Internal state
  // -----------------------------------------------------------------------

  let current: QueuedPopup<T> | null = null;
  let remainingMs = 0;
  let queue: QueuedPopup<T>[] = [];
  let destroyed = false;

  // -----------------------------------------------------------------------
  // Internal helpers
  // -----------------------------------------------------------------------

  /** Activate the next popup in the queue (if any). */
  const showNext = (): void => {
    if (queue.length === 0) {
      current = null;
      remainingMs = 0;
      return;
    }

    current = queue.shift()!;
    remainingMs = current.durationMs;
    config.onShow(current);
  };

  // -----------------------------------------------------------------------
  // Public API
  // -----------------------------------------------------------------------

  const enqueue: PopupQueueController<T>['enqueue'] = (data, options) => {
    if (destroyed) return '';

    const id = generateId();
    const priority: PopupPriority = options?.priority ?? 'normal';
    const durationMs = options?.durationMs ?? defaultDurationMs;

    const popup: QueuedPopup<T> = { id, data, priority, durationMs };

    // If nothing is currently displayed, show immediately.
    if (current === null) {
      current = popup;
      remainingMs = popup.durationMs;
      config.onShow(popup);
      return id;
    }

    // Capacity check — the limit applies to pending items only.
    if (queue.length >= maxStacked) {
      // Find the lowest-priority item in the queue.
      const lowestIdx = queue.reduce(
        (minIdx, item, idx, arr) =>
          PRIORITY_WEIGHT[item.priority] < PRIORITY_WEIGHT[arr[minIdx].priority]
            ? idx
            : minIdx,
        0,
      );

      // If the new popup outranks the lowest queued item, evict it.
      if (PRIORITY_WEIGHT[priority] > PRIORITY_WEIGHT[queue[lowestIdx].priority]) {
        const evicted = queue.splice(lowestIdx, 1)[0];
        config.onDismiss(evicted);
      } else {
        // New popup is equal or lower priority — reject the enqueue.
        return id;
      }
    }

    queue.push(popup);
    queue.sort(comparePriority);

    return id;
  };

  const processNext: PopupQueueController<T>['processNext'] = () => {
    if (destroyed) return;

    if (current !== null) {
      config.onDismiss(current);
    }
    showNext();
  };

  const dismissCurrent: PopupQueueController<T>['dismissCurrent'] = () => {
    if (destroyed || current === null) return;

    config.onDismiss(current);
    current = null;
    remainingMs = 0;
  };

  const dismiss: PopupQueueController<T>['dismiss'] = (id) => {
    if (destroyed) return;

    // Check current popup.
    if (current !== null && current.id === id) {
      config.onDismiss(current);
      showNext();
      return;
    }

    // Check pending queue.
    const idx = queue.findIndex((p) => p.id === id);
    if (idx !== -1) {
      const [removed] = queue.splice(idx, 1);
      config.onDismiss(removed);
    }
  };

  const clear: PopupQueueController<T>['clear'] = () => {
    if (destroyed) return;

    if (current !== null) {
      config.onDismiss(current);
      current = null;
      remainingMs = 0;
    }

    for (const popup of queue) {
      config.onDismiss(popup);
    }
    queue = [];
  };

  const tick: PopupQueueController<T>['tick'] = (deltaMs) => {
    if (destroyed || current === null) return;

    // durationMs of 0 means manual dismiss only — skip timer logic.
    if (current.durationMs === 0) return;

    remainingMs -= deltaMs;

    if (remainingMs <= 0) {
      config.onDismiss(current);
      showNext();
    }
  };

  const destroyController = (): void => {
    destroyed = true;
    current = null;
    remainingMs = 0;
    queue = [];
  };

  // -----------------------------------------------------------------------
  // Frozen controller
  // -----------------------------------------------------------------------

  return Object.freeze({
    enqueue,
    processNext,
    dismissCurrent,
    dismiss,
    clear,
    tick,
    destroy: destroyController,

    get current() {
      return current;
    },
    get pending(): ReadonlyArray<QueuedPopup<T>> {
      return queue;
    },
    get size() {
      return (current !== null ? 1 : 0) + queue.length;
    },
  });
}
