export const SCREEN_SHAKE_DEFAULTS = {
  /** Light shake intensity in pixels */
  lightIntensity: 2,
  /** Medium shake intensity in pixels */
  mediumIntensity: 4,
  /** Heavy shake intensity in pixels */
  heavyIntensity: 6,
  /** Duration per oscillation step in seconds */
  stepDuration: 0.017,
  /** Number of oscillation steps (decays from intensity to 0) */
  steps: 9,
  /** Y-axis intensity ratio relative to X (0 = X only, 1 = equal) */
  yRatio: 0.5,
};
