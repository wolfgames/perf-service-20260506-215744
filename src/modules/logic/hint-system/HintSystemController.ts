/**
 * Hint System Controller - Manages hint availability, cooldowns, and activation.
 *
 * Cooldown grows exponentially with each use:
 *   currentCooldown = baseCooldownMs * (growthFactor ^ hintsUsed)
 *
 * The caller drives time via `tick(deltaMs)` each frame.
 */

import { HINT_SYSTEM_DEFAULTS } from './defaults';

/** Configuration for creating a hint system controller */
export interface HintSystemConfig {
  /** Base cooldown between hints (ms) */
  baseCooldownMs?: number;
  /** Exponential cooldown growth per hint used */
  growthFactor?: number;
  /** Max total hints available (Infinity = unlimited) */
  maxHints?: number;
  /** Callback fired when a hint activates, receives the target item id */
  onHintActivated: (targetItemId: string) => void;
  /** Callback to get the current best hint target; return null if none available */
  getTargetItem: () => string | null;
}

/** Public controller interface */
export interface HintSystemController {
  /** Attempt to use a hint. Returns true if the hint fired. */
  useHint(): boolean;
  /** Milliseconds remaining on the current cooldown */
  readonly cooldownRemaining: number;
  /** Whether the system is currently on cooldown */
  readonly isOnCooldown: boolean;
  /** Total hints used so far */
  readonly hintsUsed: number;
  /** Hints remaining (maxHints - hintsUsed). Infinity if unlimited. */
  readonly hintsRemaining: number;
  /** Advance the cooldown timer. Call each frame with frame delta. */
  tick(deltaMs: number): void;
  /** Reset to initial state */
  reset(): void;
  /** Clean up */
  destroy(): void;
}

/**
 * Create a hint system controller.
 */
export function createHintSystem(config: HintSystemConfig): HintSystemController {
  const baseCooldownMs = config.baseCooldownMs ?? HINT_SYSTEM_DEFAULTS.baseCooldownMs;
  const growthFactor = config.growthFactor ?? HINT_SYSTEM_DEFAULTS.growthFactor;
  const maxHints = config.maxHints ?? HINT_SYSTEM_DEFAULTS.maxHints;
  const { onHintActivated, getTargetItem } = config;

  // Mutable state
  let hintsUsed = 0;
  let cooldownRemaining = 0;

  /**
   * Calculate cooldown for the next hint based on how many have been used.
   * Formula: baseCooldownMs * growthFactor ^ hintsUsed
   */
  const calculateCooldown = (): number => {
    return baseCooldownMs * growthFactor ** hintsUsed;
  };

  /**
   * Attempt to use a hint.
   */
  const useHint = (): boolean => {
    // Cannot use while on cooldown
    if (cooldownRemaining > 0) {
      return false;
    }

    // Cannot exceed max hints
    if (hintsUsed >= maxHints) {
      return false;
    }

    // Must have a valid target
    const targetItemId = getTargetItem();
    if (targetItemId === null) {
      return false;
    }

    // Apply hint
    hintsUsed += 1;
    cooldownRemaining = calculateCooldown();
    onHintActivated(targetItemId);

    return true;
  };

  /**
   * Advance cooldown timer by deltaMs.
   */
  const tick = (deltaMs: number): void => {
    if (cooldownRemaining > 0) {
      cooldownRemaining = Math.max(0, cooldownRemaining - deltaMs);
    }
  };

  /**
   * Reset to initial state.
   */
  const reset = (): void => {
    hintsUsed = 0;
    cooldownRemaining = 0;
  };

  /**
   * Clean up resources.
   */
  const destroy = (): void => {
    hintsUsed = 0;
    cooldownRemaining = 0;
  };

  return Object.freeze({
    useHint,
    tick,
    reset,
    destroy,

    get cooldownRemaining() {
      return cooldownRemaining;
    },

    get isOnCooldown() {
      return cooldownRemaining > 0;
    },

    get hintsUsed() {
      return hintsUsed;
    },

    get hintsRemaining() {
      return maxHints - hintsUsed;
    },
  });
}
