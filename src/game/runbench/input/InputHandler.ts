/**
 * InputHandler — tap / tap-and-hold gesture detection.
 *
 * Detects two gestures from pointer events:
 *   tap     (<200ms pointer-down-to-up) → calls onJump
 *   hold    (≥200ms pointer-down-held)  → calls onCrouchStart
 *           pointerup after hold        → calls onCrouchEnd
 *
 * Uses pointer events (pointerdown/pointerup) exclusively per core-interaction CoS.
 * Sets touch-action:none on the canvas container to block browser gestures.
 *
 * All actions are blocked when getPhase() === 'dying'.
 */

import type { RunPhase } from '../state/RunBenchPlugin';

export const TAP_THRESHOLD_MS = 200; // ms — below = tap/jump, at/above = crouch

export interface InputHandlerOptions {
  canvas: HTMLElement;
  getPhase: () => RunPhase;
  onJump: () => void;
  onCrouchStart: () => void;
  onCrouchEnd: () => void;
}

export interface InputHandlerInstance {
  mount: () => void;
  destroy: () => void;
  /** Exposed for unit testing — called with pointer events */
  handlePointerDown: (e: PointerEvent) => void;
  handlePointerUp: (e: PointerEvent) => void;
  handlePointerCancel: (e: PointerEvent) => void;
}

export const createInputHandler = ({
  canvas,
  getPhase,
  onJump,
  onCrouchStart,
  onCrouchEnd,
}: InputHandlerOptions): InputHandlerInstance => {
  let pointerDownTime = -1;
  let holdFired = false;
  let holdTimeout: ReturnType<typeof setTimeout> | null = null;

  const clearHoldTimeout = () => {
    if (holdTimeout !== null) {
      clearTimeout(holdTimeout);
      holdTimeout = null;
    }
  };

  const handlePointerDown = (e: PointerEvent): void => {
    if (getPhase() === 'dying') return;
    e.preventDefault?.();

    pointerDownTime = e.timeStamp ?? Date.now();
    holdFired = false;

    // Schedule crouch activation at TAP_THRESHOLD_MS
    holdTimeout = setTimeout(() => {
      if (getPhase() !== 'dying') {
        holdFired = true;
        onCrouchStart();
      }
    }, TAP_THRESHOLD_MS);
  };

  const handlePointerUp = (e: PointerEvent): void => {
    const phase = getPhase();
    clearHoldTimeout();

    if (pointerDownTime === -1) return;

    if (phase === 'dying') {
      pointerDownTime = -1;
      holdFired = false;
      return;
    }

    const elapsed = (e.timeStamp ?? Date.now()) - pointerDownTime;
    pointerDownTime = -1;

    if (holdFired) {
      // Hold was active — end crouch
      onCrouchEnd();
    } else if (elapsed < TAP_THRESHOLD_MS) {
      // Short tap — jump
      onJump();
    }
    holdFired = false;
  };

  const handlePointerCancel = (_e: PointerEvent): void => {
    clearHoldTimeout();
    if (holdFired) onCrouchEnd();
    pointerDownTime = -1;
    holdFired = false;
  };

  const mount = (): void => {
    // Block browser swipe/zoom/tap-highlight on the game canvas
    canvas.style['touch-action'] = 'none';
    canvas.style['user-select'] = 'none';
    (canvas.style as Record<string, string>)['-webkit-user-select'] = 'none';

    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerCancel);
  };

  const destroy = (): void => {
    clearHoldTimeout();
    canvas.removeEventListener('pointerdown', handlePointerDown);
    canvas.removeEventListener('pointerup', handlePointerUp);
    canvas.removeEventListener('pointercancel', handlePointerCancel);
  };

  return { mount, destroy, handlePointerDown, handlePointerUp, handlePointerCancel };
};
