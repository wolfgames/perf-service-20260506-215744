import { useAnalyticsService } from '@wolfgames/components/solid';
import type { AnalyticsService } from '@wolfgames/game-kit';
import {
  gameStartSchema,
  audioSettingChangedSchema,
  screenEnterSchema,
  screenExitSchema,
  errorCapturedSchema,
} from './events';

// ============================================================================
// GAME TRACKING HOOK
// ============================================================================

export interface GameTracking {
  trackGameStart: (params: typeof gameStartSchema.infer) => void;
  trackAudioSettingChanged: (params: typeof audioSettingChangedSchema.infer) => void;
  trackScreenView: (params: typeof screenEnterSchema.infer) => void;
  trackScreenExit: (params: typeof screenExitSchema.infer) => void;
  trackError: (params: typeof errorCapturedSchema.infer) => void;
  service: AnalyticsService;
}

export function useGameTracking(): GameTracking {
  const service = useAnalyticsService();

  return {
    trackGameStart: service.createTracker('game_start', gameStartSchema, ['base'], {}),
    trackAudioSettingChanged: service.createTracker('audio_setting_changed', audioSettingChangedSchema, ['base'], {}),
    trackScreenView: service.createTracker('screen_enter', screenEnterSchema, ['base'], {}),
    trackScreenExit: service.createTracker('screen_exit', screenExitSchema, ['base'], {}),
    trackError: service.createTracker('error_captured', errorCapturedSchema, ['base'], {}),
    service,
  };
}
