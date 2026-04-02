// ─── BoxDesign AI — App-wide Constants ───────────────────────────────────────

export const APP_NAME    = 'BoxDesign AI';
export const APP_VERSION = '1.0.0';

export const API_BASE_URL  = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://localhost:8000';
export const API_VERSION   = process.env.EXPO_PUBLIC_API_VERSION  ?? 'v1';
export const RAZORPAY_KEY  = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID ?? '';

export const MAX_REGENERATIONS  = 3;
export const MAX_PHOTOS         = 5;
export const PROMPT_MAX_CHARS   = 500;
export const FILE_EXPIRY_DAYS   = 90;

export const BOX_STYLES = ['RSC', 'Die-cut', 'Tuck-end', 'Mailer', 'Custom'] as const;
export const UNITS      = ['mm', 'cm', 'inches'] as const;

export const CATEGORIES = [
  'Food', 'Electronics', 'FMCG', 'Pharma',
  'E-commerce', 'Industrial', 'Other',
] as const;

export const MARKETS = ['Retail', 'Online', 'Export'] as const;

export const FONT_STYLES = [
  'Modern', 'Classic', 'Bold', 'Handwritten', 'Minimal',
] as const;

export const DESIGN_THEMES = [
  'Minimalist', 'Bold', 'Premium', 'Earthy',
  'Industrial', 'Playful', 'Monochrome',
  'Gradient',   'Pattern', 'Brand-matched',
] as const;

export const GST_RATE = 0.18; // 18%

export const GENERATION_STEPS = [
  'Enhancing your product photo...',
  'Researching your product...',
  'Generating Theme 1/10...',
  'Generating Theme 2/10...',
  'Generating Theme 3/10...',
  'Generating Theme 4/10...',
  'Generating Theme 5/10...',
  'Generating Theme 6/10...',
  'Generating Theme 7/10...',
  'Generating Theme 8/10...',
  'Generating Theme 9/10...',
  'Generating Theme 10/10...',
  'Rendering 3D previews...',
  'Calculating sheet sizes...',
  'Finalising your designs...',
] as const;
