export const DIALOGUE_BOX_CHARACTER_DEFAULTS = {
  /** Scale multiplier for the character sprite */
  characterScale: 1,
  /** Horizontal offset of character relative to dialogue box */
  characterOffsetX: -20,
  /** Vertical offset of character relative to dialogue box */
  characterOffsetY: 0,
  /** Which side the character appears on */
  characterSide: 'left' as const,
  /** Show animation: fade in duration (seconds) */
  showFadeDuration: 0.3,
  /** Show animation: easing */
  showEase: 'power2.out',
  /** Hide animation: fade out duration (seconds) */
  hideFadeDuration: 0.25,
  /** Hide animation: easing */
  hideEase: 'power2.in',
};
