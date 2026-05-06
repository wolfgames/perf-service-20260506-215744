/**
 * Start Screen View — DOM mode template
 *
 * Called by screens/StartScreen.tsx — the bridge between Solid.js and your start screen.
 *
 * In DOM mode: the Play button loads core + audio bundles, then navigates.
 * In Pixi mode: you can also call initGpu() here to set up the GPU early,
 * then build your start screen scene graph with PixiJS.
 */

import type {
  StartScreenDeps,
  StartScreenController,
  SetupStartScreen,
} from '~/game/mygame-contract';

export const setupStartScreen: SetupStartScreen = (deps: StartScreenDeps): StartScreenController => {
  let wrapper: HTMLDivElement | null = null;

  return {
    backgroundColor: '#BCE083',

    init(container: HTMLDivElement) {
      console.log('[mygame] Start screen initialized');

      wrapper = document.createElement('div');
      wrapper.style.cssText =
        'display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:24px;';

      const title = document.createElement('h1');
      title.textContent = 'Start Screen';
      title.style.cssText =
        'font-size:2.5rem;font-weight:700;color:#2d5016;margin:0;font-family:system-ui,sans-serif;';

      const playBtn = document.createElement('button');
      playBtn.textContent = 'Play';
      playBtn.style.cssText =
        'font-size:1.25rem;font-weight:600;padding:14px 48px;border:none;border-radius:12px;' +
        'background:#4a8c1c;color:#fff;cursor:pointer;font-family:system-ui,sans-serif;' +
        'box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:transform 0.1s,box-shadow 0.1s;';
      playBtn.onmouseenter = () => { playBtn.style.transform = 'scale(1.05)'; };
      playBtn.onmouseleave = () => { playBtn.style.transform = 'scale(1)'; };

      playBtn.addEventListener('click', async () => {
        playBtn.disabled = true;
        playBtn.textContent = 'Loading...';
        await deps.initGpu();
        deps.unlockAudio();
        await deps.loadCore();
        try { await deps.loadAudio(); } catch { /* audio optional */ }
        deps.analytics.trackGameStart({ start_source: 'play_button', is_returning_player: false });
        deps.goto('game');
      }, { once: true });

      wrapper.append(title, playBtn);
      container.append(wrapper);
    },

    destroy() {
      wrapper?.remove();
      wrapper = null;
      console.log('[mygame] Start screen destroyed');
    },
  };
}
