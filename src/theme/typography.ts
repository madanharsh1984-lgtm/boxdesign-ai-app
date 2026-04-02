// ─── BoxDesign AI — Typography ────────────────────────────────────────────────
import { Platform } from 'react-native';

export const fontFamily = {
  regular:  Platform.OS === 'ios' ? 'System'      : 'Roboto',
  medium:   Platform.OS === 'ios' ? 'System'      : 'Roboto-Medium',
  bold:     Platform.OS === 'ios' ? 'System'      : 'Roboto-Bold',
  mono:     Platform.OS === 'ios' ? 'Courier New' : 'monospace',
} as const;

export const fontSize = {
  xs:   11,
  sm:   13,
  base: 15,
  md:   17,
  lg:   20,
  xl:   24,
  xxl:  28,
  hero: 34,
} as const;

export const fontWeight = {
  regular: '400' as const,
  medium:  '500' as const,
  semibold:'600' as const,
  bold:    '700' as const,
  black:   '900' as const,
} as const;

export const lineHeight = {
  tight:   1.2,
  normal:  1.5,
  relaxed: 1.75,
} as const;
