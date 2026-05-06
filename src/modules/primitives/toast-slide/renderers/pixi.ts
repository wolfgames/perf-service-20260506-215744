import { Graphics, Text } from 'pixi.js';
import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../_base';
import { TOAST_SLIDE_DEFAULTS } from '../defaults';

type Variant = 'info' | 'success' | 'warning' | 'error';

/**
 * Configuration for creating a ToastSlide
 */
export interface ToastSlideConfig {
  /** Text content to display */
  message: string;
  /** Visual variant (default: 'info') */
  variant?: Variant;
  /** Auto-dismiss time in ms; 0 = manual dismiss (default: 3000) */
  durationMs?: number;
  /** Slide direction (default: 'top') */
  position?: 'top' | 'bottom';
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Toast width */
  width?: number;
  /** Text font family */
  fontFamily?: string;
}

/**
 * Animated toast notification component using Pixi graphics
 *
 * Features:
 * - Slide-in / slide-out animations via GSAP
 * - Variant-based background colors (info, success, warning, error)
 * - Auto-dismiss with configurable delay
 * - Manual dismiss via `dismiss()`
 * - Rounded-rectangle background with text overlay
 */
export class ToastSlide extends PixiRenderable {
  private background: Graphics;
  private messageText: Text;
  private config: Required<Pick<ToastSlideConfig, 'message' | 'variant' | 'durationMs' | 'position' | 'width' | 'fontFamily'>> &
    Pick<ToastSlideConfig, 'onDismiss'>;
  private dismissTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Creates a new ToastSlide instance
   *
   * @param _gpuLoader - The GPU loader (reserved for future texture use)
   * @param config - Toast configuration
   */
  constructor(_gpuLoader: PixiLoader, config: ToastSlideConfig) {
    super('toast-slide');

    this.config = {
      message: config.message,
      variant: config.variant ?? TOAST_SLIDE_DEFAULTS.variant,
      durationMs: config.durationMs ?? TOAST_SLIDE_DEFAULTS.durationMs,
      position: config.position ?? TOAST_SLIDE_DEFAULTS.position,
      onDismiss: config.onDismiss,
      width: config.width ?? TOAST_SLIDE_DEFAULTS.width,
      fontFamily: config.fontFamily ?? TOAST_SLIDE_DEFAULTS.fontFamily,
    };

    const bgColor =
      TOAST_SLIDE_DEFAULTS.variantColors[this.config.variant];

    // Create rounded-rectangle background
    this.background = new Graphics();
    this.background.roundRect(
      0,
      0,
      this.config.width,
      TOAST_SLIDE_DEFAULTS.padding * 2 + TOAST_SLIDE_DEFAULTS.fontSize + 8,
      TOAST_SLIDE_DEFAULTS.cornerRadius,
    );
    this.background.fill({ color: bgColor, alpha: TOAST_SLIDE_DEFAULTS.backgroundAlpha });
    this.addChild(this.background);

    // Create message text
    this.messageText = new Text({
      text: this.config.message,
      style: {
        fontSize: TOAST_SLIDE_DEFAULTS.fontSize,
        fontFamily: this.config.fontFamily,
        fill: TOAST_SLIDE_DEFAULTS.textColor,
        wordWrap: true,
        wordWrapWidth: this.config.width - TOAST_SLIDE_DEFAULTS.padding * 2,
      },
    });
    this.messageText.x = TOAST_SLIDE_DEFAULTS.padding;
    this.messageText.y = TOAST_SLIDE_DEFAULTS.padding;
    this.addChild(this.messageText);

    // Position off-screen based on direction
    this.alpha = 0;
  }

  /**
   * Slide the toast into view
   *
   * @returns Promise that resolves when the slide-in animation completes
   */
  async slideIn(): Promise<void> {
    const distance = TOAST_SLIDE_DEFAULTS.slideDistance;
    const offset = this.config.position === 'top' ? -distance : distance;

    // Start off-screen
    this.y += offset;
    this.alpha = 0;

    await new Promise<void>((resolve) => {
      gsap.to(this, {
        y: this.y - offset,
        alpha: 1,
        duration: TOAST_SLIDE_DEFAULTS.slideDuration,
        ease: TOAST_SLIDE_DEFAULTS.slideEase,
        onComplete: resolve,
      });
    });

    // Schedule auto-dismiss
    if (this.config.durationMs > 0) {
      this.dismissTimer = setTimeout(() => {
        this.dismiss();
      }, this.config.durationMs);
    }
  }

  /**
   * Slide the toast out of view
   *
   * @returns Promise that resolves when the slide-out animation completes
   */
  async slideOut(): Promise<void> {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }

    const distance = TOAST_SLIDE_DEFAULTS.slideDistance;
    const offset = this.config.position === 'top' ? -distance : distance;

    await new Promise<void>((resolve) => {
      gsap.to(this, {
        y: this.y + offset,
        alpha: 0,
        duration: TOAST_SLIDE_DEFAULTS.slideDuration,
        ease: TOAST_SLIDE_DEFAULTS.slideEase,
        onComplete: () => {
          this.config.onDismiss?.();
          resolve();
        },
      });
    });
  }

  /**
   * Trigger slide-out dismissal
   */
  dismiss(): void {
    void this.slideOut();
  }

  override destroy(options?: Parameters<PixiRenderable['destroy']>[0]): void {
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    super.destroy(options);
  }
}
