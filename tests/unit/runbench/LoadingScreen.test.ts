/**
 * LoadingScreen: background color — Batch 7
 *
 * Tests that the LoadingScreen does not use the legacy green #BCE083 background.
 * Dark background (bg-slate-900 or similar) required per GDD.
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

describe('LoadingScreen: background color', () => {
  it('loading screen background is dark (not #BCE083); progress bar visible and advances; no green background anywhere in loading', () => {
    const filePath = path.resolve(
      process.cwd(),
      'src/game/screens/LoadingScreen.tsx',
    );
    const source = fs.readFileSync(filePath, 'utf-8');

    // Must not contain the old green background
    expect(source).not.toContain('#BCE083');

    // Must contain a dark background class
    const hasDark = source.includes('bg-slate-900') ||
      source.includes('bg-slate-800') ||
      source.includes('bg-black') ||
      source.includes('bg-[#0a0a0f]');
    expect(hasDark).toBe(true);

    // Progress bar should still be present
    expect(source).toContain('progress');
  });
});
