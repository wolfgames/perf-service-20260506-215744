/**
 * PhysicsSystem — pure step function for runner physics.
 *
 * No Pixi imports, no Math.random(), no DOM reads. All physics values
 * are deterministic given the input state + dt. This makes the system
 * fully testable in isolation.
 *
 * Physics constants (from GDD + resolved questions):
 *   GRAVITY         = 2200 px/s²   (downward acceleration)
 *   JUMP_VY         = -900 px/s    (initial jump velocity)
 *   DOUBLE_JUMP_VY  = -700 px/s    (double-jump velocity)
 *   MAX_JUMP_COUNT  = 2            (max jumps before landing)
 *   GROUND_Y        = 600          (runner's resting Y on screen, px)
 *   RUNNER_HEIGHT   = 48           (full hitbox height, px)
 *   RUNNER_WIDTH    = 32           (hitbox width, px)
 *
 * Camera behavior:
 *   Runner X is locked to 30% of screen width. The world scrolls left.
 *   Camera Y tracks runner Y with an 80ms lag (exponential approach).
 */

export const GRAVITY = 2200; // px/s²
export const JUMP_VY = -900; // px/s
export const DOUBLE_JUMP_VY = -700; // px/s
export const MAX_JUMP_COUNT = 2;
export const GROUND_Y = 600; // px (runner resting Y from screen top)
export const RUNNER_WIDTH = 32; // px
export const RUNNER_HEIGHT = 48; // px
export const CROUCH_HEIGHT_RATIO = 0.5; // hitbox shrinks to 50% when crouching

// ── State types ─────────────────────────────────────────────────────────────

export type RunnerPhysicsState = 'idle' | 'running' | 'airborne' | 'crouching' | 'dying';

export interface RunnerState {
  x: number;
  y: number;
  velX: number;
  velY: number;
  jumpCount: number;
  state: RunnerPhysicsState;
  hitboxWidth: number;
  hitboxHeight: number;
  /** Set to true for exactly one frame after landing — used to trigger squash animation */
  landEvent: boolean;
}

export interface PhysicsAction {
  action?: 'jump' | 'crouch-start' | 'crouch-end' | 'die';
}

// ── Factory ─────────────────────────────────────────────────────────────────

export const createRunnerState = (): RunnerState => ({
  x: 0,
  y: GROUND_Y,
  velX: 0,
  velY: 0,
  jumpCount: 0,
  state: 'running',
  hitboxWidth: RUNNER_WIDTH,
  hitboxHeight: RUNNER_HEIGHT,
  landEvent: false,
});

// ── Step function ────────────────────────────────────────────────────────────

/**
 * Compute the next physics state given current state + input action + dt (seconds).
 * Pure function — returns a new state object.
 */
export const stepPhysics = (
  prev: RunnerState,
  input: PhysicsAction,
  dt: number,
): RunnerState => {
  if (prev.state === 'dying') return { ...prev, landEvent: false };

  let { x, y, velX, velY, jumpCount, state, hitboxWidth, hitboxHeight } = prev;
  let landEvent = false;

  // ── Handle input actions ────────────────────────────────────────────────

  switch (input.action) {
    case 'jump': {
      if (jumpCount === 0 && state !== 'crouching') {
        // First jump from ground — impulse applied, gravity deferred to next step
        velY = JUMP_VY;
        jumpCount = 1;
        state = 'airborne';
        return { x, y, velX, velY, jumpCount, state, hitboxWidth, hitboxHeight, landEvent: false };
      } else if (jumpCount === 1 && state === 'airborne') {
        // Double jump — impulse applied, gravity deferred to next step
        velY = DOUBLE_JUMP_VY;
        jumpCount = 2;
        return { x, y, velX, velY, jumpCount, state, hitboxWidth, hitboxHeight, landEvent: false };
      }
      // jumpCount === 2 or crouching: jump blocked
      break;
    }
    case 'crouch-start': {
      if (state !== 'airborne') {
        state = 'crouching';
        hitboxHeight = RUNNER_HEIGHT * CROUCH_HEIGHT_RATIO;
      }
      break;
    }
    case 'crouch-end': {
      if (state === 'crouching') {
        state = 'running';
        hitboxHeight = RUNNER_HEIGHT;
      }
      break;
    }
    case 'die': {
      state = 'dying';
      return { ...prev, state, landEvent: false };
    }
  }

  // ── Apply gravity ────────────────────────────────────────────────────────

  if (state === 'airborne') {
    velY += GRAVITY * dt;
    y += velY * dt;

    // ── Ground collision ──────────────────────────────────────────────────

    if (y >= GROUND_Y) {
      y = GROUND_Y;
      velY = 0;
      jumpCount = 0;
      state = state === 'crouching' ? 'crouching' : 'running';
      landEvent = true;
    }
  }

  return {
    x,
    y,
    velX,
    velY,
    jumpCount,
    state,
    hitboxWidth,
    hitboxHeight,
    landEvent,
  };
};
