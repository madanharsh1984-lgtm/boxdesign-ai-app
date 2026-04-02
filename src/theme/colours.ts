// ─── BoxDesign AI — Colour Palette ───────────────────────────────────────────

export const colours = {
  // Brand primaries
  primary:    '#1A3C6E',  // Deep Navy — headers, key UI
  secondary:  '#2E86C1',  // Mid Blue  — buttons, links
  accent:     '#E67E22',  // Orange    — CTAs, highlights
  accentDark: '#D35400',  // Dark Orange for pressed states

  // Backgrounds
  bg:         '#F8FAFC',  // App background
  bgCard:     '#FFFFFF',  // Card background
  bgLight:    '#EBF5FB',  // Light blue tint
  bgDark:     '#0F2340',  // Dark navy (splash, headers)

  // Text
  textPrimary:   '#2C3E50',
  textSecondary: '#7F8C8D',
  textLight:     '#FFFFFF',
  textMuted:     '#BDC3C7',

  // Status colours
  success:  '#27AE60',
  warning:  '#F39C12',
  error:    '#E74C3C',
  info:     '#2E86C1',

  // Status badges
  draft:      '#F39C12',  // Orange
  approved:   '#27AE60',  // Green
  delivered:  '#2E86C1',  // Blue
  processing: '#9B59B6',  // Purple

  // Borders & dividers
  border:      '#E8ECF0',
  divider:     '#F2F3F4',

  // Transparent
  overlay:     'rgba(0,0,0,0.5)',
  overlayLight:'rgba(255,255,255,0.15)',
} as const;

export type ColourKey = keyof typeof colours;
