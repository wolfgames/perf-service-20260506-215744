import type { GameTuningBase } from '~/core/systems/tuning/types';

// ============================================
// GAME TUNING TYPES — Template
//
// Add your game-specific tuning interfaces here.
// Each section maps to a Tweakpane folder in dev mode.
// ============================================

export interface DevModeConfig {
  /** Skip the start screen and go directly into gameplay */
  skipStartScreen: boolean;
}

export interface GameScreensConfig {
  startBackgroundColor: string;
  loadingBackgroundColor: string;
}

export interface GameTuning extends GameTuningBase {
  devMode: DevModeConfig;
  screens: GameScreensConfig;
}

// ============================================
// DEFAULT VALUES
// ============================================

export const GAME_DEFAULTS: GameTuning = {
  version: '1.0.0',
  devMode: {
    skipStartScreen: false,
  },
  screens: {
    startBackgroundColor: '#BCE083',
    loadingBackgroundColor: '#BCE083',
  },
};

// ============================================
// HELPERS
// ============================================

/** Parse theme from URL params — override in your game if needed */
export function getThemeFromUrl(): string | null {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('theme') ?? null;
}
