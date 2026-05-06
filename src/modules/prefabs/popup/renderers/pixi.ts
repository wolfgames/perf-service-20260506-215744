import gsap from 'gsap';
import type { PixiLoader } from '~/core/systems/assets';
import { PixiRenderable } from '../../../primitives/_base';
import { ToastSlide, type ToastSlideConfig } from '../../../primitives/toast-slide';
import { POPUP_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a Popup
 */
export interface PopupConfig {
  /** ToastSlide configuration (onDismiss is managed internally) */
  toastConfig: Omit<ToastSlideConfig, 'onDismiss'>;
  /** Auto-dismiss time in ms; 0 = no auto-dismiss (default: 5000) */
  autoDismissMs?: number;
  /** Callback when dismissed */
  onDismiss?: () => void;
  /** Callback when shown */
  onShow?: () => void;
}

/**
 * Popup prefab — wraps a ToastSlide with optional delay, auto-dismiss,
 * and show/dismiss lifecycle callbacks.
 *
 * Features:
 * - Configurable show delay before slide-in
 * - Auto-dismiss after a configurable duration
 * - onShow / onDismiss lifecycle hooks
 * - Delegates all visual rendering to an internal ToastSlide
 */
export class Popup extends PixiRenderable {
  private toast: ToastSlide;
  private config: PopupConfig;
  private autoDismissTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Creates a new Popup instance
   *
   * @param gpuLoader - The GPU loader for creating sprites from the atlas
   * @param config - Popup configuration
   */
  constructor(gpuLoader: PixiLoader, config: PopupConfig) {
    super('popup');

    this.config = config;

    // Create internal ToastSlide, wiring our own dismiss handler
    this.toast = new ToastSlide(gpuLoader, {
      ...config.toastConfig,
      durationMs: 0, // We manage auto-dismiss ourselves
      onDismiss: () => this.handleDismissed(),
    });

    this.addChild(this.toast);
  }

  /**
   * Show the popup with an optional delay, then slide in.
   * Fires `onShow` after the slide-in completes and schedules
   * auto-dismiss if configured.
   */
  async show(): Promise<void> {
    const delay = POPUP_DEFAULTS.showDelay;

    // Optional delay before slide-in
    if (delay > 0) {
      await new Promise<void>((resolve) => {
        gsap.delayedCall(delay, resolve);
      });
    }

    await this.toast.slideIn();

    this.config.onShow?.();

    // Schedule auto-dismiss
    const autoDismissMs = this.config.autoDismissMs ?? POPUP_DEFAULTS.autoDismissMs;
    if (autoDismissMs > 0) {
      this.autoDismissTimer = setTimeout(() => {
        this.dismiss();
      }, autoDismissMs);
    }
  }

  /**
   * Dismiss the popup by sliding the toast out
   */
  dismiss(): void {
    this.clearAutoDismiss();
    void this.toast.slideOut();
  }

  /**
   * Internal handler called when the toast finishes sliding out
   */
  private handleDismissed(): void {
    this.clearAutoDismiss();
    this.config.onDismiss?.();
  }

  /**
   * Clear any pending auto-dismiss timer
   */
  private clearAutoDismiss(): void {
    if (this.autoDismissTimer) {
      clearTimeout(this.autoDismissTimer);
      this.autoDismissTimer = null;
    }
  }

  /**
   * Clean up resources
   */
  override destroy(options?: Parameters<PixiRenderable['destroy']>[0]): void {
    this.clearAutoDismiss();
    super.destroy(options);
  }
}
