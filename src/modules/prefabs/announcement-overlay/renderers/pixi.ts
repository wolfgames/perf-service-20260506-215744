import { Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '~/modules/primitives/_base';
import { SpriteButton, type SpriteButtonConfig } from '~/modules/primitives/sprite-button';
import { ANNOUNCEMENT_OVERLAY_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a AnnouncementOverlay
 */
export interface AnnouncementOverlayConfig {
  /** Screen width */
  screenWidth: number;
  /** Screen height */
  screenHeight: number;
  /** Font family for headline */
  fontFamily?: string;
  /** SpriteButton config for the action button */
  button: SpriteButtonConfig & { gpuLoader: PixiLoader };
}

/**
 * Data to populate the overlay when shown
 */
export interface AnnouncementOverlayData {
  /** Headline text */
  headline: string;
}

/**
 * AnnouncementOverlay — full-screen overlay with headline + action button.
 *
 * Provides choreographed entrance: backdrop fade → headline pop → button bounce.
 * Optionally accepts child renderables (companion character, dialogue box) that
 * get added to the content area and included in the entrance stagger.
 */
export class AnnouncementOverlay extends PixiRenderable {
  private backdrop: Graphics;
  private headlineBox: PixiRenderable;
  private headlineText: Text;
  private headlineBg: Graphics;
  private actionButton: SpriteButton;
  private contentSlots: PixiRenderable[] = [];
  private entranceTl: gsap.core.Timeline | null = null;

  private screenWidth: number;
  private screenHeight: number;

  constructor(gpuLoader: PixiLoader, config: AnnouncementOverlayConfig) {
    super('announcement-overlay');

    const d = ANNOUNCEMENT_OVERLAY_DEFAULTS;
    this.screenWidth = config.screenWidth;
    this.screenHeight = config.screenHeight;

    // Backdrop
    this.backdrop = new Graphics();
    this.backdrop.rect(0, 0, config.screenWidth, config.screenHeight);
    this.backdrop.fill({ color: d.backdropColor });
    this.backdrop.alpha = 0;
    this.backdrop.eventMode = 'static';
    this.addChild(this.backdrop);

    // Headline box
    this.headlineBox = new PixiRenderable('headline-box');

    this.headlineBg = new Graphics();
    this.headlineBox.addChild(this.headlineBg);

    this.headlineText = new Text({
      text: '',
      style: {
        fontFamily: config.fontFamily ?? 'sans-serif',
        fontSize: d.headlineFontSize,
        fontWeight: 'bold',
        fill: '#ffffff',
        stroke: { color: '#000000', width: d.headlineBorderWidth },
        align: 'center',
      },
    });
    this.headlineText.anchor.set(0.5);
    this.headlineBox.addChild(this.headlineText);

    this.addChild(this.headlineBox);

    // Action button
    this.actionButton = new SpriteButton(config.button.gpuLoader, config.button);
    this.addChild(this.actionButton);

    this.visible = false;
  }

  /**
   * Add a renderable to the content area (will be staggered into entrance).
   * Call before show().
   */
  addContent(renderable: PixiRenderable): void {
    this.contentSlots.push(renderable);
    this.addChild(renderable);
  }

  /** Show the overlay with a choreographed entrance */
  show(data: AnnouncementOverlayData): void {
    const d = ANNOUNCEMENT_OVERLAY_DEFAULTS;
    const cx = this.screenWidth / 2;

    // Populate headline
    this.headlineText.text = data.headline;
    const boxW = this.headlineText.width + d.headlinePadX * 2;
    const boxH = this.headlineText.height + d.headlinePadY * 2;
    this.headlineBg.clear();
    this.headlineBg.roundRect(-boxW / 2, -boxH / 2, boxW, boxH, d.headlineBgRadius);
    this.headlineBg.fill({ color: d.headlineBgColor });
    this.headlineBg.stroke({ color: d.headlineBorderColor, width: d.headlineBorderWidth });

    // Layout
    this.headlineBox.x = cx;
    this.headlineBox.y = this.screenHeight * d.headlineYPercent;
    this.actionButton.x = cx;
    this.actionButton.y = this.screenHeight * d.buttonYPercent;

    // Initial states
    this.visible = true;
    gsap.set(this.backdrop, { alpha: 0 });
    gsap.set(this.headlineBox, { alpha: 0 });
    gsap.set(this.headlineBox.scale, { x: 0.5, y: 0.5 });
    gsap.set(this.actionButton, { alpha: 0 });
    gsap.set(this.actionButton.scale, { x: 0.5, y: 0.5 });
    for (const slot of this.contentSlots) {
      gsap.set(slot, { alpha: 0 });
      gsap.set(slot.scale, { x: 0, y: 0 });
    }

    // Choreographed entrance
    const tl = gsap.timeline();
    this.entranceTl = tl;

    // 1. Backdrop fade
    tl.to(this.backdrop, { alpha: d.backdropAlpha, duration: d.backdropFadeDuration, ease: 'power2.out' });

    // 2. Headline pop
    tl.to(this.headlineBox, { alpha: 1, duration: d.popInDuration, ease: d.popInEase }, '-=0.1');
    tl.to(this.headlineBox.scale, { x: 1, y: 1, duration: d.popInDuration, ease: d.popInEase }, '<');

    // 3. Content slots stagger
    for (const slot of this.contentSlots) {
      tl.to(slot, { alpha: 1, duration: d.popInDuration, ease: d.popInEase }, `+=${d.stagger}`);
      tl.to(slot.scale, { x: 1, y: 1, duration: d.popInDuration, ease: d.popInEase }, '<');
    }

    // 4. Button bounce
    tl.to(this.actionButton, { alpha: 1, duration: d.popInDuration, ease: d.popInEase }, `+=${d.stagger}`);
    tl.to(this.actionButton.scale, { x: 1, y: 1, duration: d.popInDuration, ease: d.popInEase }, '<');
  }

  /** Hide the overlay */
  hide(): void {
    if (this.entranceTl) {
      this.entranceTl.kill();
      this.entranceTl = null;
    }

    gsap.to(this, {
      alpha: 0,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        this.visible = false;
        this.alpha = 1;
      },
    });
  }

  /** Resize the overlay */
  override resize(width: number, height: number): void {
    this.screenWidth = width;
    this.screenHeight = height;
    this.backdrop.clear();
    this.backdrop.rect(0, 0, width, height);
    this.backdrop.fill({ color: ANNOUNCEMENT_OVERLAY_DEFAULTS.backdropColor });
  }
}
