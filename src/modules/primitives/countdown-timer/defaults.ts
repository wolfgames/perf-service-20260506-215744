export const COUNTDOWN_TIMER_DEFAULTS = {
  /** Font size */
  fontSize: 22,
  /** Font family */
  fontFamily: 'sans-serif',
  /** Normal text color */
  normalColor: '#ffffff',
  /** Urgent text color (when below threshold) */
  urgentColor: '#e74c3c',
  /** Urgency threshold in seconds */
  urgencyThreshold: 5,
  /** Scale pulse amount when urgent (1 = no pulse) */
  urgentPulseScale: 1.15,
  /** Pulse duration in seconds */
  urgentPulseDuration: 0.4,
  /** Stroke color (empty = no stroke) */
  stroke: '#000000',
  /** Stroke width */
  strokeWidth: 3,
  /** Format template — {s} = seconds, {m}:{ss} = minutes:seconds */
  format: '{s}',
};
