/**
 * Runner entity — ECS component setup for the player-controlled runner.
 *
 * State:
 *   - Position (x,y): runner X locked to 30% screen width; Y moves with physics
 *   - Velocity (vx,vy): vy set on jump/gravity; vx always 0 (camera moves)
 *   - jumpCount (0-2): resets on landing
 *   - runnerState: idle|running|airborne|crouching|dying
 *
 * The runner's position in world-space is tracked by ECS resources (runnerX, runnerY).
 * PhysicsSystem reads/writes these resources each frame.
 */

export const RUNNER_SCREEN_X_RATIO = 0.3; // runner locked at 30% screen width

export interface RunnerEntityConfig {
  screenWidth: number;
  groundY: number;
}

/** Returns the fixed screen-space X position for the runner. */
export const runnerScreenX = (screenWidth: number): number =>
  Math.floor(screenWidth * RUNNER_SCREEN_X_RATIO);
