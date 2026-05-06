import { onMount, onCleanup } from 'solid-js';

import { useAssets } from '~/core/systems/assets';
import { PauseOverlay, useTuning, type ScaffoldTuning } from '~/core';
import { Logo } from '~/core/ui/Logo';
import { useAudio } from '~/core/systems/audio';
import { useGameTracking } from '~/game/setup/tracking';

import type { GameTuning } from '~/game/tuning';
import { useGameData } from '~/game/screens/useGameData';
import { gameState } from '~/game/state';

// Game-specific controller — swap this import for a different game
import { setupGame } from '~/game/mygame/screens/gameController';

export default function GameScreen() {
  const { coordinator } = useAssets();
  const tuning = useTuning<ScaffoldTuning, GameTuning>();
  const audio = useAudio();
  const gameData = useGameData();
  const { core: analytics } = useGameTracking();
  let containerRef: HTMLDivElement | undefined;

  // Setup game-specific controller (creates signals & effects in reactive context)
  const controller = setupGame({
    coordinator,
    tuning,
    audio,
    gameData,
    analytics,
  });

  onMount(() => {
    if (containerRef) controller.init(containerRef);
  });

  onCleanup(() => controller.destroy());

  return (
    <div class="fixed inset-0 bg-black">
      {/* Engine canvas container */}
      <div
        ref={containerRef}
        class="absolute inset-0"
      />

      {/* Accessibility: Screen reader announcements */}
      <div
        class="sr-only"
        aria-live="polite"
        aria-atomic="true"
      >
        {controller.ariaText()}
      </div>

      {/* Pause overlay */}
      <PauseOverlay />

      {/* Wolf Games logo at bottom center */}
      <div class="absolute bottom-8 left-1/2 -translate-x-1/2">
        <Logo />
      </div>
    </div>
  );
}
