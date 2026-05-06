export const TOAST_SLIDE_DEFAULTS = {
  /** Toast variant */
  variant: 'info' as const,
  /** Auto-dismiss time in ms (0 = manual dismiss) */
  durationMs: 3000,
  /** Slide direction */
  position: 'top' as const,
  /** Pixels to slide from off-screen */
  slideDistance: 64,
  /** Slide animation duration (seconds) */
  slideDuration: 0.3,
  /** Slide animation easing */
  slideEase: 'power2.out',
  /** Toast width */
  width: 300,
  /** Inner padding */
  padding: 12,
  /** Text font size */
  fontSize: 14,
  /** Text font family */
  fontFamily: 'Arial',
  /** Background corner radius */
  cornerRadius: 8,
  /** Background color per variant */
  variantColors: {
    info: 0x3b82f6,
    success: 0x22c55e,
    warning: 0xeab308,
    error: 0xef4444,
  } as const,
  /** Text color */
  textColor: 0xffffff,
  /** Background alpha */
  backgroundAlpha: 0.9,
};
