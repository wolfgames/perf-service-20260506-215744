export const ROTATABLE_TILE_DEFAULTS = {
  /** Tile size in pixels */
  tileSize: 64,
  /** Overlap in pixels to eliminate sub-pixel gaps between tiles */
  overlapPx: 1,
  /** Rotation animation duration in ms */
  rotationDurationMs: 200,
  /** Rotation animation easing */
  rotationEase: 'power2.out',
  /** Jiggle angle in degrees */
  jiggleAngle: 8,
  /** Jiggle half-duration in seconds */
  jiggleHalfDuration: 0.06,
  /** Jiggle easing */
  jiggleEase: 'sine.inOut',
  /** Jiggle cycles */
  jiggleCycles: 2,
  /** Flash intensity on jiggle (0 = none, 1 = full white) */
  jiggleFlashIntensity: 0.3,
};
