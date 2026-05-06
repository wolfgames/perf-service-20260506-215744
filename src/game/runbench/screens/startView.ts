/**
 * RunBench Start Screen — DOM mode.
 *
 * Shows the game title, best distance (from localStorage), a START button,
 * and a performance tier badge (if run count > 0). Reads from runStorage at
 * mount — DOM lifecycle is correct for localStorage access per GDD analysis.
 */

import type {
  StartScreenController,
  StartScreenDeps,
  SetupStartScreen,
} from '~/game/mygame-contract';
import {
  loadBestDistance,
  loadRunCount,
  loadLastFpsAvg,
} from '../storage/runStorage';
import { fpsTier } from '../systems/PerfTracker';

export const setupStartScreen: SetupStartScreen = (deps: StartScreenDeps): StartScreenController => {
  let wrapper: HTMLDivElement | null = null;

  return {
    backgroundColor: '#0a0a0f',

    init(container: HTMLDivElement) {
      const bestDistance = loadBestDistance();
      const runCount = loadRunCount();
      const lastFpsAvg = loadLastFpsAvg();

      wrapper = document.createElement('div');
      wrapper.style.cssText =
        'display:flex;flex-direction:column;align-items:center;justify-content:center;' +
        'height:100%;gap:24px;padding:0 24px;box-sizing:border-box;';

      // Title
      const title = document.createElement('h1');
      title.textContent = 'RunBench';
      title.style.cssText =
        'font-size:3rem;font-weight:900;color:#fff;margin:0;font-family:system-ui,sans-serif;' +
        'letter-spacing:-0.02em;';

      // Best distance
      const bestLabel = document.createElement('p');
      bestLabel.textContent = `Best: ${bestDistance}m`;
      bestLabel.style.cssText =
        'font-size:1.25rem;color:rgba(255,255,255,0.6);margin:0;font-family:system-ui,sans-serif;';

      // Performance tier badge (only when run count > 0)
      const tierBadge = document.createElement('div');
      if (runCount > 0) {
        const tier = fpsTier(lastFpsAvg);
        tierBadge.textContent = tier;
        tierBadge.style.cssText =
          'font-size:0.875rem;font-weight:700;color:#0a0a0f;background:#e2e8f0;' +
          'padding:4px 12px;border-radius:9999px;font-family:system-ui,sans-serif;' +
          'text-transform:uppercase;letter-spacing:0.05em;';
      }

      // START button (≥44px height, centered in bottom-center thumb zone)
      const startBtn = document.createElement('button');
      startBtn.textContent = 'START';
      startBtn.style.cssText =
        'font-size:1.25rem;font-weight:700;padding:14px 64px;border:none;border-radius:16px;' +
        'background:#6366f1;color:#fff;cursor:pointer;font-family:system-ui,sans-serif;' +
        'min-height:52px;min-width:180px;' +
        'box-shadow:0 4px 20px rgba(99,102,241,0.4);' +
        'transition:transform 0.08s ease,box-shadow 0.08s ease;';

      // Visual tap response < 100ms via CSS pointer feedback
      startBtn.addEventListener('pointerdown', () => {
        startBtn.style.transform = 'scale(0.96)';
        startBtn.style.boxShadow = '0 2px 8px rgba(99,102,241,0.3)';
      });
      startBtn.addEventListener('pointerup', () => {
        startBtn.style.transform = 'scale(1)';
        startBtn.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)';
      });
      startBtn.addEventListener('pointerleave', () => {
        startBtn.style.transform = 'scale(1)';
        startBtn.style.boxShadow = '0 4px 20px rgba(99,102,241,0.4)';
      });

      startBtn.addEventListener('click', async () => {
        startBtn.disabled = true;
        startBtn.textContent = 'Loading...';
        await deps.initGpu();
        deps.unlockAudio();
        await deps.loadCore();
        try { await deps.loadAudio(); } catch { /* audio optional */ }
        deps.analytics.trackGameStart({ start_source: 'start_button', is_returning_player: runCount > 0 });
        deps.goto('game');
      }, { once: true });

      wrapper.append(title, bestLabel);
      if (runCount > 0) wrapper.append(tierBadge);
      wrapper.append(startBtn);
      container.append(wrapper);
    },

    destroy() {
      wrapper?.remove();
      wrapper = null;
    },
  };
};
