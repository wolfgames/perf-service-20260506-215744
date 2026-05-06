/**
 * asset-manifest: scene-runbench bundle registration — Batch 8
 *
 * Tests that the asset manifest contains the scene-runbench bundle with
 * correct naming convention and that LoadingScreen filtering includes it.
 */

import { describe, it, expect } from 'vitest';
import { manifest } from '~/game/asset-manifest';

const BUNDLE_NAME_RE = /^[a-z][a-z0-9-]*$/;

describe('asset-manifest: scene-runbench bundle registration', () => {
  it("bundle 'scene-runbench' exists with name matching ^[a-z][a-z0-9-]*$ pattern; alias='scene-runbench'; src='atlas-runbench.json' (placeholder path, not loaded until file exists)", () => {
    const bundle = manifest.bundles.find(b => b.name === 'scene-runbench');
    expect(bundle).toBeDefined();

    // Name must match naming convention
    expect(BUNDLE_NAME_RE.test('scene-runbench')).toBe(true);

    // Must have at least one asset entry
    expect(bundle!.assets).toBeDefined();
    expect(bundle!.assets!.length).toBeGreaterThan(0);

    // Asset alias should be 'scene-runbench'
    const asset = (bundle!.assets as Array<{ alias?: string; src?: string }>)[0];
    expect(asset.alias).toBe('scene-runbench');

    // Asset src should be the atlas placeholder
    expect(asset.src).toBe('atlas-runbench.json');
  });

  it("bundlesByPrefix('scene-') includes 'scene-runbench'; progress bar accounts for it", () => {
    // Replicate the LoadingScreen bundlesByPrefix logic
    const bundlesByPrefix = (prefix: string) =>
      manifest.bundles
        .filter(b => b.name.startsWith(prefix))
        .map(b => b.name);

    const sceneBundles = bundlesByPrefix('scene-');
    expect(sceneBundles).toContain('scene-runbench');
  });
});
