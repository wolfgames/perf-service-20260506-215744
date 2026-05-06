import { Text } from 'pixi.js';
import gsap from 'gsap';
import { PixiRenderable } from '../../_base';
import { COUNTDOWN_TIMER_DEFAULTS } from '../defaults';

/**
 * Configuration for creating a CountdownTimer
 */
export interface CountdownTimerConfig {
  /** Total countdown duration in seconds */
  duration: number;
  /** Callback when countdown reaches zero */
  onComplete?: () => void;
  /** Callback each tick with remaining seconds */
  onTick?: (remaining: number) => void;
  /** Font size */
  fontSize?: number;
  /** Font family */
  fontFamily?: string;
  /** Normal text color */
  normalColor?: string;
  /** Urgent text color */
  urgentColor?: string;
  /** Urgency threshold in seconds */
  urgencyThreshold?: number;
  /** Scale pulse when urgent */
  urgentPulseScale?: number;
  /** Pulse duration in seconds */
  urgentPulseDuration?: number;
  /** Stroke color */
  stroke?: string;
  /** Stroke width */
  strokeWidth?: number;
  /** Format: 'seconds' for raw count, 'mm:ss' for minutes */
  format?: 'seconds' | 'mm:ss';
}

/**
 * CountdownTimer — displays a countdown with urgency states.
 *
 * Changes color and pulses scale when below urgency threshold.
 * Driven by PixiRenderable tick loop (dt-based, not setInterval).
 */
export class CountdownTimer extends PixiRenderable {
  private textField: Text;
  private remaining: number;
  private urgencyThreshold: number;
  private normalColor: string;
  private urgentColor: string;
  private urgentPulseScale: number;
  private urgentPulseDuration: number;
  private isPulsing = false;
  private paused = false;
  private formatMode: 'seconds' | 'mm:ss';
  private onComplete?: () => void;
  private onTick?: (remaining: number) => void;
  private lastDisplayedSecond: number;

  constructor(config: CountdownTimerConfig) {
    super('countdown-timer');

    const d = COUNTDOWN_TIMER_DEFAULTS;
    this.remaining = config.duration;
    this.lastDisplayedSecond = Math.ceil(config.duration);
    this.urgencyThreshold = config.urgencyThreshold ?? d.urgencyThreshold;
    this.normalColor = config.normalColor ?? d.normalColor;
    this.urgentColor = config.urgentColor ?? d.urgentColor;
    this.urgentPulseScale = config.urgentPulseScale ?? d.urgentPulseScale;
    this.urgentPulseDuration = config.urgentPulseDuration ?? d.urgentPulseDuration;
    this.formatMode = config.format ?? 'seconds';
    this.onComplete = config.onComplete;
    this.onTick = config.onTick;

    const strokeColor = config.stroke ?? d.stroke;
    this.textField = new Text({
      text: this.formatTime(this.remaining),
      style: {
        fontFamily: config.fontFamily ?? d.fontFamily,
        fontSize: config.fontSize ?? d.fontSize,
        fill: this.normalColor,
        stroke: strokeColor ? { color: strokeColor, width: config.strokeWidth ?? d.strokeWidth } : undefined,
      },
    });
    this.textField.anchor.set(0.5);
    this.addChild(this.textField);
  }

  override update(dt: number): void {
    if (this.paused || this.remaining <= 0) return;

    this.remaining = Math.max(0, this.remaining - dt);
    const displaySecond = Math.ceil(this.remaining);

    // Only update text when the displayed second changes
    if (displaySecond !== this.lastDisplayedSecond) {
      this.lastDisplayedSecond = displaySecond;
      this.textField.text = this.formatTime(this.remaining);
      this.onTick?.(displaySecond);

      // Enter urgency mode
      if (this.remaining <= this.urgencyThreshold && this.remaining > 0) {
        this.textField.style.fill = this.urgentColor;
        if (!this.isPulsing) {
          this.isPulsing = true;
          this.startPulse();
        }
      }
    }

    if (this.remaining <= 0) {
      this.textField.text = this.formatTime(0);
      this.stopPulse();
      this.onComplete?.();
    }
  }

  /** Pause the countdown */
  pause(): void {
    this.paused = true;
  }

  /** Resume the countdown */
  resume(): void {
    this.paused = false;
  }

  /** Reset with a new duration */
  reset(duration: number): void {
    this.remaining = duration;
    this.lastDisplayedSecond = Math.ceil(duration);
    this.paused = false;
    this.isPulsing = false;
    this.stopPulse();
    this.textField.style.fill = this.normalColor;
    this.textField.text = this.formatTime(duration);
    this.scale.set(1);
  }

  /** Get remaining seconds */
  getRemaining(): number {
    return this.remaining;
  }

  private formatTime(seconds: number): string {
    const s = Math.ceil(seconds);
    if (this.formatMode === 'mm:ss') {
      const m = Math.floor(s / 60);
      const remainder = s % 60;
      return `${m}:${String(remainder).padStart(2, '0')}`;
    }
    return `${s}`;
  }

  private startPulse(): void {
    gsap.to(this.scale, {
      x: this.urgentPulseScale,
      y: this.urgentPulseScale,
      duration: this.urgentPulseDuration / 2,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    });
  }

  private stopPulse(): void {
    gsap.killTweensOf(this.scale);
    this.scale.set(1);
    this.isPulsing = false;
  }
}
